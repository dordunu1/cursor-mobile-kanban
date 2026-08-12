import type { BoardState, DailyGoal, Subtask, Task } from './types'
import { DEFAULT_WIP_LIMIT, STORAGE_KEY } from './types'
import { createSeedBoard } from './seed'

function normalizeSubtasks(raw: unknown): Subtask[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    const s = item as Partial<Subtask>
    return {
      id: s.id || crypto.randomUUID(),
      title: String(s.title || '').trim() || 'Checklist item',
      done: Boolean(s.done),
    }
  })
}

function normalizeColumnId(value: unknown): Task['columnId'] {
  if (value === 'in_progress' || value === 'completed' || value === 'archive') {
    return value
  }
  return 'planning'
}

function normalizeTask(task: Partial<Task>, index: number): Task {
  const columnId = normalizeColumnId(task.columnId)
  const updatedAt = task.updatedAt || new Date().toISOString()
  return {
    id: task.id || crypto.randomUUID(),
    title: task.title || 'Untitled',
    description: task.description || '',
    columnId,
    priority:
      task.priority === 'high' || task.priority === 'low' ? task.priority : 'medium',
    tags: Array.isArray(task.tags) ? task.tags.map(String) : [],
    dueDate: task.dueDate ?? null,
    comments: Array.isArray(task.comments)
      ? task.comments.map((c) => ({
          id: c.id || crypto.randomUUID(),
          body: c.body || '',
          createdAt: c.createdAt || new Date().toISOString(),
        }))
      : [],
    subtasks: normalizeSubtasks(task.subtasks),
    createdAt: task.createdAt || new Date().toISOString(),
    updatedAt,
    columnEnteredAt: task.columnEnteredAt || updatedAt,
    completedAt:
      task.completedAt ?? (columnId === 'completed' || columnId === 'archive' ? updatedAt : null),
    order: typeof task.order === 'number' ? task.order : index,
  }
}

function normalizeDailyGoals(raw: unknown): DailyGoal[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item, index) => {
    const goal = item as Partial<DailyGoal>
    return {
      id: goal.id || crypto.randomUUID(),
      title: String(goal.title || '').trim() || 'Daily goal',
      order: typeof goal.order === 'number' ? goal.order : index,
      createdAt: goal.createdAt || new Date().toISOString(),
    }
  })
}

function normalizeCompletions(raw: unknown): Record<string, string[]> {
  if (!raw || typeof raw !== 'object') return {}
  const next: Record<string, string[]> = {}
  for (const [date, ids] of Object.entries(raw as Record<string, unknown>)) {
    if (Array.isArray(ids)) {
      next[date] = ids.map(String)
    }
  }
  return next
}

function defaultDailyGoals(): DailyGoal[] {
  const now = new Date().toISOString()
  return [
    {
      id: crypto.randomUUID(),
      title: 'Move for 20 minutes',
      order: 0,
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: 'Deep work block (no phone)',
      order: 1,
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: 'Clear inbox to zero',
      order: 2,
      createdAt: now,
    },
  ]
}

export function normalizeBoard(parsed: BoardState): BoardState {
  return {
    version: 1,
    name: parsed.name || 'Orbit Board',
    tasks: parsed.tasks.map((task, index) => normalizeTask(task, index)),
    theme: parsed.theme === 'light' ? 'light' : 'dark',
    dailyGoals:
      parsed.dailyGoals === undefined
        ? defaultDailyGoals()
        : normalizeDailyGoals(parsed.dailyGoals),
    dailyCompletions: normalizeCompletions(parsed.dailyCompletions),
    wipLimit:
      typeof parsed.wipLimit === 'number' && parsed.wipLimit >= 0
        ? parsed.wipLimit
        : DEFAULT_WIP_LIMIT,
  }
}

export function loadBoard(): BoardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createSeedBoard()
    const parsed = JSON.parse(raw) as BoardState
    if (parsed.version !== 1 || !Array.isArray(parsed.tasks)) {
      return createSeedBoard()
    }
    return normalizeBoard(parsed)
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
    dailyGoals: state.dailyGoals,
    dailyCompletions: state.dailyCompletions,
    wipLimit: state.wipLimit,
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
  return normalizeBoard(parsed)
}

export function mergeBoards(current: BoardState, incoming: BoardState): BoardState {
  const incomingTasks = incoming.tasks.map((task) => ({
    ...task,
    id: crypto.randomUUID(),
    comments: task.comments.map((comment) => ({
      ...comment,
      id: crypto.randomUUID(),
    })),
    subtasks: task.subtasks.map((subtask) => ({
      ...subtask,
      id: crypto.randomUUID(),
    })),
  }))
  const incomingGoals = incoming.dailyGoals.map((goal, index) => ({
    ...goal,
    id: crypto.randomUUID(),
    order: current.dailyGoals.length + index,
  }))
  return {
    ...current,
    name: current.name,
    theme: current.theme,
    wipLimit: current.wipLimit,
    tasks: [...current.tasks, ...incomingTasks],
    dailyGoals: [...current.dailyGoals, ...incomingGoals],
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

export function cloneBoard(state: BoardState): BoardState {
  return structuredClone(state)
}
