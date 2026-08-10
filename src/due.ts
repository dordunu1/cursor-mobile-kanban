import type { DueFilter, Task } from './types'

export type DueStatus = 'none' | 'ok' | 'soon' | 'overdue'

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function getDueStatus(dueDate: string | null): DueStatus {
  if (!dueDate) return 'none'
  const due = new Date(`${dueDate}T12:00:00`)
  const today = startOfToday()
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000)
  if (diffDays < 0) return 'overdue'
  if (diffDays <= 2) return 'soon'
  return 'ok'
}

export function matchesDueFilter(task: Task, filter: DueFilter): boolean {
  const status = getDueStatus(task.dueDate)
  if (filter === 'all') return true
  if (filter === 'none') return status === 'none'
  if (filter === 'overdue') return status === 'overdue'
  if (filter === 'soon') return status === 'soon' || status === 'overdue'
  return true
}

export function formatDueLabel(dueDate: string | null): string | null {
  if (!dueDate) return null
  const date = new Date(`${dueDate}T12:00:00`)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
