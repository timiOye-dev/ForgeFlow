export const TASK_STATUSES = Object.freeze([
  'Todo',
  'In Progress',
  'In Review',
  'Done',
])

export const TASK_PRIORITIES = Object.freeze(['High', 'Medium', 'Low'])

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

const TASK_STATUS_CYCLE = Object.freeze({
  Todo: 'In Progress',
  'In Progress': 'In Review',
  'In Review': 'Done',
  Done: 'Todo',
})

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

function asString(value) {
  return String(value ?? '').trim()
}

function asOptionValue(value) {
  return typeof value === 'string' ? value : String(value ?? '')
}

function safeProjects(projects) {
  return Array.isArray(projects) ? projects : []
}

function isOriginalValue(value, originalValue) {
  return value === originalValue || value === asOptionValue(originalValue)
}

function projectExists(projects, projectId) {
  const id = asOptionValue(projectId)

  return (
    id !== '' &&
    safeProjects(projects).some((project) => asOptionValue(project?.id) === id)
  )
}

export function isValidTaskDueDate(value) {
  if (value === '') return true
  if (typeof value !== 'string') return false
  if (!ISO_DATE_PATTERN.test(value)) return false

  const [year, month, day] = value.split('-').map(Number)

  if (year === 0) return false
  if (month < 1 || month > 12) return false

  const maxDay = month === 2 && isLeapYear(year) ? 29 : DAYS_IN_MONTH[month - 1]

  return day >= 1 && day <= maxDay
}

export function getNextTaskStatus(status) {
  return TASK_STATUS_CYCLE[status] || 'Todo'
}

export function getTaskValidationContext(task, projects) {
  return {
    projects: safeProjects(projects),
    originalProjectId: task?.projectId,
    originalStatus: task?.status,
    originalPriority: task?.priority,
    originalDueDate: task?.dueDate,
  }
}

export function getTaskFormValues(task) {
  return {
    title: asString(task?.title),
    description: asString(task?.description),
    projectId: asOptionValue(task?.projectId),
    status: asOptionValue(task?.status),
    priority: asOptionValue(task?.priority),
    dueDate:
      typeof task?.dueDate === 'string' && isValidTaskDueDate(task.dueDate)
        ? task.dueDate
        : '',
  }
}

export function getTaskProjectOptions(task, projects) {
  const availableProjects = safeProjects(projects)
  const options = availableProjects.map((project) => ({
    value: asOptionValue(project?.id),
    label: `${project?.name ?? 'Unnamed project'} (${project?.client ?? 'No client'})`,
  }))

  const originalProjectId = task?.projectId
  const originalValue = asOptionValue(originalProjectId)

  if (projectExists(availableProjects, originalValue)) {
    return options
  }

  if (
    originalValue === '' &&
    (originalProjectId === undefined ||
      originalProjectId === null ||
      originalProjectId === '')
  ) {
    return [{ value: '', label: 'No project assigned (missing)' }, ...options]
  }

  return [
    { value: originalValue, label: `Missing project: ${originalValue}` },
    ...options,
  ]
}

export function getTaskStatusOptions(task) {
  const originalValue = asOptionValue(task?.status)
  const options = TASK_STATUSES.map((status) => ({
    value: status,
    label: status,
  }))

  if (TASK_STATUSES.includes(originalValue)) {
    return options
  }

  return [
    {
      value: originalValue,
      label:
        originalValue === ''
          ? 'Legacy status: (none)'
          : `Legacy status: ${originalValue}`,
    },
    ...options,
  ]
}

export function getTaskPriorityOptions(task) {
  const originalValue = asOptionValue(task?.priority)
  const options = TASK_PRIORITIES.map((priority) => ({
    value: priority,
    label: priority,
  }))

  if (TASK_PRIORITIES.includes(originalValue)) {
    return options
  }

  return [
    {
      value: originalValue,
      label:
        originalValue === ''
          ? 'Legacy priority: (none)'
          : `Legacy priority: ${originalValue}`,
    },
    ...options,
  ]
}

function resolveLegacyValue(formValue, originalValue, isValidValue) {
  if (isValidValue(formValue)) return formValue
  if (isOriginalValue(formValue, originalValue)) return originalValue
  return formValue
}

function resolveDueDateValue(inputState, originalDueDate) {
  if (!inputState?.touched) return originalDueDate
  return inputState.value ?? ''
}

export function resolveTaskFormValues(formData, context, interaction = {}) {
  const projects = safeProjects(context?.projects)

  return {
    title: asString(formData?.title),
    description: asString(formData?.description),
    projectId: resolveLegacyValue(
      formData?.projectId,
      context?.originalProjectId,
      (value) => projectExists(projects, value)
    ),
    status: resolveLegacyValue(
      formData?.status,
      context?.originalStatus,
      (value) => TASK_STATUSES.includes(value)
    ),
    priority: resolveLegacyValue(
      formData?.priority,
      context?.originalPriority,
      (value) => TASK_PRIORITIES.includes(value)
    ),
    dueDate: resolveDueDateValue(
      {
        touched: interaction?.dueDateTouched,
        badInput: interaction?.dueDateBadInput,
        value: formData?.dueDate,
      },
      context?.originalDueDate
    ),
  }
}

