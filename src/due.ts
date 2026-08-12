import type { DueFilter, Task } from './types'

export type DueStatus = 'none' | 'ok' | 'soon' | 'today' | 'overdue'

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function diffDaysFromToday(dueDate: string): number {
  const due = new Date(`${dueDate}T12:00:00`)
  const today = startOfToday()
  return Math.round((due.getTime() - today.getTime()) / 86400000)
}

export function getDueStatus(dueDate: string | null): DueStatus {
  if (!dueDate) return 'none'
  const diffDays = diffDaysFromToday(dueDate)
  if (diffDays < 0) return 'overdue'
  if (diffDays === 0) return 'today'
  if (diffDays <= 2) return 'soon'
  return 'ok'
}

export function matchesDueFilter(task: Task, filter: DueFilter): boolean {
  const status = getDueStatus(task.dueDate)
  if (filter === 'all') return true
  if (filter === 'none') return status === 'none'
  if (filter === 'overdue') return status === 'overdue'
  if (filter === 'today') return status === 'today'
  if (filter === 'soon') return status === 'soon'
  return true
}

export function formatDueLabel(dueDate: string | null): string | null {
  if (!dueDate) return null
  const date = new Date(`${dueDate}T12:00:00`)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function laneAgeDays(enteredAt: string): number {
  const entered = new Date(enteredAt)
  if (Number.isNaN(entered.getTime())) return 0
  const start = startOfToday()
  const enteredDay = new Date(entered)
  enteredDay.setHours(0, 0, 0, 0)
  return Math.max(0, Math.round((start.getTime() - enteredDay.getTime()) / 86400000))
}

export function formatLaneAge(enteredAt: string): string | null {
  const days = laneAgeDays(enteredAt)
  if (days < 2) return null
  return days === 1 ? '1d in lane' : `${days}d in lane`
}

export function lastNDateKeys(n: number, from = new Date()): string[] {
  const keys: string[] = []
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(from)
    d.setDate(from.getDate() - i)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    keys.push(`${y}-${m}-${day}`)
  }
  return keys
}
