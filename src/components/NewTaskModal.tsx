import { useEffect, useRef, useState } from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap'
import type { BoardColumnId, Priority } from '../types'
import { COLUMNS } from '../types'
import { IconClose, IconPlus } from './Icons'
import { GlassSelect } from './GlassSelect'

export function NewTaskModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (input: {
    title: string
    description: string
    columnId: BoardColumnId
    priority: Priority
    tags: string[]
    dueDate: string | null
  }) => void
}) {
  const sheetRef = useRef<HTMLDivElement>(null)
  useFocusTrap(sheetRef, true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [columnId, setColumnId] = useState<BoardColumnId>('planning')
  const [priority, setPriority] = useState<Priority>('medium')
  const [tags, setTags] = useState('')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = () => {
    onCreate({
      title,
      description,
      columnId,
      priority,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      dueDate: dueDate || null,
    })
    onClose()
  }

  return (
    <div className="overlay" onClick={onClose} role="presentation">
      <div
        ref={sheetRef}
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-task-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sheet-header">
          <div>
            <h2 id="new-task-title" className="sheet-title">
              New task
            </h2>
            <p className="sheet-sub">Starts in Planning unless you choose another lane.</p>
          </div>
          <button className="icon-btn neu-btn" onClick={onClose} aria-label="Close">
            <IconClose size={18} />
          </button>
        </header>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="new-title">Title</label>
            <input
              id="new-title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ship the next milestone"
              onKeyDown={(event) => {
                if (event.key === 'Enter' && title.trim()) submit()
              }}
            />
          </div>
          <div className="field">
            <label htmlFor="new-desc">Description</label>
            <textarea
              id="new-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details. Markdown is welcome."
            />
          </div>
          <div className="form-row two">
            <div className="field">
              <label htmlFor="new-column">Status</label>
              <GlassSelect
                id="new-column"
                ariaLabel="Status"
                value={columnId}
                onChange={(value) => setColumnId(value as BoardColumnId)}
                options={COLUMNS.map((column) => ({
                  value: column.id,
                  label: column.title,
                }))}
              />
            </div>
            <div className="field">
              <label htmlFor="new-priority">Priority</label>
              <GlassSelect
                id="new-priority"
                ariaLabel="Priority"
                value={priority}
                onChange={(value) => setPriority(value as Priority)}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                ]}
              />
            </div>
          </div>
          <div className="form-row two">
            <div className="field">
              <label htmlFor="new-due">Due date</label>
              <input
                id="new-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="new-tags">Tags</label>
              <input
                id="new-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="comma, separated"
              />
            </div>
          </div>
        </div>

        <div className="sheet-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={submit} disabled={!title.trim()}>
            <IconPlus size={18} />
            Add task
          </button>
        </div>
      </div>
    </div>
  )
}
