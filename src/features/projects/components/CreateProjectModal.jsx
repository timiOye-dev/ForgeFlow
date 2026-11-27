import { useState } from 'react'
import { useProjects } from '../../../app/contexts/ProjectContext'
import { Modal } from '../../../shared/components/Modal'
import {
  PROJECT_CATEGORIES,
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
} from '../../../shared/utils/projectForm'

export const CreateProjectModal = ({ isOpen, onClose }) => {
  const { addProject } = useProjects()

  const [formData, setFormData] = useState({
    name: '',
    client: '',
    description: '',
    category: 'Web Application',
    status: 'In Progress',
    priority: 'Medium',
    budget: '$5,000',
    deadline: '',
    color: '#6366f1',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    addProject({
      ...formData,
      milestones: [
        {
          id: `m_init_1`,
          title: 'Discovery & Requirements Signoff',
          completed: false,
          dueDate: formData.deadline,
        },
        {
          id: `m_init_2`,
          title: 'Core Implementation & QA Testing',
          completed: false,
          dueDate: formData.deadline,
        },
      ],
    })

    setFormData({
      name: '',
      client: '',
      description: '',
      category: 'Web Application',
      status: 'In Progress',
      priority: 'Medium',
      budget: '$5,000',
      deadline: '',
      color: '#6366f1',
    })

    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label
            htmlFor="create-project-name"
            className="block font-medium text-slate-300 mb-1"
          >
            Project Name *
          </label>
          <input
            id="create-project-name"
            type="text"
            required
            placeholder="e.g. NextGen Client Portal"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="create-project-client"
              className="block font-medium text-slate-300 mb-1"
            >
              Client / Company
            </label>
            <input
              id="create-project-client"
              type="text"
              placeholder="e.g. Acme Corp"
              value={formData.client}
              onChange={(e) =>
                setFormData({ ...formData, client: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="create-project-category"
              className="block font-medium text-slate-300 mb-1"
            >
              Category
            </label>
            <select
              id="create-project-category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {PROJECT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="create-project-description"
            className="block font-medium text-slate-300 mb-1"
          >
            Description
          </label>
          <textarea
            id="create-project-description"
            rows={3}
            placeholder="Brief overview of project scope and key deliverables..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label
              htmlFor="create-project-status"
              className="block font-medium text-slate-300 mb-1"
            >
              Status
            </label>
            <select
              id="create-project-status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
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
            <label
              htmlFor="create-project-priority"
              className="block font-medium text-slate-300 mb-1"
            >
              Priority
            </label>
            <select
              id="create-project-priority"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
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
            <label
              htmlFor="create-project-budget"
              className="block font-medium text-slate-300 mb-1"
            >
              Budget
            </label>
            <input
              id="create-project-budget"
              type="text"
              value={formData.budget}
              onChange={(e) =>
                setFormData({ ...formData, budget: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="create-project-deadline"
              className="block font-medium text-slate-300 mb-1"
            >
              Deadline Date
            </label>
            <input
              id="create-project-deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="create-project-color"
              className="block font-medium text-slate-300 mb-1"
            >
              Color Badge
            </label>
            <input
              id="create-project-color"
              type="color"
              value={formData.color}
              onChange={(e) =>
                setFormData({ ...formData, color: e.target.value })
              }
              className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-1 py-1 cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-4 flex flex-col-reverse gap-2 border-t border-slate-800 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors shadow-md shadow-indigo-600/20 w-full sm:w-auto"
          >
            Create Project
          </button>
        </div>
      </form>
    </Modal>
  )
}
