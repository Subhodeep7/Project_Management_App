import { useCallback, useEffect, useState } from 'react'
import { projectApi, taskApi } from '../../api'
import { PageLoader } from '../../components/common/LoadingSpinner'
import { ConfirmModal } from '../../components/common/Modal'
import { TaskFormModal } from '../../components/tasks/TaskFormModal'
import {
  getTaskStatusBadge,
  getTaskPriorityBadge,
  formatDate,
  getErrorMessage,
} from '../../utils/helpers'

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
]

const PRIORITY_FILTER_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
]

function TaskRow({ task, onEdit, onDelete, onToggleStatus }) {
  const statusBadge = getTaskStatusBadge(task.status)
  const priorityBadge = getTaskPriorityBadge(task.priority)
  const isCompleted = task.status === 'COMPLETED'

  return (
    <tr>
      <td>
        <div
          className={`task-checkbox ${isCompleted ? 'checked' : ''}`}
          onClick={() => onToggleStatus(task)}
          role="checkbox"
          aria-checked={isCompleted}
          aria-label={`Mark ${task.name} as ${isCompleted ? 'pending' : 'completed'}`}
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onToggleStatus(task)}
        >
          {isCompleted && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          )}
        </div>
      </td>
      <td>
        <div className={`task-name ${isCompleted ? 'completed' : ''}`}>{task.name}</div>
        {task.description && (
          <div className="task-meta">{task.description.slice(0, 60)}{task.description.length > 60 ? '…' : ''}</div>
        )}
      </td>
      <td>
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{task.projectName}</span>
      </td>
      <td><span className={`badge ${priorityBadge.cls}`}>{priorityBadge.label}</span></td>
      <td><span className={`badge ${statusBadge.cls}`}>{statusBadge.label}</span></td>
      <td style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{formatDate(task.dueDate)}</td>
      <td>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onEdit(task)}
            title="Edit"
            id={`edit-task-${task.id}`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onDelete(task)}
            title="Delete"
            id={`delete-task-${task.id}`}
            style={{ color: 'var(--color-danger)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deletingTask, setDeletingTask] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Load projects once for the form dropdown
  useEffect(() => {
    projectApi.getAll().then(r => setProjects(r.data.data || [])).catch(() => {})
  }, [])

  const loadTasks = useCallback(async () => {
    setLoading(true)
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
    }
  }, [search, statusFilter, priorityFilter])

  useEffect(() => {
    const timer = setTimeout(loadTasks, 300)
    return () => clearTimeout(timer)
  }, [loadTasks])

  const handleCreate = async (data) => {
    setFormLoading(true)
    try {
      await taskApi.create(data)
      setShowForm(false)
      await loadTasks()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = async (data) => {
    setFormLoading(true)
    try {
      await taskApi.update(editingTask.id, data)
      setEditingTask(null)
      await loadTasks()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await taskApi.delete(deletingTask.id)
      setDeletingTask(null)
      await loadTasks()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    try {
      await taskApi.update(task.id, { ...task, status: newStatus, projectId: task.projectId })
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">All tasks across your projects</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          disabled={projects.length === 0}
          title={projects.length === 0 ? 'Create a project first' : ''}
          id="new-task-btn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          New Task
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {projects.length === 0 && !loading && (
        <div className="alert alert-danger" style={{background: 'var(--color-warning-light)', color: 'var(--color-warning-text)', border: '1px solid rgba(217,119,6,0.2)'}}>
          You need to create a project before adding tasks.
        </div>
      )}

      <div className="filters-bar">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="search"
            className="search-input"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="task-search"
          />
        </div>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          id="task-status-filter"
        >
          {STATUS_FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          className="filter-select"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          id="task-priority-filter"
        >
          {PRIORITY_FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {loading ? (
        <PageLoader />
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <h2 className="empty-state-title">No tasks found</h2>
          <p className="empty-state-desc">
            {search || statusFilter || priorityFilter
              ? 'Try adjusting your search or filters'
              : 'Create your first task to get started'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{width:36}}></th>
                <th>Task</th>
                <th>Project</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
                <th style={{width:80}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onEdit={(t) => setEditingTask(t)}
                  onDelete={(t) => setDeletingTask(t)}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TaskFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreate}
        projects={projects}
        loading={formLoading}
      />

      {editingTask && (
        <TaskFormModal
          isOpen={true}
          onClose={() => setEditingTask(null)}
          onSubmit={handleEdit}
          initialData={editingTask}
          projects={projects}
          loading={formLoading}
        />
      )}

      <ConfirmModal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.name}"?`}
        loading={deleteLoading}
      />
    </div>
  )
}
