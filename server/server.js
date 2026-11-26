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
  docFee: '400',
  buyerFeePercent: '0',
  paymentDays: '3',
  extendDays: '7',
  pickupDays: '15',
  complaintDays: '3',
  specialMax: '300000',
  noLicenceMax: '100000',
  noticeFirst: '7',
  noticeRepeat: '5',
  enforceNotice: '1',
  minBidders: '2',
  tieHours: '24',
  rentPerDay: '0',
  antiSnipeMinutes: '2',
  payInstructions: 'Pay the full balance to the branch bank account shown on the lot, then show your receipt at the branch to collect the goods.',
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
    CREATE TABLE IF NOT EXISTS logos(owner TEXT PRIMARY KEY, mime TEXT NOT NULL, data BLOB NOT NULL, updated INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS posts(id INTEGER PRIMARY KEY, kind TEXT NOT NULL CHECK(kind IN ('news','tender')), title TEXT NOT NULL, body TEXT NOT NULL, org_id INTEGER, ref TEXT, closes_at INTEGER, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY, ts INTEGER NOT NULL, actor_id INTEGER, actor TEXT, action TEXT NOT NULL, target TEXT, detail TEXT);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS entries(
      id INTEGER PRIMARY KEY, lot_id TEXT NOT NULL REFERENCES lots(id) ON DELETE CASCADE, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      doc_ref TEXT, cpo_no TEXT, cpo_bank TEXT, amount INTEGER NOT NULL DEFAULT 0, attest INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL CHECK(status IN ('pending','approved','rejected','applied','refund_due','refunded','forfeited')),
      note TEXT, created_at INTEGER NOT NULL, decided_at INTEGER, decided_by TEXT, refund_ref TEXT, UNIQUE(lot_id,user_id));
    CREATE TABLE IF NOT EXISTS forfeits(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, org_id INTEGER NOT NULL, lot_id TEXT NOT NULL, at INTEGER NOT NULL, fy INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS complaints(id INTEGER PRIMARY KEY, lot_id TEXT NOT NULL REFERENCES lots(id) ON DELETE CASCADE, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, body TEXT NOT NULL, created_at INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'open', reply TEXT, replied_at INTEGER);
  `);
  const addCol = (table, col, def) => { if (!db.prepare('PRAGMA table_info(' + table + ')').all().some((c) => c.name === col)) db.exec('ALTER TABLE ' + table + ' ADD COLUMN ' + col + ' ' + def); };
  for (const c of ['tin', 'license', 'bank_name', 'bank_account', 'bank_holder', 'cpo_payee', 'office_address', 'office_phone', 'view_info']) addCol('users', c, "TEXT NOT NULL DEFAULT ''");
  addCol('users', 'ban_until', 'INTEGER NOT NULL DEFAULT 0');
  addCol('lots', 'view_info', "TEXT NOT NULL DEFAULT ''"); addCol('lots', 'repeat', 'INTEGER NOT NULL DEFAULT 0'); addCol('lots', 'special', 'INTEGER NOT NULL DEFAULT 0');
  addCol('lots', 'approved_at', 'INTEGER'); addCol('lots', 'tie_users', 'TEXT');
  addCol('orders', 'pickup_by', 'INTEGER'); addCol('orders', 'extended', 'INTEGER NOT NULL DEFAULT 0'); addCol('orders', 'note', 'TEXT');
  let clock = opts.now || (() => Date.now());
  const now = () => clock();
  if (!db.prepare('PRAGMA table_info(users)').all().some((c) => c.name === 'kind')) db.exec("ALTER TABLE users ADD COLUMN kind TEXT NOT NULL DEFAULT 'branch'");
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
  const addWork = (ts, n) => { let t = ts; while (n > 0) { t += DAY; const d = new Date(t).getUTCDay(); if (d !== 0 && d !== 6) n--; } return t; };
  const fyOf = (ts) => { const y = new Date(ts).getUTCFullYear(); return ts >= Date.UTC(y, 6, 8) ? y : y - 1; };
  const secNeed = (lot, s) => lot.special ? 0 : Math.ceil(lot.initial * num((s || settings()).depositPercent, 5) / 100);
  const reqFor = (lot, s) => {
    s = s || settings(); const low = lot.special && lot.initial <= num(s.noLicenceMax, 100000);
    return { security: secNeed(lot, s), tin: !low, license: !low && lot.cat !== 'vehicle', doc: !lot.special };
  };
  const banned = (u) => u.ban_until > now();

  function forfeit(o, lot, why) {
    const e = get('SELECT * FROM entries WHERE lot_id=? AND user_id=?', lot.id, o.buyer_id);
    if (e) run("UPDATE entries SET status='forfeited',note=? WHERE id=?", why, e.id);
    run('INSERT INTO forfeits(user_id,org_id,lot_id,at,fy) VALUES(?,?,?,?,?)', o.buyer_id, o.org_id, lot.id, now(), fyOf(now()));
    if (get('SELECT COUNT(*) n FROM forfeits WHERE user_id=? AND fy=?', o.buyer_id, fyOf(now())).n >= 2) {
      run('UPDATE users SET ban_until=? WHERE id=?', now() + 365 * DAY, o.buyer_id); audit(null, 'user.ban', String(o.buyer_id), 'two forfeits in one budget year');
    }
  }
  function offerNext(o, lot, finalStatus, why) {
    const nxt = get("SELECT b.user_id, MAX(b.amount) amount FROM bids b JOIN entries e ON e.lot_id=b.lot_id AND e.user_id=b.user_id JOIN users u ON u.id=b.user_id WHERE b.lot_id=? AND b.user_id<>? AND e.status IN ('approved','refund_due') AND u.ban_until<=? AND u.status='active' GROUP BY b.user_id HAVING MAX(b.amount)<=? ORDER BY MAX(b.amount) DESC LIMIT 1", lot.id, o.buyer_id, now(), o.amount);
    if (nxt) {
      const e = get('SELECT * FROM entries WHERE lot_id=? AND user_id=?', lot.id, nxt.user_id), fee = Math.round(nxt.amount * num(settings().buyerFeePercent, 0) / 100);
      run("UPDATE entries SET status='applied' WHERE id=?", e.id);
      run("UPDATE orders SET buyer_id=?,amount=?,fee=?,deposit=?,total=?,status='awaiting_approval',due_at=0,extended=0,paid_at=NULL,note=? WHERE id=?", nxt.user_id, nxt.amount, fee, e.amount, nxt.amount + fee, why + ' - offered to the next highest bidder', o.id);
      run('UPDATE lots SET winner_id=?,final_price=?,price=? WHERE seq=?', nxt.user_id, nxt.amount, nxt.amount, lot.seq);
      audit(null, 'order.offer_next', lot.id, 'to user ' + nxt.user_id);
    } else {
      run('UPDATE orders SET status=?,note=? WHERE id=?', finalStatus, why, o.id);
      run("UPDATE lots SET status='unsold',note=? WHERE seq=?", why, lot.seq);
    }
  }
  function closeDue() {
    const s = settings(), t0 = now();
    const due = all("SELECT * FROM lots WHERE status='open' AND end_at<=?", t0);
    for (const lot of due) {
      tx(() => {
        const cur = get('SELECT * FROM lots WHERE seq=?', lot.seq); if (cur.status !== 'open') return;
        const order = cur.mode === 'live' ? 'amount DESC, id ASC' : 'amount DESC, created_at ASC, id ASC';
        const win = get('SELECT user_id,amount FROM bids WHERE lot_id=? ORDER BY ' + order + ' LIMIT 1', cur.id);
        const n = get('SELECT COUNT(DISTINCT user_id) n FROM bids WHERE lot_id=?', cur.id).n;
        if (win && !cur.special && n < num(s.minBidders, 2)) {
          run("UPDATE lots SET status='unsold',closed_at=?,note=? WHERE seq=?", t0, 'Fewer than ' + num(s.minBidders, 2) + ' bidders', cur.seq);
          run("UPDATE entries SET status='refund_due' WHERE lot_id=? AND status='approved' AND amount>0", cur.id);
          audit(null, 'lot.unsold', cur.id, 'too few bidders'); return;
        }
        if (win && cur.mode === 'sealed' && !cur.tie_users) {
          const tied = all('SELECT user_id FROM bids WHERE lot_id=? AND amount=?', cur.id, win.amount);
          if (tied.length > 1) {
            run('UPDATE lots SET end_at=?,price=?,tie_users=? WHERE seq=?', t0 + num(s.tieHours, 24) * 3600000, win.amount, JSON.stringify(tied.map((x) => x.user_id)), cur.seq);
            audit(null, 'lot.tie', cur.id, tied.length + ' equal bids'); return;
          }
        }
        if (win) {
          const fee = Math.round(win.amount * num(s.buyerFeePercent, 0) / 100), e = get('SELECT * FROM entries WHERE lot_id=? AND user_id=?', cur.id, win.user_id);
          run("UPDATE lots SET status='sold',closed_at=?,winner_id=?,final_price=?,price=? WHERE seq=?", t0, win.user_id, win.amount, win.amount, cur.seq);
          if (e) run("UPDATE entries SET status='applied' WHERE id=?", e.id);
          run("UPDATE entries SET status='refund_due' WHERE lot_id=? AND status='approved' AND amount>0 AND user_id<>?", cur.id, win.user_id);
          run("INSERT INTO orders(lot_id,buyer_id,org_id,amount,fee,deposit,total,status,due_at,created_at) VALUES(?,?,?,?,?,?,?,'awaiting_approval',0,?)", cur.id, win.user_id, cur.org_id, win.amount, fee, e ? e.amount : 0, win.amount + fee, t0);
          audit(null, 'lot.sold', cur.id, 'amount ' + win.amount);
        } else {
          run("UPDATE lots SET status='unsold',closed_at=? WHERE seq=?", t0, cur.seq);
          audit(null, 'lot.unsold', cur.id);
        }
      });
    }
    let changed = due.length;
    for (const o of all("SELECT * FROM orders WHERE status='awaiting_payment' AND due_at<=?", t0)) {
      tx(() => {
        const cur = get('SELECT * FROM orders WHERE id=?', o.id); if (cur.status !== 'awaiting_payment') return;
        const lot = get('SELECT * FROM lots WHERE id=?', cur.lot_id);
        forfeit(cur, lot, 'Did not pay in time'); offerNext(cur, lot, 'defaulted', 'Winner did not pay in time'); audit(null, 'order.defaulted', lot.id);
      }); changed++;
    }
    if (changed) notify();
    return due.length;
  }
  function placeBid(user, lotId, amount) {
    if (user.role !== 'bidder') fail(403, 'bidders_only');
    if (banned(user)) fail(403, 'banned', { until: user.ban_until });
    return tx(() => {
      const lot = get('SELECT l.*, u.status AS org_status FROM lots l JOIN users u ON u.id=l.org_id WHERE l.id=?', lotId);
      if (!lot || lot.org_status !== 'active') fail(404, 'not_found');
      if (lot.status !== 'open' || lot.end_at <= now()) fail(409, 'closed');
      const en = get("SELECT status FROM entries WHERE lot_id=? AND user_id=?", lot.id, user.id);
      if (!en || en.status !== 'approved') fail(402, 'entry_required', { entry: en ? en.status : 'none' });
      if (lot.tie_users && !JSON.parse(lot.tie_users).includes(user.id)) fail(403, 'not_in_tie');
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
      const floor = lot.tie_users ? lot.price + 1 : lot.initial;
      if (amount < floor) fail(409, 'low_bid', { min: floor });
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
      special: !!l.special, repeat: !!l.repeat, view: l.view_info || '', security: secNeed(l), tie: !!l.tie_users,
    };
    if (live) {
      o.hist = all('SELECT user_id,amount FROM bids WHERE lot_id=? ORDER BY id DESC LIMIT 6', l.id).map((b) => ({ who: 'Bidder ••' + mask(b.user_id, l.id), amt: b.amount, mine: b.user_id === meId }));
      o.leader = meId && l.last_bidder === meId ? 'you' : 'other';
    }
    if (l.status === 'sold') { o.finalPrice = l.final_price; o.youWon = !!meId && l.winner_id === meId; }
    const mb = myBids && myBids.get(l.id); if (mb) o.myBid = mb;
    if (l.status === 'unsold' && l.note) o.note = l.note;
    return o;
  }
  const entryOut = (e) => ({ id: e.id, lotId: e.lot_id, title: e.title, bidder: e.bidder_name, phone: e.bidder_phone, tin: e.tin, license: e.license, docRef: e.doc_ref, cpoNo: e.cpo_no, cpoBank: e.cpo_bank, amount: e.amount, status: e.status, note: e.note, at: e.created_at, refundRef: e.refund_ref, branch: e.org_name });
  const ENTRY_SQL = 'SELECT e.*, l.title, l.org_id, (SELECT name FROM users WHERE id=l.org_id) org_name, u.name bidder_name, u.phone bidder_phone, u.tin, u.license FROM entries e JOIN lots l ON l.id=e.lot_id JOIN users u ON u.id=e.user_id';
  const cmpOut = (c) => ({ id: c.id, lotId: c.lot_id, title: c.title, by: c.by_name, body: c.body, at: c.created_at, status: c.status, reply: c.reply, repliedAt: c.replied_at });
  const CMP_SQL = 'SELECT c.*, l.title, (SELECT name FROM users WHERE id=c.user_id) by_name FROM complaints c JOIN lots l ON l.id=c.lot_id';
  const orgOut = (r) => ({ id: r.id, name: r.name, kind: r.kind || 'branch', logo: r.logo, bank: r.bank_name, account: r.bank_account, holder: r.bank_holder, cpo: r.cpo_payee, address: r.office_address, phone: r.office_phone, view: r.view_info });
  function stateFor(user) {
    closeDue();
    const meId = user ? user.id : null, s = settings();
    const orgs = all("SELECT u.*,COALESCE((SELECT updated FROM logos WHERE owner=CAST(u.id AS TEXT)),0) logo FROM users u WHERE u.role='branch' AND u.status='active' ORDER BY u.kind, u.name").map(orgOut);
    const myBids = new Map();
    if (meId) for (const b of all('SELECT lot_id, MAX(amount) amount, MAX(ref) ref FROM bids WHERE user_id=? GROUP BY lot_id', meId)) myBids.set(b.lot_id, { amt: b.amount, ref: b.ref || '' });
    const lots = all(`SELECT l.* FROM lots l JOIN users u ON u.id=l.org_id WHERE u.status='active' AND l.status!='cancelled' AND (l.status='open' OR l.closed_at>? OR l.id IN (SELECT lot_id FROM bids WHERE user_id=?)) ORDER BY l.end_at`, now() - 14 * DAY, meId || 0).map((l) => pubLot(l, meId, myBids));
    const posts = all('SELECT id,kind,title,body,org_id,ref,closes_at,created_at FROM posts ORDER BY created_at DESC LIMIT 30');
    const out = { settings: { docFee: num(s.docFee, 400), depositPercent: num(s.depositPercent, 5), buyerFeePercent: num(s.buyerFeePercent, 0), payInstructions: s.payInstructions, brandName: s.brandName, paymentDays: num(s.paymentDays, 3), extendDays: num(s.extendDays, 7), pickupDays: num(s.pickupDays, 15), complaintDays: num(s.complaintDays, 3), specialMax: num(s.specialMax, 300000), noLicenceMax: num(s.noLicenceMax, 100000), minBidders: num(s.minBidders, 2), noticeFirst: num(s.noticeFirst, 7), noticeRepeat: num(s.noticeRepeat, 5), enforceNotice: s.enforceNotice === '1', rentPerDay: num(s.rentPerDay, 0), logo: (get("SELECT updated FROM logos WHERE owner='site'") || {}).updated || 0, supportPhone: s.supportPhone || '', supportEmail: s.supportEmail || '', supportAddress: s.supportAddress || '' }, orgs, lots, posts, now: now(), me: null };
    if (user) {
      out.me = { id: user.id, username: user.username, name: user.name, role: user.role, mustChange: !!user.must_change };
      if (user.role === 'bidder') {
        Object.assign(out.me, { tin: user.tin, license: user.license, banUntil: banned(user) ? user.ban_until : 0 });
        out.me.entries = all(ENTRY_SQL + ' WHERE e.user_id=? ORDER BY e.id DESC', user.id).map(entryOut);
        out.me.orders = all("SELECT o.*, l.title, l.org_id oid, (SELECT name FROM users WHERE id=o.org_id) org_name FROM orders o JOIN lots l ON l.id=o.lot_id WHERE o.buyer_id=? ORDER BY o.created_at DESC", user.id).map(orderOut);
        out.me.complaints = all(CMP_SQL + ' WHERE c.user_id=? ORDER BY c.id DESC', user.id).map(cmpOut);
      }
      if (user.role === 'branch') {
        Object.assign(out.me, orgOut(Object.assign({ logo: 0 }, user)));
        out.me.orders = all("SELECT o.*, l.title, (SELECT name FROM users WHERE id=o.buyer_id) buyer_name, (SELECT phone FROM users WHERE id=o.buyer_id) buyer_phone FROM orders o JOIN lots l ON l.id=o.lot_id WHERE o.org_id=? ORDER BY o.created_at DESC", user.id).map(orderOut);
        out.me.entries = all(ENTRY_SQL + " WHERE l.org_id=? AND e.status IN ('pending','refund_due') ORDER BY e.id DESC", user.id).map(entryOut);
        out.me.complaints = all(CMP_SQL + ' WHERE l.org_id=? ORDER BY c.id DESC LIMIT 100', user.id).map(cmpOut);
      }
    }
    return out;
  }
  const orderOut = (o) => {
    const rent = o.status === 'paid' && o.pickup_by && now() > o.pickup_by ? Math.ceil((now() - o.pickup_by) / DAY) * num(settings().rentPerDay, 0) : 0;
    return { id: o.id, lotId: o.lot_id, title: o.title, amount: o.amount, fee: o.fee, deposit: o.deposit, total: o.total, balance: Math.max(0, o.total - o.deposit), status: o.status, dueAt: o.due_at, createdAt: o.created_at, paidAt: o.paid_at, pickupBy: o.pickup_by || 0, extended: !!o.extended, note: o.note || '', rent, branch: o.org_name, buyer: o.buyer_name, buyerPhone: o.buyer_phone };
  };
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
  const userRow = (u) => ({ id: u.id, username: u.username, name: u.name, phone: u.phone, role: u.role, status: u.status, kind: u.kind || 'branch', logo: u.logo || 0, createdAt: u.created_at, lastLogin: u.last_login, bank: u.bank_name, account: u.bank_account, holder: u.bank_holder, cpo: u.cpo_payee, address: u.office_address, officePhone: u.office_phone, view: u.view_info, tin: u.tin, license: u.license, banUntil: u.ban_until > now() ? u.ban_until : 0 });

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
  function decodeLogo(url) {
    const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(url || ''); if (!m) fail(400, 'bad_photo');
    const buf = Buffer.from(m[2], 'base64'); if (buf.length < 100 || buf.length > 200000) fail(400, 'photo_big');
    const ok = (m[1] === 'jpeg' && buf[0] === 0xff && buf[1] === 0xd8) || (m[1] === 'png' && buf.slice(0, 4).toString('hex') === '89504e47') || (m[1] === 'webp' && buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP');
    if (!ok) fail(400, 'bad_photo');
    return { mime: 'image/' + m[1], buf };
  }
  const setLogo = (owner, url) => { const d = decodeLogo(url); run('INSERT INTO logos(owner,mime,data,updated) VALUES(?,?,?,?) ON CONFLICT(owner) DO UPDATE SET mime=excluded.mime,data=excluded.data,updated=excluded.updated', owner, d.mime, d.buf, now()); };
  route('GET', '/api/logo/:owner', async ({ params, res }) => {
    const p = get('SELECT mime,data FROM logos WHERE owner=?', params[0]); if (!p) fail(404, 'not_found');
    res.writeHead(200, { 'Content-Type': p.mime, 'Cache-Control': 'public, max-age=604800', 'X-Content-Type-Options': 'nosniff' }); res.end(Buffer.from(p.data));
  });
  route('PUT', '/api/admin/logo/:owner', async ({ user, body, params, res }) => {
    adm(user); const o = params[0];
    if (o !== 'site' && !get("SELECT 1 FROM users WHERE id=? AND role='branch'", Number(o))) fail(404, 'not_found');
    setLogo(o, body.data); audit(user, 'logo.set', o); notify(); send(res, 200, { ok: true });
  });
  route('DELETE', '/api/admin/logo/:owner', async ({ user, params, res }) => {
    adm(user); run('DELETE FROM logos WHERE owner=?', params[0]); audit(user, 'logo.remove', params[0]); notify(); send(res, 200, { ok: true });
  });
  route('PUT', '/api/logo', async ({ user, body, res }) => {
    need(user); if (user.role !== 'branch') fail(403, 'forbidden'); setLogo(String(user.id), body.data); audit(user, 'logo.set', String(user.id)); notify(); send(res, 200, { ok: true });
  });
  route('DELETE', '/api/logo', async ({ user, res }) => {
    need(user); if (user.role !== 'branch') fail(403, 'forbidden'); run('DELETE FROM logos WHERE owner=?', String(user.id)); notify(); send(res, 200, { ok: true });
  });
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
    const st = settings(), special = body.special ? 1 : 0, repeat = body.repeat ? 1 : 0;
    const price = int(body.price, 1, 1e11, 'bad_price'), step = mode === 'live' ? int(body.step, 1, 1e10, 'bad_step') : 0, days = int(body.days, 1, 30, 'bad_input');
    if (special && price > num(st.specialMax, 300000)) fail(400, 'special_limit', { max: num(st.specialMax, 300000) });
    const minDays = st.enforceNotice === '1' ? num(repeat ? st.noticeRepeat : st.noticeFirst, 7) : 1;
    if (days < minDays) fail(400, 'notice_short', { min: minDays });
    const view = typeof body.view === 'string' ? body.view.trim().slice(0, 200) : '';
    const descr = typeof body.desc === 'string' ? body.desc.trim().slice(0, 1000) : '', ref = typeof body.ref === 'string' ? body.ref.trim().slice(0, 60) : '';
    const photos = Array.isArray(body.photos) ? body.photos.slice(0, 3).map(decodePhoto) : [];
    const id = tx(() => {
      const seq = get('SELECT COALESCE(MAX(seq),0)+1 n FROM lots').n, id = 'CH-' + (4100 + seq);
      run('INSERT INTO lots(seq,id,org_id,title,descr,cat,mode,initial,price,step,end_at,src,ref,duty,photos,created_at,special,repeat,view_info) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', seq, id, orgId, title, descr, cat, mode, price, price, step, st.enforceNotice === '1' ? addWork(now(), days) : now() + days * DAY, src, ref, duty, photos.length, now(), special, repeat, view);
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
  function orderFor(user, id, roles) {
    const o = get('SELECT * FROM orders WHERE id=?', Number(id)); if (!o) fail(404, 'not_found');
    if (user.role === 'branch' && o.org_id !== user.id) fail(403, 'forbidden');
    if (user.role === 'bidder' && o.buyer_id !== user.id) fail(403, 'forbidden');
    return o;
  }
  route('POST', '/api/orders/:id/approve', async ({ user, body, params, res }) => {
    need(user, 'branch', 'admin'); const o = orderFor(user, params[0]); if (o.status !== 'awaiting_approval') fail(409, 'bad_state');
    const lot = get('SELECT * FROM lots WHERE id=?', o.lot_id);
    if (body.decision === 'reject') {
      tx(() => { const e = get('SELECT * FROM entries WHERE lot_id=? AND user_id=?', lot.id, o.buyer_id); if (e) run("UPDATE entries SET status='refund_due',note='Not approved by the branch manager' WHERE id=?", e.id); offerNext(o, lot, 'cancelled', 'Winner not approved by the branch manager'); });
      audit(user, 'order.reject', lot.id);
    } else {
      run("UPDATE orders SET status='awaiting_payment',due_at=? WHERE id=?", addWork(now(), num(settings().paymentDays, 3)), o.id); run('UPDATE lots SET approved_at=? WHERE seq=?', now(), lot.seq);
      audit(user, 'order.approve', lot.id);
    }
    notify(); send(res, 200, { ok: true });
  });
  route('POST', '/api/orders/:id/extend', async ({ user, params, res }) => {
    need(user, 'bidder', 'branch', 'admin'); const o = orderFor(user, params[0]);
    if (o.status !== 'awaiting_payment' || o.extended || o.due_at <= now()) fail(409, 'bad_state');
    run('UPDATE orders SET due_at=?,extended=1 WHERE id=?', addWork(o.due_at, num(settings().extendDays, 7)), o.id); audit(user, 'order.extend', o.lot_id); notify(); send(res, 200, { ok: true });
  });
  route('POST', '/api/orders/:id/status', async ({ user, body, params, res }) => {
    need(user, 'branch', 'admin'); const o = orderFor(user, params[0]), lot = get('SELECT * FROM lots WHERE id=?', o.lot_id);
    const st = body.status; if (!['paid', 'collected', 'defaulted', 'unclaimed'].includes(st)) fail(400, 'bad_input');
    const ok = { paid: ['awaiting_payment'], collected: ['paid'], unclaimed: ['paid'], defaulted: ['awaiting_payment'] }[st]; if (!ok.includes(o.status)) fail(409, 'bad_state');
    tx(() => {
      if (st === 'paid') run("UPDATE orders SET status='paid',paid_at=?,pickup_by=? WHERE id=?", now(), addWork(now(), num(settings().pickupDays, 15)), o.id);
      else if (st === 'defaulted') { forfeit(o, lot, 'Did not pay'); offerNext(o, lot, 'defaulted', 'Winner did not pay'); }
      else run('UPDATE orders SET status=? WHERE id=?', st, o.id);
    });
    audit(user, 'order.' + st, o.lot_id); notify(); send(res, 200, { ok: true });
  });

  /* bidder: profile, entry to a lot, complaints */
  route('PATCH', '/api/profile', async ({ user, body, res }) => {
    need(user, 'bidder', 'branch');
    if (user.role === 'bidder') {
      if (body.tin !== undefined) { const v = String(body.tin).trim(); if (v && !/^\d{10}$/.test(v)) fail(400, 'bad_tin'); run('UPDATE users SET tin=? WHERE id=?', v, user.id); }
      if (body.license !== undefined) run('UPDATE users SET license=? WHERE id=?', str(body.license, 0, 40, 'bad_input'), user.id);
    } else saveProfile(user.id, body);
    audit(user, 'profile.update', user.username); notify(); send(res, 200, { ok: true });
  });
  function saveProfile(id, body) {
    const f = { bank_name: ['bank', 60], bank_account: ['account', 40], bank_holder: ['holder', 80], cpo_payee: ['cpo', 80], office_address: ['address', 160], office_phone: ['phone', 40], view_info: ['view', 200] };
    for (const [col, [key, max]] of Object.entries(f)) if (body[key] !== undefined) run('UPDATE users SET ' + col + '=? WHERE id=?', str(body[key], 0, max, 'bad_input'), id);
  }
  route('POST', '/api/lots/:id/entry', async ({ user, body, params, res }) => {
    need(user, 'bidder'); limit('entry:' + user.id, 30, 3600000);
    if (banned(user)) fail(403, 'banned', { until: user.ban_until });
    const lot = get('SELECT * FROM lots WHERE id=?', params[0]); if (!lot || lot.status !== 'open' || lot.end_at <= now()) fail(409, 'closed');
    const s = settings(), r = reqFor(lot, s);
    if (r.tin && !/^\d{10}$/.test(user.tin)) fail(409, 'need_tin'); if (r.license && !user.license) fail(409, 'need_license');
    const old = get('SELECT * FROM entries WHERE lot_id=? AND user_id=?', lot.id, user.id);
    if (old && old.status !== 'rejected') fail(409, 'entry_exists');
    let docRef = null, cpoNo = null, cpoBank = null, status = 'approved';
    if (r.doc) {
      docRef = str(body.docRef, 4, 40, 'bad_reference').toUpperCase(); cpoNo = str(body.cpoNo, 3, 40, 'bad_cpo'); cpoBank = str(body.cpoBank, 2, 60, 'bad_cpo');
      if (body.attest !== true) fail(400, 'attest_required');
      if (get("SELECT 1 FROM entries WHERE doc_ref=? AND status!='rejected'", docRef)) fail(409, 'reference_used');
      status = 'pending';
    }
    if (old) run('UPDATE entries SET doc_ref=?,cpo_no=?,cpo_bank=?,amount=?,attest=1,status=?,note=NULL,created_at=?,decided_at=NULL WHERE id=?', docRef, cpoNo, cpoBank, r.security, status, now(), old.id);
    else run('INSERT INTO entries(lot_id,user_id,doc_ref,cpo_no,cpo_bank,amount,attest,status,created_at) VALUES(?,?,?,?,?,?,1,?,?)', lot.id, user.id, docRef, cpoNo, cpoBank, r.security, status, now());
    audit(user, 'entry.submit', lot.id); notify(); send(res, 200, { status });
  });
  route('POST', '/api/entries/:id/decide', async ({ user, body, params, res }) => {
    need(user, 'branch', 'admin'); const e = get('SELECT e.*, l.org_id FROM entries e JOIN lots l ON l.id=e.lot_id WHERE e.id=?', Number(params[0])); if (!e) fail(404, 'not_found');
    if (user.role === 'branch' && e.org_id !== user.id) fail(403, 'forbidden'); if (e.status !== 'pending') fail(409, 'already_decided');
    const ok = body.decision === 'approve'; if (!ok && body.decision !== 'reject') fail(400, 'bad_input');
    const note = ok ? null : str(typeof body.note === 'string' && body.note.trim() ? body.note : 'Payment or cheque not verified', 1, 200);
    run('UPDATE entries SET status=?,note=?,decided_at=?,decided_by=? WHERE id=?', ok ? 'approved' : 'rejected', note, now(), user.username, e.id);
    audit(user, ok ? 'entry.approve' : 'entry.reject', e.lot_id, 'user ' + e.user_id); notify(); send(res, 200, { ok: true });
  });
  route('POST', '/api/entries/:id/refund', async ({ user, body, params, res }) => {
    need(user, 'branch', 'admin'); const e = get('SELECT e.*, l.org_id FROM entries e JOIN lots l ON l.id=e.lot_id WHERE e.id=?', Number(params[0])); if (!e) fail(404, 'not_found');
    if (user.role === 'branch' && e.org_id !== user.id) fail(403, 'forbidden'); if (e.status !== 'refund_due') fail(409, 'bad_state');
    run("UPDATE entries SET status='refunded',refund_ref=? WHERE id=?", str(body.ref || 'returned', 1, 60, 'bad_input'), e.id); audit(user, 'entry.refund', e.lot_id, 'user ' + e.user_id); notify(); send(res, 200, { ok: true });
  });
  route('POST', '/api/lots/:id/complaint', async ({ user, body, params, res }) => {
    need(user, 'bidder'); limit('cmp:' + user.id, 10, 3600000);
    const lot = get('SELECT * FROM lots WHERE id=?', params[0]); if (!lot || !lot.closed_at) fail(409, 'bad_state');
    if (!get('SELECT 1 FROM bids WHERE lot_id=? AND user_id=?', lot.id, user.id)) fail(403, 'forbidden');
    if (now() > addWork(lot.closed_at, num(settings().complaintDays, 3))) fail(409, 'complaint_late');
    run('INSERT INTO complaints(lot_id,user_id,body,created_at) VALUES(?,?,?,?)', lot.id, user.id, str(body.body, 5, 1000, 'bad_input'), now()); audit(user, 'complaint.submit', lot.id); notify(); send(res, 200, { ok: true });
  });
  route('POST', '/api/complaints/:id/reply', async ({ user, body, params, res }) => {
    need(user, 'branch', 'admin'); const c = get('SELECT c.*, l.org_id FROM complaints c JOIN lots l ON l.id=c.lot_id WHERE c.id=?', Number(params[0])); if (!c) fail(404, 'not_found');
    if (user.role === 'branch' && c.org_id !== user.id) fail(403, 'forbidden');
    run("UPDATE complaints SET reply=?,status='answered',replied_at=? WHERE id=?", str(body.reply, 1, 1000, 'bad_input'), now(), c.id); audit(user, 'complaint.reply', c.lot_id); notify(); send(res, 200, { ok: true });
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
    send(res, 200, { branches: all("SELECT u.*, COALESCE((SELECT updated FROM logos WHERE owner=CAST(u.id AS TEXT)),0) logo, (SELECT COUNT(*) FROM lots WHERE org_id=u.id) lots, (SELECT COUNT(*) FROM lots WHERE org_id=u.id AND status='open') open FROM users u WHERE role='branch' ORDER BY name").map((u) => Object.assign(userRow(u), { lots: u.lots, open: u.open })) });
  });
  route('POST', '/api/admin/branches', async ({ user, body, res }) => {
    adm(user); const name = str(body.name, 2, 80, 'bad_name'), username = userName(body.username);
    const password = body.password ? body.password : genPassword(); if (!okPassword(password)) fail(400, 'bad_password');
    const kind = body.kind === undefined ? 'branch' : body.kind; if (!['branch', 'organization'].includes(kind)) fail(400, 'bad_input');
    if (get('SELECT 1 FROM users WHERE username=?', username)) fail(409, 'username_taken');
    const r = run("INSERT INTO users(username,name,role,pass,kind,created_at) VALUES(?,?,'branch',?,?,?)", username, name, await hashPw(password), kind, now());
    audit(user, 'branch.create', username, name); notify(); send(res, 200, { id: Number(r.lastInsertRowid), username, name, kind, password });
  });
  route('PATCH', '/api/admin/branches/:id', async ({ user, body, params, res }) => {
    adm(user); const b = get("SELECT * FROM users WHERE id=? AND role='branch'", Number(params[0])); if (!b) fail(404, 'not_found');
    const out = { ok: true };
    if (body.name !== undefined) { run('UPDATE users SET name=? WHERE id=?', str(body.name, 2, 80, 'bad_name'), b.id); audit(user, 'branch.rename', b.username, body.name); }
    if (body.kind !== undefined) { if (!['branch', 'organization'].includes(body.kind)) fail(400, 'bad_input'); run('UPDATE users SET kind=? WHERE id=?', body.kind, b.id); audit(user, 'branch.kind', b.username, body.kind); }
    saveProfile(b.id, body);
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
    if (body.unban) { run('UPDATE users SET ban_until=0 WHERE id=?', u.id); run('DELETE FROM forfeits WHERE user_id=?', u.id); audit(user, 'user.unban', u.username); }
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
  route('GET', '/api/admin/entries', async ({ user, res, url }) => {
    adm(user); const st = url.searchParams.get('status'), q = ['pending', 'approved', 'rejected', 'applied', 'refund_due', 'refunded', 'forfeited'].includes(st) ? st : 'pending';
    send(res, 200, { entries: all(ENTRY_SQL + ' WHERE e.status=? ORDER BY e.id DESC LIMIT 300', q).map(entryOut) });
  });
  route('GET', '/api/admin/complaints', async ({ user, res }) => { adm(user); send(res, 200, { complaints: all(CMP_SQL + ' ORDER BY c.id DESC LIMIT 200').map(cmpOut) }); });
  route('GET', '/api/admin/settings', async ({ user, res }) => { adm(user); send(res, 200, { settings: settings(), logo: (get("SELECT updated FROM logos WHERE owner='site'") || {}).updated || 0 }); });
  route('PUT', '/api/admin/settings', async ({ user, body, res }) => {
    adm(user);
    const n = (k, a, b) => () => String(int(body[k], a, b));
    const rules = { depositPercent: n('depositPercent', 0, 100), buyerFeePercent: n('buyerFeePercent', 0, 50), paymentDays: n('paymentDays', 1, 30), extendDays: n('extendDays', 0, 30), pickupDays: n('pickupDays', 1, 90), complaintDays: n('complaintDays', 1, 30), docFee: n('docFee', 0, 100000), specialMax: n('specialMax', 0, 1e9), noLicenceMax: n('noLicenceMax', 0, 1e9), noticeFirst: n('noticeFirst', 1, 30), noticeRepeat: n('noticeRepeat', 1, 30), enforceNotice: () => (body.enforceNotice === true || body.enforceNotice === 1 || body.enforceNotice === '1' ? '1' : '0'), minBidders: n('minBidders', 1, 10), tieHours: n('tieHours', 1, 240), rentPerDay: n('rentPerDay', 0, 1e7), antiSnipeMinutes: n('antiSnipeMinutes', 0, 30), payInstructions: () => str(body.payInstructions, 0, 600), brandName: () => str(body.brandName, 1, 40), supportPhone: () => str(body.supportPhone, 0, 40), supportEmail: () => str(body.supportEmail, 0, 80), supportAddress: () => str(body.supportAddress, 0, 160) };
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
    'Content-Security-Policy': "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
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
