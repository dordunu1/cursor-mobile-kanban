import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useMemo, useState } from 'react'
import type { ColumnId, Task } from '../types'
import { COLUMNS } from '../types'
import { Column } from './Column'
import { TaskCardPreview } from './TaskCard'

export function Board({
  tasksByColumn,
  onMoveTask,
  onOpenTask,
}: {
  tasksByColumn: Record<ColumnId, Task[]>
  onMoveTask: (taskId: string, toColumn: ColumnId, toIndex: number) => void
  onOpenTask: (task: Task) => void
}) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  )

  const allTasks = useMemo(
    () => Object.values(tasksByColumn).flat(),
    [tasksByColumn],
  )

  const findColumn = (id: string): ColumnId | null => {
    if (id === 'planning' || id === 'in_progress' || id === 'completed') return id
    const task = allTasks.find((t) => t.id === id)
    return task?.columnId ?? null
  }

  const onDragStart = (event: DragStartEvent) => {
    const task = allTasks.find((t) => t.id === event.active.id)
    setActiveTask(task ?? null)
  }

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return
    const activeId = String(active.id)
    const overId = String(over.id)
    const from = findColumn(activeId)
    const to = findColumn(overId)
    if (!from || !to || from === to) return

    const overTasks = tasksByColumn[to]
    const overIndex =
      overId === to
        ? overTasks.length
        : Math.max(
            0,
            overTasks.findIndex((t) => t.id === overId),
          )
    onMoveTask(activeId, to, overIndex === -1 ? overTasks.length : overIndex)
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)
    const from = findColumn(activeId)
    const to = findColumn(overId)
    if (!from || !to) return

    const overTasks = tasksByColumn[to].filter((t) => t.id !== activeId)
    let toIndex = overTasks.length
    if (overId !== to) {
      const idx = overTasks.findIndex((t) => t.id === overId)
      toIndex = idx === -1 ? overTasks.length : idx
    }
    onMoveTask(activeId, to, toIndex)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveTask(null)}
    >
      <div className="board">
        {COLUMNS.map((column) => (
          <Column
            key={column.id}
            id={column.id}
            title={column.title}
            subtitle={column.subtitle}
            tasks={tasksByColumn[column.id]}
            onOpenTask={onOpenTask}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeTask ? <TaskCardPreview task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
