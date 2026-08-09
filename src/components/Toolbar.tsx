import { useRef } from 'react'

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
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2.2" />
            <circle cx="12" cy="12" r="2.4" fill="currentColor" />
            <path
              d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="brand-copy">
          <div className="brand-name">Orbit Board</div>
          <div className="brand-sub">Personal Kanban · stored on this device</div>
        </div>
      </div>

      <div className="toolbar-actions">
        <span className="stats-hint">{taskCount} tasks cached locally</span>
        <button className="btn btn-ghost" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
        <button className="btn" onClick={onExport}>
          Export
        </button>
        <button className="btn" onClick={() => fileRef.current?.click()}>
          Import
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
          New task
        </button>
      </div>
    </header>
  )
}
