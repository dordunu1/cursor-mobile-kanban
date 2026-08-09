import { useCallback, useEffect, useMemo, useState } from 'react'
import type { BoardState, ColumnId, Comment, Priority, Task } from '../types'
import { exportBoard, loadBoard, parseImport, saveBoard, downloadJson } from '../storage'

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => a.order - b.order)
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

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setBoard((prev) => ({ ...prev, theme }))
  }, [])

  const addTask = useCallback(
    (input: {
      title: string
      description: string
      columnId: ColumnId
      priority: Priority
      tags: string[]
      dueDate: string | null
    }) => {
      const now = new Date().toISOString()
      setBoard((prev) => {
        const columnTasks = prev.tasks.filter((t) => t.columnId === input.columnId)
        const order = columnTasks.length
        const task: Task = {
          id: crypto.randomUUID(),
          title: input.title.trim() || 'Untitled task',
          description: input.description.trim(),
          columnId: input.columnId,
          priority: input.priority,
          tags: input.tags,
          dueDate: input.dueDate,
          comments: [],
          createdAt: now,
          updatedAt: now,
          order,
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
    setBoard((prev) => {
      const remaining = prev.tasks.filter((t) => t.id !== id)
      const reindexed = remaining.map((task) => task)
      const byColumn: Record<ColumnId, Task[]> = {
        planning: [],
        in_progress: [],
        completed: [],
      }
      for (const task of reindexed) byColumn[task.columnId].push(task)
      const next: Task[] = []
      for (const columnId of Object.keys(byColumn) as ColumnId[]) {
        byColumn[columnId]
          .sort((a, b) => a.order - b.order)
          .forEach((task, index) => {
            next.push({ ...task, order: index })
          })
      }
      return { ...prev, tasks: next }
    })
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

  const exportData = useCallback(() => {
    const stamp = new Date().toISOString().slice(0, 10)
    downloadJson(`orbit-board-${stamp}.json`, exportBoard(board))
  }, [board])

  const importData = useCallback(async (file: File) => {
    const text = await file.text()
    const next = parseImport(text)
    setBoard(next)
  }, [])

  const resetDemo = useCallback(() => {
    localStorage.removeItem('orbit-board.v1')
    setBoard(loadBoard())
  }, [])

  return {
    board,
    tasksByColumn,
    setTheme,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addComment,
    deleteComment,
    exportData,
    importData,
    resetDemo,
  }
}
