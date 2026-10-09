// Status badge helpers
export function getProjectStatusBadge(status) {
  const map = {
    NOT_STARTED: { label: 'Not Started', cls: 'badge-neutral' },
    IN_PROGRESS:  { label: 'In Progress',  cls: 'badge-info'    },
    COMPLETED:    { label: 'Completed',    cls: 'badge-success' },
  }
  return map[status] || { label: status, cls: 'badge-neutral' }
}

export function getTaskStatusBadge(status) {
  const map = {
    PENDING:     { label: 'Pending',     cls: 'badge-warning' },
    IN_PROGRESS: { label: 'In Progress', cls: 'badge-info'    },
    COMPLETED:   { label: 'Completed',   cls: 'badge-success' },
  }
  return map[status] || { label: status, cls: 'badge-neutral' }
}

export function getTaskPriorityBadge(priority) {
  const map = {
    LOW:    { label: 'Low',    cls: 'badge-success' },
    MEDIUM: { label: 'Medium', cls: 'badge-warning' },
    HIGH:   { label: 'High',   cls: 'badge-danger'  },
  }
  return map[priority] || { label: priority, cls: 'badge-neutral' }
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function getErrorMessage(error) {
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.response?.data?.errors?.length) return error.response.data.errors.join(', ')
  if (error?.message) return error.message
  return 'An unexpected error occurred'
}
