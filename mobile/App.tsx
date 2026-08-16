import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import * as Haptics from 'expo-haptics'
import { Column } from './src/components/Column'
import { FilterBar } from './src/components/FilterBar'
import { NewTaskModal } from './src/components/NewTaskModal'
import { AppBackground, Surface } from './src/components/Surface'
import { TaskDetailModal } from './src/components/TaskDetailModal'
import { matchesDueFilter } from './src/due'
import { useBoard } from './src/hooks/useBoard'
import { getTheme, isAndroid } from './src/theme'
import type { BoardColumnId, BoardFilters, Task } from './src/types'
import { COLUMNS, emptyFilters, todayKey } from './src/types'

export default function App() {
  const boardApi = useBoard()
  const [filters, setFilters] = useState<BoardFilters>(emptyFilters())
  const [showNew, setShowNew] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const theme = getTheme(boardApi.board?.theme || 'light')
  const flash = (message: string) => setToast(message)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(timer)
  }, [toast])

  const selectedTask = useMemo(
    () => boardApi.board?.tasks.find((task) => task.id === selectedId) ?? null,
    [boardApi.board?.tasks, selectedId],
  )

  const filteredByColumn = useMemo(() => {
    const filterTask = (task: Task) => {
      if (filters.priority !== 'all' && task.priority !== filters.priority) return false
      if (!matchesDueFilter(task, filters.due)) return false
      if (filters.tag && !task.tags.includes(filters.tag)) return false
      const q = filters.query.trim().toLowerCase()
      if (!q) return true
      return (
        task.title.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q) ||
        task.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    }
    return {
      planning: boardApi.tasksByColumn.planning.filter(filterTask),
      in_progress: boardApi.tasksByColumn.in_progress.filter(filterTask),
      completed: boardApi.tasksByColumn.completed.filter(filterTask),
    }
  }, [boardApi.tasksByColumn, filters])

  if (!boardApi.ready || !boardApi.board) {
    return (
      <SafeAreaProvider>
        <View style={[styles.loading, { backgroundColor: theme.bg0 }]}>
          <ActivityIndicator color={theme.accent} size="large" />
          <Text style={{ color: theme.textSecondary, marginTop: 12 }}>Loading Orbit Board…</Text>
        </View>
      </SafeAreaProvider>
    )
  }

  const board = boardApi.board
  const goals = [...(board.dailyGoals || [])].sort((a, b) => a.order - b.order)
  const today = todayKey()
  const doneToday = new Set((board.dailyCompletions || {})[today] || [])

  return (
    <SafeAreaProvider>
      <AppBackground theme={theme}>
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
          <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
          <ScrollView
            stickyHeaderIndices={[0]}
            contentContainerStyle={styles.page}
            showsVerticalScrollIndicator={false}
          >
            <Surface theme={theme} style={styles.toolbar} intensity={34}>
              <View style={styles.toolbarInner}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.brand, { color: theme.text }]}>{board.name}</Text>
                  <Text style={[styles.brandSub, { color: theme.textSecondary }]}>
                    {isAndroid ? 'Material You · ' : 'Liquid Glass · '}
                    {board.tasks.filter((t) => t.columnId !== 'archive').length} on board
                    {Platform.OS === 'ios' ? ' · Expo Go ready' : ''}
                  </Text>
                </View>
                <Pressable
                  onPress={() => boardApi.setTheme(board.theme === 'dark' ? 'light' : 'dark')}
                  style={[styles.iconBtn, { backgroundColor: theme.chip }]}
                >
                  <Text style={{ color: theme.text, fontWeight: '700' }}>
                    {board.theme === 'dark' ? '☀' : '☾'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    setShowNew(true)
                  }}
                  style={[styles.primaryBtn, { backgroundColor: theme.accent }]}
                >
                  <Text style={{ color: theme.accentInk, fontWeight: '700' }}>New</Text>
                </Pressable>
              </View>
            </Surface>

            <Surface theme={theme} style={styles.goals} intensity={22}>
              <View style={styles.goalsInner}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily goals</Text>
                {goals.map((goal) => {
                  const done = doneToday.has(goal.id)
                  return (
                    <Pressable
                      key={goal.id}
                      onPress={() => {
                        boardApi.toggleDailyGoal(goal.id, today)
                        void Haptics.selectionAsync()
                      }}
                      style={styles.goalRow}
                    >
                      <View
                        style={[
                          styles.check,
                          {
                            borderColor: theme.accent,
                            backgroundColor: done ? theme.accent : 'transparent',
                          },
                        ]}
                      >
                        {done ? (
                          <Text style={{ color: theme.accentInk, fontSize: 12, fontWeight: '700' }}>
                            ✓
                          </Text>
                        ) : null}
                      </View>
                      <Text
                        style={{
                          color: theme.text,
                          flex: 1,
                          textDecorationLine: done ? 'line-through' : 'none',
                          opacity: done ? 0.55 : 1,
                        }}
                      >
                        {goal.title}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </Surface>

            <FilterBar filters={filters} theme={theme} onChange={setFilters} />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.board}
              decelerationRate="fast"
              snapToInterval={314}
            >
              {COLUMNS.map((column) => (
                <Column
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  subtitle={column.subtitle}
                  tasks={filteredByColumn[column.id]}
                  theme={theme}
                  wipLimit={board.wipLimit}
                  wipCount={boardApi.tasksByColumn.in_progress.length}
                  onOpenTask={(task) => setSelectedId(task.id)}
                  onQuickAdd={(title) => {
                    if (boardApi.wouldExceedWip('new', column.id)) {
                      flash(`In Progress is at its WIP limit (${board.wipLimit})`)
                      return
                    }
                    boardApi.addTask({ title, columnId: column.id })
                    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                    flash(`Added to ${column.title}`)
                  }}
                  onSort={(mode) => {
                    boardApi.sortColumn(column.id, mode)
                    flash(`Sorted ${column.title}`)
                  }}
                  onArchiveCompleted={() => {
                    boardApi.archiveCompleted()
                    flash('Completed tasks archived')
                  }}
                />
              ))}
            </ScrollView>

            <View style={styles.footerActions}>
              <Pressable
                onPress={() => {
                  Alert.alert('Reset demo board?', 'This replaces your current board data.', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Reset',
                      style: 'destructive',
                      onPress: () => {
                        boardApi.resetDemo()
                        flash('Demo board restored')
                      },
                    },
                  ])
                }}
                style={[styles.secondaryBtn, { backgroundColor: theme.chip }]}
              >
                <Text style={{ color: theme.text, fontWeight: '700' }}>Reset demo</Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  const json = boardApi.getExportJson()
                  if (!json) return
                  await Share.share({ message: json, title: 'Orbit Board export' })
                }}
                style={[styles.secondaryBtn, { backgroundColor: theme.chip }]}
              >
                <Text style={{ color: theme.text, fontWeight: '700' }}>Export JSON</Text>
              </Pressable>
            </View>
          </ScrollView>

          {toast ? (
            <View style={[styles.toast, { backgroundColor: theme.surfaceElevated }]}>
              <Text style={{ color: theme.text, fontWeight: '600' }}>{toast}</Text>
            </View>
          ) : null}

          <NewTaskModal
            theme={theme}
            visible={showNew}
            onClose={() => setShowNew(false)}
            onCreate={(input) => {
              if (boardApi.wouldExceedWip('new', input.columnId)) {
                flash(`In Progress is at its WIP limit (${board.wipLimit})`)
                boardApi.addTask({ ...input, columnId: 'planning' })
                return
              }
              boardApi.addTask(input)
              flash('Task created')
            }}
          />

          <TaskDetailModal
            theme={theme}
            task={selectedTask}
            visible={Boolean(selectedTask)}
            wipBlocked={
              selectedTask ? boardApi.wouldExceedWip(selectedTask.id, 'in_progress') : false
            }
            onClose={() => setSelectedId(null)}
            onSave={(patch) => {
              if (!selectedTask) return
              boardApi.updateTask(selectedTask.id, patch)
              flash('Saved')
            }}
            onMove={(columnId) => {
              if (!selectedTask) return false
              if (boardApi.wouldExceedWip(selectedTask.id, columnId)) return false
              const dest =
                columnId === 'archive'
                  ? boardApi.tasksByColumn.archive
                  : boardApi.tasksByColumn[columnId as BoardColumnId] || []
              boardApi.moveTask(selectedTask.id, columnId, dest.length)
              return true
            }}
            onDelete={() => {
              if (!selectedTask) return
              boardApi.deleteTask(selectedTask.id)
              setSelectedId(null)
              flash('Task deleted')
            }}
            onDuplicate={() => {
              if (!selectedTask) return
              const id = boardApi.duplicateTask(selectedTask.id)
              setSelectedId(id)
              flash('Task duplicated')
            }}
            onAddComment={(body) => selectedTask && boardApi.addComment(selectedTask.id, body)}
            onDeleteComment={(commentId) =>
              selectedTask && boardApi.deleteComment(selectedTask.id, commentId)
            }
            onAddSubtask={(title) => selectedTask && boardApi.addSubtask(selectedTask.id, title)}
            onToggleSubtask={(subtaskId) =>
              selectedTask && boardApi.toggleSubtask(selectedTask.id, subtaskId)
            }
            onDeleteSubtask={(subtaskId) =>
              selectedTask && boardApi.deleteSubtask(selectedTask.id, subtaskId)
            }
          />
        </SafeAreaView>
      </AppBackground>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  page: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  toolbar: {
    marginBottom: 4,
  },
  toolbarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
  },
  brand: {
    fontSize: 24,
    fontWeight: '700',
  },
  brandSub: {
    marginTop: 2,
    fontSize: 12,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  goals: {},
  goalsInner: {
    padding: 14,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  secondaryBtn: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 28,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
})
