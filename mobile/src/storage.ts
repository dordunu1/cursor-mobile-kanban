import AsyncStorage from '@react-native-async-storage/async-storage'
import { createId } from './lib/id'
import { createSeedBoard } from './seed'
import type { BoardState, DailyGoal, Subtask, Task } from './types'
import { DEFAULT_WIP_LIMIT, STORAGE_KEY } from './types'

function normalizeSubtasks(raw: unknown): Subtask[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    const s = item as Partial<Subtask>
    return {
      id: s.id || createId(),
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
    id: task.id || createId(),
    title: task.title || 'Untitled',
    description: task.description || '',
    columnId,
    priority:
      task.priority === 'high' || task.priority === 'low' ? task.priority : 'medium',
    tags: Array.isArray(task.tags) ? task.tags.map(String) : [],
    dueDate: task.dueDate ?? null,
    comments: Array.isArray(task.comments)
      ? task.comments.map((c) => ({
          id: c.id || createId(),
          body: c.body || '',
          createdAt: c.createdAt || new Date().toISOString(),
        }))
      : [],
    subtasks: normalizeSubtasks(task.subtasks),
    createdAt: task.createdAt || new Date().toISOString(),
    updatedAt,
    columnEnteredAt: task.columnEnteredAt || updatedAt,
    completedAt:
      task.completedAt ??
      (columnId === 'completed' || columnId === 'archive' ? updatedAt : null),
    order: typeof task.order === 'number' ? task.order : index,
  }
}

function normalizeDailyGoals(raw: unknown): DailyGoal[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item, index) => {
    const goal = item as Partial<DailyGoal>
    return {
      id: goal.id || createId(),
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
    if (Array.isArray(ids)) next[date] = ids.map(String)
  }
  return next
}

function defaultDailyGoals(): DailyGoal[] {
  const now = new Date().toISOString()
  return [
    { id: createId(), title: 'Move for 20 minutes', order: 0, createdAt: now },
    { id: createId(), title: 'Deep work block (no phone)', order: 1, createdAt: now },
    { id: createId(), title: 'Clear inbox to zero', order: 2, createdAt: now },
  ]
}

export function normalizeBoard(parsed: BoardState): BoardState {
  return {
    version: 1,
    name: parsed.name || 'Orbit Board',
    tasks: parsed.tasks.map((task, index) => normalizeTask(task, index)),
    theme: parsed.theme === 'dark' ? 'dark' : 'light',
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

export async function loadBoard(): Promise<BoardState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
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

export async function saveBoard(state: BoardState): Promise<void> {
  const payload: BoardState = {
    version: 1,
    name: state.name,
    tasks: state.tasks,
    theme: state.theme,
    dailyGoals: state.dailyGoals,
    dailyCompletions: state.dailyCompletions,
    wipLimit: state.wipLimit,
  }
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function exportBoard(state: BoardState): string {
  return JSON.stringify(
    {
      ...state,
      version: 1,
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  )
}

export function parseImport(json: string): BoardState {
  const parsed = JSON.parse(json) as BoardState
  if (parsed.version !== 1 || !Array.isArray(parsed.tasks)) {
    throw new Error('Invalid Orbit Board file')
  }
  return normalizeBoard(parsed)
}

export function cloneBoard(state: BoardState): BoardState {
  return JSON.parse(JSON.stringify(state)) as BoardState
}
