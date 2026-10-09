import { useForm } from 'react-hook-form'
import { Modal } from '../../components/common/Modal'

const STATUS_OPTIONS = [
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
]

export function ProjectFormModal({ isOpen, onClose, onSubmit, initialData, loading }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: initialData || { status: 'NOT_STARTED' },
  })

  // Reset form when modal opens/closes or data changes
  const handleClose = () => {
    reset(initialData || { status: 'NOT_STARTED' })
    onClose()
  }

  const onFormSubmit = async (data) => {
    await onSubmit(data)
    reset()
  }

  const isEditing = !!initialData?.id

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Project' : 'New Project'}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </button>
          <button
            type="submit"
            form="project-form"
            className="btn btn-primary"
            disabled={loading}
            id="project-form-submit-btn"
          >
            {loading && <span className="loading-spinner" style={{width:13,height:13}} />}
            {isEditing ? 'Save changes' : 'Create project'}
          </button>
        </>
      }
    >
      <form id="project-form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
        <div className="form-group">
          <label className="form-label required" htmlFor="project-name">Project Name</label>
          <input
            id="project-name"
            type="text"
            className="form-input"
            placeholder="e.g. Website Redesign"
            {...register('name', { required: 'Project name is required' })}
          />
          {errors.name && <p className="form-error">{errors.name.message}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="project-desc">Description</label>
          <textarea
            id="project-desc"
            className="form-textarea"
            placeholder="Describe this project..."
            {...register('description')}
          />
        </div>

        <div className="form-group">
          <label className="form-label required" htmlFor="project-status">Status</label>
          <select
            id="project-status"
            className="form-select"
            {...register('status', { required: 'Status is required' })}
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {errors.status && <p className="form-error">{errors.status.message}</p>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="project-start">Start Date</label>
            <input
              id="project-start"
              type="date"
              className="form-input"
              {...register('startDate')}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="project-end">End Date</label>
            <input
              id="project-end"
              type="date"
              className="form-input"
              {...register('endDate')}
            />
          </div>
        </div>
      </form>
    </Modal>
  )
}
