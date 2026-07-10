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

## Getting started — run it on your device

There is no hosted version and no sign-up: you run LifeCLI yourself and all data stays on your machine. There are two ways to run it — the browser (quickest) or as a native desktop app.

### Prerequisites

- **[Node.js](https://nodejs.org/) 20+** (LTS recommended) — this includes `npm`. Needed for both options.
- **For the desktop app only**, also install the [Tauri v2 prerequisites](https://tauri.app/start/prerequisites/):
  - **Rust** (stable) via [rustup](https://rustup.rs/).
  - A **C/C++ build toolchain** — on **Windows** the *Microsoft C++ Build Tools* (or Visual Studio with the "Desktop development with C++" workload); on **macOS** the *Xcode Command Line Tools* (`xcode-select --install`); on **Linux** `build-essential` and the WebKitGTK dev packages.
  - A **system webview** — **WebView2** on Windows (preinstalled on Windows 10/11), **WebKitGTK** on Linux, built-in on macOS.

### 1. Get the code

```bash
git clone https://github.com/ivanstegen/LifeCLI.git
cd LifeCLI
npm install
```

(Or download the ZIP from the green **Code** button on GitHub, extract it, open a terminal in the folder, and run `npm install`.)

### Option A — run in your browser (easiest, no Rust needed)

```bash
npm run dev
```

Open **http://localhost:5173** in your browser. That's it — add finances, habits, and watchlist items; everything is saved locally in the browser's IndexedDB and persists across restarts.

To make an optimized production build instead:

```bash
npm run build     # type-checks and outputs to dist/
npm run preview   # serve the built app locally to check it
```

### Option B — install it as a native desktop app (Tauri)

This needs the desktop prerequisites above.

```bash
npm run tauri:dev     # opens the app in a native window with hot reload
```

To build a real installer you can double-click:

```bash
npm run tauri:build
```

The installers are written to `src-tauri/target/release/bundle/`:

- **Windows:** `nsis/LifeCLI_<version>_x64-setup.exe` (recommended) and `msi/LifeCLI_<version>_x64_en-US.msi`
- **macOS:** a `.dmg` and `.app` under `bundle/dmg` and `bundle/macos`
- **Linux:** `.AppImage` and `.deb` under `bundle/appimage` and `bundle/deb`

Double-click the installer to install LifeCLI with its icon; afterwards it launches from your Start menu / applications like any other app.

> **Windows note:** because the app isn't code-signed, SmartScreen may show *"Windows protected your PC."* Click **More info → Run anyway** to proceed. This is expected for a self-built, unsigned app.

## Data & privacy

All data is stored locally (IndexedDB in the browser / the app's WebView storage). The browser and the installed app use **separate** storage — to move data between them, use **Настройки → Свали резервно копие** (export) and **Възстанови от файл** (import). Only the weather feature makes a network request (to Open-Meteo).

## License

Personal project — no license specified yet.
