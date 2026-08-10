import { useEffect, useMemo, useRef, useState } from 'react'
import { Board } from './components/Board'
import { BoardPulse } from './components/BoardPulse'
import { FilterBar } from './components/FilterBar'
import { NewTaskModal } from './components/NewTaskModal'
import { TaskDetail } from './components/TaskDetail'
import { Toolbar } from './components/Toolbar'
import { matchesDueFilter } from './due'
import { useBoard } from './hooks/useBoard'
import type { BoardFilters, BoardState, ColumnId, Task } from './types'
import { COLUMNS } from './types'

type UndoState = {
  message: string
  board: BoardState
}

const EMPTY_FILTERS: BoardFilters = {
  query: '',
  priority: 'all',
  due: 'all',
  tag: '',
}

export default function App() {
  const {
    board,
    tasksByColumn,
    allTags,
    snapshot,
    replaceBoard,
    setTheme,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addComment,
    deleteComment,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    clearColumn,
    sortColumn,
    exportData,
    importData,
  } = useBoard()

  const [showNew, setShowNew] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filters, setFilters] = useState<BoardFilters>(EMPTY_FILTERS)
  const [toast, setToast] = useState<string | null>(null)
  const [undo, setUndo] = useState<UndoState | null>(null)
  const dragSnapshot = useRef<BoardState | null>(null)

  useEffect(() => {
    if (!undo && !toast) return
    const timer = window.setTimeout(() => {
      setToast(null)
      setUndo(null)
    }, 4200)
    return () => window.clearTimeout(timer)
  }, [undo, toast])

  const selectedTask = useMemo(
    () => board.tasks.find((task) => task.id === selectedId) ?? null,
    [board.tasks, selectedId],
  )

  const filteredByColumn = useMemo(() => {
    const query = filters.query.trim().toLowerCase()
    const map: Record<ColumnId, Task[]> = {
      planning: [],
      in_progress: [],
      completed: [],
    }
    for (const columnId of Object.keys(map) as ColumnId[]) {
      map[columnId] = tasksByColumn[columnId].filter((task) => {
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
  }, [tasksByColumn, filters])

  const flash = (message: string) => {
    setUndo(null)
    setToast(message)
  }

  const offerUndo = (message: string, previous: BoardState) => {
    setToast(null)
    setUndo({ message, board: previous })
  }

  const openTask = (task: Task) => setSelectedId(task.id)

  const columnTitle = (id: ColumnId) =>
    COLUMNS.find((column) => column.id === id)?.title || id

  return (
    <div className="app-shell">
      <div className="ambient ambient-a" aria-hidden="true" />
      <div className="ambient ambient-b" aria-hidden="true" />
      <div className="app-frame">
        <Toolbar
          theme={board.theme}
          taskCount={board.tasks.length}
          onToggleTheme={() => setTheme(board.theme === 'dark' ? 'light' : 'dark')}
          onNewTask={() => setShowNew(true)}
          onExport={() => {
            exportData()
            flash('Board exported as JSON')
          }}
          onImport={async (file) => {
            const previous = snapshot()
            try {
              await importData(file)
              offerUndo('Board imported', previous)
            } catch {
              flash('Import failed — use an Orbit Board JSON file')
            }
          }}
        />

        <BoardPulse tasksByColumn={tasksByColumn} />

        <FilterBar filters={filters} tags={allTags} onChange={setFilters} />

        <Board
          tasksByColumn={filteredByColumn}
          onMoveTask={moveTask}
          onOpenTask={openTask}
          onQuickAdd={(columnId, title) => {
            addTask({ title, columnId })
            flash(`Added to ${columnTitle(columnId)}`)
          }}
          onSortColumn={(columnId, mode) => {
            sortColumn(columnId, mode)
            flash(`Sorted ${columnTitle(columnId)}`)
          }}
          onClearColumn={(columnId) => {
            const previous = snapshot()
            clearColumn(columnId)
            offerUndo(`Cleared ${columnTitle(columnId)}`, previous)
          }}
          onDragBegin={() => {
            dragSnapshot.current = snapshot()
          }}
          onMoved={(_taskId, toColumn) => {
            const previous = dragSnapshot.current
            dragSnapshot.current = null
            if (previous) {
              offerUndo(`Moved to ${columnTitle(toColumn)}`, previous)
            } else {
              flash(`Moved to ${columnTitle(toColumn)}`)
            }
          }}
        />
      </div>

      {showNew ? (
        <NewTaskModal onClose={() => setShowNew(false)} onCreate={addTask} />
      ) : null}

      {selectedTask ? (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedId(null)}
          onSave={(patch) => updateTask(selectedTask.id, patch)}
          onDelete={() => {
            const previous = snapshot()
            deleteTask(selectedTask.id)
            setSelectedId(null)
            offerUndo('Task deleted', previous)
          }}
          onAddComment={(body) => addComment(selectedTask.id, body)}
          onDeleteComment={(commentId) => deleteComment(selectedTask.id, commentId)}
          onAddSubtask={(title) => addSubtask(selectedTask.id, title)}
          onToggleSubtask={(subtaskId) => toggleSubtask(selectedTask.id, subtaskId)}
          onDeleteSubtask={(subtaskId) => deleteSubtask(selectedTask.id, subtaskId)}
        />
      ) : null}

      {undo ? (
        <div className="toast toast-undo">
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
        <div className="toast">{toast}</div>
      ) : null}
    </div>
  )
}
