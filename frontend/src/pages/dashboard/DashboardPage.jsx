import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardApi } from '../../api'
import { PageLoader } from '../../components/common/LoadingSpinner'
import { getErrorMessage } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'

function StatCard({ label, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={color ? { color } : {}}>
        {value ?? 0}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await dashboardApi.get()
        setStats(res.data.data)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="page-content"><PageLoader /></div>

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.fullName?.split(' ')[0]}!</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {stats && (
        <>
          <section aria-label="Project statistics">
            <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 'var(--space-3)' }}>
              Projects
            </h2>
            <div className="stats-grid">
              <StatCard label="Total Projects" value={stats.totalProjects} />
              <StatCard label="Not Started" value={stats.projectsNotStarted} />
              <StatCard label="In Progress" value={stats.projectsInProgress} color="var(--color-info)" />
              <StatCard label="Completed" value={stats.projectsCompleted} color="var(--color-success)" />
            </div>
          </section>

          <section aria-label="Task statistics">
            <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 'var(--space-3)' }}>
              Tasks
            </h2>
            <div className="stats-grid">
              <StatCard label="Total Tasks" value={stats.totalTasks} />
              <StatCard label="Pending" value={stats.pendingTasks} color="var(--color-warning)" />
              <StatCard label="In Progress" value={stats.inProgressTasks} color="var(--color-info)" />
              <StatCard label="Completed" value={stats.completedTasks} color="var(--color-success)" />
            </div>
          </section>

          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/projects')}
              id="go-to-projects-btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 7h20M5 7V5a2 2 0 012-2h10a2 2 0 012 2v2M5 7v12a2 2 0 002 2h10a2 2 0 002-2V7"/>
              </svg>
              View Projects
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/tasks')}
              id="go-to-tasks-btn"
            >
              View Tasks
            </button>
          </div>
        </>
      )}
    </div>
  )
}
