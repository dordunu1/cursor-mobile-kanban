import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { formatDueLabel, formatLaneAge, getDueStatus, laneAgeDays } from '../due'
import { stripMarkdown } from '../markdown'
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
  const aging =
    task.columnId === 'in_progress' ? formatLaneAge(task.columnEnteredAt) : null
  const desc = stripMarkdown(task.description)

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`task-card due-${dueStatus}${isDragging ? ' is-dragging' : ''}${settling ? ' is-settling' : ''}${aging && laneAgeDays(task.columnEnteredAt) >= 5 ? ' is-aging' : ''}`}
    >
      <div className="task-card-body">
        <div className="task-card-top">
          <span className={`priority-gem priority-${task.priority}`} title={task.priority}>
            {task.priority}
          </span>
          <button
            type="button"
            className="task-grip"
            aria-label={`Move ${task.title}`}
            {...attributes}
            {...listeners}
            onClick={(event) => event.stopPropagation()}
          >
            <IconGrip size={16} />
          </button>
        </div>
        <button
          type="button"
          className="task-card-open"
          onClick={() => onOpen(task)}
          aria-label={`Open task ${task.title}`}
        >
          <h3 className="task-card-title">{task.title}</h3>
          {desc ? <p className="task-card-desc">{desc}</p> : null}

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
                {dueStatus === 'overdue'
                  ? `Overdue · ${due}`
                  : dueStatus === 'today'
                    ? `Today · ${due}`
                    : due}
              </span>
            ) : null}
            {aging ? <span className="chip chip-aging">{aging}</span> : null}
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
        </button>
      </div>
    </article>
  )
}

export function TaskCardPreview({ task }: { task: Task }) {
  return (
    <div className="drag-preview">
      <div className="task-card-body">
        <span className={`priority-gem priority-${task.priority}`}>{task.priority}</span>
        <h3 className="task-card-title">{task.title}</h3>
        {task.description ? (
          <p className="task-card-desc">{stripMarkdown(task.description)}</p>
        ) : null}
      </div>
    </div>
  )
}
