import { useLayoutEffect, useRef, useState } from 'react'
import { Save } from 'lucide-react'
import { useProjects } from '../../../app/contexts/ProjectContext'
import { Modal } from '../../../shared/components/Modal'
import {
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  getProjectCategoryOptions,
  getProjectFormValues,
  normalizeProjectForm,
  validateProjectForm,
} from '../../../shared/utils/projectForm'

export const EditProjectModal = ({ isOpen, onClose, project, onSuccess }) => {
  const { updateProject } = useProjects()
  const [formData, setFormData] = useState(() => getProjectFormValues(project))
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const wasOpen = useRef(isOpen)
  const categoryOptions = getProjectCategoryOptions(project)

  useLayoutEffect(() => {
    if (isOpen && !wasOpen.current) {
      setFormData(getProjectFormValues(project))
      setError('')
      setIsSubmitting(false)
    }
    wasOpen.current = isOpen
  }, [isOpen, project])

  const handleChange = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (isSubmitting) return

    const validation = validateProjectForm(formData, {
      originalCategory: project?.category,
    })
    if (!validation.success) {
      setError(Object.values(validation.errors)[0])
      return
    }

    setError('')
    setIsSubmitting(true)

    const result = project
      ? updateProject(project.id, normalizeProjectForm(formData))
      : {
          success: false,
          error: { message: 'This project no longer exists.' },
        }

    setIsSubmitting(false)

    if (!result.success) {
      setError(result.error?.message || 'Unable to update this project.')
      return
    }

    onSuccess?.(result.project)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Project">
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
            Project Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. NextGen Client Portal"
            value={formData.name}
            onChange={handleChange('name')}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Client / Company
            </label>
            <input
              type="text"
              placeholder="e.g. Acme Corp"
              value={formData.client}
              onChange={handleChange('client')}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={handleChange('category')}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-300 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Brief overview of project scope and key deliverables..."
            value={formData.description}
            onChange={handleChange('description')}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={handleChange('status')}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {PROJECT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={handleChange('priority')}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {PROJECT_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Budget
            </label>
            <input
              type="text"
              value={formData.budget}
              onChange={handleChange('budget')}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Deadline Date
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={handleChange('deadline')}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Color Badge
            </label>
            <input
              type="color"
              value={formData.color}
              onChange={handleChange('color')}
              className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-1 py-1 cursor-pointer"
            />
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
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors shadow-md shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </Modal>
  )
}
