import { useEffect, useRef, useState } from 'react'
import {
  IconArchive,
  IconExport,
  IconImport,
  IconMoon,
  IconOrbit,
  IconPlus,
  IconReset,
  IconSun,
} from './Icons'

export function Toolbar({
  name,
  theme,
  taskCount,
  archiveCount,
  onRename,
  onToggleTheme,
  onNewTask,
  onExport,
  onImport,
  onOpenArchive,
  onResetDemo,
}: {
  name: string
  theme: 'light' | 'dark'
  taskCount: number
  archiveCount: number
  onRename: (name: string) => void
  onToggleTheme: () => void
  onNewTask: () => void
  onExport: () => void
  onImport: (file: File) => void
  onOpenArchive: () => void
  onResetDemo: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDraft(name)
  }, [name])

  useEffect(() => {
    if (editing) nameRef.current?.focus()
  }, [editing])

  const commitName = () => {
    onRename(draft)
    setEditing(false)
  }

  return (
    <header className="toolbar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <IconOrbit size={28} />
        </div>
        <div className="brand-copy">
          {editing ? (
            <input
              ref={nameRef}
              className="brand-name-input"
              value={draft}
              aria-label="Board name"
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitName}
              onKeyDown={(event) => {
                if (event.key === 'Enter') commitName()
                if (event.key === 'Escape') {
                  setDraft(name)
                  setEditing(false)
                }
              }}
            />
          ) : (
            <button
              type="button"
              className="brand-name"
              onClick={() => setEditing(true)}
              title="Rename board"
            >
              {name}
            </button>
          )}
          <div className="brand-sub">
            Local Kanban · {taskCount} on board
            {archiveCount ? ` · ${archiveCount} archived` : ''}
          </div>
        </div>
      </div>

      <div className="toolbar-actions">
        <button
          className="icon-btn neu-btn"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title="Toggle theme"
        >
          {theme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
        </button>
        <button
          className="icon-btn neu-btn"
          onClick={onOpenArchive}
          aria-label="Open archive"
          title="Archive"
        >
          <IconArchive size={18} />
        </button>
        <button
          className="icon-btn neu-btn"
          onClick={onResetDemo}
          aria-label="Reset demo board"
          title="Reset demo"
        >
          <IconReset size={18} />
        </button>
        <button className="btn neu-btn" onClick={onExport} title="Export JSON">
          <IconExport size={18} />
          <span className="btn-label">Export</span>
        </button>
        <button
          className="btn neu-btn"
          onClick={() => fileRef.current?.click()}
          title="Import JSON"
        >
          <IconImport size={18} />
          <span className="btn-label">Import</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) onImport(file)
            event.target.value = ''
          }}
        />
        <button className="btn btn-primary" onClick={onNewTask}>
          <IconPlus size={18} />
          <span>New task</span>
        </button>
      </div>
    </header>
  )
}
