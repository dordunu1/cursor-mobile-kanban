import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import type { ThemeColors } from '../theme'
import type { BoardFilters, DueFilter, PriorityFilter } from '../types'
import { emptyFilters, filtersAreActive } from '../types'
import { Surface } from './Surface'

const PRIORITIES: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Med' },
  { value: 'low', label: 'Low' },
]

const DUES: { value: DueFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Today' },
  { value: 'soon', label: 'Soon' },
  { value: 'none', label: 'None' },
]

export function FilterBar({
  filters,
  theme,
  onChange,
}: {
  filters: BoardFilters
  theme: ThemeColors
  onChange: (next: BoardFilters) => void
}) {
  const active = filtersAreActive(filters)

  return (
    <Surface theme={theme} style={styles.wrap} intensity={24}>
      <View style={styles.inner}>
        <TextInput
          value={filters.query}
          onChangeText={(query) => onChange({ ...filters, query })}
          placeholder="Search tasks…"
          placeholderTextColor={theme.textTertiary}
          style={[styles.search, { color: theme.text, backgroundColor: theme.chip }]}
        />
        <Text style={[styles.label, { color: theme.textTertiary }]}>Priority</Text>
        <View style={styles.row}>
          {PRIORITIES.map((item) => {
            const on = filters.priority === item.value
            return (
              <Pressable
                key={item.value}
                onPress={() => onChange({ ...filters, priority: item.value })}
                style={[
                  styles.chip,
                  {
                    backgroundColor: on ? theme.accent : theme.chip,
                  },
                ]}
              >
                <Text style={{ color: on ? theme.accentInk : theme.text, fontWeight: '700', fontSize: 12 }}>
                  {item.label}
                </Text>
              </Pressable>
            )
          })}
        </View>
        <Text style={[styles.label, { color: theme.textTertiary }]}>Due</Text>
        <View style={styles.row}>
          {DUES.map((item) => {
            const on = filters.due === item.value
            return (
              <Pressable
                key={item.value}
                onPress={() => onChange({ ...filters, due: item.value })}
                style={[
                  styles.chip,
                  {
                    backgroundColor: on ? theme.accent : theme.chip,
                  },
                ]}
              >
                <Text style={{ color: on ? theme.accentInk : theme.text, fontWeight: '700', fontSize: 12 }}>
                  {item.label}
                </Text>
              </Pressable>
            )
          })}
        </View>
        {active ? (
          <Pressable onPress={() => onChange(emptyFilters())} style={styles.clear}>
            <Text style={{ color: theme.accent, fontWeight: '700' }}>Clear filters</Text>
          </Pressable>
        ) : null}
      </View>
    </Surface>
  )
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
  },
  inner: {
    padding: 14,
    gap: 8,
  },
  search: {
    borderRadius: 16,
    minHeight: 44,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clear: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
})
