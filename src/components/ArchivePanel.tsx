import { useEffect, useRef } from 'react'
import { formatDueLabel } from '../due'
import { useFocusTrap } from '../hooks/useFocusTrap'
import type { Task } from '../types'
import { IconArchive, IconClose, IconTrash } from './Icons'

export function ArchivePanel({
  tasks,
  onClose,
  onRestore,
  onDelete,
}: {
  tasks: Task[]
  onClose: () => void
  onRestore: (id: string) => void
  onDelete: (id: string) => void
}) {
  const sheetRef = useRef<HTMLDivElement>(null)
  useFocusTrap(sheetRef, true)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="overlay" onClick={onClose} role="presentation">
      <div
        ref={sheetRef}
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="archive-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sheet-header">
          <div>
            <h2 id="archive-title" className="sheet-title">
              Archive
            </h2>
            <p className="sheet-sub">
              Finished work kept off the board. Restore to Planning, or delete forever.
            </p>
          </div>
          <button className="icon-btn neu-btn" onClick={onClose} aria-label="Close">
            <IconClose size={18} />
          </button>
        </header>

        {tasks.length === 0 ? (
          <div className="empty-column">
            <div className="empty-glyph tone-completed">
              <IconArchive size={36} />
            </div>
            <p>Nothing archived yet. Clearing Completed moves cards here.</p>
          </div>
        ) : (
          <div className="archive-list">
            {tasks.map((task) => (
              <article key={task.id} className="archive-row">
                <div>
                  <h3>{task.title}</h3>
                  <p>
                    {task.completedAt
                      ? `Finished ${new Date(task.completedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}`
                      : 'Archived'}
                    {task.dueDate ? ` · due ${formatDueLabel(task.dueDate)}` : ''}
                  </p>
                </div>
                <div className="archive-row-actions">
                  <button className="btn neu-btn" onClick={() => onRestore(task.id)}>
                    Restore
                  </button>
                  <button
                    className="icon-btn neu-btn"
                    onClick={() => onDelete(task.id)}
                    aria-label={`Delete ${task.title} forever`}
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
