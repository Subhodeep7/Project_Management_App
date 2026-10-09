import React, { useCallback, useEffect, useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
  Modal, ScrollView,
} from 'react-native'
import { taskApi, projectApi } from '../api'
import { colors, getTaskStatusBadge, getTaskPriorityBadge, formatDate, getErrorMessage } from '../utils/helpers'

const STATUS_OPTIONS = ['', 'PENDING', 'IN_PROGRESS', 'COMPLETED']
const STATUS_LABELS = { '': 'All', PENDING: 'Pending', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed' }
const PRIORITY_OPTIONS = ['', 'LOW', 'MEDIUM', 'HIGH']
const PRIORITY_LABELS = { '': 'All', LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' }

function Badge({ label, bg, color }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  )
}

function TaskItem({ task, onEdit, onDelete, onToggle }) {
  const statusBadge = getTaskStatusBadge(task.status)
  const priorityBadge = getTaskPriorityBadge(task.priority)
  const isCompleted = task.status === 'COMPLETED'

  return (
    <View style={styles.taskItem}>
      <TouchableOpacity
        style={[styles.checkbox, isCompleted && styles.checkboxChecked]}
        onPress={() => onToggle(task)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isCompleted }}
      >
        {isCompleted && <Text style={{ color: '#fff', fontSize: 10 }}>✓</Text>}
      </TouchableOpacity>
      <View style={styles.taskContent}>
        <Text style={[styles.taskName, isCompleted && styles.taskNameDone]} numberOfLines={1}>
          {task.name}
        </Text>
        <View style={styles.taskMeta}>
          <Badge label={priorityBadge.label} bg={priorityBadge.bg} color={priorityBadge.color} />
          <Badge label={statusBadge.label} bg={statusBadge.bg} color={statusBadge.color} />
          {task.dueDate && <Text style={styles.metaText}>{formatDate(task.dueDate)}</Text>}
        </View>
        <Text style={styles.projectName}>{task.projectName}</Text>
      </View>
      <View style={styles.taskActions}>
        <TouchableOpacity onPress={() => onEdit(task)} style={styles.actionBtn}>
          <Text style={styles.actionText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(task)} style={styles.actionBtn}>
          <Text style={styles.actionText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function TaskFormModal({ visible, onClose, onSubmit, initialData, projects, loading }) {
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [status, setStatus] = useState(initialData?.status || 'PENDING')
  const [priority, setPriority] = useState(initialData?.priority || 'MEDIUM')
  const [projectId, setProjectId] = useState(initialData?.projectId || projects?.[0]?.id || null)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (visible) {
      setName(initialData?.name || '')
      setDescription(initialData?.description || '')
      setStatus(initialData?.status || 'PENDING')
      setPriority(initialData?.priority || 'MEDIUM')
      setProjectId(initialData?.projectId || projects?.[0]?.id || null)
      setErrors({})
    }
  }, [visible, initialData])

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = 'Task name is required'
    if (!projectId) e.projectId = 'Project is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit({ name: name.trim(), description, status, priority, projectId: Number(projectId) })
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{initialData?.id ? 'Edit Task' : 'New Task'}</Text>
          <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
        </View>
        <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
          <Text style={styles.fieldLabel}>Task Name *</Text>
          <TextInput style={[styles.input, errors.name && styles.inputError]} value={name} onChangeText={setName} placeholder="Task name" placeholderTextColor={colors.textMuted} />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput style={[styles.input, { height: 72, textAlignVertical: 'top' }]} value={description} onChangeText={setDescription} placeholder="Optional description" placeholderTextColor={colors.textMuted} multiline />

          <Text style={styles.fieldLabel}>Project *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            {projects.map(p => (
              <TouchableOpacity
                key={p.id}
                style={[styles.chip, projectId === p.id && styles.chipActive]}
                onPress={() => setProjectId(p.id)}
              >
                <Text style={[styles.chipText, projectId === p.id && styles.chipTextActive]} numberOfLines={1}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {errors.projectId && <Text style={styles.errorText}>{errors.projectId}</Text>}

          <Text style={styles.fieldLabel}>Priority</Text>
          <View style={styles.chipRow}>
            {['LOW','MEDIUM','HIGH'].map(p => (
              <TouchableOpacity key={p} style={[styles.chip, priority === p && styles.chipActive]} onPress={() => setPriority(p)}>
                <Text style={[styles.chipText, priority === p && styles.chipTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Status</Text>
          <View style={styles.chipRow}>
            {['PENDING','IN_PROGRESS','COMPLETED'].map(s => (
              <TouchableOpacity key={s} style={[styles.chip, status === s && styles.chipActive]} onPress={() => setStatus(s)}>
                <Text style={[styles.chipText, status === s && styles.chipTextActive]}>{STATUS_LABELS[s]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitBtnText}>{initialData?.id ? 'Save' : 'Create'}</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

export default function TasksScreen() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    projectApi.getAll().then(r => setProjects(r.data.data || [])).catch(() => {})
  }, [])

  const loadTasks = useCallback(async () => {
    setError('')
    try {
      const params = {}
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      if (priorityFilter) params.priority = priorityFilter
      const res = await taskApi.getAll(params)
      setTasks(res.data.data || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [search, statusFilter, priorityFilter])

  useEffect(() => {
    const t = setTimeout(loadTasks, 400)
    return () => clearTimeout(t)
  }, [loadTasks])

  const handleToggle = async (task) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    try {
      await taskApi.update(task.id, { ...task, status: newStatus, projectId: task.projectId })
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
    } catch (err) { setError(getErrorMessage(err)) }
  }

  const handleDelete = (task) => {
    Alert.alert('Delete Task', `Delete "${task.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await taskApi.delete(task.id)
          setTasks(prev => prev.filter(t => t.id !== task.id))
        } catch (err) { setError(getErrorMessage(err)) }
      }},
    ])
  }

  const handleSubmit = async (data) => {
    setFormLoading(true)
    try {
      if (editingTask) {
        await taskApi.update(editingTask.id, data)
        setEditingTask(null)
      } else {
        await taskApi.create(data)
        setShowForm(false)
      }
      await loadTasks()
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err))
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity
          style={[styles.newBtn, projects.length === 0 && { opacity: 0.4 }]}
          onPress={() => setShowForm(true)}
          disabled={projects.length === 0}
        >
          <Text style={styles.newBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
        {STATUS_OPTIONS.map(s => (
          <TouchableOpacity key={s} style={[styles.filterChip, statusFilter === s && styles.filterChipActive]} onPress={() => setStatusFilter(s)}>
            <Text style={[styles.filterChipText, statusFilter === s && styles.filterChipTextActive]}>{STATUS_LABELS[s]}</Text>
          </TouchableOpacity>
        ))}
        <View style={styles.filterDivider} />
        {PRIORITY_OPTIONS.map(p => (
          <TouchableOpacity key={p} style={[styles.filterChip, priorityFilter === p && styles.filterChipActive]} onPress={() => setPriorityFilter(p)}>
            <Text style={[styles.filterChipText, priorityFilter === p && styles.filterChipTextActive]}>{PRIORITY_LABELS[p]}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {error ? (
        <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>
      ) : loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TaskItem task={item} onToggle={handleToggle} onEdit={setEditingTask} onDelete={handleDelete} />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadTasks() }} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyTitle}>No tasks found</Text>
              <Text style={styles.emptyDesc}>
                {search || statusFilter || priorityFilter ? 'Try different filters' : 'Create tasks to track your work'}
              </Text>
            </View>
          }
        />
      )}

      <TaskFormModal
        visible={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        projects={projects}
        loading={formLoading}
      />
      {editingTask && (
        <TaskFormModal
          visible={true}
          onClose={() => setEditingTask(null)}
          onSubmit={handleSubmit}
          initialData={editingTask}
          projects={projects}
          loading={formLoading}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  toolbar: { flexDirection: 'row', padding: 16, gap: 10, paddingBottom: 8 },
  searchInput: {
    flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, padding: 10, fontSize: 14, color: colors.textPrimary,
  },
  newBtn: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center' },
  newBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  filterBar: { maxHeight: 44, marginBottom: 4 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  filterChipTextActive: { color: '#fff' },
  filterDivider: { width: 1, backgroundColor: colors.border, marginHorizontal: 4 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  taskItem: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: { width: 18, height: 18, borderWidth: 2, borderColor: colors.border, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginTop: 2, backgroundColor: colors.surface },
  checkboxChecked: { backgroundColor: colors.success, borderColor: colors.success },
  taskContent: { flex: 1 },
  taskName: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, marginBottom: 4 },
  taskNameDone: { textDecorationLine: 'line-through', color: colors.textMuted },
  taskMeta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 4 },
  metaText: { fontSize: 11, color: colors.textMuted },
  projectName: { fontSize: 11, color: colors.textMuted },
  badge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  taskActions: { flexDirection: 'column', gap: 4 },
  actionBtn: { padding: 4 },
  actionText: { fontSize: 14 },
  errorBox: { backgroundColor: colors.dangerLight, borderRadius: 8, padding: 12, margin: 16 },
  errorText: { fontSize: 13, color: colors.danger },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 36, marginBottom: 12 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 },
  emptyDesc: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
  // Modal styles
  modalContainer: { flex: 1, backgroundColor: colors.surface },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  modalClose: { fontSize: 18, color: colors.textMuted, padding: 4 },
  modalBody: { flex: 1, padding: 20 },
  modalFooter: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: colors.border },
  fieldLabel: { fontSize: 13, fontWeight: '500', color: colors.textPrimary, marginBottom: 6, marginTop: 4 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.surface, marginBottom: 14 },
  inputError: { borderColor: colors.danger },
  errorText: { fontSize: 12, color: colors.danger, marginBottom: 10 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.gray100, borderWidth: 1, borderColor: colors.border, maxWidth: 140 },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: colors.gray100, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  submitBtn: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center' },
  submitBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
})
