import type { ColumnId, Task } from '../types'
import { IconCompleted, IconPlanning, IconProgress, IconSpark } from './Icons'

export function BoardPulse({
  tasksByColumn,
}: {
  tasksByColumn: Record<ColumnId, Task[]>
}) {
  const planning = tasksByColumn.planning.length
  const progress = tasksByColumn.in_progress.length
  const done = tasksByColumn.completed.length
  const total = planning + progress + done || 1
  const donePct = Math.round((done / total) * 100)

  return (
    <section className="board-pulse" aria-label="Board overview">
      <div className="pulse-copy">
        <div className="pulse-kicker">
          <IconSpark size={18} />
          <span>Workspace pulse</span>
        </div>
        <h1 className="pulse-title">Shape the week with calm focus</h1>
        <p className="pulse-sub">
          Drag cards between lanes. Everything stays on this device until you export.
        </p>
      </div>

      <div className="pulse-meter" aria-hidden="true">
        <div className="pulse-ring">
          <svg viewBox="0 0 120 120">
            <circle className="ring-track" cx="60" cy="60" r="48" />
            <circle
              className="ring-value"
              cx="60"
              cy="60"
              r="48"
              style={{
                strokeDasharray: `${(donePct / 100) * 301} 301`,
              }}
            />
          </svg>
          <div className="pulse-ring-label">
            <strong>{donePct}%</strong>
            <span>done</span>
          </div>
        </div>
      </div>

      <div className="pulse-stats">
        <div className="pulse-stat">
          <span className="pulse-stat-icon tone-plan">
            <IconPlanning size={22} />
          </span>
          <div>
            <strong>{planning}</strong>
            <span>Planning</span>
          </div>
        </div>
        <div className="pulse-stat">
          <span className="pulse-stat-icon tone-progress">
            <IconProgress size={22} />
          </span>
          <div>
            <strong>{progress}</strong>
            <span>In progress</span>
          </div>
        </div>
        <div className="pulse-stat">
          <span className="pulse-stat-icon tone-done">
            <IconCompleted size={22} />
          </span>
          <div>
            <strong>{done}</strong>
            <span>Completed</span>
          </div>
        </div>
      </div>
    </section>
  )
}
