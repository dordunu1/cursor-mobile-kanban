# Orbit Board

A local-first Kanban task manager with an Apple-inspired interface and orange accents.

## Features

- Columns: **Planning → In Progress → Completed**
- Drag and drop tasks between columns
- Task details: description, priority, tags, due date
- Comments on each task
- Light and dark themes
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
