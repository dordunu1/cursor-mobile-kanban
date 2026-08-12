import { IconSearch } from './Icons'
import type { BoardFilters, DueFilter, PriorityFilter } from '../types'
import { emptyFilters, filtersAreActive } from '../types'

export function FilterBar({
  filters,
  tags,
  onChange,
}: {
  filters: BoardFilters
  tags: string[]
  onChange: (next: BoardFilters) => void
}) {
  const active = filtersAreActive(filters)

  return (
    <section className="filter-bar" aria-label="Search and filters">
      <label className="filter-search">
        <IconSearch size={18} />
        <input
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          placeholder="Search tasks, tags, notes…  (/)"
          aria-label="Search tasks"
        />
      </label>

      <div className="filter-controls">
        <label className="filter-field">
          <span>Priority</span>
          <select
            value={filters.priority}
            onChange={(e) =>
              onChange({ ...filters, priority: e.target.value as PriorityFilter })
            }
          >
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>

        <label className="filter-field">
          <span>Due</span>
          <select
            value={filters.due}
            onChange={(e) => onChange({ ...filters, due: e.target.value as DueFilter })}
          >
            <option value="all">All</option>
            <option value="overdue">Overdue</option>
            <option value="today">Today</option>
            <option value="soon">Due soon</option>
            <option value="none">No date</option>
          </select>
        </label>

        <label className="filter-field">
          <span>Tag</span>
          <select
            value={filters.tag}
            onChange={(e) => onChange({ ...filters, tag: e.target.value })}
          >
            <option value="">All tags</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>

        {active ? (
          <button
            type="button"
            className="btn neu-btn filter-clear"
            onClick={() => onChange(emptyFilters())}
          >
            Clear
          </button>
        ) : null}
      </div>
    </section>
  )
}
