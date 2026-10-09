import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { projectApi, taskApi } from '../../api'
import { PageLoader } from '../../components/common/LoadingSpinner'
import { ConfirmModal } from '../../components/common/Modal'
import { ProjectFormModal } from '../../components/projects/ProjectFormModal'
import { TaskFormModal } from '../../components/tasks/TaskFormModal'
import {
  getProjectStatusBadge,
  getTaskStatusBadge,
  getTaskPriorityBadge,
  formatDate,
  getErrorMessage,
} from '../../utils/helpers'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deletingTask, setDeletingTask] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteProjectLoading, setDeleteProjectLoading] = useState(false)
  const [deleteTaskLoading, setDeleteTaskLoading] = useState(false)

  const loadProject = useCallback(async () => {
    try {
      const res = await projectApi.getById(id)
      setProject(res.data.data)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [id])

  const loadTasks = useCallback(async () => {
    try {
      const res = await taskApi.getAll({ projectId: id })
      setTasks(res.data.data || [])
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [id])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await Promise.all([loadProject(), loadTasks()])
      setLoading(false)
    }
    load()
  }, [loadProject, loadTasks])

  const handleEditProject = async (data) => {
    setFormLoading(true)
    try {
      await projectApi.update(id, data)
      setShowEdit(false)
      await loadProject()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteProject = async () => {
    setDeleteProjectLoading(true)
    try {
      await projectApi.delete(id)
      navigate('/projects')
    } catch (err) {
      setError(getErrorMessage(err))
      setDeleteProjectLoading(false)
    }
  }

  const handleCreateTask = async (data) => {
    setFormLoading(true)
    try {
      await taskApi.create(data)
      setShowTaskForm(false)
      await loadTasks()
      await loadProject()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditTask = async (data) => {
    setFormLoading(true)
    try {
      await taskApi.update(editingTask.id, data)
      setEditingTask(null)
      await loadTasks()
      await loadProject()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteTask = async () => {
    setDeleteTaskLoading(true)
    try {
      await taskApi.delete(deletingTask.id)
      setDeletingTask(null)
      await loadTasks()
      await loadProject()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDeleteTaskLoading(false)
    }
  }

  const handleToggleTaskStatus = async (task) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    try {
      await taskApi.update(task.id, { ...task, status: newStatus, projectId: task.projectId })
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
      await loadProject()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading) return <div className="page-content"><PageLoader /></div>
  if (!project && error) return (
    <div className="page-content">
      <div className="alert alert-danger">{error}</div>
      <button className="btn btn-secondary" onClick={() => navigate('/projects')}>← Back</button>
    </div>
  )

  const statusBadge = project ? getProjectStatusBadge(project.status) : null
  const progress = project?.taskCount > 0
    ? Math.round((project.completedTaskCount / project.taskCount) * 100)
    : 0

  return (
    <div className="page-content">
      {/* Breadcrumb */}
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => navigate('/projects')}
        style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-secondary)' }}
      >
        ← Back to Projects
      </button>

      {error && <div className="alert alert-danger">{error}</div>}

      {project && (
        <>
          <div className="page-header">
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-1)' }}>
                <h1 className="page-title">{project.name}</h1>
                <span className={`badge ${statusBadge.cls}`}>{statusBadge.label}</span>
              </div>
              {project.description && (
                <p className="page-subtitle">{project.description}</p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowEdit(true)}
                id="edit-project-detail-btn"
              >
                Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => setShowDelete(true)}
                id="delete-project-detail-btn"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Project Meta */}
          <div className="card card-sm" style={{ marginBottom: 'var(--space-6)', display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Start Date</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{formatDate(project.startDate)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>End Date</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{formatDate(project.endDate)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Created</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{formatDate(project.createdAt)}</div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Progress — {project.completedTaskCount}/{project.taskCount} tasks
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600 }}>Tasks ({tasks.length})</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowTaskForm(true)}
              id="add-task-to-project-btn"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Add Task
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-10)' }}>
              <div className="empty-state-icon">✅</div>
              <p className="empty-state-title">No tasks yet</p>
              <p className="empty-state-desc">Add tasks to track progress in this project</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th style={{width:36}}></th>
                    <th>Task</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th style={{width:80}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => {
                    const statusBadge = getTaskStatusBadge(task.status)
                    const priorityBadge = getTaskPriorityBadge(task.priority)
                    const isCompleted = task.status === 'COMPLETED'
                    return (
                      <tr key={task.id}>
                        <td>
                          <div
                            className={`task-checkbox ${isCompleted ? 'checked' : ''}`}
                            onClick={() => handleToggleTaskStatus(task)}
                            role="checkbox"
                            aria-checked={isCompleted}
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && handleToggleTaskStatus(task)}
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
                            <div className="task-meta">{task.description.slice(0, 60)}</div>
                          )}
                        </td>
                        <td><span className={`badge ${priorityBadge.cls}`}>{priorityBadge.label}</span></td>
                        <td><span className={`badge ${statusBadge.cls}`}>{statusBadge.label}</span></td>
                        <td style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{formatDate(task.dueDate)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setEditingTask(task)}
                              id={`edit-task-detail-${task.id}`}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setDeletingTask(task)}
                              style={{ color: 'var(--color-danger)' }}
                              id={`delete-task-detail-${task.id}`}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showEdit && project && (
        <ProjectFormModal
          isOpen={true}
          onClose={() => setShowEdit(false)}
          onSubmit={handleEditProject}
          initialData={project}
          loading={formLoading}
        />
      )}

      <ConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message={`Delete "${project?.name}" and all its tasks? This cannot be undone.`}
        loading={deleteProjectLoading}
      />

      <TaskFormModal
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        onSubmit={handleCreateTask}
        projects={project ? [project] : []}
        defaultProjectId={project?.id}
        loading={formLoading}
      />

      {editingTask && (
        <TaskFormModal
          isOpen={true}
          onClose={() => setEditingTask(null)}
          onSubmit={handleEditTask}
          initialData={editingTask}
          projects={project ? [project] : []}
          loading={formLoading}
        />
      )}

      <ConfirmModal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Delete task "${deletingTask?.name}"?`}
        loading={deleteTaskLoading}
      />
    </div>
  )
}
