import { useLayoutEffect, useRef, useState } from 'react'
import { Save } from 'lucide-react'
import { useTasks } from '../../../app/contexts/TaskContext'
import { useProjects } from '../../../app/contexts/ProjectContext'
import { Modal } from '../../../shared/components/Modal'
import {
  getTaskFormValues,
  getTaskPriorityOptions,
  getTaskProjectOptions,
  getTaskStatusOptions,
  getTaskValidationContext,
  isValidTaskDueDate,
  normalizeTaskForm,
  resolveTaskFormValues,
  validateTaskForm,
} from '../../../shared/utils/taskForm'

export const EditTaskModal = ({ isOpen, onClose, task, onSuccess }) => {
  const { updateTask } = useTasks()
  const { projects } = useProjects()

  const [formData, setFormData] = useState(() => getTaskFormValues(task))
  const [dueDateInteraction, setDueDateInteraction] = useState({
    dueDateTouched: false,
    dueDateBadInput: false,
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const wasOpen = useRef(isOpen)
  const loadedTaskId = useRef(task?.id)

  const projectOptions = getTaskProjectOptions(task, projects)
  const statusOptions = getTaskStatusOptions(task)
  const priorityOptions = getTaskPriorityOptions(task)

  const storedDueDate = task?.dueDate
  const hasLegacyDueDate =
    storedDueDate !== undefined &&
    storedDueDate !== null &&
    storedDueDate !== '' &&
    !(typeof storedDueDate === 'string' && isValidTaskDueDate(storedDueDate))

  useLayoutEffect(() => {
    if (isOpen && (!wasOpen.current || loadedTaskId.current !== task?.id)) {
      setFormData(getTaskFormValues(task))
      setDueDateInteraction({
        dueDateTouched: false,
        dueDateBadInput: false,
      })
      setError('')
      setIsSubmitting(false)
      loadedTaskId.current = task?.id
    }
    wasOpen.current = isOpen
  }, [isOpen, task])

  const handleChange = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleDueDateChange = (event) => {
    setDueDateInteraction({
      dueDateTouched: true,
      dueDateBadInput: Boolean(event.target.validity?.badInput),
    })
    setFormData((current) => ({ ...current, dueDate: event.target.value }))
  }

  const handleClearDueDate = () => {
    setDueDateInteraction({
      dueDateTouched: true,
      dueDateBadInput: false,
    })
    setFormData((current) => ({ ...current, dueDate: '' }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (isSubmitting) return

    const context = getTaskValidationContext(task, projects)
    context.dueDateTouched = dueDateInteraction.dueDateTouched
    context.dueDateBadInput = dueDateInteraction.dueDateBadInput

    const resolved = resolveTaskFormValues(
      formData,
      context,
      dueDateInteraction
    )
    const validation = validateTaskForm(resolved, context)

    if (!validation.success) {
      setError(Object.values(validation.errors)[0])
      return
    }

    setError('')
    setIsSubmitting(true)

    const result = task
      ? updateTask(task.id, normalizeTaskForm(resolved), {
          dueDateTouched: dueDateInteraction.dueDateTouched,
          dueDateBadInput: dueDateInteraction.dueDateBadInput,
        })
      : {
          success: false,
          error: { message: 'This task no longer exists.' },
        }

    setIsSubmitting(false)

    if (!result.success) {
      setError(result.error?.message || 'Unable to update this task.')
      return
    }

    onSuccess?.(result.task)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
      <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
        {error && (
          <div
            role="alert"
            className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300"
          >
            {error}
          </div>
        )}

        <div>
          <label className="block font-medium text-slate-300 mb-1">
            Task Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={handleChange('title')}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block font-medium text-slate-300 mb-1">
            Project Assignment
          </label>
          <select
            value={formData.projectId}
            onChange={handleChange('projectId')}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            {projectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium text-slate-300 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={handleChange('description')}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={handleChange('priority')}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={handleChange('status')}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-300 mb-1">
            Due Date
          </label>
          {hasLegacyDueDate && (
            <div
              role="status"
              className="mb-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]"
            >
              Stored due date &quot;{String(storedDueDate)}&quot; cannot be
              displayed in a date picker. It will be preserved unless you select
              a new date or use Clear.
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={formData.dueDate}
              onChange={handleDueDateChange}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleClearDueDate}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors whitespace-nowrap"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors shadow-md shadow-indigo-600/20 flex items-center gap-1.5 disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </Modal>
  )
}
