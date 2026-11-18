'use strict';
/*
  Chereta backend. No dependencies: Node 22 or newer (uses the built-in SQLite).
  Serves the website from /public and the JSON API under /api.
  All data lives in one SQLite file inside DATA_DIR.
*/
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const { DatabaseSync } = require('node:sqlite');

const DAY = 86400000;
const CATS = ['vehicle', 'machinery', 'electronics', 'furniture', 'power', 'parts', 'goods', 'houses', 'battery', 'grid'];
const SRCS = ['uncleared', 'seized', 'abandoned'];
const DUTIES = ['incl', 'buyer'];
const DEFAULTS = {
  depositPercent: '5',
  buyerFeePercent: '2',
  paymentDays: '3',
  antiSnipeMinutes: '2',
  payInstructions: 'Pay with Telebirr or CBE Birr using the account details shown by the branch. Keep your payment receipt.',
  brandName: 'Chereta',
  supportPhone: '',
  supportEmail: '',
  supportAddress: '',
};

class HttpError extends Error {
  constructor(status, code, extra) { super(code); this.status = status; this.code = code; this.extra = extra || {}; }
}
const fail = (status, code, extra) => { throw new HttpError(status, code, extra); };

function createApp(opts = {}) {
  const dataDir = opts.dataDir || process.env.DATA_DIR || path.join(__dirname, '..', 'data');
  const publicDir = opts.publicDir || path.join(__dirname, '..', 'public');
  const secureCookie = opts.secureCookie ?? process.env.COOKIE_SECURE === '1';
  const log = opts.log || ((...a) => console.log(...a));
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, 'chereta.db'));
  db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users(
      id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE COLLATE NOCASE, name TEXT NOT NULL, phone TEXT,
      role TEXT NOT NULL CHECK(role IN ('admin','branch','bidder')), pass TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','suspended')),
      must_change INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL, last_login INTEGER);
    CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS lots(
      seq INTEGER PRIMARY KEY, id TEXT NOT NULL UNIQUE, org_id INTEGER NOT NULL REFERENCES users(id),
      title TEXT NOT NULL, descr TEXT NOT NULL DEFAULT '', cat TEXT NOT NULL, mode TEXT NOT NULL CHECK(mode IN ('live','sealed')),
      initial INTEGER NOT NULL, price INTEGER NOT NULL, step INTEGER NOT NULL DEFAULT 0, end_at INTEGER NOT NULL,
      src TEXT NOT NULL, ref TEXT NOT NULL DEFAULT '', duty TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'open',
      last_bidder INTEGER, bidders INTEGER NOT NULL DEFAULT 0, photos INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL, closed_at INTEGER, winner_id INTEGER, final_price INTEGER, note TEXT);
    CREATE INDEX IF NOT EXISTS lots_status ON lots(status, end_at);
    CREATE TABLE IF NOT EXISTS photos(lot_id TEXT NOT NULL REFERENCES lots(id) ON DELETE CASCADE, idx INTEGER NOT NULL, mime TEXT NOT NULL, data BLOB NOT NULL, PRIMARY KEY(lot_id, idx));
    CREATE TABLE IF NOT EXISTS bids(id INTEGER PRIMARY KEY, lot_id TEXT NOT NULL REFERENCES lots(id) ON DELETE CASCADE, user_id INTEGER NOT NULL REFERENCES users(id), amount INTEGER NOT NULL, ref TEXT, created_at INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS bids_lot ON bids(lot_id, amount);
    CREATE TABLE IF NOT EXISTS orders(
      id INTEGER PRIMARY KEY, lot_id TEXT NOT NULL UNIQUE REFERENCES lots(id) ON DELETE CASCADE, buyer_id INTEGER NOT NULL REFERENCES users(id), org_id INTEGER NOT NULL REFERENCES users(id),
      amount INTEGER NOT NULL, fee INTEGER NOT NULL, deposit INTEGER NOT NULL, total INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'awaiting_payment', due_at INTEGER NOT NULL, created_at INTEGER NOT NULL, paid_at INTEGER);
    CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS posts(id INTEGER PRIMARY KEY, kind TEXT NOT NULL CHECK(kind IN ('news','tender')), title TEXT NOT NULL, body TEXT NOT NULL, org_id INTEGER, ref TEXT, closes_at INTEGER, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY, ts INTEGER NOT NULL, actor_id INTEGER, actor TEXT, action TEXT NOT NULL, target TEXT, detail TEXT);
  `);

  let clock = opts.now || (() => Date.now());
  const now = () => clock();
  const get = (sql, ...p) => db.prepare(sql).get(...p);
  const all = (sql, ...p) => db.prepare(sql).all(...p);
  const run = (sql, ...p) => db.prepare(sql).run(...p);
  const tx = (fn) => {
    db.exec('BEGIN IMMEDIATE');
    try { const r = fn(); db.exec('COMMIT'); return r; } catch (e) { try { db.exec('ROLLBACK'); } catch (_) {} throw e; }
  };
  const audit = (actor, action, target, detail) => run('INSERT INTO audit(ts,actor_id,actor,action,target,detail) VALUES(?,?,?,?,?,?)', now(), actor ? actor.id : null, actor ? actor.username : 'system', action, target == null ? null : String(target), detail == null ? null : String(detail).slice(0, 300));

  /* ---------- settings ---------- */
  for (const [k, v] of Object.entries(DEFAULTS)) run('INSERT OR IGNORE INTO settings(key,value) VALUES(?,?)', k, v);
  const settings = () => { const o = {}; for (const r of all('SELECT key,value FROM settings')) o[r.key] = r.value; return o; };
  const num = (v, d) => { const n = Number(v); return Number.isFinite(n) ? n : d; };

  /* ---------- passwords and sessions ---------- */
  const scrypt = (pw, salt) => new Promise((res, rej) => crypto.scrypt(pw, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (e, k) => e ? rej(e) : res(k)));
  async function hashPw(pw) { const salt = crypto.randomBytes(16); const k = await scrypt(pw, salt); return 's1$' + salt.toString('base64') + '$' + k.toString('base64'); }
  const DUMMY = 's1$' + Buffer.alloc(16).toString('base64') + '$' + Buffer.alloc(64).toString('base64');
  async function checkPw(pw, stored) {
    const [v, s, h] = String(stored).split('$'); if (v !== 's1') return false;
    const k = await scrypt(pw, Buffer.from(s, 'base64')); const want = Buffer.from(h, 'base64');
    return k.length === want.length && crypto.timingSafeEqual(k, want);
  }
  const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
  const sessionHours = (role) => role === 'admin' ? 12 : 24 * 14;
  function newSession(user) {
    const token = crypto.randomBytes(32).toString('base64url');
    run('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)', sha(token), user.id, now() + sessionHours(user.role) * 3600000);
    return token;
  }
  function genPassword() {
    const a = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = '';
    for (const b of crypto.randomBytes(10)) s += a[b % a.length];
    return s;
  }
  const okPassword = (p) => typeof p === 'string' && p.length >= 8 && p.length <= 100;

  /* ---------- rate limiting ---------- */
  const hits = new Map();
  function limit(key, max, windowMs) {
    const t = now(); let h = hits.get(key);
    if (!h || h.reset < t) { h = { n: 0, reset: t + windowMs }; hits.set(key, h); }
    h.n++; if (h.n > max) fail(429, 'too_many', { retryAfter: Math.ceil((h.reset - t) / 1000) });
  }
  setInterval(() => { const t = now(); for (const [k, h] of hits) if (h.reset < t) hits.delete(k); }, 60000).unref();

  /* ---------- validation ---------- */
  const str = (v, min, max, code) => { if (typeof v !== 'string') fail(400, code || 'bad_input'); const s = v.trim(); if (s.length < min || s.length > max) fail(400, code || 'bad_input'); return s; };
  const int = (v, min, max, code) => { const n = typeof v === 'string' && /^\d+$/.test(v) ? Number(v) : v; if (!Number.isInteger(n) || n < min || n > max) fail(400, code || 'bad_input'); return n; };
  const normPhone = (v) => { let d = String(v || '').replace(/\D/g, ''); if (d.startsWith('251')) d = d.slice(3); if (d.startsWith('0')) d = d.slice(1); return /^[79]\d{8}$/.test(d) ? d : null; };
  const userName = (v) => { const s = str(v, 3, 30, 'bad_username').toLowerCase(); if (!/^[a-z0-9._-]+$/.test(s) || !/[a-z]/.test(s)) fail(400, 'bad_username'); return s; };
  function decodePhoto(url) {
    const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(url || ''); if (!m) fail(400, 'bad_photo');
    const buf = Buffer.from(m[2], 'base64'); if (buf.length < 100 || buf.length > 300000) fail(400, 'photo_big');
    const ok = (m[1] === 'jpeg' && buf[0] === 0xff && buf[1] === 0xd8) || (m[1] === 'png' && buf.slice(0, 4).toString('hex') === '89504e47') || (m[1] === 'webp' && buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP');
    if (!ok) fail(400, 'bad_photo');
    return { mime: 'image/' + m[1], buf };
  }

  /* ---------- auction logic ---------- */
  function closeDue() {
    const due = all("SELECT * FROM lots WHERE status='open' AND end_at<=?", now());
    for (const lot of due) {
      tx(() => {
        const cur = get('SELECT * FROM lots WHERE seq=?', lot.seq); if (cur.status !== 'open') return;
        let win = null;
        if (cur.mode === 'live') win = get('SELECT user_id,amount FROM bids WHERE lot_id=? ORDER BY amount DESC, id ASC LIMIT 1', cur.id);
        else win = get('SELECT user_id,amount FROM bids WHERE lot_id=? ORDER BY amount DESC, created_at ASC, id ASC LIMIT 1', cur.id);
        if (win) {
          const s = settings(), fee = Math.round(win.amount * num(s.buyerFeePercent, 2) / 100), dep = Math.ceil(cur.initial * num(s.depositPercent, 5) / 100);
          run("UPDATE lots SET status='sold',closed_at=?,winner_id=?,final_price=?,price=? WHERE seq=?", now(), win.user_id, win.amount, win.amount, cur.seq);
          run('INSERT INTO orders(lot_id,buyer_id,org_id,amount,fee,deposit,total,status,due_at,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)', cur.id, win.user_id, cur.org_id, win.amount, fee, dep, win.amount + fee, 'awaiting_payment', now() + num(s.paymentDays, 3) * DAY, now());
          audit(null, 'lot.sold', cur.id, 'amount ' + win.amount);
        } else {
          run("UPDATE lots SET status='unsold',closed_at=? WHERE seq=?", now(), cur.seq);
          audit(null, 'lot.unsold', cur.id);
        }
      });
    }
    if (due.length) notify();
    return due.length;
  }
  function placeBid(user, lotId, amount) {
    if (user.role !== 'bidder') fail(403, 'bidders_only');
    return tx(() => {
      const lot = get('SELECT l.*, u.status AS org_status FROM lots l JOIN users u ON u.id=l.org_id WHERE l.id=?', lotId);
      if (!lot || lot.org_status !== 'active') fail(404, 'not_found');
      if (lot.status !== 'open' || lot.end_at <= now()) fail(409, 'closed');
      if (!Number.isInteger(amount) || amount <= 0 || amount > 1e12) fail(400, 'bad_amount');
      const s = settings(), t = now();
      if (lot.mode === 'live') {
        const min = lot.bidders === 0 ? lot.initial : lot.price + lot.step;
        if (amount < min) fail(409, 'low_bid', { min });
        if (lot.last_bidder === user.id) fail(409, 'leading');
        run('INSERT INTO bids(lot_id,user_id,amount,created_at) VALUES(?,?,?,?)', lot.id, user.id, amount, t);
        const snipe = num(s.antiSnipeMinutes, 2) * 60000; let end = lot.end_at; if (snipe > 0 && end - t < snipe) end = t + snipe;
        const n = get('SELECT COUNT(DISTINCT user_id) n FROM bids WHERE lot_id=?', lot.id).n;
        run('UPDATE lots SET price=?,last_bidder=?,bidders=?,end_at=? WHERE seq=?', amount, user.id, n, end, lot.seq);
        return { price: amount, leader: 'you', end };
      }
      if (amount < lot.initial) fail(409, 'low_bid', { min: lot.initial });
      const mine = get('SELECT id,ref FROM bids WHERE lot_id=? AND user_id=?', lot.id, user.id);
      let ref;
      if (mine) { ref = mine.ref; run('UPDATE bids SET amount=?,created_at=? WHERE id=?', amount, t, mine.id); }
      else { ref = 'CH-' + String(100000 + crypto.randomInt(900000)); run('INSERT INTO bids(lot_id,user_id,amount,ref,created_at) VALUES(?,?,?,?,?)', lot.id, user.id, amount, ref, t); }
      run('UPDATE lots SET bidders=(SELECT COUNT(DISTINCT user_id) FROM bids WHERE lot_id=?) WHERE seq=?', lot.id, lot.seq);
      return { ref, amount };
    });
  }
  const mask = (uid, lotId) => String(1000 + (parseInt(sha(uid + ':' + lotId).slice(0, 6), 16) % 9000));
  function pubLot(l, meId, myBids) {
    const live = l.mode === 'live', o = {
      id: l.id, orgId: l.org_id, title: l.title, desc: l.descr, cat: l.cat, mode: l.mode, initial: l.initial, step: l.step, bidders: l.bidders, end: l.end_at,
      src: l.src, ref: l.ref, duty: l.duty, photos: l.photos, status: l.status, price: live ? l.price : l.initial,
    };
    if (live) {
      o.hist = all('SELECT user_id,amount FROM bids WHERE lot_id=? ORDER BY id DESC LIMIT 6', l.id).map((b) => ({ who: 'Bidder ••' + mask(b.user_id, l.id), amt: b.amount, mine: b.user_id === meId }));
      o.leader = meId && l.last_bidder === meId ? 'you' : 'other';
    }
    if (l.status === 'sold') { o.finalPrice = l.final_price; o.youWon = !!meId && l.winner_id === meId; }
    const mb = myBids && myBids.get(l.id); if (mb) o.myBid = mb;
    return o;
  }
  function stateFor(user) {
    closeDue();
    const meId = user ? user.id : null, s = settings();
    const orgs = all("SELECT id,name FROM users WHERE role='branch' AND status='active' ORDER BY name").map((r) => ({ id: r.id, name: r.name }));
    const myBids = new Map();
    if (meId) for (const b of all('SELECT lot_id, MAX(amount) amount, MAX(ref) ref FROM bids WHERE user_id=? GROUP BY lot_id', meId)) myBids.set(b.lot_id, { amt: b.amount, ref: b.ref || '' });
    const lots = all(`SELECT l.* FROM lots l JOIN users u ON u.id=l.org_id WHERE u.status='active' AND l.status!='cancelled' AND (l.status='open' OR l.closed_at>? OR l.id IN (SELECT lot_id FROM bids WHERE user_id=?)) ORDER BY l.end_at`, now() - 14 * DAY, meId || 0).map((l) => pubLot(l, meId, myBids));
    const posts = all('SELECT id,kind,title,body,org_id,ref,closes_at,created_at FROM posts ORDER BY created_at DESC LIMIT 30');
    const out = { settings: { depositPercent: num(s.depositPercent, 5), buyerFeePercent: num(s.buyerFeePercent, 2), payInstructions: s.payInstructions, brandName: s.brandName, paymentDays: num(s.paymentDays, 3), supportPhone: s.supportPhone || '', supportEmail: s.supportEmail || '', supportAddress: s.supportAddress || '' }, orgs, lots, posts, now: now(), me: null };
    if (user) {
      out.me = { id: user.id, username: user.username, name: user.name, role: user.role, mustChange: !!user.must_change };
      if (user.role === 'bidder') out.me.orders = all("SELECT o.*, l.title, l.org_id oid, (SELECT name FROM users WHERE id=o.org_id) org_name FROM orders o JOIN lots l ON l.id=o.lot_id WHERE o.buyer_id=? ORDER BY o.created_at DESC", user.id).map(orderOut);
      if (user.role === 'branch') out.me.orders = all("SELECT o.*, l.title, (SELECT name FROM users WHERE id=o.buyer_id) buyer_name, (SELECT phone FROM users WHERE id=o.buyer_id) buyer_phone FROM orders o JOIN lots l ON l.id=o.lot_id WHERE o.org_id=? ORDER BY o.created_at DESC", user.id).map(orderOut);
    }
    return out;
  }
  const orderOut = (o) => ({ id: o.id, lotId: o.lot_id, title: o.title, amount: o.amount, fee: o.fee, deposit: o.deposit, total: o.total, status: o.status, dueAt: o.due_at, createdAt: o.created_at, paidAt: o.paid_at, branch: o.org_name, buyer: o.buyer_name, buyerPhone: o.buyer_phone });

  /* ---------- realtime ---------- */
  const clients = new Set(); let pending = null;
  function notify() { if (pending) return; pending = setTimeout(() => { pending = null; for (const r of clients) r.write('data: changed\n\n'); }, 80); }

  /* ---------- request helpers ---------- */
  function readBody(req) {
    return new Promise((res, rej) => {
      const chunks = []; let n = 0;
      req.on('data', (c) => { n += c.length; if (n > 3 * 1024 * 1024) { rej(new HttpError(413, 'too_large')); req.destroy(); } else chunks.push(c); });
      req.on('end', () => { if (!n) return res({}); try { const v = JSON.parse(Buffer.concat(chunks).toString('utf8')); res(v && typeof v === 'object' ? v : {}); } catch (e) { rej(new HttpError(400, 'bad_json')); } });
      req.on('error', rej);
    });
  }
  const parseCookies = (h) => { const o = {}; for (const p of String(h || '').split(';')) { const i = p.indexOf('='); if (i > 0) o[p.slice(0, i).trim()] = p.slice(i + 1).trim(); } return o; };
  function authUser(req) {
    const tok = parseCookies(req.headers.cookie).cs; if (!tok) return null;
    const r = get('SELECT u.*, s.expires_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=?', sha(tok));
    if (!r || r.expires_at < now() || r.status !== 'active') return null;
    return r;
  }
  const ip = (req) => String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const cookieHeader = (token, maxAgeS) => `cs=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeS}${secureCookie ? '; Secure' : ''}`;
  function send(res, status, obj, headers) {
    const body = JSON.stringify(obj);
    res.writeHead(status, Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, headers || {}));
    res.end(body);
  }
  const need = (user, ...roles) => { if (!user) fail(401, 'auth_required'); if (roles.length && !roles.includes(user.role)) fail(403, 'forbidden'); return user; };
  const userRow = (u) => ({ id: u.id, username: u.username, name: u.name, phone: u.phone, role: u.role, status: u.status, createdAt: u.created_at, lastLogin: u.last_login });

  /* ---------- API ---------- */
  const routes = [];
  const route = (method, pattern, fn) => routes.push({ method, re: new RegExp('^' + pattern.replace(/:(\w+)/g, '([^/]+)') + '$'), fn });

  route('POST', '/api/login', async ({ body, req, res }) => {
    const id = str(body.identifier, 1, 60, 'bad_login'), pw = typeof body.password === 'string' ? body.password.slice(0, 200) : '';
    limit('ip:' + ip(req), 40, 15 * 60000); limit('id:' + id.toLowerCase(), 8, 15 * 60000);
    const phone = normPhone(id);
    const u = get('SELECT * FROM users WHERE username=?', id) || (phone ? get("SELECT * FROM users WHERE username=? AND role='bidder'", phone) : null);
    const good = await checkPw(pw, u ? u.pass : DUMMY);
    if (!u || !good) fail(401, 'bad_login');
    if (u.status !== 'active') fail(403, 'suspended');
    run('UPDATE users SET last_login=? WHERE id=?', now(), u.id);
    const token = newSession(u);
    audit(u, 'login', u.username);
    send(res, 200, { user: { id: u.id, username: u.username, name: u.name, role: u.role, mustChange: !!u.must_change } }, { 'Set-Cookie': cookieHeader(token, sessionHours(u.role) * 3600) });
  });
  route('POST', '/api/logout', async ({ req, res }) => {
    const tok = parseCookies(req.headers.cookie).cs; if (tok) run('DELETE FROM sessions WHERE token_hash=?', sha(tok));
    send(res, 200, { ok: true }, { 'Set-Cookie': cookieHeader('', 0) });
  });
  route('POST', '/api/register', async ({ body, req, res }) => {
    limit('reg:' + ip(req), 15, 3600000);
    const name = str(body.name, 2, 60, 'bad_name'), phone = normPhone(body.phone); if (!phone) fail(400, 'bad_phone');
    if (!okPassword(body.password)) fail(400, 'bad_password');
    if (get('SELECT 1 FROM users WHERE username=?', phone)) fail(409, 'phone_taken');
    const h = await hashPw(body.password);
    const r = run("INSERT INTO users(username,name,phone,role,pass,created_at) VALUES(?,?,?,'bidder',?,?)", phone, name, phone, h, now());
    const u = get('SELECT * FROM users WHERE id=?', r.lastInsertRowid), token = newSession(u);
    audit(u, 'register', u.username);
    send(res, 200, { user: { id: u.id, username: u.username, name: u.name, role: 'bidder' } }, { 'Set-Cookie': cookieHeader(token, sessionHours('bidder') * 3600) });
  });
  route('POST', '/api/password', async ({ user, body, res }) => {
    need(user); if (!okPassword(body.next)) fail(400, 'bad_password');
    if (!(await checkPw(String(body.current || ''), user.pass))) fail(403, 'bad_login');
    const h = await hashPw(body.next); run('UPDATE users SET pass=?,must_change=0 WHERE id=?', h, user.id);
    run('DELETE FROM sessions WHERE user_id=? AND token_hash!=?', user.id, sha(parseCookies(res.req.headers.cookie).cs));
    audit(user, 'password.change', user.username); send(res, 200, { ok: true });
  });
  route('GET', '/api/state', async ({ user, res }) => send(res, 200, stateFor(user)));
  route('GET', '/api/photo/:id/:idx', async ({ params, res }) => {
    const p = get("SELECT p.mime,p.data FROM photos p JOIN lots l ON l.id=p.lot_id WHERE p.lot_id=? AND p.idx=?", params[0], Number(params[1]));
    if (!p) fail(404, 'not_found');
    res.writeHead(200, { 'Content-Type': p.mime, 'Cache-Control': 'public, max-age=86400', 'X-Content-Type-Options': 'nosniff' }); res.end(Buffer.from(p.data));
  });
  route('POST', '/api/lots/:id/bid', async ({ user, body, params, res }) => {
    need(user); limit('bid:' + user.id, 60, 60000);
    const r = placeBid(user, params[0], body.amount); notify(); send(res, 200, r);
  });

  /* branch */
  route('POST', '/api/lots', async ({ user, body, res }) => {
    need(user, 'branch', 'admin'); limit('lot:' + user.id, 60, 3600000);
    let orgId = user.id;
    if (user.role === 'admin') { // an administrator posts a lot on behalf of one of the branches
      const br = get("SELECT id FROM users WHERE id=? AND role='branch' AND status='active'", Number(body.orgId)); if (!br) fail(400, 'bad_branch'); orgId = br.id;
    }
    const title = str(body.title, 3, 120, 'bad_title'), mode = body.mode === 'live' ? 'live' : 'sealed';
    const cat = CATS.includes(body.cat) ? body.cat : fail(400, 'bad_input'), src = SRCS.includes(body.src) ? body.src : fail(400, 'bad_input'), duty = DUTIES.includes(body.duty) ? body.duty : fail(400, 'bad_input');
    const price = int(body.price, 1, 1e11, 'bad_price'), step = mode === 'live' ? int(body.step, 1, 1e10, 'bad_step') : 0, days = int(body.days, 1, 30, 'bad_input');
    const descr = typeof body.desc === 'string' ? body.desc.trim().slice(0, 1000) : '', ref = typeof body.ref === 'string' ? body.ref.trim().slice(0, 60) : '';
    const photos = Array.isArray(body.photos) ? body.photos.slice(0, 3).map(decodePhoto) : [];
    const id = tx(() => {
      const seq = get('SELECT COALESCE(MAX(seq),0)+1 n FROM lots').n, id = 'CH-' + (4100 + seq);
      run('INSERT INTO lots(seq,id,org_id,title,descr,cat,mode,initial,price,step,end_at,src,ref,duty,photos,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', seq, id, orgId, title, descr, cat, mode, price, price, step, now() + days * DAY, src, ref, duty, photos.length, now());
      photos.forEach((p, i) => run('INSERT INTO photos(lot_id,idx,mime,data) VALUES(?,?,?,?)', id, i, p.mime, p.buf));
      audit(user, 'lot.create', id, title + (user.role === 'admin' ? ' (by admin)' : '')); return id;
    });
    notify(); send(res, 200, { id });
  });
  route('DELETE', '/api/lots/:id', async ({ user, params, res }) => {
    need(user, 'branch', 'admin');
    const lot = get('SELECT * FROM lots WHERE id=?', params[0]); if (!lot) fail(404, 'not_found');
    if (user.role === 'branch' && lot.org_id !== user.id) fail(403, 'forbidden');
    if (lot.status !== 'open' || lot.bidders > 0) fail(409, 'has_bids');
    run('DELETE FROM lots WHERE id=?', lot.id); audit(user, 'lot.delete', lot.id, lot.title); notify(); send(res, 200, { ok: true });
  });
  route('POST', '/api/orders/:id/status', async ({ user, body, params, res }) => {
    need(user, 'branch', 'admin');
    const o = get('SELECT * FROM orders WHERE id=?', Number(params[0])); if (!o) fail(404, 'not_found');
    if (user.role === 'branch' && o.org_id !== user.id) fail(403, 'forbidden');
    const st = body.status; if (!['awaiting_payment', 'paid', 'collected', 'defaulted'].includes(st)) fail(400, 'bad_input');
    run('UPDATE orders SET status=?,paid_at=? WHERE id=?', st, st === 'paid' || st === 'collected' ? (o.paid_at || now()) : null, o.id);
    audit(user, 'order.' + st, o.lot_id); notify(); send(res, 200, { ok: true });
  });

  /* admin */
  const adm = (user) => need(user, 'admin');
  route('GET', '/api/admin/overview', async ({ user, res }) => {
    adm(user); closeDue();
    const c = (sql, ...p) => get(sql, ...p).n;
    send(res, 200, {
      branches: c("SELECT COUNT(*) n FROM users WHERE role='branch'"), activeBranches: c("SELECT COUNT(*) n FROM users WHERE role='branch' AND status='active'"),
      bidders: c("SELECT COUNT(*) n FROM users WHERE role='bidder'"), openLots: c("SELECT COUNT(*) n FROM lots WHERE status='open'"), liveLots: c("SELECT COUNT(*) n FROM lots WHERE status='open' AND mode='live'"),
      listedValue: c("SELECT COALESCE(SUM(initial),0) n FROM lots WHERE status='open'"), soldLots: c("SELECT COUNT(*) n FROM lots WHERE status='sold'"), soldValue: c("SELECT COALESCE(SUM(final_price),0) n FROM lots WHERE status='sold'"),
      fees: c("SELECT COALESCE(SUM(fee),0) n FROM orders WHERE status IN ('paid','collected')"), feesDue: c("SELECT COALESCE(SUM(fee),0) n FROM orders WHERE status='awaiting_payment'"),
      awaiting: c("SELECT COUNT(*) n FROM orders WHERE status='awaiting_payment'"), awaitingValue: c("SELECT COALESCE(SUM(total),0) n FROM orders WHERE status='awaiting_payment'"),
      unsold: c("SELECT COUNT(*) n FROM lots WHERE status='unsold'"),
      byBranch: all("SELECT u.name, u.status, (SELECT COUNT(*) FROM lots WHERE org_id=u.id AND status='open') open, (SELECT COUNT(*) FROM lots WHERE org_id=u.id AND status='sold') sold, (SELECT COALESCE(SUM(final_price),0) FROM lots WHERE org_id=u.id AND status='sold') value FROM users u WHERE u.role='branch' ORDER BY value DESC, open DESC, u.name"),
      closingSoon: all("SELECT l.id,l.title,l.end_at,(SELECT name FROM users WHERE id=l.org_id) org FROM lots l WHERE l.status='open' ORDER BY l.end_at LIMIT 6"),
    });
  });
  route('GET', '/api/admin/branches', async ({ user, res }) => {
    adm(user);
    send(res, 200, { branches: all("SELECT u.*, (SELECT COUNT(*) FROM lots WHERE org_id=u.id) lots, (SELECT COUNT(*) FROM lots WHERE org_id=u.id AND status='open') open FROM users u WHERE role='branch' ORDER BY name").map((u) => Object.assign(userRow(u), { lots: u.lots, open: u.open })) });
  });
  route('POST', '/api/admin/branches', async ({ user, body, res }) => {
    adm(user); const name = str(body.name, 2, 80, 'bad_name'), username = userName(body.username);
    const password = body.password ? body.password : genPassword(); if (!okPassword(password)) fail(400, 'bad_password');
    if (get('SELECT 1 FROM users WHERE username=?', username)) fail(409, 'username_taken');
    const r = run("INSERT INTO users(username,name,role,pass,created_at) VALUES(?,?,'branch',?,?)", username, name, await hashPw(password), now());
    audit(user, 'branch.create', username, name); notify(); send(res, 200, { id: Number(r.lastInsertRowid), username, name, password });
  });
  route('PATCH', '/api/admin/branches/:id', async ({ user, body, params, res }) => {
    adm(user); const b = get("SELECT * FROM users WHERE id=? AND role='branch'", Number(params[0])); if (!b) fail(404, 'not_found');
    const out = { ok: true };
    if (body.name !== undefined) { run('UPDATE users SET name=? WHERE id=?', str(body.name, 2, 80, 'bad_name'), b.id); audit(user, 'branch.rename', b.username, body.name); }
    if (body.status !== undefined) {
      if (!['active', 'suspended'].includes(body.status)) fail(400, 'bad_input');
      run('UPDATE users SET status=? WHERE id=?', body.status, b.id); if (body.status === 'suspended') run('DELETE FROM sessions WHERE user_id=?', b.id);
      audit(user, 'branch.' + body.status, b.username);
    }
    if (body.resetPassword) { const pw = body.password || genPassword(); if (!okPassword(pw)) fail(400, 'bad_password'); run('UPDATE users SET pass=? WHERE id=?', await hashPw(pw), b.id); run('DELETE FROM sessions WHERE user_id=?', b.id); out.password = pw; audit(user, 'branch.password', b.username); }
    notify(); send(res, 200, out);
  });
  route('DELETE', '/api/admin/branches/:id', async ({ user, params, res }) => {
    adm(user); const b = get("SELECT * FROM users WHERE id=? AND role='branch'", Number(params[0])); if (!b) fail(404, 'not_found');
    if (get('SELECT 1 FROM lots WHERE org_id=?', b.id)) fail(409, 'has_lots');
    run('DELETE FROM users WHERE id=?', b.id); audit(user, 'branch.delete', b.username); notify(); send(res, 200, { ok: true });
  });
  route('GET', '/api/admin/users', async ({ user, res, url }) => {
    adm(user); const role = url.searchParams.get('role') === 'admin' ? 'admin' : 'bidder';
    send(res, 200, { users: all('SELECT u.*, (SELECT COUNT(DISTINCT lot_id) FROM bids WHERE user_id=u.id) bids FROM users u WHERE role=? ORDER BY created_at DESC LIMIT 500', role).map((u) => Object.assign(userRow(u), { bids: u.bids })) });
  });
  route('POST', '/api/admin/users', async ({ user, body, res }) => {
    adm(user); const name = str(body.name, 2, 80, 'bad_name'), username = userName(body.username), password = body.password ? body.password : genPassword(); if (!okPassword(password)) fail(400, 'bad_password');
    if (get('SELECT 1 FROM users WHERE username=?', username)) fail(409, 'username_taken');
    const r = run("INSERT INTO users(username,name,role,pass,must_change,created_at) VALUES(?,?,'admin',?,1,?)", username, name, await hashPw(password), now());
    audit(user, 'admin.create', username); send(res, 200, { id: Number(r.lastInsertRowid), username, name, password });
  });
  route('PATCH', '/api/admin/users/:id', async ({ user, body, params, res }) => {
    adm(user); const u = get("SELECT * FROM users WHERE id=? AND role IN ('admin','bidder')", Number(params[0])); if (!u) fail(404, 'not_found');
    const out = { ok: true };
    if (body.status !== undefined) {
      if (!['active', 'suspended'].includes(body.status)) fail(400, 'bad_input'); if (u.id === user.id) fail(409, 'self');
      run('UPDATE users SET status=? WHERE id=?', body.status, u.id); if (body.status === 'suspended') run('DELETE FROM sessions WHERE user_id=?', u.id); audit(user, 'user.' + body.status, u.username);
    }
    if (body.resetPassword) { const pw = body.password || genPassword(); if (!okPassword(pw)) fail(400, 'bad_password'); run('UPDATE users SET pass=?,must_change=? WHERE id=?', await hashPw(pw), u.role === 'admin' ? 1 : 0, u.id); run('DELETE FROM sessions WHERE user_id=?', u.id); out.password = pw; audit(user, 'user.password', u.username); }
    send(res, 200, out);
  });
  route('GET', '/api/admin/lots', async ({ user, res }) => {
    adm(user); closeDue();
    send(res, 200, { lots: all("SELECT l.*, (SELECT name FROM users WHERE id=l.org_id) org, (SELECT name FROM users WHERE id=l.winner_id) winner FROM lots l ORDER BY l.created_at DESC LIMIT 500").map((l) => ({ id: l.id, title: l.title, org: l.org, mode: l.mode, status: l.status, initial: l.initial, price: l.price, finalPrice: l.final_price, bidders: l.bidders, end: l.end_at, winner: l.winner, note: l.note, created: l.created_at })) });
  });
  route('GET', '/api/admin/lots/:id/bids', async ({ user, params, res }) => {
    adm(user); send(res, 200, { bids: all('SELECT b.amount,b.ref,b.created_at,u.name,u.phone FROM bids b JOIN users u ON u.id=b.user_id WHERE b.lot_id=? ORDER BY b.amount DESC, b.id', params[0]) });
  });
  route('POST', '/api/admin/lots/:id/cancel', async ({ user, body, params, res }) => {
    adm(user); const lot = get('SELECT * FROM lots WHERE id=?', params[0]); if (!lot) fail(404, 'not_found'); if (lot.status !== 'open') fail(409, 'closed');
    run("UPDATE lots SET status='cancelled',closed_at=?,note=? WHERE seq=?", now(), str(body.reason || 'Cancelled by the Commission', 1, 200, 'bad_input'), lot.seq); audit(user, 'lot.cancel', lot.id, body.reason); notify(); send(res, 200, { ok: true });
  });
  route('POST', '/api/admin/lots/:id/extend', async ({ user, body, params, res }) => {
    adm(user); const lot = get('SELECT * FROM lots WHERE id=?', params[0]); if (!lot) fail(404, 'not_found'); if (lot.status !== 'open') fail(409, 'closed');
    const h = int(body.hours, 1, 24 * 30, 'bad_input'); run('UPDATE lots SET end_at=end_at+? WHERE seq=?', h * 3600000, lot.seq); audit(user, 'lot.extend', lot.id, h + ' h'); notify(); send(res, 200, { ok: true });
  });
  route('GET', '/api/admin/orders', async ({ user, res }) => {
    adm(user); closeDue();
    send(res, 200, { orders: all("SELECT o.*, l.title, (SELECT name FROM users WHERE id=o.org_id) org_name, (SELECT name FROM users WHERE id=o.buyer_id) buyer_name, (SELECT phone FROM users WHERE id=o.buyer_id) buyer_phone FROM orders o JOIN lots l ON l.id=o.lot_id ORDER BY o.created_at DESC LIMIT 500").map((o) => Object.assign(orderOut(o), { branch: o.org_name })) });
  });
  route('GET', '/api/admin/orders.csv', async ({ user, res }) => {
    adm(user); const q = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const rows = all("SELECT o.*, l.title, (SELECT name FROM users WHERE id=o.org_id) org_name, (SELECT name FROM users WHERE id=o.buyer_id) buyer_name, (SELECT phone FROM users WHERE id=o.buyer_id) buyer_phone FROM orders o JOIN lots l ON l.id=o.lot_id ORDER BY o.created_at");
    const csv = ['Lot,Title,Branch,Buyer,Buyer phone,Winning bid,Fee,Total,Status,Date'].concat(rows.map((o) => [o.lot_id, o.title, o.org_name, o.buyer_name, o.buyer_phone, o.amount, o.fee, o.total, o.status, new Date(o.created_at).toISOString().slice(0, 10)].map(q).join(','))).join('\n');
    res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="chereta-orders.csv"', 'Cache-Control': 'no-store' }); res.end('﻿' + csv);
  });
  route('GET', '/api/admin/settings', async ({ user, res }) => { adm(user); send(res, 200, { settings: settings() }); });
  route('PUT', '/api/admin/settings', async ({ user, body, res }) => {
    adm(user);
    const rules = { depositPercent: () => String(int(body.depositPercent, 0, 100)), buyerFeePercent: () => String(int(body.buyerFeePercent, 0, 50)), paymentDays: () => String(int(body.paymentDays, 1, 30)), antiSnipeMinutes: () => String(int(body.antiSnipeMinutes, 0, 30)), payInstructions: () => str(body.payInstructions, 0, 600), brandName: () => str(body.brandName, 1, 40), supportPhone: () => str(body.supportPhone, 0, 40), supportEmail: () => str(body.supportEmail, 0, 80), supportAddress: () => str(body.supportAddress, 0, 160) };
    for (const [k, f] of Object.entries(rules)) if (body[k] !== undefined) { run('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', k, f()); }
    audit(user, 'settings.update', '', Object.keys(body).join(',')); notify(); send(res, 200, { settings: settings() });
  });
  route('GET', '/api/admin/audit', async ({ user, res }) => { adm(user); send(res, 200, { entries: all('SELECT ts,actor,action,target,detail FROM audit ORDER BY id DESC LIMIT 300') }); });
  route('POST', '/api/admin/posts', async ({ user, body, res }) => {
    adm(user); const kind = body.kind === 'tender' ? 'tender' : 'news', title = str(body.title, 3, 140, 'bad_title'), text = str(body.body, 3, 1500, 'bad_input');
    const org = body.orgId ? int(body.orgId, 1, 1e9) : null, ref = typeof body.ref === 'string' ? body.ref.trim().slice(0, 60) : '', closes = body.closesAt ? int(body.closesAt, 1, 4e12) : null;
    const r = run('INSERT INTO posts(kind,title,body,org_id,ref,closes_at,created_at) VALUES(?,?,?,?,?,?,?)', kind, title, text, org, ref, closes, now());
    audit(user, 'post.create', kind, title); notify(); send(res, 200, { id: Number(r.lastInsertRowid) });
  });
  route('DELETE', '/api/admin/posts/:id', async ({ user, params, res }) => { adm(user); run('DELETE FROM posts WHERE id=?', Number(params[0])); audit(user, 'post.delete', params[0]); notify(); send(res, 200, { ok: true }); });
  route('GET', '/api/events', async ({ res }) => {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
    res.write('retry: 3000\n\n'); clients.add(res); res.on('close', () => clients.delete(res));
  });

  /* ---------- static files ---------- */
  const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2' };
  const fileCache = new Map();
  function serveStatic(req, res, pathname) {
    let rel = decodeURIComponent(pathname); if (rel === '/' || rel === '') rel = '/index.html'; if (rel === '/admin') rel = '/admin.html';
    const full = path.normalize(path.join(publicDir, rel));
    if (!full.startsWith(publicDir + path.sep)) { res.writeHead(403); return res.end(); }
    let st; try { st = fs.statSync(full); } catch (e) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    if (!st.isFile()) { res.writeHead(404); return res.end('Not found'); }
    const ext = path.extname(full).toLowerCase(); let c = fileCache.get(full);
    if (!c || c.mtime !== st.mtimeMs) { const buf = fs.readFileSync(full); c = { mtime: st.mtimeMs, buf, gz: /\.(html|css|js|svg|json|txt)$/.test(ext) ? zlib.gzipSync(buf) : null }; fileCache.set(full, c); }
    const h = { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': ext === '.png' || ext === '.svg' ? 'public, max-age=86400' : 'no-cache' };
    if (c.gz && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) { h['Content-Encoding'] = 'gzip'; h.Vary = 'Accept-Encoding'; res.writeHead(200, h); return res.end(c.gz); }
    res.writeHead(200, h); res.end(c.buf);
  }

  /* ---------- server ---------- */
  const SEC = {
    'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin', 'X-Frame-Options': 'DENY', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  };
  const server = http.createServer(async (req, res) => {
    for (const [k, v] of Object.entries(SEC)) res.setHeader(k, v);
    res.req = req;
    const url = new URL(req.url, 'http://x');
    try {
      if (!url.pathname.startsWith('/api/')) {
        if (req.method !== 'GET' && req.method !== 'HEAD') fail(405, 'method');
        return serveStatic(req, res, url.pathname);
      }
      if (req.method !== 'GET' && req.method !== 'HEAD' && req.headers['x-requested-with'] !== 'chereta') fail(403, 'csrf');
      const r = routes.find((x) => x.method === req.method && x.re.test(url.pathname)); if (!r) fail(404, 'not_found');
      const params = r.re.exec(url.pathname).slice(1).map(decodeURIComponent);
      const body = req.method === 'GET' || req.method === 'DELETE' || req.method === 'HEAD' ? {} : await readBody(req);
      await r.fn({ req, res, url, params, body, user: authUser(req) });
    } catch (e) {
      if (res.headersSent) { try { res.end(); } catch (_) {} return; }
      if (e instanceof HttpError) { const h = e.code === 'too_many' ? { 'Retry-After': String(e.extra.retryAfter || 60) } : {}; return send(res, e.status, Object.assign({ error: e.code }, e.extra), h); }
      log('error', req.method, req.url, e && e.stack || e); send(res, 500, { error: 'server' });
    }
  });

  /* ---------- first start: create the administrator ---------- */
  function ensureAdmin() {
    if (get("SELECT 1 FROM users WHERE role='admin'")) return null;
    const username = (process.env.ADMIN_USERNAME || 'admin').toLowerCase(), password = process.env.ADMIN_PASSWORD || genPassword();
    return hashPw(password).then((h) => {
      run("INSERT INTO users(username,name,role,pass,must_change,created_at) VALUES(?,?,'admin',?,?,?)", username, 'Commission administrator', h, process.env.ADMIN_PASSWORD ? 0 : 1, now());
      audit(null, 'admin.bootstrap', username);
      return { username, password, generated: !process.env.ADMIN_PASSWORD };
    });
  }
  let timer = null;
  return {
    server, db, closeDue, hashPw, ensureAdmin, settings,
    setClock(fn) { clock = fn; },
    listen(port) { return new Promise((r) => server.listen(port, () => { timer = setInterval(closeDue, 10000); timer.unref(); r(server.address().port); })); },
    close() { clearInterval(timer); for (const r of clients) r.end(); clients.clear(); return new Promise((r) => { server.close(() => { db.close(); r(); }); server.closeAllConnections && server.closeAllConnections(); }); },
  };
}

module.exports = { createApp };

if (require.main === module) {
  const app = createApp();
  const port = Number(process.env.PORT) || 3000;
  Promise.resolve(app.ensureAdmin()).then((a) => {
    if (a) {
      console.log('\n==============================================');
      console.log(' First start: administrator account created');
      console.log('   username: ' + a.username);
      console.log('   password: ' + a.password + (a.generated ? '   (change it after you sign in)' : ''));
      console.log('==============================================\n');
    }
    return app.listen(port);
  }).then((p) => console.log('Chereta is running on http://localhost:' + p + '  (admin console: /admin)'));
  const stop = () => app.close().then(() => process.exit(0)); process.on('SIGTERM', stop); process.on('SIGINT', stop);
}
