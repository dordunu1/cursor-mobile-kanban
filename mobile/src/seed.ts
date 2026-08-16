import { createId } from './lib/id'
import type { BoardState, Task } from './types'
import { DEFAULT_WIP_LIMIT } from './types'

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3600 * 1000).toISOString()
}

export function createSeedBoard(): BoardState {
  const now = new Date().toISOString()
  const aged = hoursAgo(24 * 4)

  const tasks: Task[] = [
    {
      id: createId(),
      title: 'Sketch onboarding flow',
      description:
        'Map the first-run experience so new users land on a board that already feels useful.',
      columnId: 'planning',
      priority: 'high',
      tags: ['design', 'ux'],
      dueDate: daysFromNow(3),
      comments: [
        {
          id: createId(),
          body: 'Keep the first viewport calm — brand, one headline, one CTA.',
          createdAt: now,
        },
      ],
      subtasks: [
        { id: createId(), title: 'Hero composition', done: true },
        { id: createId(), title: 'Empty-state copy', done: false },
        { id: createId(), title: 'Mobile pass', done: false },
      ],
      createdAt: now,
      updatedAt: now,
      columnEnteredAt: now,
      completedAt: null,
      order: 0,
    },
    {
      id: createId(),
      title: 'Define priority colors',
      description: 'Use zPayy blue for high priority; keep medium and low quieter.',
      columnId: 'planning',
      priority: 'medium',
      tags: ['design'],
      dueDate: daysFromNow(-1),
      comments: [],
      subtasks: [],
      createdAt: now,
      updatedAt: now,
      columnEnteredAt: now,
      completedAt: null,
      order: 1,
    },
    {
      id: createId(),
      title: 'Wire column moves',
      description: 'Planning → In Progress → Completed with a smooth lane switcher.',
      columnId: 'in_progress',
      priority: 'high',
      tags: ['engineering'],
      dueDate: daysFromNow(0),
      comments: [],
      subtasks: [
        { id: createId(), title: 'Cross-column move', done: true },
        { id: createId(), title: 'WIP guard', done: false },
      ],
      createdAt: aged,
      updatedAt: aged,
      columnEnteredAt: aged,
      completedAt: null,
      order: 0,
    },
    {
      id: createId(),
      title: 'Local cache + export',
      description: 'Persist with AsyncStorage and ship a portable JSON snapshot.',
      columnId: 'in_progress',
      priority: 'medium',
      tags: ['engineering', 'data'],
      dueDate: daysFromNow(2),
      comments: [],
      subtasks: [
        { id: createId(), title: 'Schema normalize', done: true },
        { id: createId(), title: 'Import validation', done: true },
      ],
      createdAt: now,
      updatedAt: now,
      columnEnteredAt: now,
      completedAt: null,
      order: 1,
    },
    {
      id: createId(),
      title: 'Choose product name',
      description: 'Orbit Board — personal Kanban for phone and web.',
      columnId: 'completed',
      priority: 'low',
      tags: ['product'],
      dueDate: null,
      comments: [
        {
          id: createId(),
          body: 'Name locked for v1.',
          createdAt: now,
        },
      ],
      subtasks: [{ id: createId(), title: 'Trademark scan', done: true }],
      createdAt: now,
      updatedAt: now,
      columnEnteredAt: now,
      completedAt: now,
      order: 0,
    },
  ]

  return {
    version: 1,
    name: 'Orbit Board',
    tasks,
    theme: 'light',
    dailyGoals: [
      {
        id: createId(),
        title: 'Move for 20 minutes',
        order: 0,
        createdAt: now,
      },
      {
        id: createId(),
        title: 'Deep work block (no phone)',
        order: 1,
        createdAt: now,
      },
      {
        id: createId(),
        title: 'Clear inbox to zero',
        order: 2,
        createdAt: now,
      },
    ],
    dailyCompletions: {},
    wipLimit: DEFAULT_WIP_LIMIT,
  }
}
