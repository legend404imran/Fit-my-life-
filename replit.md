# Fit My Life

A complete production-ready Progressive Web App for personal fitness tracking — dashboard, food, water, workout, sleep, habits, mood, progress, reminders, calendar, notes, and reports. Everything stored locally (IndexedDB + localStorage), no backend, no login required.

## Run & Operate

- `pnpm --filter @workspace/fit-my-life run dev` — run the PWA dev server
- App served at `/` (port assigned by workflow)

## Stack

- pnpm workspaces, Node.js 24, Vite
- **Frontend**: Vanilla JavaScript ES2023, CSS3 (glassmorphism)
- **Storage**: IndexedDB (workouts, meals, water, sleep, habits, moods, notes, measurements) + localStorage (profile, settings, streak)
- **Charts**: Custom Canvas 2D + SVG (no chart library)
- **PWA**: manifest.json + service worker (sw.js) in `public/`

## Where things live

- `artifacts/fit-my-life/src/main.js` — app bootstrap, SW registration
- `artifacts/fit-my-life/src/router.js` — hash-based SPA router (#/ routes)
- `artifacts/fit-my-life/src/db.js` — IndexedDB wrapper (all persistent data)
- `artifacts/fit-my-life/src/store.js` — localStorage sync (profile, settings)
- `artifacts/fit-my-life/src/styles.css` — all styles (glassmorphism design system)
- `artifacts/fit-my-life/src/pages/` — 15 page modules (dashboard, food, water, workout, etc.)
- `artifacts/fit-my-life/src/components/` — nav, fab, charts, modals, toast
- `artifacts/fit-my-life/src/utils/` — exercises-db, foods-db, quotes, calculations, icons
- `artifacts/fit-my-life/public/` — manifest.json, sw.js, icons/

## Architecture decisions

- **No framework**: Pure vanilla JS in Vite. React scaffold replaced entirely; index.html loads `/src/main.js`.
- **Hash router**: All navigation uses `#/route` — no server-side routing needed for a PWA.
- **IDB-first**: Heavy data (workouts, meals, history) in IndexedDB via a thin promise wrapper. Profile/settings in localStorage for fast sync access.
- **Custom charts**: Canvas 2D for bar/line charts, SVG for progress rings — zero external chart dependencies, full animation control.
- **CSS variables for theming**: Dark mode is the default; light mode applies `.light-mode` class to `<body>`.

## Product

15 fully wired sections: Dashboard (live rings + stats), Food Tracker (breakfast/lunch/dinner/snacks with 100+ food DB), Water Tracker (animated bottle + reminders), Workout Tracker (templates + exercise sets + rest timer + PR detection), Exercise Library (50+ exercises), Sleep Tracker, Habit Tracker, Mood Tracker, Progress Tracker (charts + body measurements + photos), Calendar (multi-data dots), Notes (pinnable journal), Reminders (browser notifications), Reports (daily/weekly/monthly + JSON/CSV export), Settings (theme, data backup/restore), Profile (auto-calculated TDEE + macros).

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Vite serves public/ at root — sw.js and manifest.json are at `public/sw.js` and `public/manifest.json`.
- The React scaffold files (`src/App.tsx`, `src/main.tsx`) are still present but unused — `index.html` points to `src/main.js` instead.
- All page modules export `async render(container)` — always clear container before rendering.
- IndexedDB is initialized asynchronously in `db.js`; use `await DB.ready()` before first query.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
