import { useEffect, useState } from 'react'
import type { ColumnId, Priority, Task } from '../types'
import { COLUMNS } from '../types'

export function TaskDetail({
  task,
  onClose,
  onSave,
  onDelete,
  onAddComment,
  onDeleteComment,
}: {
  task: Task
  onClose: () => void
  onSave: (patch: Partial<Task>) => void
  onDelete: () => void
  onAddComment: (body: string) => void
  onDeleteComment: (commentId: string) => void
}) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [columnId, setColumnId] = useState<ColumnId>(task.columnId)
  const [priority, setPriority] = useState<Priority>(task.priority)
  const [tags, setTags] = useState(task.tags.join(', '))
  const [dueDate, setDueDate] = useState(task.dueDate ?? '')
  const [comment, setComment] = useState('')

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const save = () => {
    onSave({
      title: title.trim() || 'Untitled task',
      description: description.trim(),
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
            <p className="sheet-sub">Edit fields, move status, or leave a note.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
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
              placeholder="Add context, links, or acceptance notes"
            />
          </div>
          <div className="form-row two">
            <div className="field">
              <label htmlFor="task-column">Status</label>
              <select
                id="task-column"
                value={columnId}
                onChange={(e) => setColumnId(e.target.value as ColumnId)}
              >
                {COLUMNS.map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
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

        <section className="comments">
          <h3>Comments</h3>
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
