# Orbit Board

A local-first Kanban with Apple Liquid Glass materials, zPayy blue (`#2f6bff`) with white labels, and zPayy fonts (Instrument Serif + DM Sans).

## Live site

**https://dordunu1.github.io/cursor-mobile-kanban/**

## Mobile app (Expo)

Native iOS + Android app lives in [`mobile/`](./mobile/).

- **iOS (Expo Go):** `cd mobile && npm install && npx expo start` — scan the QR with Expo Go
- **Android APK:** push a `mobile-v*` tag (or run **Actions → Build Android APK**) and download from **Releases** / workflow artifacts

See [`mobile/README.md`](./mobile/README.md) for details. The web board stays at the repo root.

If the board still looks like the previous neumorphic theme, hard-refresh or open a private window — an old service worker may be caching the last build.

## Look

- Translucent glass panels (`backdrop-filter` blur + saturate, specular edge, Chromium refraction filter)
- zPayy primary `#2f6bff` / `#3b75ff` → `#2a5ef0` with white text on primary buttons
- Instrument Serif for titles, DM Sans for UI
- Light-first wallpaper with blue / violet / green light so the glass has color to pick up
- Dark mode: navy glass, same blue CTAs

## Features

- Light & dark themes
- Renameable workspace
- Workspace pulse overview with completion ring
- Search + filters (priority, due today/soon/overdue, tags) with one-tap clear
- Quick-add in every column
- Subtask checklists with card progress
- Markdown in descriptions
- Overdue / due-today / due-soon styling
- Card aging on In Progress
- WIP limit on In Progress (default 3)
- Daily goals you can check off, reorder, and track on a 7-day heatmap
- Confetti when a card lands in Completed (or every daily goal is done)
- Archive instead of deleting completed work
- Duplicate tasks
- Undo toasts for delete, archive, import, reset, and moves
- Column actions: sort by due/priority, collapse, archive completed
- Custom glass dropdowns for filters, status, and priority
- Drag from the grip — keyboard, mouse, and delayed touch
- Keyboard shortcuts: `N` new task, `/` search
- Persists in browser `localStorage`
- Export / import JSON (replace or merge)
- Installable PWA (Add to Home Screen)
- Reset to the demo board

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Export & import

1. Click **Export** to download `orbit-board-YYYY-MM-DD.json`
2. On another browser, click **Import** and choose **Replace** or **Merge**

All data stays on device — there is no backend.

## Deploy

Pushing to `main` builds the app and publishes `dist/` to the `gh-pages` branch (GitHub Pages source).
