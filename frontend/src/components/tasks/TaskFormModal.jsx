import { useForm } from 'react-hook-form'
import { Modal } from '../../components/common/Modal'

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
]

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
]

export function TaskFormModal({ isOpen, onClose, onSubmit, initialData, projects, loading, defaultProjectId }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: initialData || {
      status: 'PENDING',
      priority: 'MEDIUM',
      projectId: defaultProjectId || (projects?.[0]?.id ?? ''),
    },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const onFormSubmit = async (data) => {
    await onSubmit({ ...data, projectId: Number(data.projectId) })
    reset()
  }

  const isEditing = !!initialData?.id

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Task' : 'New Task'}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </button>
          <button
            type="submit"
            form="task-form"
            className="btn btn-primary"
            disabled={loading}
            id="task-form-submit-btn"
          >
            {loading && <span className="loading-spinner" style={{width:13,height:13}} />}
            {isEditing ? 'Save changes' : 'Create task'}
          </button>
        </>
      }
    >
      <form id="task-form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
        <div className="form-group">
          <label className="form-label required" htmlFor="task-name">Task Name</label>
          <input
            id="task-name"
            type="text"
            className="form-input"
            placeholder="e.g. Design homepage mockup"
            {...register('name', { required: 'Task name is required' })}
          />
          {errors.name && <p className="form-error">{errors.name.message}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="task-desc">Description</label>
          <textarea
            id="task-desc"
            className="form-textarea"
            placeholder="Task details..."
            {...register('description')}
          />
        </div>

        <div className="form-group">
          <label className="form-label required" htmlFor="task-project">Project</label>
          <select
            id="task-project"
            className="form-select"
            {...register('projectId', { required: 'Project is required' })}
          >
            {(projects || []).map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {errors.projectId && <p className="form-error">{errors.projectId.message}</p>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label required" htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              className="form-select"
              {...register('priority', { required: true })}
            >
              {PRIORITY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label required" htmlFor="task-status">Status</label>
            <select
              id="task-status"
              className="form-select"
              {...register('status', { required: true })}
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="task-due">Due Date</label>
          <input
            id="task-due"
            type="date"
            className="form-input"
            {...register('dueDate')}
          />
        </div>
      </form>
    </Modal>
  )
}
