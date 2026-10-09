// Shared design tokens for the mobile app
export const colors = {
  primary: '#4f46e5',
  primaryLight: '#ede9fe',
  bg: '#f7f8fc',
  surface: '#ffffff',
  border: '#e4e7ef',
  textPrimary: '#1a1d27',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  success: '#059669',
  successLight: '#d1fae5',
  warning: '#d97706',
  warningLight: '#fef3c7',
  danger: '#dc2626',
  dangerLight: '#fee2e2',
  info: '#0284c7',
  infoLight: '#e0f2fe',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
}

export function getProjectStatusBadge(status) {
  const map = {
    NOT_STARTED: { label: 'Not Started', bg: colors.gray100, color: colors.textSecondary },
    IN_PROGRESS:  { label: 'In Progress',  bg: colors.infoLight,    color: colors.info    },
    COMPLETED:    { label: 'Completed',    bg: colors.successLight, color: colors.success  },
  }
  return map[status] || { label: status, bg: colors.gray100, color: colors.textSecondary }
}

export function getTaskStatusBadge(status) {
  const map = {
    PENDING:     { label: 'Pending',     bg: colors.warningLight, color: colors.warning },
    IN_PROGRESS: { label: 'In Progress', bg: colors.infoLight,    color: colors.info    },
    COMPLETED:   { label: 'Completed',   bg: colors.successLight, color: colors.success  },
  }
  return map[status] || { label: status, bg: colors.gray100, color: colors.textSecondary }
}

export function getTaskPriorityBadge(priority) {
  const map = {
    LOW:    { label: 'Low',    bg: colors.successLight, color: colors.success },
    MEDIUM: { label: 'Medium', bg: colors.warningLight, color: colors.warning },
    HIGH:   { label: 'High',   bg: colors.dangerLight,  color: colors.danger  },
  }
  return map[priority] || { label: priority, bg: colors.gray100, color: colors.textSecondary }
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
  if (!error) return 'Unknown error'
  if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
    return 'No network connection. Please check your internet.'
  }
  if (error.response?.data?.message) return error.response.data.message
  if (error.response?.data?.errors?.length) return error.response.data.errors.join(', ')
  if (error.message) return error.message
  return 'An unexpected error occurred'
}
