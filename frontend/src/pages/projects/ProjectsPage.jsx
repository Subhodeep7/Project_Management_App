import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { projectApi } from '../../api'
import { PageLoader } from '../../components/common/LoadingSpinner'
import { ConfirmModal } from '../../components/common/Modal'
import { ProjectFormModal } from '../../components/projects/ProjectFormModal'
import {
  getProjectStatusBadge,
  formatDate,
  getErrorMessage,
} from '../../utils/helpers'

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
]

function ProjectCard({ project, onEdit, onDelete, onView }) {
  const badge = getProjectStatusBadge(project.status)
  const progress = project.taskCount > 0
    ? Math.round((project.completedTaskCount / project.taskCount) * 100)
    : 0

  return (
    <div className="project-card" role="article">
      <div className="project-card-header">
        <div>
          <h3
            className="project-card-title"
            onClick={() => onView(project.id)}
          >
            {project.name}
          </h3>
          <span className={`badge ${badge.cls}`} style={{ marginTop: 4 }}>
            {badge.label}
          </span>
        </div>
        <div className="project-card-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onEdit(project)}
            title="Edit project"
            id={`edit-project-${project.id}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onDelete(project)}
            title="Delete project"
            id={`delete-project-${project.id}`}
            style={{ color: 'var(--color-danger)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
            </svg>
          </button>
        </div>
      </div>

      {project.description && (
        <p className="project-card-desc">{project.description}</p>
      )}

      {project.taskCount > 0 && (
        <div className="progress-bar-container">
          <div className="progress-bar-label">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="project-card-meta">
        <span>
          {project.taskCount} task{project.taskCount !== 1 ? 's' : ''}
          {project.completedTaskCount > 0 && ` · ${project.completedTaskCount} done`}
        </span>
        <span>{formatDate(project.endDate) !== '—' ? `Due ${formatDate(project.endDate)}` : `Created ${formatDate(project.createdAt)}`}</span>
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [deletingProject, setDeletingProject] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadProjects = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      const res = await projectApi.getAll(params)
      setProjects(res.data.data || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    const timer = setTimeout(loadProjects, 300)
    return () => clearTimeout(timer)
  }, [loadProjects])

  const handleCreate = async (data) => {
    setFormLoading(true)
    try {
      await projectApi.create(data)
      setShowForm(false)
      await loadProjects()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = async (data) => {
    setFormLoading(true)
    try {
      await projectApi.update(editingProject.id, data)
      setEditingProject(null)
      await loadProjects()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await projectApi.delete(deletingProject.id)
      setDeletingProject(null)
      await loadProjects()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage and track your projects</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          id="new-project-btn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          New Project
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="filters-bar">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="search"
            className="search-input"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="project-search"
          />
        </div>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          id="project-status-filter"
        >
          {STATUS_FILTER_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <PageLoader />
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h2 className="empty-state-title">No projects found</h2>
          <p className="empty-state-desc">
            {search || statusFilter
              ? 'Try adjusting your search or filters'
              : 'Create your first project to get started'}
          </p>
          {!search && !statusFilter && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onView={(id) => navigate(`/projects/${id}`)}
              onEdit={(p) => setEditingProject(p)}
              onDelete={(p) => setDeletingProject(p)}
            />
          ))}
        </div>
      )}

      <ProjectFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreate}
        loading={formLoading}
      />

      {editingProject && (
        <ProjectFormModal
          isOpen={true}
          onClose={() => setEditingProject(null)}
          onSubmit={handleEdit}
          initialData={editingProject}
          loading={formLoading}
        />
      )}

      <ConfirmModal
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${deletingProject?.name}"? This will also delete all tasks in this project.`}
        loading={deleteLoading}
      />
    </div>
  )
}
