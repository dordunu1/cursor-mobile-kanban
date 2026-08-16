import { useCallback, useEffect, useMemo, useState } from 'react'
import { createId } from '../lib/id'
import { createSeedBoard } from '../seed'
import { cloneBoard, exportBoard, loadBoard, saveBoard } from '../storage'
import type {
  BoardState,
  ColumnId,
  ColumnSort,
  Comment,
  Priority,
  Subtask,
  Task,
} from '../types'
import { ALL_COLUMN_IDS, DEFAULT_WIP_LIMIT, PRIORITY_RANK } from '../types'

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => a.order - b.order)
}

function reindexAll(tasks: Task[]): Task[] {
  const byColumn: Record<ColumnId, Task[]> = {
    planning: [],
    in_progress: [],
    completed: [],
    archive: [],
  }
  for (const task of tasks) byColumn[task.columnId].push(task)
  const next: Task[] = []
  for (const columnId of ALL_COLUMN_IDS) {
    byColumn[columnId]
      .sort((a, b) => a.order - b.order)
      .forEach((task, index) => next.push({ ...task, order: index }))
  }
  return next
}

function emptyColumnMap(): Record<ColumnId, Task[]> {
  return {
    planning: [],
    in_progress: [],
    completed: [],
    archive: [],
  }
}

