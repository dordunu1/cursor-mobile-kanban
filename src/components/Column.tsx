import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { ColumnId, Task } from '../types'
import { TaskCard } from './TaskCard'

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

  return (
    <section className={`column${isOver ? ' is-over' : ''}`} aria-label={title}>
      <header className="column-header">
        <div>
          <h2 className="column-title">{title}</h2>
          <p className="column-sub">{subtitle}</p>
        </div>
        <span className="column-count">{tasks.length}</span>
      </header>
      <div ref={setNodeRef} className="column-body">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="empty-column">Drop a task here</div>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} onOpen={onOpenTask} />
            ))
          )}
        </SortableContext>
      </div>
    </section>
  )
}
