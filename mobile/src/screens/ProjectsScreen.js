import React, { useCallback, useEffect, useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native'
import { projectApi } from '../api'
import { colors, getProjectStatusBadge, formatDate, getErrorMessage } from '../utils/helpers'

function Badge({ label, bg, color }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  )
}

function ProjectCard({ project, onPress }) {
  const badge = getProjectStatusBadge(project.status)
  const progress = project.taskCount > 0
    ? Math.round((project.completedTaskCount / project.taskCount) * 100)
    : 0

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>{project.name}</Text>
        <Badge label={badge.label} bg={badge.bg} color={badge.color} />
      </View>
      {project.description ? (
        <Text style={styles.cardDesc} numberOfLines={2}>{project.description}</Text>
      ) : null}
      {project.taskCount > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      )}
      <View style={styles.cardFooter}>
        <Text style={styles.cardMeta}>{project.taskCount} task{project.taskCount !== 1 ? 's' : ''}</Text>
        {project.endDate && <Text style={styles.cardMeta}>Due {formatDate(project.endDate)}</Text>}
      </View>
    </TouchableOpacity>
  )
}

export default function ProjectsScreen({ navigation }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  const loadProjects = useCallback(async (searchVal = search) => {
    setError('')
    try {
      const params = {}
      if (searchVal) params.search = searchVal
      const res = await projectApi.getAll(params)
      setProjects(res.data.data || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => loadProjects(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => loadProjects(search))
    return unsubscribe
  }, [navigation, loadProjects])

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search projects..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {error ? (
        <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>
      ) : loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ProjectCard
              project={item}
              onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id, projectName: item.name })}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadProjects() }}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No projects found</Text>
              <Text style={styles.emptyDesc}>
                {search ? 'Try a different search' : 'Create projects on the web to see them here'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  searchContainer: { padding: 16, paddingBottom: 8 },
  searchInput: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, padding: 10, fontSize: 14, color: colors.textPrimary,
  },
  list: { padding: 16, paddingTop: 8 },
  card: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: 16, marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  cardTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginRight: 8 },
  cardDesc: { fontSize: 12.5, color: colors.textSecondary, lineHeight: 18, marginBottom: 10 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  progressBar: { flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
  progressText: { fontSize: 11, color: colors.textMuted, width: 30 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  cardMeta: { fontSize: 11, color: colors.textMuted },
  errorBox: { backgroundColor: colors.dangerLight, borderRadius: 8, padding: 12, margin: 16 },
  errorText: { fontSize: 13, color: colors.danger },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 36, marginBottom: 12 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 },
  emptyDesc: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
})
