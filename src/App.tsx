import { useEffect, useMemo, useRef, useState } from 'react'
import { ArchivePanel } from './components/ArchivePanel'
import { Board } from './components/Board'
import { BoardPulse } from './components/BoardPulse'
import { ConfettiBurst } from './components/ConfettiBurst'
import { ConfirmDialog } from './components/ConfirmDialog'
import { DailyGoals } from './components/DailyGoals'
import { FilterBar } from './components/FilterBar'
import { ImportDialog } from './components/ImportDialog'
import { LiquidGlassFilters } from './components/LiquidGlassFilters'
import { NewTaskModal } from './components/NewTaskModal'
import { TaskDetail } from './components/TaskDetail'
import { Toolbar } from './components/Toolbar'
import { matchesDueFilter } from './due'
import { useBoard } from './hooks/useBoard'
import type { BoardColumnId, BoardFilters, BoardState, ColumnId, Task } from './types'
import { COLUMNS, emptyFilters, filtersAreActive, todayKey } from './types'

type UndoState = {
  message: string
  board: BoardState
}

export default function App() {
  const {
    board,
    tasksByColumn,
    allTags,
    snapshot,
    replaceBoard,
    setTheme,
    setName,
    setWipLimit,
    wouldExceedWip,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    archiveCompleted,
    restoreTask,
    duplicateTask,
    addComment,
    deleteComment,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    sortColumn,
    addDailyGoal,
    deleteDailyGoal,
    toggleDailyGoal,
    reorderDailyGoals,
    resetDemo,
    exportData,
    importData,
  } = useBoard()

  const [showNew, setShowNew] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filters, setFilters] = useState<BoardFilters>(emptyFilters())
  const [toast, setToast] = useState<string | null>(null)
  const [undo, setUndo] = useState<UndoState | null>(null)
  const [confettiToken, setConfettiToken] = useState(0)
  const [pendingImport, setPendingImport] = useState<File | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const dragSnapshot = useRef<BoardState | null>(null)
  const wipWarned = useRef(false)

  useEffect(() => {
    if (!undo && !toast) return
    const timer = window.setTimeout(() => {
      setToast(null)
      setUndo(null)
    }, 4200)
    return () => window.clearTimeout(timer)
  }, [undo, toast])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      if (event.key === '/' && !typing) {
        event.preventDefault()
        document.querySelector<HTMLInputElement>('.filter-search input')?.focus()
      }
      if ((event.key === 'n' || event.key === 'N') && !typing && !showNew && !selectedId) {
        event.preventDefault()
        setShowNew(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, showNew])

  const selectedTask = useMemo(
    () => board.tasks.find((task) => task.id === selectedId) ?? null,
    [board.tasks, selectedId],
  )

  const boardColumns = useMemo(() => {
    return {
      planning: tasksByColumn.planning,
      in_progress: tasksByColumn.in_progress,
      completed: tasksByColumn.completed,
    }
  }, [tasksByColumn])

  const filteredByColumn = useMemo(() => {
    const query = filters.query.trim().toLowerCase()
    const map: Record<BoardColumnId, Task[]> = {
      planning: [],
      in_progress: [],
      completed: [],
    }
    for (const columnId of Object.keys(map) as BoardColumnId[]) {
      map[columnId] = boardColumns[columnId].filter((task) => {
        if (filters.priority !== 'all' && task.priority !== filters.priority) return false
        if (!matchesDueFilter(task, filters.due)) return false
        if (filters.tag && !task.tags.includes(filters.tag)) return false
        if (!query) return true
        const haystack = [
          task.title,
          task.description,
          task.tags.join(' '),
          task.comments.map((c) => c.body).join(' '),
          task.subtasks.map((s) => s.title).join(' '),
        ]
          .join(' ')
          .toLowerCase()
        return haystack.includes(query)
      })
    }
    return map
  }, [boardColumns, filters])

  const flash = (message: string) => {
    setUndo(null)
    setToast(message)
  }

  const offerUndo = (message: string, previous: BoardState) => {
    setToast(null)
    setUndo({ message, board: previous })
  }

  const celebrate = () => setConfettiToken((n) => n + 1)

  const openTask = (task: Task) => setSelectedId(task.id)

  const columnTitle = (id: ColumnId) => {
    if (id === 'archive') return 'Archive'
    return COLUMNS.find((column) => column.id === id)?.title || id
  }

  const tryMove = (taskId: string, toColumn: ColumnId, toIndex: number) => {
    if (wouldExceedWip(taskId, toColumn)) {
      if (!wipWarned.current) {
        flash(`In Progress is at its WIP limit (${board.wipLimit})`)
        wipWarned.current = true
      }
      return false
    }
    moveTask(taskId, toColumn, toIndex)
    return true
  }

  const activeBoardCount =
    board.tasks.filter((task) => task.columnId !== 'archive').length

  return (
    <div className="app-shell">
      <LiquidGlassFilters />
      <div className="ambient ambient-a" aria-hidden="true" />
      <div className="ambient ambient-b" aria-hidden="true" />
      <div className="ambient ambient-c" aria-hidden="true" />
      <ConfettiBurst token={confettiToken} />
      <div className="app-frame">
        <Toolbar
          name={board.name}
          theme={board.theme}
          taskCount={activeBoardCount}
          archiveCount={tasksByColumn.archive.length}
          onRename={setName}
          onToggleTheme={() => setTheme(board.theme === 'dark' ? 'light' : 'dark')}
          onNewTask={() => setShowNew(true)}
          onExport={() => {
            exportData()
            flash('Board exported as JSON')
          }}
          onImport={(file) => setPendingImport(file)}
          onOpenArchive={() => setShowArchive(true)}
          onResetDemo={() => setConfirmReset(true)}
        />

        <div className="workspace-rail">
          <BoardPulse tasksByColumn={boardColumns} />

          <DailyGoals
            goals={board.dailyGoals || []}
            completions={board.dailyCompletions || {}}
            onAdd={(title) => {
              addDailyGoal(title)
              flash('Daily goal added')
            }}
            onToggle={(goalId) => {
              const date = todayKey()
              const goals = board.dailyGoals || []
              const done = new Set((board.dailyCompletions || {})[date] || [])
              const wasDone = done.has(goalId)
              toggleDailyGoal(goalId, date)
              if (!wasDone && goals.length > 0) {
                const remaining = goals.filter((g) => g.id !== goalId && !done.has(g.id))
                if (remaining.length === 0) celebrate()
              }
            }}
            onDelete={(goalId) => {
              const previous = snapshot()
              deleteDailyGoal(goalId)
              offerUndo('Daily goal removed', previous)
            }}
            onReorder={reorderDailyGoals}
          />
        </div>

        <FilterBar filters={filters} tags={allTags} onChange={setFilters} />

        <Board
          tasksByColumn={filteredByColumn}
          filtered={filtersAreActive(filters)}
          wipLimit={board.wipLimit}
          wipCount={boardColumns.in_progress.length}
          onMoveTask={tryMove}
          onOpenTask={openTask}
          onQuickAdd={(columnId, title) => {
            if (wouldExceedWip('new', columnId)) {
              flash(`In Progress is at its WIP limit (${board.wipLimit})`)
              return
            }
            addTask({ title, columnId })
            flash(`Added to ${columnTitle(columnId)}`)
          }}
          onSortColumn={(columnId, mode) => {
            sortColumn(columnId, mode)
            flash(`Sorted ${columnTitle(columnId)}`)
          }}
          onClearColumn={() => {
            const previous = snapshot()
            archiveCompleted()
            offerUndo('Completed tasks archived', previous)
          }}
          onSetWipLimit={(limit) => {
            setWipLimit(limit)
            flash(limit === 0 ? 'WIP limit off' : `WIP limit set to ${limit}`)
          }}
          onDragBegin={() => {
            dragSnapshot.current = snapshot()
            wipWarned.current = false
          }}
          onMoved={(_taskId, fromColumn, toColumn) => {
            const previous = dragSnapshot.current
            dragSnapshot.current = null
            if (toColumn === 'completed' && fromColumn !== 'completed') celebrate()
            if (previous) {
              offerUndo(`Moved to ${columnTitle(toColumn)}`, previous)
            } else {
              flash(`Moved to ${columnTitle(toColumn)}`)
            }
          }}
        />
      </div>

      {showNew ? (
        <NewTaskModal
          onClose={() => setShowNew(false)}
          onCreate={(input) => {
            if (wouldExceedWip('new', input.columnId)) {
              flash(`In Progress is at its WIP limit (${board.wipLimit})`)
              addTask({ ...input, columnId: 'planning' })
              return
            }
            addTask(input)
          }}
        />
      ) : null}

      {selectedTask ? (
        <TaskDetail
          task={selectedTask}
          wipBlocked={wouldExceedWip(selectedTask.id, 'in_progress')}
          onClose={() => setSelectedId(null)}
          onSave={(patch) => updateTask(selectedTask.id, patch)}
          onMoveColumn={(columnId) => {
            const dest = tasksByColumn[columnId] || []
            return tryMove(selectedTask.id, columnId, dest.length)
          }}
          onDelete={() => {
            const previous = snapshot()
            deleteTask(selectedTask.id)
            setSelectedId(null)
            offerUndo('Task deleted', previous)
          }}
          onDuplicate={() => {
            const id = duplicateTask(selectedTask.id)
            if (id) {
              setSelectedId(id)
              flash('Task duplicated')
            }
          }}
          onAddComment={(body) => addComment(selectedTask.id, body)}
          onDeleteComment={(commentId) => deleteComment(selectedTask.id, commentId)}
          onAddSubtask={(title) => addSubtask(selectedTask.id, title)}
          onToggleSubtask={(subtaskId) => toggleSubtask(selectedTask.id, subtaskId)}
          onDeleteSubtask={(subtaskId) => deleteSubtask(selectedTask.id, subtaskId)}
        />
      ) : null}

      {showArchive ? (
        <ArchivePanel
          tasks={tasksByColumn.archive}
          onClose={() => setShowArchive(false)}
          onRestore={(id) => {
            restoreTask(id, 'planning')
            flash('Restored to Planning')
          }}
          onDelete={(id) => {
            const previous = snapshot()
            deleteTask(id)
            offerUndo('Archived task deleted', previous)
          }}
        />
      ) : null}

      {pendingImport ? (
        <ImportDialog
          filename={pendingImport.name}
          onClose={() => setPendingImport(null)}
          onReplace={async () => {
            const previous = snapshot()
            const file = pendingImport
            setPendingImport(null)
            try {
              await importData(file, 'replace')
              offerUndo('Board imported', previous)
            } catch {
              flash('Import failed — use an Orbit Board JSON file')
            }
          }}
          onMerge={async () => {
            const previous = snapshot()
            const file = pendingImport
            setPendingImport(null)
            try {
              await importData(file, 'merge')
              offerUndo('Board merged', previous)
            } catch {
              flash('Import failed — use an Orbit Board JSON file')
            }
          }}
        />
      ) : null}

      {confirmReset ? (
        <ConfirmDialog
          title="Reset demo board"
          body="Replace the current board with the sample tasks? You can undo from the toast."
          confirmLabel="Reset"
          danger
          onClose={() => setConfirmReset(false)}
          onConfirm={() => {
            const previous = snapshot()
            resetDemo()
            setConfirmReset(false)
            offerUndo('Demo board restored', previous)
          }}
        />
      ) : null}

      {undo ? (
        <div className="toast toast-undo" role="status" aria-live="polite">
          <span>{undo.message}</span>
          <button
            className="btn btn-primary toast-undo-btn"
            onClick={() => {
              replaceBoard(undo.board)
              setUndo(null)
              flash('Undone')
            }}
          >
            Undo
          </button>
        </div>
      ) : toast ? (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  )
}
