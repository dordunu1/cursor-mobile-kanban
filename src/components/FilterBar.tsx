import { IconSearch } from './Icons'
import { GlassSelect } from './GlassSelect'
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
        <div className="filter-field">
          <span>Priority</span>
          <GlassSelect
            ariaLabel="Filter by priority"
            value={filters.priority}
            onChange={(value) =>
              onChange({ ...filters, priority: value as PriorityFilter })
            }
            options={[
              { value: 'all', label: 'All' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
          />
        </div>

        <div className="filter-field">
          <span>Due</span>
          <GlassSelect
            ariaLabel="Filter by due date"
            value={filters.due}
            onChange={(value) => onChange({ ...filters, due: value as DueFilter })}
            options={[
              { value: 'all', label: 'All' },
              { value: 'overdue', label: 'Overdue' },
              { value: 'today', label: 'Today' },
              { value: 'soon', label: 'Due soon' },
              { value: 'none', label: 'No date' },
            ]}
          />
        </div>

        <div className="filter-field">
          <span>Tag</span>
          <GlassSelect
            ariaLabel="Filter by tag"
            value={filters.tag}
            onChange={(value) => onChange({ ...filters, tag: value })}
            options={[
              { value: '', label: 'All tags' },
              ...tags.map((tag) => ({ value: tag, label: tag })),
            ]}
          />
        </div>

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
