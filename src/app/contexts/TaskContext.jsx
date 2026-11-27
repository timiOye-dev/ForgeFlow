import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { INITIAL_TASKS } from '../../mocks/initialData'
import { applyTaskUpdate, getNextTaskStatus } from '../../shared/utils/taskForm'
import { useProjects } from './ProjectContext'

const TaskContext = createContext(null)

export const TaskProvider = ({ children }) => {
  const { projects } = useProjects()
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('forgeflow_tasks')
      if (!saved) return INITIAL_TASKS
      const parsed = JSON.parse(saved)
      return Array.isArray(parsed) ? parsed : INITIAL_TASKS
    } catch {
      return INITIAL_TASKS
    }
  })

  const tasksRef = useRef(tasks)

  const commitTasks = (nextOrUpdater) => {
    const nextTasks =
      typeof nextOrUpdater === 'function'
        ? nextOrUpdater(tasksRef.current)
        : nextOrUpdater

    tasksRef.current = nextTasks
    setTasks(nextTasks)

    return nextTasks
  }

  useEffect(() => {
    localStorage.setItem('forgeflow_tasks', JSON.stringify(tasks))
  }, [tasks])

  const addTask = (taskData) => {
    const newTask = {
      id: `task_${Date.now()}`,
      title: taskData.title,
      description: taskData.description || '',
      projectId: taskData.projectId,
      status: taskData.status || 'Todo',
      priority: taskData.priority || 'Medium',
      dueDate:
        taskData.dueDate ||
        new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      assignee: taskData.assignee || 'Timilehin Oye',
      estimatedHours: Number(taskData.estimatedHours || 0),
      loggedHours: Number(taskData.loggedHours || 0),
      createdAt: new Date().toISOString().split('T')[0],
    }
    commitTasks((prev) => [newTask, ...prev])
    return newTask
  }

  const updateTask = (id, updatedFields, options = {}) => {
    let result

    commitTasks((currentTasks) => {
      result = applyTaskUpdate(
        currentTasks,
        projects,
        id,
        updatedFields,
        options
      )
      return result.success ? result.tasks : currentTasks
    })

    return result
  }

  const deleteTask = (id) => {
    commitTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const toggleTaskStatus = (id) => {
    commitTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: getNextTaskStatus(t.status) } : t
      )
    )
  }

  const getTasksByProjectId = (projectId) => {
    return tasks.filter((t) => t.projectId === projectId)
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        getTasksByProjectId,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider')
  }
  return context
}
