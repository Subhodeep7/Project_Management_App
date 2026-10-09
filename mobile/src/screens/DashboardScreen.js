import React, { useEffect, useState, useCallback } from 'react'
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, RefreshControl, Alert,
} from 'react-native'
import { dashboardApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { colors, getErrorMessage } from '../utils/helpers'

function StatCard({ label, value, color }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, color && { color }]}>{value ?? 0}</Text>
    </View>
  )
}

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadStats = useCallback(async () => {
    setError('')
    try {
      const res = await dashboardApi.get()
      setStats(res.data.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { loadStats() }, [loadStats])

  const onRefresh = () => {
    setRefreshing(true)
    loadStats()
  }

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ])
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.inner}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.fullName?.split(' ')[0]} 👋</Text>
          <Text style={styles.headerSub}>Here's your overview</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : stats ? (
        <>
          <Text style={styles.sectionTitle}>Projects</Text>
          <View style={styles.grid}>
            <StatCard label="Total" value={stats.totalProjects} />
            <StatCard label="Not Started" value={stats.projectsNotStarted} />
            <StatCard label="In Progress" value={stats.projectsInProgress} color={colors.info} />
            <StatCard label="Completed" value={stats.projectsCompleted} color={colors.success} />
          </View>

          <Text style={styles.sectionTitle}>Tasks</Text>
          <View style={styles.grid}>
            <StatCard label="Total" value={stats.totalTasks} />
            <StatCard label="Pending" value={stats.pendingTasks} color={colors.warning} />
            <StatCard label="In Progress" value={stats.inProgressTasks} color={colors.info} />
            <StatCard label="Completed" value={stats.completedTasks} color={colors.success} />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('Projects')}
            >
              <Text style={styles.actionBtnText}>View Projects</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnSecondary]}
              onPress={() => navigation.navigate('Tasks')}
            >
              <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>View Tasks</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  headerSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  logoutBtn: { padding: 8, backgroundColor: colors.dangerLight, borderRadius: 8 },
  logoutText: { fontSize: 13, color: colors.danger, fontWeight: '500' },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: 16, width: '47%',
  },
  statLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '500', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 },
  statValue: { fontSize: 28, fontWeight: '700', color: colors.textPrimary, letterSpacing: -1 },
  errorBox: { backgroundColor: colors.dangerLight, borderRadius: 8, padding: 12, marginBottom: 16 },
  errorText: { fontSize: 13, color: colors.danger },
  actions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  actionBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: 8, padding: 12, alignItems: 'center' },
  actionBtnSecondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
})
