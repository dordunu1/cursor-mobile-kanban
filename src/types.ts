export type BoardColumnId = 'planning' | 'in_progress' | 'completed'
export type ColumnId = BoardColumnId | 'archive'

export type Priority = 'low' | 'medium' | 'high'

export type DueFilter = 'all' | 'overdue' | 'soon' | 'today' | 'none'
export type PriorityFilter = 'all' | Priority
export type ColumnSort = 'manual' | 'due' | 'priority'

export interface Comment {
  id: string
  body: string
  createdAt: string
}

export interface Subtask {
  id: string
  title: string
  done: boolean
}

export interface Task {
  id: string
  title: string
  description: string
  columnId: ColumnId
  priority: Priority
  tags: string[]
  dueDate: string | null
  comments: Comment[]
  subtasks: Subtask[]
  createdAt: string
  updatedAt: string
  /** When the card entered its current lane — used for aging. */
  columnEnteredAt: string
  /** Set when the card last landed in Completed. */
  completedAt: string | null
  order: number
}

export interface DailyGoal {
  id: string
  title: string
  order: number
  createdAt: string
}

export interface BoardState {
  version: 1
  name: string
  tasks: Task[]
  theme: 'light' | 'dark'
  dailyGoals: DailyGoal[]
  /** Map of YYYY-MM-DD -> completed goal ids for that day */
  dailyCompletions: Record<string, string[]>
  /** Max cards allowed in In Progress. 0 means unlimited. */
  wipLimit: number
  exportedAt?: string
}

export interface BoardFilters {
  query: string
  priority: PriorityFilter
  due: DueFilter
  tag: string
}

export const COLUMNS: { id: BoardColumnId; title: string; subtitle: string }[] = [
  { id: 'planning', title: 'Planning', subtitle: 'Ideas & backlog' },
  { id: 'in_progress', title: 'In Progress', subtitle: 'Active work' },
  { id: 'completed', title: 'Completed', subtitle: 'Finished' },
]

export const ALL_COLUMN_IDS: ColumnId[] = [
  'planning',
  'in_progress',
  'completed',
  'archive',
]

export const STORAGE_KEY = 'orbit-board.v1'

export const DEFAULT_WIP_LIMIT = 3

export const PRIORITY_RANK: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

export function todayKey(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function emptyFilters(): BoardFilters {
  return {
    query: '',
    priority: 'all',
    due: 'all',
    tag: '',
  }
}

export function filtersAreActive(filters: BoardFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.priority !== 'all' ||
    filters.due !== 'all' ||
    filters.tag !== ''
  )
}