export function useBoard() {
  const [board, setBoard] = useState<BoardState | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    loadBoard().then((next) => {
      if (!alive) return
      setBoard(next)
      setReady(true)
    })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!board || !ready) return
    void saveBoard(board)
  }, [board, ready])

  const tasksByColumn = useMemo(() => {
    const map = emptyColumnMap()
    if (!board) return map
    for (const task of sortTasks(board.tasks)) {
      map[task.columnId].push(task)
    }
    return map
  }, [board])

  const allTags = useMemo(() => {
    const set = new Set<string>()
    for (const task of board?.tasks || []) {
      for (const tag of task.tags) set.add(tag)
    }
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [board?.tasks])

  const snapshot = useCallback(() => (board ? cloneBoard(board) : null), [board])

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setBoard((prev) => (prev ? { ...prev, theme } : prev))
  }, [])

  const setName = useCallback((name: string) => {
    const next = name.trim() || 'Orbit Board'
    setBoard((prev) => (prev ? { ...prev, name: next } : prev))
  }, [])

  const setWipLimit = useCallback((wipLimit: number) => {
    setBoard((prev) =>
      prev
        ? {
            ...prev,
            wipLimit: Number.isFinite(wipLimit)
              ? Math.max(0, Math.round(wipLimit))
              : DEFAULT_WIP_LIMIT,
          }
        : prev,
    )
  }, [])

  const wouldExceedWip = useCallback(
    (taskId: string, toColumn: ColumnId) => {
      if (!board) return false
      if (toColumn !== 'in_progress') return false
      if (board.wipLimit <= 0) return false
      const task = board.tasks.find((item) => item.id === taskId)
      if (task?.columnId === 'in_progress') return false
      return tasksByColumn.in_progress.length >= board.wipLimit
    },
    [board, tasksByColumn.in_progress.length],
  )

  const addTask = useCallback(
    (input: {
      title: string
      description?: string
      columnId: ColumnId
      priority?: Priority
      tags?: string[]
      dueDate?: string | null
    }) => {
      const now = new Date().toISOString()
      const createdId = createId()
      setBoard((prev) => {
        if (!prev) return prev
        const columnTasks = prev.tasks.filter((t) => t.columnId === input.columnId)
        const task: Task = {
          id: createdId,
          title: input.title.trim() || 'Untitled task',
          description: (input.description || '').trim(),
          columnId: input.columnId,
          priority: input.priority || 'medium',
          tags: input.tags || [],
          dueDate: input.dueDate ?? null,
          comments: [],
          subtasks: [],
          createdAt: now,
          updatedAt: now,
          columnEnteredAt: now,
          completedAt: input.columnId === 'completed' ? now : null,
          order: columnTasks.length,
        }
        return { ...prev, tasks: [...prev.tasks, task] }
      })
      return createdId
    },
    [],
  )

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    const now = new Date().toISOString()
    setBoard((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        tasks: prev.tasks.map((task) => {
          if (task.id !== id) return task
          const rest = { ...patch }
          delete rest.columnId
          delete rest.order
          delete rest.id
          return { ...task, ...rest, updatedAt: now }
        }),
      }
    })
  }, [])

  const deleteTask = useCallback((id: string) => {
    setBoard((prev) =>
      prev
        ? { ...prev, tasks: reindexAll(prev.tasks.filter((t) => t.id !== id)) }
        : prev,
    )
  }, [])

  const moveTask = useCallback((taskId: string, toColumn: ColumnId, toIndex: number) => {
    setBoard((prev) => {
      if (!prev) return prev
      const task = prev.tasks.find((t) => t.id === taskId)
      if (!task) return prev
      if (
        toColumn === 'in_progress' &&
        task.columnId !== 'in_progress' &&
        prev.wipLimit > 0
      ) {
        const inProgressCount = prev.tasks.filter(
          (item) => item.columnId === 'in_progress' && item.id !== taskId,
        ).length
        if (inProgressCount >= prev.wipLimit) return prev
      }

      const others = prev.tasks.filter((t) => t.id !== taskId)
      const destination = others
        .filter((t) => t.columnId === toColumn)
        .sort((a, b) => a.order - b.order)

      const now = new Date().toISOString()
      const columnChanged = task.columnId !== toColumn
      const moved: Task = {
        ...task,
        columnId: toColumn,
        updatedAt: now,
        columnEnteredAt: columnChanged ? now : task.columnEnteredAt,
        completedAt:
          toColumn === 'completed' && columnChanged
            ? now
            : toColumn === 'archive'
              ? task.completedAt || now
              : task.completedAt,
      }
      destination.splice(Math.max(0, Math.min(toIndex, destination.length)), 0, moved)

      const next: Task[] = []
      for (const columnId of ALL_COLUMN_IDS) {
        const list =
          columnId === toColumn
            ? destination
            : others.filter((t) => t.columnId === columnId).sort((a, b) => a.order - b.order)
        list.forEach((item, index) => next.push({ ...item, columnId, order: index }))
      }
      return { ...prev, tasks: next }
    })
  }, [])

  const archiveCompleted = useCallback(() => {
    setBoard((prev) => {
      if (!prev) return prev
      const now = new Date().toISOString()
      const archived = prev.tasks
        .filter((t) => t.columnId === 'completed')
        .sort((a, b) => a.order - b.order)
      const archiveTail = prev.tasks
        .filter((t) => t.columnId === 'archive')
        .sort((a, b) => a.order - b.order)
      const others = prev.tasks.filter(
        (t) => t.columnId !== 'completed' && t.columnId !== 'archive',
      )
      const nextArchive = [
        ...archiveTail,
        ...archived.map((task) => ({
          ...task,
          columnId: 'archive' as const,
          updatedAt: now,
          columnEnteredAt: now,
          completedAt: task.completedAt || now,
        })),
      ].map((task, index) => ({ ...task, order: index }))
      return { ...prev, tasks: reindexAll([...others, ...nextArchive]) }
    })
  }, [])

  const restoreTask = useCallback((id: string, toColumn: ColumnId = 'planning') => {
    setBoard((prev) => {
      if (!prev) return prev
      const task = prev.tasks.find((t) => t.id === id)
      if (!task) return prev
      const now = new Date().toISOString()
      const others = prev.tasks.filter((t) => t.id !== id)
      const destination = others
        .filter((t) => t.columnId === toColumn)
        .sort((a, b) => a.order - b.order)
      destination.push({
        ...task,
        columnId: toColumn,
        updatedAt: now,
        columnEnteredAt: now,
      })
      const next: Task[] = []
      for (const columnId of ALL_COLUMN_IDS) {
        const list =
          columnId === toColumn
            ? destination
            : others.filter((t) => t.columnId === columnId).sort((a, b) => a.order - b.order)
        list.forEach((item, index) => next.push({ ...item, columnId, order: index }))
      }
      return { ...prev, tasks: next }
    })
  }, [])

  const duplicateTask = useCallback((id: string) => {
    const createdId = createId()
    setBoard((prev) => {
      if (!prev) return prev
      const task = prev.tasks.find((t) => t.id === id)
      if (!task) return prev
      const now = new Date().toISOString()
      const columnTasks = prev.tasks.filter((t) => t.columnId === task.columnId)
      const copy: Task = {
        ...task,
        id: createdId,
        title: `${task.title} (copy)`,
        comments: [],
        subtasks: task.subtasks.map((item) => ({ ...item, id: createId() })),
        createdAt: now,
        updatedAt: now,
        columnEnteredAt: now,
        completedAt: task.columnId === 'completed' ? now : null,
        order: columnTasks.length,
      }
      return { ...prev, tasks: [...prev.tasks, copy] }
    })
    return createdId
  }, [])

  const addComment = useCallback((taskId: string, body: string) => {
    const text = body.trim()
    if (!text) return
    const comment: Comment = {
      id: createId(),
      body: text,
      createdAt: new Date().toISOString(),
    }
    setBoard((prev) =>
      prev
        ? {
            ...prev,
            tasks: prev.tasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    comments: [...task.comments, comment],
                    updatedAt: new Date().toISOString(),
                  }
                : task,
            ),
          }
        : prev,
    )
  }, [])

  const deleteComment = useCallback((taskId: string, commentId: string) => {
    setBoard((prev) =>
      prev
        ? {
            ...prev,
            tasks: prev.tasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    comments: task.comments.filter((c) => c.id !== commentId),
                    updatedAt: new Date().toISOString(),
                  }
                : task,
            ),
          }
        : prev,
    )
  }, [])

  const addSubtask = useCallback((taskId: string, title: string) => {
    const text = title.trim()
    if (!text) return
    const item: Subtask = { id: createId(), title: text, done: false }
    setBoard((prev) =>
      prev
        ? {
            ...prev,
            tasks: prev.tasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    subtasks: [...task.subtasks, item],
                    updatedAt: new Date().toISOString(),
                  }
                : task,
            ),
          }
        : prev,
    )
  }, [])

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setBoard((prev) =>
      prev
        ? {
            ...prev,
            tasks: prev.tasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    subtasks: task.subtasks.map((s) =>
                      s.id === subtaskId ? { ...s, done: !s.done } : s,
                    ),
                    updatedAt: new Date().toISOString(),
                  }
                : task,
            ),
          }
        : prev,
    )
  }, [])

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setBoard((prev) =>
      prev
        ? {
            ...prev,
            tasks: prev.tasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    subtasks: task.subtasks.filter((s) => s.id !== subtaskId),
                    updatedAt: new Date().toISOString(),
                  }
                : task,
            ),
          }
        : prev,
    )
  }, [])

  const sortColumn = useCallback((columnId: ColumnId, mode: ColumnSort) => {
    if (mode === 'manual') return
    setBoard((prev) => {
      if (!prev) return prev
      const columnTasks = prev.tasks
        .filter((t) => t.columnId === columnId)
        .sort((a, b) => {
          if (mode === 'priority') {
            return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
          }
          if (!a.dueDate && !b.dueDate) return a.order - b.order
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return a.dueDate.localeCompare(b.dueDate)
        })
        .map((task, index) => ({ ...task, order: index }))
      const others = prev.tasks.filter((t) => t.columnId !== columnId)
      return { ...prev, tasks: [...others, ...columnTasks] }
    })
  }, [])

  const addDailyGoal = useCallback((title: string) => {
    const text = title.trim()
    if (!text) return
    setBoard((prev) => {
      if (!prev) return prev
      const goals = [...(prev.dailyGoals || [])]
      goals.push({
        id: createId(),
        title: text,
        order: goals.length,
        createdAt: new Date().toISOString(),
      })
      return { ...prev, dailyGoals: goals }
    })
  }, [])

  const deleteDailyGoal = useCallback((goalId: string) => {
    setBoard((prev) => {
      if (!prev) return prev
      const goals = (prev.dailyGoals || [])
        .filter((g) => g.id !== goalId)
        .map((goal, index) => ({ ...goal, order: index }))
      const completions: Record<string, string[]> = {}
      for (const [date, ids] of Object.entries(prev.dailyCompletions || {})) {
        completions[date] = ids.filter((id) => id !== goalId)
      }
      return { ...prev, dailyGoals: goals, dailyCompletions: completions }
    })
  }, [])

  const toggleDailyGoal = useCallback((goalId: string, dateKey: string) => {
    setBoard((prev) => {
      if (!prev) return prev
      const completions = { ...(prev.dailyCompletions || {}) }
      const todayIds = new Set(completions[dateKey] || [])
      if (todayIds.has(goalId)) todayIds.delete(goalId)
      else todayIds.add(goalId)
      completions[dateKey] = [...todayIds]
      return { ...prev, dailyCompletions: completions }
    })
  }, [])

  const resetDemo = useCallback(() => {
    setBoard(createSeedBoard())
  }, [])

  const getExportJson = useCallback(() => {
    if (!board) return null
    return exportBoard(board)
  }, [board])

  return {
    ready,
    board,
    tasksByColumn,
    allTags,
    snapshot,
    setTheme,
    setName,
    setWipLimit,
    wouldExceedWip,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    archiveCompleted,
    restoreTask,
    duplicateTask,
    addComment,
    deleteComment,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    sortColumn,
    addDailyGoal,
    deleteDailyGoal,
    toggleDailyGoal,
    resetDemo,
    getExportJson,
  }
}
