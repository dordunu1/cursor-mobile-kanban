import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRef } from 'react'
import type { Task } from '../types'

function formatDue(dueDate: string | null): string | null {
  if (!dueDate) return null
  const date = new Date(`${dueDate}T12:00:00`)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function TaskCard({
  task,
  onOpen,
}: {
  task: Task
  onOpen: (task: Task) => void
}) {
  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: task.id,
      data: { type: 'task', task },
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const due = formatDue(task.dueDate)

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`task-card${isDragging ? ' is-dragging' : ''}`}
      {...attributes}
      {...listeners}
      onPointerDown={(event) => {
        pointerStart.current = { x: event.clientX, y: event.clientY }
        listeners?.onPointerDown?.(event)
      }}
      onClick={(event) => {
        const start = pointerStart.current
        pointerStart.current = null
        if (
          start &&
          Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6
        ) {
          return
        }
        onOpen(task)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen(task)
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open task ${task.title}`}
    >
      <h3 className="task-card-title">{task.title}</h3>
      {task.description ? <p className="task-card-desc">{task.description}</p> : null}
      <div className="task-meta">
        <span className={`chip chip-priority-${task.priority}`}>{task.priority}</span>
        {due ? <span className="chip">Due {due}</span> : null}
        {task.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="chip">
            {tag}
          </span>
        ))}
        {task.comments.length > 0 ? (
          <span className="chip chip-comment">{task.comments.length} notes</span>
        ) : null}
      </div>
    </article>
  )
}

export function TaskCardPreview({ task }: { task: Task }) {
  return (
    <div className="drag-preview">
      <h3 className="task-card-title">{task.title}</h3>
      {task.description ? <p className="task-card-desc">{task.description}</p> : null}
    </div>
  )
}
