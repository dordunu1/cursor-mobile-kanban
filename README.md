# Orbit Board

A local-first Kanban with a premium soft-neumorphic interface, refined ember accents, and branded iconography.

## Live site

**https://dordunu1.github.io/cursor-mobile-kanban/**

## Features

- Soft neumorphic light & dark themes
- Workspace pulse overview with completion ring
- Columns: **Planning → In Progress → Completed** with large status icons
- Drag and drop between lanes
- Task details: description, priority, tags, due date, comments
- Persists in browser `localStorage`
- Export / import JSON to move boards between browsers

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Export & import

1. Click **Export** to download `orbit-board-YYYY-MM-DD.json`
2. On another browser, click **Import** and select that file

All data stays on device — there is no backend.
