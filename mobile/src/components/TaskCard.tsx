import { Pressable, StyleSheet, Text, View } from 'react-native'
import { formatDueLabel, formatLaneAge, getDueStatus } from '../due'
import type { ThemeColors } from '../theme'
import type { Task } from '../types'
import { Surface } from './Surface'

export function TaskCard({
  task,
  theme,
  onPress,
}: {
  task: Task
  theme: ThemeColors
  onPress: () => void
}) {
  const due = getDueStatus(task.dueDate)
  const dueLabel = formatDueLabel(task.dueDate)
  const age = task.columnId === 'in_progress' ? formatLaneAge(task.columnEnteredAt) : null
  const done = task.subtasks.filter((s) => s.done).length

  return (
    <Pressable onPress={onPress}>
      <Surface theme={theme} style={styles.card} intensity={22}>
        <View style={styles.body}>
          <View style={styles.top}>
            <Text style={[styles.priority, { color: priorityColor(task.priority, theme) }]}>
              {task.priority.toUpperCase()}
            </Text>
            {dueLabel ? (
              <Text
                style={[
                  styles.due,
                  {
                    color:
                      due === 'overdue'
                        ? theme.danger
                        : due === 'today' || due === 'soon'
                          ? theme.accent
                          : theme.textTertiary,
                  },
                ]}
              >
                {dueLabel}
              </Text>
            ) : null}
          </View>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
            {task.title}
          </Text>
          {task.description ? (
            <Text style={[styles.desc, { color: theme.textSecondary }]} numberOfLines={2}>
              {task.description}
            </Text>
          ) : null}
          <View style={styles.meta}>
            {task.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={[styles.chip, { backgroundColor: theme.chip }]}>
                <Text style={[styles.chipText, { color: theme.accent }]}>{tag}</Text>
              </View>
            ))}
            {task.subtasks.length ? (
              <Text style={[styles.metaText, { color: theme.textTertiary }]}>
                {done}/{task.subtasks.length}
              </Text>
            ) : null}
            {age ? (
              <Text style={[styles.metaText, { color: theme.textTertiary }]}>{age}</Text>
            ) : null}
          </View>
        </View>
      </Surface>
    </Pressable>
  )
}

function priorityColor(priority: Task['priority'], theme: ThemeColors) {
  if (priority === 'high') return theme.danger
  if (priority === 'medium') return theme.accent
  return theme.textTertiary
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
  },
  body: {
    padding: 14,
    gap: 8,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priority: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  due: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
  },
})
