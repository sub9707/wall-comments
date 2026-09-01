# Biodance Pink Drop Wall

Kiosk-style interactive Comments Wall for a Biodance beauty-brand event.
Visitors type a short note and hit Enter; it's saved to a local SQLite DB
and appears on screen as a floating translucent "pink serum bubble." See
`draft.md` for the full spec this implements.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · three.js / React Three
Fiber · better-sqlite3 · Zustand · Pretendard · PM2.

No external services (no Supabase/Firebase/WebSocket/SSE) — everything
runs from a single local SQLite file on the venue PC.

## Setup

```bash
npm install
cp .env.example .env.local   # then set a real ADMIN_PASSWORD
npm run build
npm run start                # production server on http://localhost:3000
```

`/admin` is the operator panel (password from `ADMIN_PASSWORD`). It is
not linked from the main wall.

## Running under PM2 (event day)

```bash
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup     # follow the printed instructions once, so PM2 survives a PC reboot
```

Useful ops commands:

```bash
pm2 restart biodance   # after a config/env change
pm2 logs biodance       # tail logs
pm2 status
```

## Data & backups

- The database lives at `data/biodance.db` (WAL mode). It is never
  committed to git.
- `POST /api/admin/backup` (from the admin panel's Backup button) copies
  the live DB into `backup/biodance-{dateKey}-{timestamp}.db` using
  better-sqlite3's hot-backup API — safe to run while the app is live.
- "CLEAR SCREEN" in the admin panel only resets the on-screen
  visualization; it never touches the database. "DELETE TODAY'S DATA" is
  the only destructive action and requires an explicit confirmation.

## Kiosk display setup

The app can't fully control browser chrome from JavaScript. For the
actual event display, launch Chrome in kiosk mode pointed at the app,
e.g.:

```bash
chrome --kiosk http://localhost:3000
```

The page itself hides the cursor after a few seconds of inactivity and
blocks the right-click context menu and text selection.

## Verification performed in development

- `npm run build` and `npm run lint` are clean.
- Manual API testing: POST validation (empty/too-long/HTML/URL/banned
  words/duplicate/rate-limit), `GET /api/comments/today`, and
  `GET /api/stats/today` all verified against a running production
  server, confirming DB-first writes and correct KST `dateKey`
  computation.
- Restart-recovery: the wall re-fetches `/api/comments/today` on mount
  and rehydrates the bubble pool + counter, so a PM2 restart or browser
  refresh doesn't lose the current day's data or count.

### Not yet run — do before the event

These require the physical kiosk setup and real time, so they weren't
feasible in the development session:

- **8–12 hour unattended soak test** (draft.md §70 Test 8) — watch for
  FPS degradation, memory growth, or DOM/listener leaks over a full
  event day.
- **PC reboot recovery test** (draft.md §70 Test 7) — confirm PM2
  auto-starts the app after a full Windows restart and that `pm2
  startup` was configured correctly for the venue machine.
- **Large-volume load test** (1,000–5,000+ comments) directly against
  the venue hardware, to confirm real-world FPS with the pool capped at
  45 active bubbles.

## Project structure

See `src/app`, `src/components/{biodance,pink-drop,admin}`, and
`src/lib` — component/module responsibilities are documented at the top
of each file where the reasoning isn't obvious from the name alone.
