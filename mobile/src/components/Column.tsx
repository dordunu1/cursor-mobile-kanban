import { useState } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import type { ThemeColors } from '../theme'
import type { BoardColumnId, ColumnSort, Task } from '../types'
import { Surface } from './Surface'
import { TaskCard } from './TaskCard'

export function Column({
  id,
  title,
  subtitle,
  tasks,
  theme,
  wipLimit,
  wipCount,
  onOpenTask,
  onQuickAdd,
  onSort,
  onArchiveCompleted,
}: {
  id: BoardColumnId
  title: string
  subtitle: string
  tasks: Task[]
  theme: ThemeColors
  wipLimit: number
  wipCount: number
  onOpenTask: (task: Task) => void
  onQuickAdd: (title: string) => void
  onSort: (mode: ColumnSort) => void
  onArchiveCompleted: () => void
}) {
  const [draft, setDraft] = useState('')
  const atWip = id === 'in_progress' && wipLimit > 0 && wipCount >= wipLimit

  return (
    <Surface theme={theme} style={styles.column} intensity={30}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.sub, { color: theme.textSecondary }]}>
            {id === 'in_progress' && wipLimit > 0
              ? `WIP ${wipCount}/${wipLimit}`
              : subtitle}
          </Text>
        </View>
        <View style={[styles.count, { backgroundColor: theme.chip }]}>
          <Text style={[styles.countText, { color: theme.accent }]}>{tasks.length}</Text>
        </View>
      </View>

      <View style={styles.tools}>
        <Pressable onPress={() => onSort('due')} style={[styles.toolBtn, { backgroundColor: theme.chip }]}>
          <Text style={[styles.toolText, { color: theme.accent }]}>Due</Text>
        </Pressable>
        <Pressable
          onPress={() => onSort('priority')}
          style={[styles.toolBtn, { backgroundColor: theme.chip }]}
        >
          <Text style={[styles.toolText, { color: theme.accent }]}>Priority</Text>
        </Pressable>
        {id === 'completed' ? (
          <Pressable
            onPress={onArchiveCompleted}
            style={[styles.toolBtn, { backgroundColor: theme.chip }]}
          >
            <Text style={[styles.toolText, { color: theme.danger }]}>Archive</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 8 }}>
        {tasks.length === 0 ? (
          <Text style={[styles.empty, { color: theme.textTertiary }]}>
            {atWip ? 'WIP limit reached' : `Drop work into ${title.toLowerCase()}`}
          </Text>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} theme={theme} onPress={() => onOpenTask(task)} />
          ))
        )}
      </ScrollView>

      <View style={[styles.quickAdd, { borderTopColor: theme.border }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={`Add to ${title}…`}
          placeholderTextColor={theme.textTertiary}
          style={[styles.input, { color: theme.text }]}
          onSubmitEditing={() => {
            const value = draft.trim()
            if (!value) return
            onQuickAdd(value)
            setDraft('')
          }}
        />
        <Pressable
          disabled={!draft.trim() || atWip}
          onPress={() => {
            const value = draft.trim()
            if (!value) return
            onQuickAdd(value)
            setDraft('')
          }}
          style={[
            styles.addBtn,
            {
              backgroundColor: theme.accent,
              opacity: !draft.trim() || atWip ? 0.4 : 1,
            },
          ]}
        >
          <Text style={[styles.addText, { color: theme.accentInk }]}>Add</Text>
        </Pressable>
      </View>
    </Surface>
  )
}

const styles = StyleSheet.create({
  column: {
    width: 300,
    marginRight: 14,
    maxHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  sub: {
    marginTop: 2,
    fontSize: 12,
  },
  count: {
    minWidth: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  countText: {
    fontWeight: '700',
    fontSize: 12,
  },
  tools: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  toolBtn: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  toolText: {
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 12,
    minHeight: 220,
  },
  empty: {
    padding: 18,
    textAlign: 'center',
    fontSize: 13,
  },
  quickAdd: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  input: {
    flex: 1,
    minHeight: 40,
    fontSize: 14,
  },
  addBtn: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addText: {
    fontWeight: '700',
    fontSize: 13,
  },
})
