# Chereta: customs auctions website

A website (no app to install) for the Ethiopian Customs Commission to sell uncleared, seized and abandoned goods.
English and Amharic. Live and sealed bidding. Everything runs from one small Node program with a built-in database file.

## Who does what

| Who | Where | What they can do |
|---|---|---|
| **Commission administrators** | `/admin` | Create and manage branch logins (name, username, password), see and cancel or extend any lot, see every bid, sales and payments (CSV export), manage bidders and other administrators, post news and tenders, set fees and contact details, read the activity log |
| **Branches** | public site, "For customs branches" | Sign in with the username and password the admin created, post lots (photos, live or sealed), see their sales and mark payments |
| **Bidders** | public site | Register with name, phone and password, bid, watch lots, see results and what to pay |

## Run it on your computer (VS Code)

Needs Node 22.5 or newer (https://nodejs.org). No `npm install` is needed: there are no dependencies.

```
cd chereta-customs
ADMIN_USERNAME=admin ADMIN_PASSWORD=choose-a-long-password node server/server.js
```
On Windows PowerShell: `$env:ADMIN_PASSWORD="choose-a-long-password"; node server/server.js`

Open http://localhost:3000 (public site) and http://localhost:3000/admin (admin console).
If you do not set `ADMIN_PASSWORD`, a random one is printed once in the terminal on first start.

Demo data for rehearsals (never on the real server):
```
ADMIN_PASSWORD=choose-a-long-password node server/seed.js http://localhost:3000
```
This creates four sample branches (kality, modjo, airport, diredawa; password `Branch-<username>-2026`), six lots and sample news.

Run the automated tests: `npm test`.

## Put it online with GitHub

1. Create a GitHub repository and push this folder (`.gitignore` already excludes the database and secrets).
2. Deploy from the repository on any host that runs Node or Docker and gives the program a **persistent disk** (the database is the file `data/chereta.db`). `render.yaml` and `Dockerfile` are included, so on Render you choose "New Blueprint" and point it at the repository. Railway, Fly.io or an ordinary VPS also work.
3. Set the environment variables below. Serve it over HTTPS and set `COOKIE_SECURE=1`.
4. Open `/admin`, sign in, change the password when asked, then create the branches.

GitHub Pages alone cannot run this, because it only hosts static files and Chereta needs the server.

## Environment variables

| Name | Default | Meaning |
|---|---|---|
| `PORT` | 3000 | Port to listen on |
| `DATA_DIR` | `./data` | Folder holding the database. Put it on a persistent disk and back it up |
| `ADMIN_USERNAME` | admin | First administrator, created only if no administrator exists |
| `ADMIN_PASSWORD` | random, printed once | First administrator password |
| `COOKIE_SECURE` | off | Set to `1` when served over HTTPS |

## Backups

Copy `data/chereta.db` (and the `-wal` file next to it while running) regularly, or use the host's disk snapshots. Admin console, Sales, "Export CSV" also gives a spreadsheet of all orders.

## How an auction works

* **Live lot**: the first bid is at the initial price, then each bid must be at least the current price plus the step. You cannot outbid yourself. A bid in the last minutes extends the closing time (anti-sniping, default 2 minutes, adjustable).
* **Sealed lot**: each bidder submits one amount (they may raise it before closing). Nobody sees amounts. The highest valid bid wins; a tie goes to the earliest bid.
* When a lot closes the server picks the winner and creates an order: winning bid + buyer fee (default 2%), with the due date (default 3 days). The winner sees it on the lot page; the branch marks it paid or collected.
* Payments are made outside the site (Telebirr, CBE Birr, bank). The site records them; it does not move money.

## Security notes

Passwords are hashed with scrypt; sessions are HttpOnly cookies; state-changing calls need a custom header (CSRF defence); logins and registrations are rate limited; security headers and a strict Content-Security-Policy are set; every administrator action is written to the activity log. Before real money is handled, have an independent party review it and the host setup.

## Not included yet (be clear with the client)

Online payment collection, identity checks (TIN, Fayda), SMS verification, real Terms and Privacy text approved by the Commission's lawyers, email notifications. The terms and privacy pages contain sample text only.

## Folder map

```
server/server.js   the whole backend (API, auth, auction rules, database)
server/server.test.js  automated tests
server/seed.js     optional demo data
public/            the website (index.html, admin.html, css/, js/)
```
