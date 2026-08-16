import { useEffect, useRef, useState } from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap'
import type { ColumnId, Priority, Task } from '../types'
import { COLUMNS } from '../types'
import { IconCheck, IconClose, IconComment, IconCopy, IconPlus, IconTrash } from './Icons'
import { GlassSelect } from './GlassSelect'
import { MarkdownBody } from './MarkdownBody'

export function TaskDetail({
  task,
  wipBlocked,
  onClose,
  onSave,
  onMoveColumn,
  onDelete,
  onDuplicate,
  onAddComment,
  onDeleteComment,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}: {
  task: Task
  wipBlocked: boolean
  onClose: () => void
  onSave: (patch: Partial<Task>) => void
  onMoveColumn: (columnId: ColumnId) => boolean
  onDelete: () => void
  onDuplicate: () => void
  onAddComment: (body: string) => void
  onDeleteComment: (commentId: string) => void
  onAddSubtask: (title: string) => void
  onToggleSubtask: (subtaskId: string) => void
  onDeleteSubtask: (subtaskId: string) => void
}) {
  const sheetRef = useRef<HTMLDivElement>(null)
  useFocusTrap(sheetRef, true)

  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [columnId, setColumnId] = useState<ColumnId>(task.columnId)
  const [priority, setPriority] = useState<Priority>(task.priority)
  const [tags, setTags] = useState(task.tags.join(', '))
  const [dueDate, setDueDate] = useState(task.dueDate ?? '')
  const [comment, setComment] = useState('')
  const [subtaskDraft, setSubtaskDraft] = useState('')

  useEffect(() => {
    setColumnId(task.columnId)
  }, [task.columnId])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const save = () => {
    if (columnId !== task.columnId) {
      const moved = onMoveColumn(columnId)
      if (!moved) {
        setColumnId(task.columnId)
        return
      }
    }
    onSave({
      title: title.trim() || 'Untitled task',
      description: description.trim(),
      priority,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      dueDate: dueDate || null,
    })
    onClose()
  }

  const doneCount = task.subtasks.filter((s) => s.done).length
  const statusOptions = [
    ...COLUMNS,
    { id: 'archive' as const, title: 'Archive', subtitle: '' },
  ]

  return (
    <div className="overlay" onClick={onClose} role="presentation">
      <div
        ref={sheetRef}
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sheet-header">
          <div>
            <h2 id="task-detail-title" className="sheet-title">
              Task details
            </h2>
            <p className="sheet-sub">Edit fields, checklist, status, or leave a note.</p>
          </div>
          <button className="icon-btn neu-btn" onClick={onClose} aria-label="Close">
            <IconClose size={18} />
          </button>
        </header>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="task-title">Title</label>
            <input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs doing?"
            />
          </div>
          <div className="field">
            <label htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Markdown works: **bold**, *italic*, `code`, [links](https://), and - lists"
            />
            {description.trim() ? (
              <div className="markdown-preview">
                <span className="markdown-preview-label">Preview</span>
                <MarkdownBody className="markdown-body" text={description} />
              </div>
            ) : null}
          </div>
          <div className="form-row two">
            <div className="field">
              <label htmlFor="task-column">Status</label>
              <GlassSelect
                id="task-column"
                ariaLabel="Status"
                value={columnId}
                onChange={(value) => setColumnId(value as ColumnId)}
                options={statusOptions.map((column) => ({
                  value: column.id,
                  label: column.title,
                }))}
              />
              {wipBlocked && columnId === 'in_progress' && task.columnId !== 'in_progress' ? (
                <p className="field-hint">In Progress is at its WIP limit.</p>
              ) : null}
            </div>
            <div className="field">
              <label htmlFor="task-priority">Priority</label>
              <GlassSelect
                id="task-priority"
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
              <label htmlFor="task-due">Due date</label>
              <input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="task-tags">Tags</label>
              <input
                id="task-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="design, engineering"
              />
            </div>
          </div>
        </div>

        <section className="checklist">
          <div className="checklist-head">
            <h3>
              <IconCheck size={18} /> Checklist
            </h3>
            <span>
              {doneCount}/{task.subtasks.length}
            </span>
          </div>
          <div className="checklist-list">
            {task.subtasks.length === 0 ? (
              <p className="sheet-sub">Break this task into smaller steps.</p>
            ) : (
              task.subtasks.map((item) => (
                <div key={item.id} className={`checklist-item${item.done ? ' is-done' : ''}`}>
                  <button
                    className="check-toggle"
                    onClick={() => onToggleSubtask(item.id)}
                    aria-label={item.done ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {item.done ? <IconCheck size={14} /> : null}
                  </button>
                  <span>{item.title}</span>
                  <button
                    className="icon-btn neu-btn checklist-delete"
                    onClick={() => onDeleteSubtask(item.id)}
                    aria-label="Delete subtask"
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
          <form
            className="checklist-add"
            onSubmit={(event) => {
              event.preventDefault()
              onAddSubtask(subtaskDraft)
              setSubtaskDraft('')
            }}
          >
            <IconPlus size={16} />
            <input
              value={subtaskDraft}
              onChange={(e) => setSubtaskDraft(e.target.value)}
              placeholder="Add a checklist item…"
            />
            <button type="submit" className="btn" disabled={!subtaskDraft.trim()}>
              Add
            </button>
          </form>
        </section>

        <section className="comments">
          <h3>
            <IconComment size={18} /> Comments
          </h3>
          <div className="comment-list">
            {task.comments.length === 0 ? (
              <p className="sheet-sub">No comments yet.</p>
            ) : (
              task.comments.map((item) => (
                <div key={item.id} className="comment">
                  <div className="comment-meta">
                    <span>
                      {new Date(item.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                    <button
                      className="btn-ghost"
                      onClick={() => onDeleteComment(item.id)}
                      aria-label="Delete comment"
                    >
                      Delete
                    </button>
                  </div>
                  <p>{item.body}</p>
                </div>
              ))
            )}
          </div>
          <div className="comment-compose">
            <div className="field">
              <label htmlFor="new-comment">Add a comment</label>
              <textarea
                id="new-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Leave a note for yourself…"
              />
            </div>
            <div className="sheet-actions" style={{ marginTop: 0 }}>
              <button
                className="btn"
                onClick={() => {
                  onAddComment(comment)
                  setComment('')
                }}
                disabled={!comment.trim()}
              >
                Post comment
              </button>
            </div>
          </div>
        </section>

        <div className="sheet-actions">
          <button className="btn btn-danger" onClick={onDelete}>
            Delete task
          </button>
          <button className="btn neu-btn" onClick={onDuplicate}>
            <IconCopy size={16} />
            Duplicate
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save}>
            Save changes
          </button>
        </div>
      </div>
    </div>
  )
}
