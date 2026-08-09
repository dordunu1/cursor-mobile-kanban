import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { ColumnId, Task } from '../types'
import { IconCompleted, IconPlanning, IconProgress } from './Icons'
import { TaskCard } from './TaskCard'

const COLUMN_ICONS = {
  planning: IconPlanning,
  in_progress: IconProgress,
  completed: IconCompleted,
} as const

export function Column({
  id,
  title,
  subtitle,
  tasks,
  onOpenTask,
}: {
  id: ColumnId
  title: string
  subtitle: string
  tasks: Task[]
  onOpenTask: (task: Task) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const Icon = COLUMN_ICONS[id]

  return (
    <section className={`column tone-${id}${isOver ? ' is-over' : ''}`} aria-label={title}>
      <header className="column-header">
        <div className="column-heading">
          <div className={`column-icon tone-${id}`} aria-hidden="true">
            <Icon size={30} />
          </div>
          <div>
            <h2 className="column-title">{title}</h2>
            <p className="column-sub">{subtitle}</p>
          </div>
        </div>
        <span className="column-count">{tasks.length}</span>
      </header>
      <div ref={setNodeRef} className="column-body">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="empty-column">
              <div className={`empty-glyph tone-${id}`}>
                <Icon size={36} />
              </div>
              <p>Drop a task into {title.toLowerCase()}</p>
            </div>
          ) : (
            tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                onOpen={onOpenTask}
                styleDelay={index * 40}
              />
            ))
          )}
        </SortableContext>
      </div>
    </section>
  )
}
