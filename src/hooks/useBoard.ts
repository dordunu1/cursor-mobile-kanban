import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { createSeedBoard } from '../seed'
import {
  cloneBoard,
  downloadJson,
  exportBoard,
  loadBoard,
  mergeBoards,
  parseImport,
  saveBoard,
} from '../storage'

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
  const [board, setBoard] = useState<BoardState>(() => loadBoard())

  useEffect(() => {
    saveBoard(board)
  }, [board])

  useEffect(() => {
    document.documentElement.dataset.theme = board.theme
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', board.theme === 'light' ? '#e7ebf3' : '#171a21')
    }
  }, [board.theme])

  const tasksByColumn = useMemo(() => {
    const map = emptyColumnMap()
    for (const task of sortTasks(board.tasks)) {
      map[task.columnId].push(task)
    }
    return map
  }, [board.tasks])

  const allTags = useMemo(() => {
    const set = new Set<string>()
    for (const task of board.tasks) {
      for (const tag of task.tags) set.add(tag)
    }
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [board.tasks])

  const replaceBoard = useCallback((next: BoardState) => {
    setBoard(next)
  }, [])

  const snapshot = useCallback(() => cloneBoard(board), [board])

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setBoard((prev) => ({ ...prev, theme }))
  }, [])

  const setName = useCallback((name: string) => {
    const next = name.trim() || 'Orbit Board'
    setBoard((prev) => ({ ...prev, name: next }))
  }, [])

  const setWipLimit = useCallback((wipLimit: number) => {
    setBoard((prev) => ({
      ...prev,
      wipLimit: Number.isFinite(wipLimit) ? Math.max(0, Math.round(wipLimit)) : DEFAULT_WIP_LIMIT,
    }))
  }, [])

  const wouldExceedWip = useCallback(
    (taskId: string, toColumn: ColumnId) => {
      if (toColumn !== 'in_progress') return false
      if (board.wipLimit <= 0) return false
      const task = board.tasks.find((item) => item.id === taskId)
      if (task?.columnId === 'in_progress') return false
      return tasksByColumn.in_progress.length >= board.wipLimit
    },
    [board.tasks, board.wipLimit, tasksByColumn.in_progress.length],
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
      const createdId = crypto.randomUUID()
      setBoard((prev) => {
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
    setBoard((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => {
        if (task.id !== id) return task
        const rest = { ...patch }
        delete rest.columnId
        delete rest.order
        delete rest.id
        return { ...task, ...rest, updatedAt: now }
      }),
    }))
  }, [])

  const deleteTask = useCallback((id: string) => {
    setBoard((prev) => ({
      ...prev,
      tasks: reindexAll(prev.tasks.filter((t) => t.id !== id)),
    }))
  }, [])

  const moveTask = useCallback(
    (taskId: string, toColumn: ColumnId, toIndex: number) => {
      setBoard((prev) => {
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
              : others
                  .filter((t) => t.columnId === columnId)
                  .sort((a, b) => a.order - b.order)
          list.forEach((item, index) => {
            next.push({ ...item, columnId, order: index })
          })
        }
        return { ...prev, tasks: next }
      })
    },
    [],
  )

  const archiveCompleted = useCallback(() => {
    setBoard((prev) => {
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
            : others
                .filter((t) => t.columnId === columnId)
                .sort((a, b) => a.order - b.order)
        list.forEach((item, index) => next.push({ ...item, columnId, order: index }))
      }
      return { ...prev, tasks: next }
    })
  }, [])

  const duplicateTask = useCallback((id: string) => {
    const createdId = crypto.randomUUID()
    setBoard((prev) => {
      const task = prev.tasks.find((t) => t.id === id)
      if (!task) return prev
      const now = new Date().toISOString()
      const columnTasks = prev.tasks.filter((t) => t.columnId === task.columnId)
      const copy: Task = {
        ...task,
        id: createdId,
        title: `${task.title} (copy)`,
        comments: [],
        subtasks: task.subtasks.map((item) => ({
          ...item,
          id: crypto.randomUUID(),
        })),
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
      id: crypto.randomUUID(),
      body: text,
      createdAt: new Date().toISOString(),
    }
    setBoard((prev) => ({
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
    }))
  }, [])

  const deleteComment = useCallback((taskId: string, commentId: string) => {
    setBoard((prev) => ({
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
    }))
  }, [])

  const addSubtask = useCallback((taskId: string, title: string) => {
    const text = title.trim()
    if (!text) return
    const item: Subtask = { id: crypto.randomUUID(), title: text, done: false }
    setBoard((prev) => ({
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
    }))
  }, [])

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setBoard((prev) => ({
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
    }))
  }, [])

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setBoard((prev) => ({
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
    }))
  }, [])

  const sortColumn = useCallback((columnId: ColumnId, mode: ColumnSort) => {
    if (mode === 'manual') return
    setBoard((prev) => {
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
      const goals = [...(prev.dailyGoals || [])]
      goals.push({
        id: crypto.randomUUID(),
        title: text,
        order: goals.length,
        createdAt: new Date().toISOString(),
      })
      return { ...prev, dailyGoals: goals }
    })
  }, [])

  const deleteDailyGoal = useCallback((goalId: string) => {
    setBoard((prev) => {
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
      const completions = { ...(prev.dailyCompletions || {}) }
      const todayIds = new Set(completions[dateKey] || [])
      if (todayIds.has(goalId)) todayIds.delete(goalId)
      else todayIds.add(goalId)
      completions[dateKey] = [...todayIds]
      return { ...prev, dailyCompletions: completions }
    })
  }, [])

  const reorderDailyGoals = useCallback((fromIndex: number, toIndex: number) => {
    setBoard((prev) => {
      const goals = [...(prev.dailyGoals || [])].sort((a, b) => a.order - b.order)
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= goals.length ||
        toIndex >= goals.length
      ) {
        return prev
      }
      const [moved] = goals.splice(fromIndex, 1)
      goals.splice(toIndex, 0, moved)
      return {
        ...prev,
        dailyGoals: goals.map((goal, index) => ({ ...goal, order: index })),
      }
    })
  }, [])

  const resetDemo = useCallback(() => {
    setBoard(createSeedBoard())
  }, [])

  const exportData = useCallback(() => {
    const stamp = new Date().toISOString().slice(0, 10)
    downloadJson(`orbit-board-${stamp}.json`, exportBoard(board))
  }, [board])

  const importData = useCallback(async (file: File, mode: 'replace' | 'merge' = 'replace') => {
    const text = await file.text()
    const incoming = parseImport(text)
    setBoard((prev) => (mode === 'merge' ? mergeBoards(prev, incoming) : incoming))
  }, [])

  return {
    board,
    tasksByColumn,
    allTags,
    snapshot,
    replaceBoard,
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
    reorderDailyGoals,
    resetDemo,
    exportData,
    importData,
  }
}
