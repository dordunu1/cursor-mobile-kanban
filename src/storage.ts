import type { BoardState } from './types'
import { STORAGE_KEY } from './types'
import { createSeedBoard } from './seed'

export function loadBoard(): BoardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createSeedBoard()
    const parsed = JSON.parse(raw) as BoardState
    if (parsed.version !== 1 || !Array.isArray(parsed.tasks)) {
      return createSeedBoard()
    }
    return {
      version: 1,
      name: parsed.name || 'Orbit Board',
      tasks: parsed.tasks,
      theme: parsed.theme === 'light' ? 'light' : 'dark',
    }
  } catch {
    return createSeedBoard()
  }
}

export function saveBoard(state: BoardState): void {
  const payload: BoardState = {
    version: 1,
    name: state.name,
    tasks: state.tasks,
    theme: state.theme,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function exportBoard(state: BoardState): string {
  const payload: BoardState = {
    ...state,
    version: 1,
    exportedAt: new Date().toISOString(),
  }
  return JSON.stringify(payload, null, 2)
}

export function parseImport(json: string): BoardState {
  const parsed = JSON.parse(json) as BoardState
  if (parsed.version !== 1 || !Array.isArray(parsed.tasks)) {
    throw new Error('Invalid Orbit Board file')
  }
  return {
    version: 1,
    name: parsed.name || 'Orbit Board',
    tasks: parsed.tasks.map((task, index) => ({
      id: task.id || crypto.randomUUID(),
      title: task.title || 'Untitled',
      description: task.description || '',
      columnId:
        task.columnId === 'in_progress' || task.columnId === 'completed'
          ? task.columnId
          : 'planning',
      priority:
        task.priority === 'high' || task.priority === 'low'
          ? task.priority
          : 'medium',
      tags: Array.isArray(task.tags) ? task.tags.map(String) : [],
      dueDate: task.dueDate ?? null,
      comments: Array.isArray(task.comments)
        ? task.comments.map((c) => ({
            id: c.id || crypto.randomUUID(),
            body: c.body || '',
            createdAt: c.createdAt || new Date().toISOString(),
          }))
        : [],
      createdAt: task.createdAt || new Date().toISOString(),
      updatedAt: task.updatedAt || new Date().toISOString(),
      order: typeof task.order === 'number' ? task.order : index,
    })),
    theme: parsed.theme === 'light' ? 'light' : 'dark',
  }
}

export function downloadJson(filename: string, contents: string): void {
  const blob = new Blob([contents], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
