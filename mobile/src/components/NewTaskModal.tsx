import { useState, type ReactNode } from 'react'
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import type { ThemeColors } from '../theme'
import type { BoardColumnId, Priority } from '../types'
import { COLUMNS } from '../types'
import { Surface } from './Surface'

export function NewTaskModal({
  theme,
  visible,
  onClose,
  onCreate,
}: {
  theme: ThemeColors
  visible: boolean
  onClose: () => void
  onCreate: (input: {
    title: string
    description: string
    columnId: BoardColumnId
    priority: Priority
    tags: string[]
    dueDate: string | null
  }) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [columnId, setColumnId] = useState<BoardColumnId>('planning')
  const [priority, setPriority] = useState<Priority>('medium')
  const [tags, setTags] = useState('')
  const [dueDate, setDueDate] = useState('')

  const reset = () => {
    setTitle('')
    setDescription('')
    setColumnId('planning')
    setPriority('medium')
    setTags('')
    setDueDate('')
  }

  const submit = () => {
    if (!title.trim()) return
    onCreate({
      title,
      description,
      columnId,
      priority,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      dueDate: dueDate.trim() || null,
    })
    reset()
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <Surface theme={theme} style={styles.sheet} intensity={40}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={[styles.title, { color: theme.text }]}>New task</Text>
            <Text style={[styles.sub, { color: theme.textSecondary }]}>
              Starts in Planning unless you choose another lane.
            </Text>

            <Field label="Title" theme={theme}>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Ship the next milestone"
                placeholderTextColor={theme.textTertiary}
                style={[styles.input, { color: theme.text, backgroundColor: theme.chip }]}
              />
            </Field>

            <Field label="Description" theme={theme}>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Optional details"
                placeholderTextColor={theme.textTertiary}
                multiline
                style={[styles.textarea, { color: theme.text, backgroundColor: theme.chip }]}
              />
            </Field>

            <Text style={[styles.label, { color: theme.textTertiary }]}>Status</Text>
            <View style={styles.row}>
              {COLUMNS.map((column) => {
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

            <Field label="Due date (YYYY-MM-DD)" theme={theme}>
              <TextInput
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="2026-08-20"
                placeholderTextColor={theme.textTertiary}
                style={[styles.input, { color: theme.text, backgroundColor: theme.chip }]}
              />
            </Field>

            <Field label="Tags" theme={theme}>
              <TextInput
                value={tags}
                onChangeText={setTags}
                placeholder="design, engineering"
                placeholderTextColor={theme.textTertiary}
                style={[styles.input, { color: theme.text, backgroundColor: theme.chip }]}
              />
            </Field>

            <View style={styles.actions}>
              <Pressable onPress={onClose} style={styles.ghost}>
                <Text style={{ color: theme.textSecondary, fontWeight: '700' }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={submit}
                disabled={!title.trim()}
                style={[
                  styles.primary,
                  { backgroundColor: theme.accent, opacity: title.trim() ? 1 : 0.45 },
                ]}
              >
                <Text style={{ color: theme.accentInk, fontWeight: '700' }}>Add task</Text>
              </Pressable>
            </View>
          </ScrollView>
        </Surface>
      </View>
    </Modal>
  )
}

function Field({
  label,
  theme,
  children,
}: {
  label: string
  theme: ThemeColors
  children: ReactNode
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={[styles.label, { color: theme.textTertiary }]}>{label}</Text>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '92%',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  content: {
    padding: 20,
    gap: 12,
    paddingBottom: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  sub: {
    fontSize: 13,
    marginBottom: 4,
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
    minHeight: 100,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  ghost: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  primary: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
})
