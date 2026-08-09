import { useRef } from 'react'
import {
  IconExport,
  IconImport,
  IconMoon,
  IconOrbit,
  IconPlus,
  IconSun,
} from './Icons'

export function Toolbar({
  theme,
  taskCount,
  onToggleTheme,
  onNewTask,
  onExport,
  onImport,
}: {
  theme: 'light' | 'dark'
  taskCount: number
  onToggleTheme: () => void
  onNewTask: () => void
  onExport: () => void
  onImport: (file: File) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <header className="toolbar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <IconOrbit size={28} />
        </div>
        <div className="brand-copy">
          <div className="brand-name">Orbit Board</div>
          <div className="brand-sub">Premium local Kanban · {taskCount} tasks</div>
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
