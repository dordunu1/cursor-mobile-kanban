import { useMemo, useState } from 'react'
import { Board } from './components/Board'
import { BoardPulse } from './components/BoardPulse'
import { NewTaskModal } from './components/NewTaskModal'
import { TaskDetail } from './components/TaskDetail'
import { Toolbar } from './components/Toolbar'
import { useBoard } from './hooks/useBoard'
import type { Task } from './types'

export default function App() {
  const {
    board,
    tasksByColumn,
    setTheme,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addComment,
    deleteComment,
    exportData,
    importData,
  } = useBoard()

  const [showNew, setShowNew] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const selectedTask = useMemo(
    () => board.tasks.find((task) => task.id === selectedId) ?? null,
    [board.tasks, selectedId],
  )

  const flash = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2400)
  }

  const openTask = (task: Task) => setSelectedId(task.id)

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
            try {
              await importData(file)
              flash('Board imported successfully')
            } catch {
              flash('Import failed — use an Orbit Board JSON file')
            }
          }}
        />

        <BoardPulse tasksByColumn={tasksByColumn} />

        <Board
          tasksByColumn={tasksByColumn}
          onMoveTask={moveTask}
          onOpenTask={openTask}
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
            deleteTask(selectedTask.id)
            setSelectedId(null)
            flash('Task deleted')
          }}
          onAddComment={(body) => addComment(selectedTask.id, body)}
          onDeleteComment={(commentId) => deleteComment(selectedTask.id, commentId)}
        />
      ) : null}

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  )
}
