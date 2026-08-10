import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRef } from 'react'
import { formatDueLabel, getDueStatus } from '../due'
import type { Task } from '../types'
import { IconCalendar, IconComment, IconGrip } from './Icons'

export function TaskCard({
  task,
  onOpen,
  styleDelay = 0,
  settling = false,
}: {
  task: Task
  onOpen: (task: Task) => void
  styleDelay?: number
  settling?: boolean
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
    animationDelay: `${styleDelay}ms`,
  }

  const due = formatDueLabel(task.dueDate)
  const dueStatus = getDueStatus(task.dueDate)
  const doneCount = task.subtasks.filter((s) => s.done).length
  const subtotal = task.subtasks.length
  const subPct = subtotal ? Math.round((doneCount / subtotal) * 100) : 0

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`task-card due-${dueStatus}${isDragging ? ' is-dragging' : ''}${settling ? ' is-settling' : ''}`}
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
      <span className={`priority-rail priority-${task.priority}`} aria-hidden="true" />
      <div className="task-card-body">
        <div className="task-card-top">
          <span className={`priority-gem priority-${task.priority}`} title={task.priority}>
            {task.priority}
          </span>
          <span className="task-grip" aria-hidden="true">
            <IconGrip size={16} />
          </span>
        </div>
        <h3 className="task-card-title">{task.title}</h3>
        {task.description ? <p className="task-card-desc">{task.description}</p> : null}

        {subtotal > 0 ? (
          <div className="subtask-progress" aria-label={`${doneCount} of ${subtotal} subtasks`}>
            <div className="subtask-progress-track">
              <div className="subtask-progress-fill" style={{ width: `${subPct}%` }} />
            </div>
            <span>
              {doneCount}/{subtotal}
            </span>
          </div>
        ) : null}

        <div className="task-meta">
          {due ? (
            <span className={`chip due-chip due-${dueStatus}`}>
              <IconCalendar size={14} />
              {dueStatus === 'overdue' ? `Overdue · ${due}` : due}
            </span>
          ) : null}
          {task.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="chip">
              {tag}
            </span>
          ))}
          {task.comments.length > 0 ? (
            <span className="chip chip-comment">
              <IconComment size={14} />
              {task.comments.length}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export function TaskCardPreview({ task }: { task: Task }) {
  return (
    <div className="drag-preview">
      <span className={`priority-rail priority-${task.priority}`} aria-hidden="true" />
      <div className="task-card-body">
        <span className={`priority-gem priority-${task.priority}`}>{task.priority}</span>
        <h3 className="task-card-title">{task.title}</h3>
        {task.description ? <p className="task-card-desc">{task.description}</p> : null}
      </div>
    </div>
  )
}
