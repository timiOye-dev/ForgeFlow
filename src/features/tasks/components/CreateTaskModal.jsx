import { useLayoutEffect, useRef, useState } from 'react'
import { useTasks } from '../../../app/contexts/TaskContext'
import { useProjects } from '../../../app/contexts/ProjectContext'
import { Modal } from '../../../shared/components/Modal'
import {
  getCreateTaskFormValues,
  reconcileCreateTaskForm,
  validateCreateTaskInput,
} from '../../../shared/utils/taskForm'

export const CreateTaskModal = ({ isOpen, onClose, defaultProjectId = '' }) => {
  const { addTask } = useTasks()
  const { projects } = useProjects()

  const [formData, setFormData] = useState(() =>
    getCreateTaskFormValues(defaultProjectId, projects)
  )
  const [error, setError] = useState('')

  const projectsRef = useRef(projects)

  useLayoutEffect(() => {
    projectsRef.current = projects
  }, [projects])

  const wasOpen = useRef(isOpen)
  const previousDefaultProjectId = useRef(defaultProjectId)
  const projectIdsKey = projects
    .map((project) => String(project?.id ?? ''))
    .join('|')

  useLayoutEffect(() => {
    const currentProjects = projectsRef.current
    const sessionStart = isOpen && !wasOpen.current
    const defaultProjectIdChanged =
      previousDefaultProjectId.current !== defaultProjectId

    if (!isOpen && wasOpen.current) {
      setFormData(getCreateTaskFormValues(defaultProjectId, currentProjects))
    } else if (isOpen) {
      setFormData((currentForm) =>
        reconcileCreateTaskForm(currentForm, {
          defaultProjectId,
          projects: currentProjects,
          sessionStart,
          defaultProjectIdChanged,
        })
      )
    }

    if (isOpen || (!isOpen && wasOpen.current)) setError('')

    previousDefaultProjectId.current = defaultProjectId
    wasOpen.current = isOpen
  }, [isOpen, defaultProjectId, projectIdsKey])

  const resetForm = () => {
    setFormData(getCreateTaskFormValues(defaultProjectId, projects))
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const validation = validateCreateTaskInput(formData, projects)

    if (!validation.success) {
      setError(Object.values(validation.errors)[0])
      return
    }

    const createdTask = addTask(formData)

    if (!createdTask) {
      setError('Unable to create task. Select a valid project.')
      return
    }

    resetForm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Task">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <p
            role="alert"
            className="text-rose-400 bg-rose-950/40 border border-rose-900 rounded-lg px-3 py-2"
          >
            {error}
          </p>
        )}

        {projects.length === 0 && (
          <p className="text-amber-300 bg-amber-950/40 border border-amber-900 rounded-lg px-3 py-2">
            Create a project before adding a task.
          </p>
        )}

        <div>
          <label
            htmlFor="create-task-title"
            className="block font-medium text-slate-300 mb-1"
          >
            Task Title *
          </label>
          <input
            id="create-task-title"
            type="text"
            required
            placeholder="e.g. Implement OAuth2 authentication flow"
            value={formData.title}
            onChange={(e) =>
              setFormData((current) => ({ ...current, title: e.target.value }))
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="create-task-project"
            className="block font-medium text-slate-300 mb-1"
          >
            Project Assignment
          </label>
          <select
            id="create-task-project"
            disabled={projects.length === 0}
            value={formData.projectId}
            onChange={(e) =>
              setFormData((current) => ({
                ...current,
                projectId: e.target.value,
              }))
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 disabled:opacity-60"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.client})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="create-task-description"
            className="block font-medium text-slate-300 mb-1"
          >
            Description
          </label>
          <textarea
            id="create-task-description"
            rows={3}
            placeholder="Technical details, acceptance criteria, or relevant links..."
            value={formData.description}
            onChange={(e) =>
              setFormData((current) => ({
                ...current,
                description: e.target.value,
              }))
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="create-task-priority"
              className="block font-medium text-slate-300 mb-1"
            >
              Priority
            </label>
            <select
              id="create-task-priority"
              value={formData.priority}
              onChange={(e) =>
                setFormData((current) => ({
                  ...current,
                  priority: e.target.value,
                }))
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="create-task-status"
              className="block font-medium text-slate-300 mb-1"
            >
              Status
            </label>
            <select
              id="create-task-status"
              value={formData.status}
              onChange={(e) =>
                setFormData((current) => ({
                  ...current,
                  status: e.target.value,
                }))
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">In Review</option>
              <option value="Done">Done</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="create-task-due-date"
            className="block font-medium text-slate-300 mb-1"
          >
            Due Date
          </label>
          <input
            id="create-task-due-date"
            type="date"
            value={formData.dueDate}
            onChange={(e) =>
              setFormData((current) => ({
                ...current,
                dueDate: e.target.value,
              }))
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="pt-4 flex flex-col-reverse gap-2 border-t border-slate-800 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={projects.length === 0}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            Add Task
          </button>
        </div>
      </form>
    </Modal>
  )
}
