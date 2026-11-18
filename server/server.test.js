'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const { createApp } = require('./server');

const PHOTO = 'data:image/jpeg;base64,' + Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(200, 7)]).toString('base64');

test('chereta backend end to end', async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'chereta-'));
  let T = 1_800_000_000_000;
  const app = createApp({ dataDir: dir, now: () => T, log: () => {} });
  process.env.ADMIN_PASSWORD = 'Admin-pass-1';
  const adminInfo = await app.ensureAdmin(); delete process.env.ADMIN_PASSWORD;
  const port = await app.listen(0), base = 'http://127.0.0.1:' + port;
  t.after(() => app.close());

  function client() {
    let cookie = '';
    return async (method, url, body, extra) => {
      const r = await fetch(base + url, { method, headers: Object.assign({ 'Content-Type': 'application/json', 'X-Requested-With': 'chereta', Cookie: cookie }, extra || {}), body: body ? JSON.stringify(body) : undefined });
      const sc = r.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0].startsWith('cs=') && sc.includes('Max-Age=0') ? '' : sc.split(';')[0];
      const text = await r.text(); let j = {}; try { j = JSON.parse(text); } catch (e) { j = { text }; }
      return { s: r.status, j };
    };
  }
  const A = client(), B = client(), U1 = client(), U2 = client(), anon = client();

  await t.test('administrator signs in, wrong password refused, CSRF header required', async () => {
    assert.equal(adminInfo.username, 'admin');
    assert.equal((await A('POST', '/api/login', { identifier: 'admin', password: 'wrong' })).s, 401);
    assert.equal((await A('POST', '/api/login', { identifier: 'admin', password: 'Admin-pass-1' })).s, 200);
    const r = await fetch(base + '/api/logout', { method: 'POST' }); assert.equal(r.status, 403);
    assert.equal((await A('GET', '/api/admin/overview')).s, 200);
    assert.equal((await anon('GET', '/api/admin/overview')).s, 401);
  });

  await t.test('admin creates a branch with a username and password; branch signs in', async () => {
    const r = await A('POST', '/api/admin/branches', { name: 'Kality Customs', username: 'kality', password: 'kality-2026' });
    assert.equal(r.s, 200); assert.equal(r.j.password, 'kality-2026');
    assert.equal((await A('POST', '/api/admin/branches', { name: 'Dup', username: 'KALITY' })).s, 409);
    assert.equal((await A('POST', '/api/admin/branches', { name: 'Digits', username: '911234567' })).s, 400);
    const g = await A('POST', '/api/admin/branches', { name: 'Bole Airport', username: 'bole' }); assert.equal(g.s, 200); assert.ok(g.j.password.length >= 8);
    assert.equal((await B('POST', '/api/login', { identifier: 'kality', password: 'nope' })).s, 401);
    const l = await B('POST', '/api/login', { identifier: 'kality', password: 'kality-2026' }); assert.equal(l.s, 200); assert.equal(l.j.user.role, 'branch');
    assert.equal((await B('GET', '/api/admin/overview')).s, 403);
  });

  let live, sealed;
  await t.test('branch posts live and sealed lots with a photo', async () => {
    const lotBase = { title: 'Toyota Hilux 2018', cat: 'vehicle', src: 'seized', duty: 'buyer', ref: 'KLT/1', days: 3, desc: 'Diesel', photos: [PHOTO] };
    live = (await B('POST', '/api/lots', Object.assign({ mode: 'live', price: 1000000, step: 10000 }, lotBase))).j.id;
    sealed = (await B('POST', '/api/lots', Object.assign({ mode: 'sealed', price: 500000 }, lotBase, { title: 'Filters', photos: [] }))).j.id;
    assert.match(live, /^CH-41\d\d$/);
    assert.equal((await B('POST', '/api/lots', { mode: 'live', price: 5, title: 'x' })).s, 400);
    assert.equal((await B('POST', '/api/lots', Object.assign({ mode: 'live', price: 1000, step: 10 }, lotBase, { photos: ['data:image/jpeg;base64,AAAA'] }))).s, 400);
    const p = await fetch(base + '/api/photo/' + live + '/0'); assert.equal(p.status, 200); assert.equal(p.headers.get('content-type'), 'image/jpeg');
    const st = (await anon('GET', '/api/state')).j; assert.equal(st.lots.length, 2); assert.equal(st.orgs.length, 2);
    assert.equal(st.lots.find((l) => l.id === sealed).price, 500000);
  });

  await t.test('bidders register and bid; rules are enforced on the server', async () => {
    assert.equal((await U1('POST', '/api/register', { name: 'Abebe Kebede', phone: '0911 234 567', password: 'short' })).s, 400);
    assert.equal((await U1('POST', '/api/register', { name: 'Abebe Kebede', phone: '0911 234 567', password: 'abebe-pass-1' })).s, 200);
    assert.equal((await U2('POST', '/api/register', { name: 'Sara Tesfaye', phone: '+251922000111', password: 'sara-pass-1' })).s, 200);
    assert.equal((await U2('POST', '/api/register', { name: 'Dup', phone: '922000111', password: 'sara-pass-1' })).s, 409);
    assert.equal((await B('POST', '/api/lots/' + live + '/bid', { amount: 2000000 })).s, 403); // branch cannot bid
    assert.equal((await anon('POST', '/api/lots/' + live + '/bid', { amount: 2000000 })).s, 401);
    assert.equal((await U1('POST', '/api/lots/' + live + '/bid', { amount: 999999 })).j.error, 'low_bid');
    assert.equal((await U1('POST', '/api/lots/' + live + '/bid', { amount: 1000000 })).s, 200); // first bid at the initial price
    assert.equal((await U1('POST', '/api/lots/' + live + '/bid', { amount: 1100000 })).j.error, 'leading');
    const low = await U2('POST', '/api/lots/' + live + '/bid', { amount: 1005000 }); assert.equal(low.j.error, 'low_bid'); assert.equal(low.j.min, 1010000);
    assert.equal((await U2('POST', '/api/lots/' + live + '/bid', { amount: 1010000 })).s, 200);
    assert.equal((await U1('POST', '/api/lots/' + live + '/bid', { amount: 1500000 })).s, 200);
    const s1 = (await U1('GET', '/api/state')).j, l1 = s1.lots.find((l) => l.id === live);
    assert.equal(l1.price, 1500000); assert.equal(l1.leader, 'you'); assert.equal(l1.bidders, 2); assert.equal(l1.hist[0].mine, true);
    assert.ok(!JSON.stringify(s1).includes('Abebe') || s1.me.name === 'Abebe Kebede');
    const s2 = (await U2('GET', '/api/state')).j; assert.equal(s2.lots.find((l) => l.id === live).leader, 'other');
    // sealed
    const sb = await U1('POST', '/api/lots/' + sealed + '/bid', { amount: 600000 }); assert.equal(sb.s, 200); assert.match(sb.j.ref, /^CH-\d{6}$/);
    assert.equal((await U1('POST', '/api/lots/' + sealed + '/bid', { amount: 400000 })).j.error, 'low_bid');
    assert.equal((await U2('POST', '/api/lots/' + sealed + '/bid', { amount: 700000 })).s, 200);
    assert.equal((await U1('POST', '/api/lots/' + sealed + '/bid', { amount: 650000 })).j.ref, sb.j.ref); // update keeps receipt
    const pub = (await anon('GET', '/api/state')).j.lots.find((l) => l.id === sealed); assert.equal(pub.price, 500000); assert.equal(pub.bidders, 2); assert.equal(pub.hist, undefined);
    assert.equal((await B('POST', '/api/lots', { mode: 'live' })).s, 400);
    assert.equal((await B('DELETE', '/api/lots/' + live)).j.error, 'has_bids');
  });

  await t.test('anti sniping extends a live lot bid in the last minutes', async () => {
    const before = (await anon('GET', '/api/state')).j.lots.find((l) => l.id === live).end;
    T = before - 30000;
    const r = await U2('POST', '/api/lots/' + live + '/bid', { amount: 1600000 }); assert.equal(r.s, 200); assert.equal(r.j.end, T + 120000);
  });

  await t.test('lots close, winners and orders are created, results are visible', async () => {
    T += 4 * 86400000; app.closeDue();
    await A('POST', '/api/login', { identifier: 'admin', password: 'Admin-pass-1' }); await B('POST', '/api/login', { identifier: 'kality', password: 'kality-2026' });
    await U1('POST', '/api/login', { identifier: '911234567', password: 'abebe-pass-1' }); await U2('POST', '/api/login', { identifier: '0922000111', password: 'sara-pass-1' });
    const sU1 = (await U1('GET', '/api/state')).j, sU2 = (await U2('GET', '/api/state')).j;
    const lv = sU2.lots.find((l) => l.id === live), sl = sU1.lots.find((l) => l.id === sealed);
    assert.equal(lv.status, 'sold'); assert.equal(lv.youWon, true); assert.equal(lv.finalPrice, 1600000);
    assert.equal(sl.status, 'sold'); assert.equal(sl.youWon, false); assert.equal(sl.finalPrice, 700000);
    const o = sU2.me.orders.find((x) => x.lotId === live); assert.equal(o.amount, 1600000); assert.equal(o.fee, 32000); assert.equal(o.total, 1632000); assert.equal(o.deposit, 50000);
    assert.equal(sU1.me.orders.length, 0);
    assert.equal((await U1('POST', '/api/lots/' + sealed + '/bid', { amount: 900000 })).j.error, 'closed');
    const bo = (await B('GET', '/api/state')).j.me.orders; assert.equal(bo.length, 2); assert.equal(bo[0].buyer.length > 0, true);
    assert.equal((await U2('POST', '/api/orders/' + o.id + '/status', { status: 'paid' })).s, 403);
    assert.equal((await B('POST', '/api/orders/' + o.id + '/status', { status: 'paid' })).s, 200);
    const ov = (await A('GET', '/api/admin/overview')).j; assert.equal(ov.soldLots, 2); assert.equal(ov.fees, 32000); assert.equal(ov.soldValue, 2300000);
    const csv = await fetch(base + '/api/admin/orders.csv', { headers: { Cookie: '' } }); assert.equal(csv.status, 401);
  });

  await t.test('admin controls: lots, extend, cancel, bids, branches, bidders, settings, audit', async () => {
    const id = (await B('POST', '/api/lots', { mode: 'sealed', price: 90000, title: 'Tires', cat: 'parts', src: 'uncleared', duty: 'incl', days: 1 })).j.id;
    assert.equal((await A('POST', '/api/admin/lots/' + id + '/extend', { hours: 24 })).s, 200);
    assert.equal((await U1('POST', '/api/lots/' + id + '/bid', { amount: 95000 })).s, 200);
    const bids = (await A('GET', '/api/admin/lots/' + id + '/bids')).j.bids; assert.equal(bids[0].name, 'Abebe Kebede'); assert.equal(bids[0].phone, '911234567');
    assert.equal((await A('POST', '/api/admin/lots/' + id + '/cancel', { reason: 'Wrong description' })).s, 200);
    assert.equal((await anon('GET', '/api/state')).j.lots.some((l) => l.id === id), false);
    // suspend a branch: it cannot sign in and its lots disappear
    const kb = (await A('GET', '/api/admin/branches')).j.branches.find((b) => b.username === 'kality');
    assert.equal((await A('PATCH', '/api/admin/branches/' + kb.id, { status: 'suspended' })).s, 200);
    assert.equal((await B('GET', '/api/state')).j.me, null); // session ended
    assert.equal((await B('POST', '/api/login', { identifier: 'kality', password: 'kality-2026' })).s, 403);
    assert.equal((await anon('GET', '/api/state')).j.orgs.length, 1);
    assert.equal((await A('PATCH', '/api/admin/branches/' + kb.id, { status: 'active' })).s, 200);
    // reset password
    const rp = (await A('PATCH', '/api/admin/branches/' + kb.id, { resetPassword: true })).j; assert.ok(rp.password);
    assert.equal((await B('POST', '/api/login', { identifier: 'kality', password: rp.password })).s, 200);
    assert.equal((await A('DELETE', '/api/admin/branches/' + kb.id)).j.error, 'has_lots');
    // bidders
    const users = (await A('GET', '/api/admin/users')).j.users; assert.equal(users.length, 2);
    assert.equal((await A('PATCH', '/api/admin/users/' + users[0].id, { status: 'suspended' })).s, 200);
    assert.equal((await A('GET', '/api/admin/users?role=admin')).j.users.length, 1);
    assert.equal((await A('PATCH', '/api/admin/users/1', { status: 'suspended' })).j.error, 'self');
    // settings change applies to the next sale
    assert.equal((await A('PUT', '/api/admin/settings', { buyerFeePercent: 3, payInstructions: 'Pay at CBE 1000' })).j.settings.buyerFeePercent, '3');
    assert.equal((await anon('GET', '/api/state')).j.settings.buyerFeePercent, 3);
    assert.equal((await A('PUT', '/api/admin/settings', { buyerFeePercent: 500 })).s, 400);
    // posts
    assert.equal((await A('POST', '/api/admin/posts', { kind: 'news', title: 'Inspection week', body: 'Mon to Fri at the warehouse' })).s, 200);
    assert.equal((await anon('GET', '/api/state')).j.posts.length, 1);
    const log = (await A('GET', '/api/admin/audit')).j.entries.map((e) => e.action); assert.ok(log.includes('branch.create') && log.includes('lot.cancel') && log.includes('branch.suspended'));
  });

  await t.test('password change, session logout, rate limit', async () => {
    assert.equal((await U2('POST', '/api/password', { current: 'wrong-wrong', next: 'new-password-1' })).s, 403);
    assert.equal((await U2('POST', '/api/password', { current: 'sara-pass-1', next: 'new-password-1' })).s, 200);
    assert.equal((await U2('POST', '/api/logout')).s, 200); assert.equal((await U2('GET', '/api/state')).j.me, null);
    assert.equal((await anon('POST', '/api/login', { identifier: '922000111', password: 'new-password-1' })).s, 200);
    let last; for (let i = 0; i < 10; i++) last = await client()('POST', '/api/login', { identifier: 'ghost', password: 'x' }); assert.equal(last.s, 429);
  });

  await t.test('static files and security headers', async () => {
    fs.mkdirSync(path.join(__dirname, '..', 'public'), { recursive: true });
    const r = await fetch(base + '/'); assert.equal(r.status, 200); assert.match(r.headers.get('content-security-policy'), /default-src 'self'/);
    assert.equal((await fetch(base + '/..%2fserver%2fserver.js')).status === 200, false);
    assert.equal((await fetch(base + '/nope.txt')).status, 404);
  });
});
