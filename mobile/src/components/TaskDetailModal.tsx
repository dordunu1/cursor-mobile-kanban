import { useEffect, useState } from 'react'
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import type { ThemeColors } from '../theme'
import type { ColumnId, Priority, Task } from '../types'
import { COLUMNS } from '../types'
import { Surface } from './Surface'

export function TaskDetailModal({
  theme,
  task,
  wipBlocked,
  visible,
  onClose,
  onSave,
  onMove,
  onDelete,
  onDuplicate,
  onAddComment,
  onDeleteComment,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}: {
  theme: ThemeColors
  task: Task | null
  wipBlocked: boolean
  visible: boolean
  onClose: () => void
  onSave: (patch: Partial<Task>) => void
  onMove: (columnId: ColumnId) => boolean
  onDelete: () => void
  onDuplicate: () => void
  onAddComment: (body: string) => void
  onDeleteComment: (commentId: string) => void
  onAddSubtask: (title: string) => void
  onToggleSubtask: (subtaskId: string) => void
  onDeleteSubtask: (subtaskId: string) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [columnId, setColumnId] = useState<ColumnId>('planning')
  const [priority, setPriority] = useState<Priority>('medium')
  const [tags, setTags] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [comment, setComment] = useState('')
  const [subtaskDraft, setSubtaskDraft] = useState('')

  useEffect(() => {
    if (!task) return
    setTitle(task.title)
    setDescription(task.description)
    setColumnId(task.columnId)
    setPriority(task.priority)
    setTags(task.tags.join(', '))
    setDueDate(task.dueDate ?? '')
  }, [task])

  if (!task) return null

  const statusOptions = [
    ...COLUMNS,
    { id: 'archive' as const, title: 'Archive', subtitle: '' },
  ]

  const save = () => {
    if (columnId !== task.columnId) {
      const moved = onMove(columnId)
      if (!moved) {
        setColumnId(task.columnId)
        Alert.alert('WIP limit', 'In Progress is at its WIP limit.')
        return
      }
    }
    onSave({
      title: title.trim() || 'Untitled task',
      description: description.trim(),
      priority,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      dueDate: dueDate.trim() || null,
    })
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <Surface theme={theme} style={styles.sheet} intensity={40}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={[styles.title, { color: theme.text }]}>Task details</Text>

            <Text style={[styles.label, { color: theme.textTertiary }]}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              style={[styles.input, { color: theme.text, backgroundColor: theme.chip }]}
            />

            <Text style={[styles.label, { color: theme.textTertiary }]}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              style={[styles.textarea, { color: theme.text, backgroundColor: theme.chip }]}
            />

            <Text style={[styles.label, { color: theme.textTertiary }]}>Status</Text>
            <View style={styles.row}>
              {statusOptions.map((column) => {
                const on = columnId === column.id
                return (
                  <Pressable
                    key={column.id}
                    onPress={() => setColumnId(column.id)}
                    style={[styles.chip, { backgroundColor: on ? theme.accent : theme.chip }]}
                  >
                    <Text style={{ color: on ? theme.accentInk : theme.text, fontWeight: '700' }}>
                      {column.title}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
            {wipBlocked && columnId === 'in_progress' && task.columnId !== 'in_progress' ? (
              <Text style={{ color: theme.danger }}>In Progress is at its WIP limit.</Text>
            ) : null}

            <Text style={[styles.label, { color: theme.textTertiary }]}>Priority</Text>
            <View style={styles.row}>
              {(['low', 'medium', 'high'] as Priority[]).map((item) => {
                const on = priority === item
                return (
                  <Pressable
                    key={item}
                    onPress={() => setPriority(item)}
                    style={[styles.chip, { backgroundColor: on ? theme.accent : theme.chip }]}
                  >
                    <Text style={{ color: on ? theme.accentInk : theme.text, fontWeight: '700' }}>
                      {item}
                    </Text>
                  </Pressable>
                )
              })}
            </View>

            <Text style={[styles.label, { color: theme.textTertiary }]}>Due date</Text>
            <TextInput
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.textTertiary}
              style={[styles.input, { color: theme.text, backgroundColor: theme.chip }]}
            />

            <Text style={[styles.label, { color: theme.textTertiary }]}>Tags</Text>
            <TextInput
              value={tags}
              onChangeText={setTags}
              style={[styles.input, { color: theme.text, backgroundColor: theme.chip }]}
            />

            <Text style={[styles.section, { color: theme.text }]}>Checklist</Text>
            {task.subtasks.map((item) => (
              <View key={item.id} style={styles.checkRow}>
                <Pressable onPress={() => onToggleSubtask(item.id)} style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: theme.text,
                      textDecorationLine: item.done ? 'line-through' : 'none',
                      opacity: item.done ? 0.55 : 1,
                    }}
                  >
                    {item.done ? '✓ ' : '○ '}
                    {item.title}
                  </Text>
                </Pressable>
                <Pressable onPress={() => onDeleteSubtask(item.id)}>
                  <Text style={{ color: theme.danger, fontWeight: '700' }}>Delete</Text>
                </Pressable>
              </View>
            ))}
            <View style={styles.row}>
              <TextInput
                value={subtaskDraft}
                onChangeText={setSubtaskDraft}
                placeholder="Add checklist item"
                placeholderTextColor={theme.textTertiary}
                style={[styles.input, { flex: 1, color: theme.text, backgroundColor: theme.chip }]}
              />
              <Pressable
                onPress={() => {
                  onAddSubtask(subtaskDraft)
                  setSubtaskDraft('')
                }}
                style={[styles.primary, { backgroundColor: theme.accent }]}
              >
                <Text style={{ color: theme.accentInk, fontWeight: '700' }}>Add</Text>
              </Pressable>
            </View>

            <Text style={[styles.section, { color: theme.text }]}>Comments</Text>
            {task.comments.map((item) => (
              <View key={item.id} style={[styles.comment, { backgroundColor: theme.chip }]}>
                <Text style={{ color: theme.text }}>{item.body}</Text>
                <Pressable onPress={() => onDeleteComment(item.id)}>
                  <Text style={{ color: theme.danger, marginTop: 6, fontWeight: '700' }}>Delete</Text>
                </Pressable>
              </View>
            ))}
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Leave a note…"
              placeholderTextColor={theme.textTertiary}
              multiline
              style={[styles.textarea, { color: theme.text, backgroundColor: theme.chip }]}
            />
            <Pressable
              onPress={() => {
                onAddComment(comment)
                setComment('')
              }}
              style={[styles.primary, { backgroundColor: theme.accent, alignSelf: 'flex-start' }]}
            >
              <Text style={{ color: theme.accentInk, fontWeight: '700' }}>Post comment</Text>
            </Pressable>

            <View style={styles.actions}>
              <Pressable
                onPress={() =>
                  Alert.alert('Delete task?', 'This cannot be undone.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: onDelete },
                  ])
                }
              >
                <Text style={{ color: theme.danger, fontWeight: '700' }}>Delete</Text>
              </Pressable>
              <Pressable onPress={onDuplicate}>
                <Text style={{ color: theme.textSecondary, fontWeight: '700' }}>Duplicate</Text>
              </Pressable>
              <Pressable onPress={onClose}>
                <Text style={{ color: theme.textSecondary, fontWeight: '700' }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={save} style={[styles.primary, { backgroundColor: theme.accent }]}>
                <Text style={{ color: theme.accentInk, fontWeight: '700' }}>Save</Text>
              </Pressable>
            </View>
          </ScrollView>
        </Surface>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '94%',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  content: {
    padding: 20,
    gap: 10,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  section: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: 16,
    minHeight: 46,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  textarea: {
    borderRadius: 16,
    minHeight: 90,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  comment: {
    borderRadius: 16,
    padding: 12,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  primary: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
})