export function validateTaskForm(values, context = {}) {
  const errors = {}
  const projects = safeProjects(context.projects)

  const hasExistingProject = projectExists(projects, values?.projectId)
  const isUnchangedProject = isOriginalValue(
    values?.projectId,
    context.originalProjectId
  )

  if (!asString(values?.title)) {
    errors.title = 'Task title is required.'
  }

  if (!hasExistingProject && !isUnchangedProject) {
    errors.projectId = 'Select a valid project.'
  }

  if (
    !TASK_STATUSES.includes(values?.status) &&
    !isOriginalValue(values?.status, context.originalStatus)
  ) {
    errors.status = 'Select a valid task status.'
  }

  if (
    !TASK_PRIORITIES.includes(values?.priority) &&
    !isOriginalValue(values?.priority, context.originalPriority)
  ) {
    errors.priority = 'Select a valid task priority.'
  }

  const isUnchangedDueDate =
    context.dueDateTouched === false &&
    isOriginalValue(values?.dueDate, context.originalDueDate)

  if (context.dueDateBadInput) {
    errors.dueDate = 'Enter a valid due date.'
  } else if (!isValidTaskDueDate(values?.dueDate) && !isUnchangedDueDate) {
    errors.dueDate = 'Enter a valid due date.'
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
  }
}

const CREATE_ORIGINAL_VALUE = '__forgeflow_create_task__'

export function resolveCreateTaskProjectId(defaultProjectId, projects) {
  if (projectExists(projects, defaultProjectId)) {
    return asOptionValue(defaultProjectId)
  }

  const firstProjectId = asOptionValue(safeProjects(projects)[0]?.id)

  return projectExists(projects, firstProjectId) ? firstProjectId : ''
}

export function getCreateTaskFormValues(defaultProjectId, projects) {
  return {
    title: '',
    description: '',
    projectId: resolveCreateTaskProjectId(defaultProjectId, projects),
    priority: 'Medium',
    status: 'Todo',
    dueDate: '',
    estimatedHours: '4',
    loggedHours: '0',
  }
}

export function getCreateTaskValidationContext(projects) {
  return {
    projects: safeProjects(projects),
    originalProjectId: CREATE_ORIGINAL_VALUE,
    originalStatus: CREATE_ORIGINAL_VALUE,
    originalPriority: CREATE_ORIGINAL_VALUE,
    originalDueDate: CREATE_ORIGINAL_VALUE,
    dueDateTouched: true,
    dueDateBadInput: false,
  }
}

export function validateCreateTaskInput(values, projects) {
  return validateTaskForm(values, getCreateTaskValidationContext(projects))
}

export function reconcileCreateTaskForm(
  currentForm,
  {
    defaultProjectId = '',
    projects,
    sessionStart = false,
    defaultProjectIdChanged = false,
  } = {}
) {
  if (sessionStart) {
    return getCreateTaskFormValues(defaultProjectId, projects)
  }

  const form = currentForm ?? {}
  const availableProjects = safeProjects(projects)
  const shouldResolveProject =
    defaultProjectIdChanged || !projectExists(availableProjects, form.projectId)

  if (!shouldResolveProject) {
    return form
  }

  const resolvedProjectId = resolveCreateTaskProjectId(
    defaultProjectId,
    availableProjects
  )

  if (resolvedProjectId === asOptionValue(form.projectId)) {
    return form
  }

  return { ...form, projectId: resolvedProjectId }
}

export function applyTaskCreate(tasks, projects, newTask) {
  if (!Array.isArray(tasks)) {
    return {
      success: false,
      error: {
        code: 'INVALID_TASK_LIST',
        message: 'Task data could not be loaded.',
      },
    }
  }

  const validation = validateCreateTaskInput(newTask, projects)

  if (!validation.success) {
    const [message] = Object.values(validation.errors)

    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message,
        errors: validation.errors,
      },
    }
  }

  return {
    success: true,
    tasks: [newTask, ...tasks],
    task: newTask,
  }
}

export function normalizeTaskForm(values) {
  return {
    title: asString(values?.title),
    description: asString(values?.description),
    projectId: values?.projectId,
    status: values?.status,
    priority: values?.priority,
    dueDate: values?.dueDate,
  }
}

export function applyTaskUpdate(
  tasks,
  projects,
  id,
  updatedFields,
  options = {}
) {
  if (!Array.isArray(tasks)) {
    return {
      success: false,
      error: {
        code: 'INVALID_TASK_LIST',
        message: 'Task data could not be loaded.',
      },
    }
  }

  const index = tasks.findIndex((task) => task?.id === id)

  if (index === -1) {
    return {
      success: false,
      error: {
        code: 'TASK_NOT_FOUND',
        message: 'This task no longer exists.',
      },
    }
  }

  const storedTask = tasks[index]
  const context = getTaskValidationContext(storedTask, projects)
  context.dueDateTouched = Boolean(options?.dueDateTouched)
  context.dueDateBadInput = Boolean(options?.dueDateBadInput)

  const mergeFields = { ...updatedFields }

  if (!context.dueDateTouched) {
    mergeFields.dueDate = storedTask.dueDate
  }

  const merged = { ...storedTask, ...mergeFields }
  const validation = validateTaskForm(merged, context)

  if (!validation.success) {
    const [message] = Object.values(validation.errors)

    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message,
        errors: validation.errors,
      },
    }
  }

  const normalized = normalizeTaskForm(merged)
  const nextTasks = tasks.map((task, taskIndex) =>
    taskIndex === index ? { ...task, ...normalized } : task
  )

  return {
    success: true,
    tasks: nextTasks,
    task: nextTasks[index],
  }
}
