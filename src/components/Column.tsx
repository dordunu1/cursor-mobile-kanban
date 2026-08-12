import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useEffect, useRef, useState } from 'react'
import type { BoardColumnId, ColumnSort, Task } from '../types'
import {
  IconCompleted,
  IconMore,
  IconPlanning,
  IconPlus,
  IconProgress,
} from './Icons'
import { TaskCard } from './TaskCard'

const COLUMN_ICONS = {
  planning: IconPlanning,
  in_progress: IconProgress,
  completed: IconCompleted,
} as const

export function Column({
  id,
  title,
  subtitle,
  tasks,
  settlingId,
  collapsed,
  filtered,
  wipLimit,
  wipCount,
  onToggleCollapsed,
  onOpenTask,
  onQuickAdd,
  onSort,
  onClear,
  onSetWipLimit,
}: {
  id: BoardColumnId
  title: string
  subtitle: string
  tasks: Task[]
  settlingId: string | null
  collapsed: boolean
  filtered: boolean
  wipLimit: number
  wipCount: number
  onToggleCollapsed: () => void
  onOpenTask: (task: Task) => void
  onQuickAdd: (title: string) => void
  onSort: (mode: ColumnSort) => void
  onClear: () => void
  onSetWipLimit: (limit: number) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const Icon = COLUMN_ICONS[id]
  const [draft, setDraft] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const atWip =
    id === 'in_progress' && wipLimit > 0 && wipCount >= wipLimit

  useEffect(() => {
    if (!menuOpen) return
    const onPointer = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    window.addEventListener('mousedown', onPointer)
    return () => window.removeEventListener('mousedown', onPointer)
  }, [menuOpen])

  const submitQuick = () => {
    const value = draft.trim()
    if (!value) return
    onQuickAdd(value)
    setDraft('')
  }

  return (
    <section
      className={`column tone-${id}${isOver ? ' is-over' : ''}${collapsed ? ' is-collapsed' : ''}${atWip ? ' is-wip-full' : ''}`}
      aria-label={title}
    >
      <header className="column-header">
        <div className="column-heading">
          <div className={`column-icon tone-${id}`} aria-hidden="true">
            <Icon size={30} />
          </div>
          <div>
            <h2 className="column-title">{title}</h2>
            <p className="column-sub">
              {id === 'in_progress' && wipLimit > 0
                ? `WIP ${wipCount}/${wipLimit}`
                : subtitle}
            </p>
          </div>
        </div>
        <div className="column-tools">
          <span className={`column-count${atWip ? ' is-wip' : ''}`}>
            {id === 'in_progress' && wipLimit > 0
              ? `${wipCount}/${wipLimit}`
              : tasks.length}
          </span>
          <div className="column-menu" ref={menuRef}>
            <button
              className="icon-btn neu-btn column-menu-btn"
              aria-label={`${title} actions`}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <IconMore size={18} />
            </button>
            {menuOpen ? (
              <div className="column-menu-panel" role="menu">
                <button
                  role="menuitem"
                  onClick={() => {
                    onSort('due')
                    setMenuOpen(false)
                  }}
                >
                  Sort by due date
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    onSort('priority')
                    setMenuOpen(false)
                  }}
                >
                  Sort by priority
                </button>
                {id === 'in_progress' ? (
                  <>
                    <button
                      role="menuitem"
                      onClick={() => {
                        onSetWipLimit(3)
                        setMenuOpen(false)
                      }}
                    >
                      WIP limit: 3
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => {
                        onSetWipLimit(5)
                        setMenuOpen(false)
                      }}
                    >
                      WIP limit: 5
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => {
                        onSetWipLimit(0)
                        setMenuOpen(false)
                      }}
                    >
                      WIP unlimited
                    </button>
                  </>
                ) : null}
                {id === 'completed' ? (
                  <button
                    role="menuitem"
                    onClick={() => {
                      onToggleCollapsed()
                      setMenuOpen(false)
                    }}
                  >
                    {collapsed ? 'Expand completed' : 'Collapse completed'}
                  </button>
                ) : null}
                {id === 'completed' ? (
                  <button
                    role="menuitem"
                    className="danger"
                    onClick={() => {
                      onClear()
                      setMenuOpen(false)
                    }}
                  >
                    Archive completed
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {!collapsed ? (
        <>
          <div ref={setNodeRef} className="column-body">
            <SortableContext
              items={tasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {tasks.length === 0 ? (
                <div className="empty-column">
                  <div className={`empty-glyph tone-${id}`}>
                    <Icon size={36} />
                  </div>
                  <p>
                    {filtered
                      ? 'No matching tasks in this lane'
                      : `Drop a task into ${title.toLowerCase()}`}
                  </p>
                </div>
              ) : (
                tasks.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onOpen={onOpenTask}
                    styleDelay={index * 40}
                    settling={settlingId === task.id}
                  />
                ))
              )}
            </SortableContext>
          </div>

          <form
            className="quick-add"
            onSubmit={(event) => {
              event.preventDefault()
              submitQuick()
            }}
          >
            <IconPlus size={16} />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Add to ${title}…`}
              aria-label={`Quick add to ${title}`}
            />
            <button type="submit" className="quick-add-btn" disabled={!draft.trim()}>
              Add
            </button>
          </form>
        </>
      ) : (
        <button className="collapsed-lane" onClick={onToggleCollapsed}>
          {tasks.length} completed tasks hidden — tap to expand
        </button>
      )}
    </section>
  )
}
