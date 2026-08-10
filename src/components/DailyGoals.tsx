import { useEffect, useMemo, useRef, useState } from 'react'
import type { DailyGoal } from '../types'
import { todayKey } from '../types'
import { IconCheck, IconClose, IconPlus, IconTarget, IconTrash } from './Icons'

function countStreak(
  goalId: string,
  completions: Record<string, string[]>,
): number {
  let streak = 0
  const cursor = new Date()
  for (let i = 0; i < 60; i += 1) {
    const key = todayKey(cursor)
    const done = (completions[key] || []).includes(goalId)
    if (!done) {
      if (i === 0) {
        cursor.setDate(cursor.getDate() - 1)
        continue
      }
      break
    }
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function DailyGoals({
  goals,
  completions,
  onAdd,
  onToggle,
  onDelete,
}: {
  goals: DailyGoal[]
  completions: Record<string, string[]>
  onAdd: (title: string) => void
  onToggle: (goalId: string) => void
  onDelete: (goalId: string) => void
}) {
  const [draft, setDraft] = useState('')
  const [adding, setAdding] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const date = todayKey()
  const doneToday = useMemo(() => new Set(completions[date] || []), [completions, date])
  const sorted = useMemo(
    () => [...goals].sort((a, b) => a.order - b.order),
    [goals],
  )
  const doneCount = sorted.filter((g) => doneToday.has(g.id)).length
  const total = sorted.length
  const pct = total ? Math.round((doneCount / total) * 100) : 0
  const label = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  const submit = () => {
    const value = draft.trim()
    if (!value) return
    onAdd(value)
    setDraft('')
    setAdding(false)
  }

  return (
    <section className="daily-goals" aria-label="Daily goals">
      <header className="daily-goals-header">
        <div className="daily-goals-brand">
          <div className="daily-goals-icon" aria-hidden="true">
            <IconTarget size={22} />
          </div>
          <div>
            <div className="daily-goals-kicker">Daily goals</div>
            <h2 className="daily-goals-title">Today’s habits</h2>
            <p className="daily-goals-sub">{label} · resets nightly</p>
          </div>
        </div>
        <div className="daily-goals-meter" aria-hidden="true">
          <div className="daily-goals-ring">
            <svg viewBox="0 0 84 84">
              <circle className="ring-track" cx="42" cy="42" r="32" />
              <circle
                className="ring-value"
                cx="42"
                cy="42"
                r="32"
                style={{ strokeDasharray: `${(pct / 100) * 201} 201` }}
              />
            </svg>
            <div className="daily-goals-ring-label">
              <strong>
                {doneCount}/{total || 0}
              </strong>
              <span>today</span>
            </div>
          </div>
        </div>
      </header>

      <div className="daily-goals-list">
        {sorted.length === 0 ? (
          <p className="daily-goals-empty">
            Keep a short list of habits. Check them off each day — they reset tomorrow.
          </p>
        ) : (
          sorted.map((goal) => {
            const done = doneToday.has(goal.id)
            const streak = countStreak(goal.id, completions)
            return (
              <div key={goal.id} className={`daily-goal-row${done ? ' is-done' : ''}`}>
                <button
                  className="check-toggle"
                  onClick={() => onToggle(goal.id)}
                  aria-label={done ? `Unmark ${goal.title}` : `Complete ${goal.title}`}
                >
                  {done ? <IconCheck size={14} /> : null}
                </button>
                <div className="daily-goal-copy">
                  <span className="daily-goal-name">{goal.title}</span>
                  {streak > 0 ? (
                    <span className="daily-goal-streak">{streak}-day streak</span>
                  ) : (
                    <span className="daily-goal-streak muted">No streak yet</span>
                  )}
                </div>
                <button
                  className="icon-btn neu-btn checklist-delete"
                  onClick={() => onDelete(goal.id)}
                  aria-label={`Delete ${goal.title}`}
                >
                  <IconTrash size={14} />
                </button>
              </div>
            )
          })
        )}
      </div>

      {adding ? (
        <form
          className="daily-goals-composer"
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. Read 20 pages"
            aria-label="New daily goal title"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setAdding(false)
                setDraft('')
              }
            }}
          />
          <button type="submit" className="btn btn-primary" disabled={!draft.trim()}>
            Save
          </button>
          <button
            type="button"
            className="icon-btn neu-btn"
            aria-label="Cancel"
            onClick={() => {
              setAdding(false)
              setDraft('')
            }}
          >
            <IconClose size={16} />
          </button>
        </form>
      ) : (
        <button className="btn neu-btn daily-goals-add-btn" onClick={() => setAdding(true)}>
          <IconPlus size={18} />
          Add goal
        </button>
      )}
    </section>
  )
}
