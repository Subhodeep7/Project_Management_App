import React, { useCallback, useEffect, useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native'
import { projectApi, taskApi } from '../api'
import { colors, getProjectStatusBadge, getTaskStatusBadge, getTaskPriorityBadge, formatDate, getErrorMessage } from '../utils/helpers'

function Badge({ label, bg, color }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  )
}

export default function ProjectDetailScreen({ route, navigation }) {
  const { projectId } = route.params
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const [pRes, tRes] = await Promise.all([
        projectApi.getById(projectId),
        taskApi.getAll({ projectId }),
      ])
      setProject(pRes.data.data)
      setTasks(tRes.data.data || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [projectId])

  useEffect(() => { load() }, [load])

  const handleToggle = async (task) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    try {
      await taskApi.update(task.id, { ...task, status: newStatus, projectId: task.projectId })
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
      // Refresh project stats
      const pRes = await projectApi.getById(projectId)
      setProject(pRes.data.data)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    )
  }

  const badge = project ? getProjectStatusBadge(project.status) : null
  const progress = project?.taskCount > 0
    ? Math.round((project.completedTaskCount / project.taskCount) * 100)
    : 0

  return (
    <FlatList
      style={styles.container}
      data={tasks}
      keyExtractor={(item) => String(item.id)}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={colors.primary} />
      }
      ListHeaderComponent={
        <View>
          {error ? (
            <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>
          ) : null}
          {project && (
            <View style={styles.projectCard}>
              <View style={styles.projectHeader}>
                <Text style={styles.projectTitle}>{project.name}</Text>
                {badge && <Badge label={badge.label} bg={badge.bg} color={badge.color} />}
              </View>
              {project.description ? (
                <Text style={styles.projectDesc}>{project.description}</Text>
              ) : null}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{progress}%</Text>
              </View>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Start</Text>
                  <Text style={styles.metaValue}>{formatDate(project.startDate)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>End</Text>
                  <Text style={styles.metaValue}>{formatDate(project.endDate)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Tasks</Text>
                  <Text style={styles.metaValue}>{project.taskCount}</Text>
                </View>
              </View>
            </View>
          )}
          <Text style={styles.sectionTitle}>Tasks ({tasks.length})</Text>
        </View>
      }
      renderItem={({ item }) => {
        const statusBadge = getTaskStatusBadge(item.status)
        const priorityBadge = getTaskPriorityBadge(item.priority)
        const isCompleted = item.status === 'COMPLETED'
        return (
          <View style={styles.taskItem}>
            <TouchableOpacity
              style={[styles.checkbox, isCompleted && styles.checkboxChecked]}
              onPress={() => handleToggle(item)}
            >
              {isCompleted && <Text style={{ color: '#fff', fontSize: 10 }}>✓</Text>}
            </TouchableOpacity>
            <View style={styles.taskContent}>
              <Text style={[styles.taskName, isCompleted && styles.taskNameDone]}>{item.name}</Text>
              <View style={styles.taskBadges}>
                <Badge label={priorityBadge.label} bg={priorityBadge.bg} color={priorityBadge.color} />
                <Badge label={statusBadge.label} bg={statusBadge.bg} color={statusBadge.color} />
                {item.dueDate && <Text style={styles.dueText}>{formatDate(item.dueDate)}</Text>}
              </View>
            </View>
          </View>
        )
      }}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyTitle}>No tasks yet</Text>
          <Text style={styles.emptyDesc}>Add tasks from the web or tasks screen</Text>
        </View>
      }
      contentContainerStyle={styles.list}
    />
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16 },
  errorBox: { backgroundColor: colors.dangerLight, borderRadius: 8, padding: 12, marginBottom: 12 },
  errorText: { fontSize: 13, color: colors.danger },
  projectCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, marginBottom: 20 },
  projectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  projectTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginRight: 10 },
  projectDesc: { fontSize: 13, color: colors.textSecondary, marginBottom: 12, lineHeight: 18 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  progressBar: { flex: 1, height: 5, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  progressText: { fontSize: 12, color: colors.textMuted, width: 32 },
  metaRow: { flexDirection: 'row', gap: 20 },
  metaItem: {},
  metaLabel: { fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
  metaValue: { fontSize: 13, fontWeight: '500', color: colors.textPrimary },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 12 },
  taskItem: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: { width: 18, height: 18, borderWidth: 2, borderColor: colors.border, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginTop: 2, backgroundColor: colors.surface },
  checkboxChecked: { backgroundColor: colors.success, borderColor: colors.success },
  taskContent: { flex: 1 },
  taskName: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, marginBottom: 6 },
  taskNameDone: { textDecorationLine: 'line-through', color: colors.textMuted },
  taskBadges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
  badge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  dueText: { fontSize: 11, color: colors.textMuted },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 32, marginBottom: 10 },
  emptyTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 },
  emptyDesc: { fontSize: 12, color: colors.textSecondary, textAlign: 'center' },
})
