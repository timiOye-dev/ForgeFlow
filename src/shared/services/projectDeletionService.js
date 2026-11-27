export const PROJECT_STORAGE_KEY = 'forgeflow_projects'
export const TASK_STORAGE_KEY = 'forgeflow_tasks'

const browserStorageAdapter = {
  getItem: (key) => globalThis.localStorage.getItem(key),
  setItem: (key, value) => globalThis.localStorage.setItem(key, value),
  removeItem: (key) => globalThis.localStorage.removeItem(key),
}

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function asOptionValue(value) {
  return typeof value === 'string' ? value : String(value ?? '')
}

function failure(code, message, details = {}) {
  return {
    success: false,
    error: { code, message },
    ...details,
  }
}

export function getProjectTaskCount(tasks, projectId) {
  const id = asOptionValue(projectId)

  if (id === '') return 0

  return asArray(tasks).filter((task) => asOptionValue(task?.projectId) === id)
    .length
}

export function removeTasksForProject(tasks, projectId) {
  const id = asOptionValue(projectId)

  if (id === '') return asArray(tasks)

  return asArray(tasks).filter((task) => asOptionValue(task?.projectId) !== id)
}

export function removeProjectById(projects, projectId) {
  const id = asOptionValue(projectId)

  if (id === '') return asArray(projects)

  return asArray(projects).filter(
    (project) => asOptionValue(project?.id) !== id
  )
}

function restoreStorageValue(storage, key, originalValue) {
  if (originalValue === null) {
    storage.removeItem(key)
    return
  }

  storage.setItem(key, originalValue)
}

export function createProjectDeletionService({
  storage = browserStorageAdapter,
} = {}) {
  const deleteProjectCascade = ({
    projects,
    tasks,
    projectId,
    publishDeletionState,
  }) => {
    if (typeof publishDeletionState !== 'function') {
      return failure(
        'INVALID_PUBLICATION_CALLBACK',
        'Project deletion could not be initialized.'
      )
    }

    let originalValues

    try {
      originalValues = {
        [PROJECT_STORAGE_KEY]: storage.getItem(PROJECT_STORAGE_KEY),
        [TASK_STORAGE_KEY]: storage.getItem(TASK_STORAGE_KEY),
      }
    } catch (error) {
      return failure(
        'STORAGE_READ_FAILED',
        'Workspace data could not be read.',
        {
          cause: error?.message,
        }
      )
    }

    const nextProjects = removeProjectById(projects, projectId)
    const nextTasks = removeTasksForProject(tasks, projectId)
    const removedTaskCount = getProjectTaskCount(tasks, projectId)

    let serializedProjects
    let serializedTasks

    try {
      serializedProjects = JSON.stringify(nextProjects)
      serializedTasks = JSON.stringify(nextTasks)
    } catch (error) {
      return failure(
        'SERIALIZATION_FAILED',
        'Workspace data could not be saved.',
        { cause: error?.message }
      )
    }

    try {
      storage.setItem(TASK_STORAGE_KEY, serializedTasks)
    } catch (error) {
      return failure(
        'TASK_WRITE_FAILED',
        'Associated tasks could not be deleted.',
        {
          storageCommitted: false,
          statePublication: 'not_attempted',
          cause: error?.message,
        }
      )
    }

    try {
      storage.setItem(PROJECT_STORAGE_KEY, serializedProjects)
    } catch (error) {
      let rollbackSucceeded = false

      try {
        restoreStorageValue(
          storage,
          TASK_STORAGE_KEY,
          originalValues[TASK_STORAGE_KEY]
        )

        if (
          storage.getItem(PROJECT_STORAGE_KEY) !==
          originalValues[PROJECT_STORAGE_KEY]
        ) {
          restoreStorageValue(
            storage,
            PROJECT_STORAGE_KEY,
            originalValues[PROJECT_STORAGE_KEY]
          )
        }

        rollbackSucceeded = true
      } catch {
        // Keep the failure result; best-effort rollback did not complete.
      }

      return failure(
        'PROJECT_WRITE_FAILED',
        rollbackSucceeded
          ? 'Project deletion failed. Workspace data was restored.'
          : 'Project deletion failed. Workspace data may be inconsistent; reload before retrying.',
        {
          storageCommitted: false,
          rollbackSucceeded,
          statePublication: 'not_attempted',
          cause: error?.message,
        }
      )
    }

    try {
      publishDeletionState(nextProjects, nextTasks)
    } catch (error) {
      let recovered = false

      try {
        publishDeletionState(nextProjects, nextTasks)
        recovered = true
      } catch {
        // Keep the failure result; the publication retry did not complete.
      }

      return failure(
        'STATE_PUBLICATION_FAILED',
        recovered
          ? 'Project deletion was saved but the interface did not update cleanly. Reload to confirm.'
          : 'Project deletion was saved but the interface could not be updated. Reload to confirm.',
        {
          storageCommitted: true,
          statePublication: recovered ? 'recovered' : 'partial',
          cause: error?.message,
        }
      )
    }

    return {
      success: true,
      removedTaskCount,
      projects: nextProjects,
      tasks: nextTasks,
    }
  }

  return { deleteProjectCascade }
}

export const projectDeletionService = createProjectDeletionService()
