import { useEffect, useState } from 'react'
import type { ColumnId, Priority, Task } from '../types'
import { COLUMNS } from '../types'
import { IconCheck, IconClose, IconComment, IconPlus, IconTrash } from './Icons'

export function TaskDetail({
  task,
  onClose,
  onSave,
  onDelete,
  onAddComment,
  onDeleteComment,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}: {
  task: Task
  onClose: () => void
  onSave: (patch: Partial<Task>) => void
  onDelete: () => void
  onAddComment: (body: string) => void
  onDeleteComment: (commentId: string) => void
  onAddSubtask: (title: string) => void
  onToggleSubtask: (subtaskId: string) => void
  onDeleteSubtask: (subtaskId: string) => void
}) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [columnId, setColumnId] = useState<ColumnId>(task.columnId)
  const [priority, setPriority] = useState<Priority>(task.priority)
  const [tags, setTags] = useState(task.tags.join(', '))
  const [dueDate, setDueDate] = useState(task.dueDate ?? '')
  const [comment, setComment] = useState('')
  const [subtaskDraft, setSubtaskDraft] = useState('')

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

  const doneCount = task.subtasks.filter((s) => s.done).length

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
