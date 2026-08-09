export type ColumnId = 'planning' | 'in_progress' | 'completed'

export type Priority = 'low' | 'medium' | 'high'

export interface Comment {
  id: string
  body: string
  createdAt: string
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

export const COLUMNS: { id: ColumnId; title: string; subtitle: string }[] = [
  { id: 'planning', title: 'Planning', subtitle: 'Ideas & backlog' },
  { id: 'in_progress', title: 'In Progress', subtitle: 'Active work' },
  { id: 'completed', title: 'Completed', subtitle: 'Finished' },
]

export const STORAGE_KEY = 'orbit-board.v1'
