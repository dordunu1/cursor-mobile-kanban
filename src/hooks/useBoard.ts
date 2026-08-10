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
import { PRIORITY_RANK } from '../types'
import {
  cloneBoard,
  downloadJson,
  exportBoard,
  loadBoard,
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
  }
  for (const task of tasks) byColumn[task.columnId].push(task)
  const next: Task[] = []
  for (const columnId of Object.keys(byColumn) as ColumnId[]) {
    byColumn[columnId]
      .sort((a, b) => a.order - b.order)
      .forEach((task, index) => next.push({ ...task, order: index }))
  }
  return next
}

export function useBoard() {
  const [board, setBoard] = useState<BoardState>(() => loadBoard())

  useEffect(() => {
    saveBoard(board)
  }, [board])

  useEffect(() => {
    document.documentElement.dataset.theme = board.theme
  }, [board.theme])

  const tasksByColumn = useMemo(() => {
    const map: Record<ColumnId, Task[]> = {
      planning: [],
      in_progress: [],
      completed: [],
    }
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
      setBoard((prev) => {
        const columnTasks = prev.tasks.filter((t) => t.columnId === input.columnId)
        const task: Task = {
          id: crypto.randomUUID(),
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
          order: columnTasks.length,
        }
        return { ...prev, tasks: [...prev.tasks, task] }
      })
    },
    [],
  )

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    const now = new Date().toISOString()
    setBoard((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id ? { ...task, ...patch, updatedAt: now } : task,
      ),
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

        const others = prev.tasks.filter((t) => t.id !== taskId)
        const destination = others
          .filter((t) => t.columnId === toColumn)
          .sort((a, b) => a.order - b.order)

        const moved: Task = {
          ...task,
          columnId: toColumn,
          updatedAt: new Date().toISOString(),
        }
        destination.splice(Math.max(0, Math.min(toIndex, destination.length)), 0, moved)

        const next: Task[] = []
        for (const columnId of ['planning', 'in_progress', 'completed'] as ColumnId[]) {
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

  const setSubtasks = useCallback((taskId: string, subtasks: Subtask[]) => {
    setBoard((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId
          ? { ...task, subtasks, updatedAt: new Date().toISOString() }
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

  const clearColumn = useCallback((columnId: ColumnId) => {
    setBoard((prev) => ({
      ...prev,
      tasks: reindexAll(prev.tasks.filter((t) => t.columnId !== columnId)),
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
          // due
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

  const exportData = useCallback(() => {
    const stamp = new Date().toISOString().slice(0, 10)
    downloadJson(`orbit-board-${stamp}.json`, exportBoard(board))
  }, [board])

  const importData = useCallback(async (file: File) => {
    const text = await file.text()
    const next = parseImport(text)
    setBoard(next)
  }, [])

  return {
    board,
    tasksByColumn,
    allTags,
    snapshot,
    replaceBoard,
    setTheme,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addComment,
    deleteComment,
    setSubtasks,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    clearColumn,
    sortColumn,
    addDailyGoal,
    deleteDailyGoal,
    toggleDailyGoal,
    exportData,
    importData,
  }
}
