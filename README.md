# Orbit Board

A local-first Kanban with a premium soft-neumorphic interface, refined ember accents, and branded iconography.

## Live site

**https://dordunu1.github.io/cursor-mobile-kanban/**

## Features

- Soft neumorphic light & dark themes
- Workspace pulse overview with completion ring
- Search + filters (priority, due, tags)
- Quick-add in every column
- Subtask checklists with card progress
- Overdue / due-soon styling
- Undo toasts for delete, clear, import, and moves
- Column actions: sort by due/priority, collapse/clear completed
- Drag and drop with settle animation and stronger drop glow
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
