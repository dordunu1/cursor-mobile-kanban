export type ColumnId = 'planning' | 'in_progress' | 'completed'

export type Priority = 'low' | 'medium' | 'high'

export type DueFilter = 'all' | 'overdue' | 'soon' | 'none'
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
  order: number
}

export interface BoardState {
  version: 1
  name: string
  tasks: Task[]
  theme: 'light' | 'dark'
  exportedAt?: string
}

export interface BoardFilters {
  query: string
  priority: PriorityFilter
  due: DueFilter
  tag: string
}

export const COLUMNS: { id: ColumnId; title: string; subtitle: string }[] = [
  { id: 'planning', title: 'Planning', subtitle: 'Ideas & backlog' },
  { id: 'in_progress', title: 'In Progress', subtitle: 'Active work' },
  { id: 'completed', title: 'Completed', subtitle: 'Finished' },
]

export const STORAGE_KEY = 'orbit-board.v1'

export const PRIORITY_RANK: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}
