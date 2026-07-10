# LifeCLI

A private, local-first personal dashboard — **Finance, Habits, Watchlist (movies/series), and a daily overview** — that runs entirely in the browser or as a desktop app. No backend, no accounts: all data stays on your device in IndexedDB.

> The UI is in Bulgarian; the code/identifiers are in English.

## Features

- **Табло (Dashboard)** — a bento-grid overview with weather (Open-Meteo, no API key), current-month balance, longest habit streak, today's habits (togglable), and what you're currently watching. Subtle glassmorphism UI with a lightweight 3D background (three.js) that respects `prefers-reduced-motion`.
- **Финанси (Finance)** — income/expense tracking in **EUR**, monthly report with category breakdown and a chart.
- **Навици (Habits)** — daily habit tracking with streaks and a 12-week activity heatmap.
- **Гледане (Watch)** — a kanban board split by type (movies/series) × status (to-watch / watching / watched), with ratings and progress.
- **Настройки (Settings)** — JSON **backup export/import** (your data lives only on this device, so back it up), plus a one-time lev→euro reconversion helper.

## Tech stack

Vite · React · TypeScript · Tailwind CSS v4 · Dexie (IndexedDB) · React Router · Recharts · date-fns · framer-motion · three.js / @react-three/fiber / drei · self-hosted fonts (@fontsource) · **Tauri v2** (desktop packaging).

## Run in the browser (dev)

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + production build to dist/
```

## Run as a desktop app (Tauri)

Requires the [Tauri v2 prerequisites](https://tauri.app/start/prerequisites/): Rust (stable), a C/C++ toolchain (MSVC on Windows), and the platform webview (WebView2 on Windows).

```bash
npm run tauri:dev    # launches the native window with hot reload
npm run tauri:build  # produces installers in src-tauri/target/release/bundle/
```

On Windows this yields an NSIS `*-setup.exe` and a `*.msi`.

## Data & privacy

All data is stored locally (IndexedDB in the browser / the app's WebView storage). The browser and the installed app use **separate** storage — to move data between them, use **Настройки → Свали резервно копие** (export) and **Възстанови от файл** (import). Only the weather feature makes a network request (to Open-Meteo).

## License

Personal project — no license specified yet.
