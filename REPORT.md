# Orbit Board — Product Report (v1)

## Goal
A highly detailed, Apple-inspired Kanban task manager that runs entirely in the browser. No backend. All data persists in local storage, with JSON export/import for moving boards between browsers.

## Product name
**Orbit Board** — a focused personal task board with Planning → In Progress → Completed columns.

## v1 scope
- Three columns: Planning, In Progress, Completed
- Create / edit / delete tasks (title, description, priority, tags, due date)
- Drag-and-drop between columns and reorder within a column
- Per-task comments with timestamps
- Light and dark themes with an orange accent (iOS-inspired)
- Persist board state in `localStorage`
- Export board as JSON download; import JSON to restore/replace board
- Seed demo tasks on first launch so the board feels alive

## Out of scope (later)
- Accounts, sync, multiplayer
- Attachments / file uploads
- Notifications and recurring tasks
- Multiple boards / workspaces

## Technical approach
- Vite + React + TypeScript
- `@dnd-kit` for accessible drag-and-drop
- CSS variables for theme tokens (Apple-like materials, orange accent)
- Single JSON document schema for persistence and portability

## Success criteria
- Add a task and see it survive a refresh
- Drag a task Planning → In Progress → Completed
- Add comments on a task detail sheet
- Toggle light/dark theme
- Export JSON, clear storage, import JSON, and recover the board
