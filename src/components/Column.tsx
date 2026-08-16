import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useCallback, useRef, useState } from 'react'
import type { BoardColumnId, ColumnSort, Task } from '../types'
import { GlassFloatMenu } from './GlassSelect'
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
  const menuBtnRef = useRef<HTMLButtonElement>(null)
  const atWip =
    id === 'in_progress' && wipLimit > 0 && wipCount >= wipLimit
  const closeMenu = useCallback(() => setMenuOpen(false), [])

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
          <div className="column-menu">
            <button
              ref={menuBtnRef}
              className="icon-btn neu-btn column-menu-btn"
              aria-label={`${title} actions`}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <IconMore size={18} />
            </button>
            <GlassFloatMenu
              open={menuOpen}
              anchorRef={menuBtnRef}
              onClose={closeMenu}
              align="right"
              minWidth={196}
              role="menu"
              ariaLabel={`${title} actions`}
            >
              <button
                type="button"
                role="menuitem"
                className="glass-select-option"
                onClick={() => {
                  onSort('due')
                  closeMenu()
                }}
              >
                Sort by due date
              </button>
              <button
                type="button"
                role="menuitem"
                className="glass-select-option"
                onClick={() => {
                  onSort('priority')
                  closeMenu()
                }}
              >
                Sort by priority
              </button>
              {id === 'in_progress' ? (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    className="glass-select-option"
                    onClick={() => {
                      onSetWipLimit(3)
                      closeMenu()
                    }}
                  >
                    WIP limit: 3
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="glass-select-option"
                    onClick={() => {
                      onSetWipLimit(5)
                      closeMenu()
                    }}
                  >
                    WIP limit: 5
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="glass-select-option"
                    onClick={() => {
                      onSetWipLimit(0)
                      closeMenu()
                    }}
                  >
                    WIP unlimited
                  </button>
                </>
              ) : null}
              {id === 'completed' ? (
                <button
                  type="button"
                  role="menuitem"
                  className="glass-select-option"
                  onClick={() => {
                    onToggleCollapsed()
                    closeMenu()
                  }}
                >
                  {collapsed ? 'Expand completed' : 'Collapse completed'}
                </button>
              ) : null}
              {id === 'completed' ? (
                <button
                  type="button"
                  role="menuitem"
                  className="glass-select-option is-danger"
                  onClick={() => {
                    onClear()
                    closeMenu()
                  }}
                >
                  Archive completed
                </button>
              ) : null}
            </GlassFloatMenu>
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
