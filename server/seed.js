// Optional demo data for rehearsals and demos. Never run this on the real Commission server.
// Usage:  ADMIN_USERNAME=admin ADMIN_PASSWORD=... node server/seed.js http://localhost:3000
const base = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const user = process.env.ADMIN_USERNAME || 'admin', pass = process.env.ADMIN_PASSWORD;
if (!pass) { console.error('Set ADMIN_PASSWORD to the admin password.'); process.exit(1); }
let cookie = '';
async function api(method, url, body, ck) {
  const r = await fetch(base + url, { method, headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'chereta', cookie: ck ?? cookie }, body: body ? JSON.stringify(body) : undefined });
  const sc = r.headers.get('set-cookie'); if (sc && ck === undefined) cookie = sc.split(';')[0];
  const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(method + ' ' + url + ' ' + (j.error || r.status)); return { j, sc };
}
(async () => {
  await api('POST', '/api/login', { identifier: user, password: pass });
  const branches = [['Kality Customs Branch', 'kality'], ['Modjo Dry Port Branch', 'modjo'], ['Addis Ababa Airport Branch', 'airport'], ['Dire Dawa Customs Branch', 'diredawa']];
  const made = [];
  for (const [name, username] of branches) { try { const r = await api('POST', '/api/admin/branches', { name, username, password: 'Branch-' + username + '-2026' }); made.push([username, r.j.password]); } catch (e) { console.log('skip', username, e.message); } }
  await api('PUT', '/api/admin/settings', { supportPhone: '+251 11 000 0000', supportEmail: 'auctions@example.et', supportAddress: 'Addis Ababa (set the real address in Settings)' });
  const lots = [
    ['kality', 'Toyota Hilux 2016, uncleared', 'vehicle', 'live', 850000, 10000, 2, 'uncleared', 'DEC-2026-0412', 'Double cab, diesel, manual. Inspection at Kality yard.'],
    ['kality', 'Industrial sewing machines, 12 units', 'machinery', 'sealed', 300000, 0, 5, 'seized', 'SZ-2026-118', 'Twelve Juki industrial machines, boxed.'],
    ['modjo', 'Used laptops, mixed brands, 40 units', 'electronics', 'sealed', 420000, 0, 4, 'abandoned', 'AB-2026-077', 'Mixed brands, sold as one lot.'],
    ['modjo', 'Diesel generator 100 kVA', 'power', 'live', 520000, 5000, 3, 'uncleared', 'DEC-2026-0388', 'Perkins engine, 100 kVA, low hours.'],
    ['airport', 'Office furniture set, 30 pieces', 'furniture', 'live', 95000, 2000, 1, 'seized', 'SZ-2026-131', 'Desks, chairs and cabinets.'],
    ['diredawa', 'Car spare parts, mixed pallets', 'parts', 'sealed', 150000, 0, 6, 'uncleared', 'DEC-2026-0440', 'Brake pads, filters and belts.'],
  ];
  for (const [u, title, cat, mode, price, step, days, src, ref, desc] of lots) {
    const pw = 'Branch-' + u + '-2026';
    const lg = await api('POST', '/api/login', { identifier: u, password: pw }, '');
    const ck = lg.sc.split(';')[0];
    await api('POST', '/api/lots', { title, cat, mode, price, step, days, src, duty: 'incl', ref, desc, photos: [] }, ck);
  }
  await api('POST', '/api/admin/posts', { kind: 'news', title: 'Chereta online auctions are open', body: 'Registered bidders can now bid on lots from customs branches. Sample content: replace it in the admin console.' });
  await api('POST', '/api/admin/posts', { kind: 'tender', title: 'Sample tender notice', body: 'Replace this with a real tender from the admin console.', ref: 'TN-2026-001', closesAt: Date.now() + 20 * 86400000 });
  console.log('Seeded. Branch logins: username kality / modjo / airport / diredawa, password Branch-<username>-2026');
})().catch((e) => { console.error(e.message); process.exit(1); });
