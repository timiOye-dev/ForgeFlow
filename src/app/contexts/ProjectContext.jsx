import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { INITIAL_PROJECTS } from '../../mocks/initialData'
import { applyProjectUpdate } from '../../shared/utils/projectForm'

const ProjectContext = createContext(null)

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('forgeflow_projects')
      if (!saved) return INITIAL_PROJECTS
      const parsed = JSON.parse(saved)
      return Array.isArray(parsed) ? parsed : INITIAL_PROJECTS
    } catch {
      return INITIAL_PROJECTS
    }
  })

  const projectsRef = useRef(projects)

  const commitProjects = (nextOrUpdater) => {
    const nextProjects =
      typeof nextOrUpdater === 'function'
        ? nextOrUpdater(projectsRef.current)
        : nextOrUpdater

    projectsRef.current = nextProjects
    setProjects(nextProjects)

    return nextProjects
  }

  useEffect(() => {
    localStorage.setItem('forgeflow_projects', JSON.stringify(projects))
  }, [projects])

  const addProject = (projectData) => {
    const newProject = {
      id: `proj_${Date.now()}`,
      name: projectData.name,
      description: projectData.description || '',
      client: projectData.client || 'Self / Internal',
      category: projectData.category || 'General',
      status: projectData.status || 'Planned',
      priority: projectData.priority || 'Medium',
      deadline:
        projectData.deadline ||
        new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      budget: projectData.budget || '$0',
      progress: 0,
      color: projectData.color || '#3b82f6',
      milestones: projectData.milestones || [],
      notes: [],
      files: [],
      createdAt: new Date().toISOString().split('T')[0],
    }
    commitProjects((prev) => [newProject, ...prev])
    return newProject
  }

  const updateProject = (id, updatedFields) => {
    let result

    commitProjects((currentProjects) => {
      result = applyProjectUpdate(currentProjects, id, updatedFields)
      return result.success ? result.projects : currentProjects
    })

    return result
  }

  const deleteProject = (id) => {
    commitProjects((prev) => prev.filter((p) => p.id !== id))
  }

  const getProjectById = (id) => {
    return projectsRef.current.find((p) => p.id === id)
  }

  const addMilestone = (projectId, milestoneTitle, dueDate) => {
    commitProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p
        const newM = {
          id: `m_${Date.now()}`,
          title: milestoneTitle,
          completed: false,
          dueDate: dueDate || p.deadline,
        }
        const updatedMilestones = [...p.milestones, newM]
        const completedCount = updatedMilestones.filter(
          (m) => m.completed
        ).length
        const progress =
          updatedMilestones.length > 0
            ? Math.round((completedCount / updatedMilestones.length) * 100)
            : p.progress

        return {
          ...p,
          milestones: updatedMilestones,
          progress,
        }
      })
    )
  }

  const toggleMilestone = (projectId, milestoneId) => {
    commitProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p
        const updatedMilestones = p.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        )
        const completedCount = updatedMilestones.filter(
          (m) => m.completed
        ).length
        const progress =
          updatedMilestones.length > 0
            ? Math.round((completedCount / updatedMilestones.length) * 100)
            : p.progress

        return {
          ...p,
          milestones: updatedMilestones,
          progress,
          status:
            progress === 100
              ? 'Completed'
              : p.status === 'Completed'
                ? 'In Progress'
                : p.status,
        }
      })
    )
  }

  const addNote = (projectId, title, content) => {
    commitProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p
        const newNote = {
          id: `n_${Date.now()}`,
          title,
          content,
          updatedAt: new Date().toISOString().split('T')[0],
        }
        return { ...p, notes: [newNote, ...p.notes] }
      })
    )
  }

  const deleteNote = (projectId, noteId) => {
    commitProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p
        return { ...p, notes: p.notes.filter((n) => n.id !== noteId) }
      })
    )
  }

  const addFile = (projectId, file) => {
    commitProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p
        const newFile = {
          id: `f_${Date.now()}`,
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          uploadedAt: new Date().toISOString().split('T')[0],
        }
        return { ...p, files: [newFile, ...p.files] }
      })
    )
  }

  const deleteFile = (projectId, fileId) => {
    commitProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p
        return { ...p, files: p.files.filter((f) => f.id !== fileId) }
      })
    )
  }

  return (
    <ProjectContext.Provider
      value={{
        projects,
        addProject,
        updateProject,
        deleteProject,
        getProjectById,
        addMilestone,
        toggleMilestone,
        addNote,
        deleteNote,
        addFile,
        deleteFile,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider')
  }
  return context
}
