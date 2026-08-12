import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useEffect, useMemo, useState } from 'react'
import type { BoardColumnId, ColumnId, ColumnSort, Task } from '../types'
import { COLUMNS } from '../types'
import { Column } from './Column'
import { TaskCardPreview } from './TaskCard'

export function Board({
  tasksByColumn,
  filtered,
  wipLimit,
  wipCount,
  onMoveTask,
  onOpenTask,
  onQuickAdd,
  onSortColumn,
  onClearColumn,
  onSetWipLimit,
  onMoved,
  onDragBegin,
}: {
  tasksByColumn: Record<BoardColumnId, Task[]>
  filtered: boolean
  wipLimit: number
  wipCount: number
  onMoveTask: (taskId: string, toColumn: ColumnId, toIndex: number) => boolean
  onOpenTask: (task: Task) => void
  onQuickAdd: (columnId: BoardColumnId, title: string) => void
  onSortColumn: (columnId: BoardColumnId, mode: ColumnSort) => void
  onClearColumn: (columnId: BoardColumnId) => void
  onSetWipLimit: (limit: number) => void
  onMoved?: (taskId: string, fromColumn: ColumnId, toColumn: ColumnId) => void
  onDragBegin?: () => void
}) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [originColumn, setOriginColumn] = useState<ColumnId | null>(null)
  const [settlingId, setSettlingId] = useState<string | null>(null)
  const [collapsedCompleted, setCollapsedCompleted] = useState(false)
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    if (!settlingId) return
    const timer = window.setTimeout(() => setSettlingId(null), 420)
    return () => window.clearTimeout(timer)
  }, [settlingId])

  const allTasks = useMemo(
    () => Object.values(tasksByColumn).flat(),
    [tasksByColumn],
  )

  const findColumn = (id: string): ColumnId | null => {
    if (
      id === 'planning' ||
      id === 'in_progress' ||
      id === 'completed' ||
      id === 'archive'
    ) {
      return id
    }
    const task = allTasks.find((t) => t.id === id)
    return task?.columnId ?? null
  }

  const onDragStart = (event: DragStartEvent) => {
    onDragBegin?.()
    const task = allTasks.find((t) => t.id === event.active.id)
    setActiveTask(task ?? null)
    setOriginColumn(task?.columnId ?? null)
  }

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return
    const activeId = String(active.id)
    const overId = String(over.id)
    const from = findColumn(activeId)
    const to = findColumn(overId)
    if (!from || !to || from === to) return

    const overTasks = tasksByColumn[to as BoardColumnId] || []
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
    const activeId = String(active.id)
    const from = originColumn ?? findColumn(activeId)
    setActiveTask(null)
    if (!over) {
      setOriginColumn(null)
      return
    }

    const overId = String(over.id)
    const to = findColumn(overId)
    if (!from || !to) {
      setOriginColumn(null)
      return
    }

    const overTasks = (tasksByColumn[to as BoardColumnId] || []).filter(
      (t) => t.id !== activeId,
    )
    let toIndex = overTasks.length
    if (overId !== to) {
      const idx = overTasks.findIndex((t) => t.id === overId)
      toIndex = idx === -1 ? overTasks.length : idx
    }
    const moved = onMoveTask(activeId, to, toIndex)
    setSettlingId(activeId)
    if (moved && from !== to) onMoved?.(activeId, from, to)
    setOriginColumn(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => {
        setActiveTask(null)
        setOriginColumn(null)
      }}
    >
      <div className={`board${activeTask ? ' is-dragging-active' : ''}`}>
        {COLUMNS.map((column) => (
          <Column
            key={column.id}
            id={column.id}
            title={column.title}
            subtitle={column.subtitle}
            tasks={tasksByColumn[column.id]}
            settlingId={settlingId}
            collapsed={column.id === 'completed' && collapsedCompleted}
            filtered={filtered}
            wipLimit={wipLimit}
            wipCount={wipCount}
            onToggleCollapsed={() => setCollapsedCompleted((v) => !v)}
            onOpenTask={onOpenTask}
            onQuickAdd={(title) => onQuickAdd(column.id, title)}
            onSort={(mode) => onSortColumn(column.id, mode)}
            onClear={() => onClearColumn(column.id)}
            onSetWipLimit={onSetWipLimit}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeTask ? <TaskCardPreview task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
