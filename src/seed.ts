import type { BoardState, Task } from './types'

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function createSeedBoard(): BoardState {
  const now = new Date().toISOString()

  const tasks: Task[] = [
    {
      id: crypto.randomUUID(),
      title: 'Sketch onboarding flow',
      description:
        'Map the first-run experience so new users land on a board that already feels useful.',
      columnId: 'planning',
      priority: 'high',
      tags: ['design', 'ux'],
      dueDate: daysFromNow(3),
      comments: [
        {
          id: crypto.randomUUID(),
          body: 'Keep the first viewport calm — brand, one headline, one CTA.',
          createdAt: now,
        },
      ],
      subtasks: [
        { id: crypto.randomUUID(), title: 'Hero composition', done: true },
        { id: crypto.randomUUID(), title: 'Empty-state copy', done: false },
        { id: crypto.randomUUID(), title: 'Mobile pass', done: false },
      ],
      createdAt: now,
      updatedAt: now,
      order: 0,
    },
    {
      id: crypto.randomUUID(),
      title: 'Define priority colors',
      description: 'Ember accent for high priority; keep medium and low quieter.',
      columnId: 'planning',
      priority: 'medium',
      tags: ['design'],
      dueDate: daysFromNow(-1),
      comments: [],
      subtasks: [],
      createdAt: now,
      updatedAt: now,
      order: 1,
    },
    {
      id: crypto.randomUUID(),
      title: 'Wire drag-and-drop columns',
      description:
        'Planning → In Progress → Completed with smooth reordering inside each lane.',
      columnId: 'in_progress',
      priority: 'high',
      tags: ['engineering'],
      dueDate: daysFromNow(1),
      comments: [
        {
          id: crypto.randomUUID(),
          body: 'Using dnd-kit for keyboard-friendly dragging.',
          createdAt: now,
        },
      ],
      subtasks: [
        { id: crypto.randomUUID(), title: 'Cross-column move', done: true },
        { id: crypto.randomUUID(), title: 'Settle animation', done: false },
      ],
      createdAt: now,
      updatedAt: now,
      order: 0,
    },
    {
      id: crypto.randomUUID(),
      title: 'Local cache + export/import',
      description: 'Persist to localStorage and ship a portable JSON snapshot.',
      columnId: 'in_progress',
      priority: 'medium',
      tags: ['engineering', 'data'],
      dueDate: daysFromNow(2),
      comments: [],
      subtasks: [
        { id: crypto.randomUUID(), title: 'Schema normalize', done: true },
        { id: crypto.randomUUID(), title: 'Import validation', done: true },
      ],
      createdAt: now,
      updatedAt: now,
      order: 1,
    },
    {
      id: crypto.randomUUID(),
      title: 'Choose product name',
      description: 'Orbit Board — personal Kanban with soft neumorphic materials.',
      columnId: 'completed',
      priority: 'low',
      tags: ['product'],
      dueDate: null,
      comments: [
        {
          id: crypto.randomUUID(),
          body: 'Name locked for v1.',
          createdAt: now,
        },
      ],
      subtasks: [{ id: crypto.randomUUID(), title: 'Trademark scan', done: true }],
      createdAt: now,
      updatedAt: now,
      order: 0,
    },
  ]

  return {
    version: 1,
    name: 'Orbit Board',
    tasks,
    theme: 'dark',
  }
}
