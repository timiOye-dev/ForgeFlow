export const PROJECT_CATEGORIES = Object.freeze([
  'Web Application',
  'Mobile App',
  'Brand Identity',
  'API Integration',
  'Design System',
])

export const PROJECT_STATUSES = Object.freeze([
  'Planned',
  'In Progress',
  'In Review',
  'Completed',
])

export const PROJECT_PRIORITIES = Object.freeze(['High', 'Medium', 'Low'])

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export function isValidDeadline(value) {
  if (value === '') return true
  if (typeof value !== 'string') return false
  if (!ISO_DATE_PATTERN.test(value)) return false

  const [year, month, day] = value.split('-').map(Number)

  if (year === 0) return false
  if (month < 1 || month > 12) return false

  const maxDay = month === 2 && isLeapYear(year) ? 29 : DAYS_IN_MONTH[month - 1]

  return day >= 1 && day <= maxDay
}

function isValidColor(value) {
  return typeof value === 'string' && HEX_COLOR_PATTERN.test(value.trim())
}

function allowedValue(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback
}

function asString(value) {
  return String(value ?? '').trim()
}

export function getProjectFormValues(project) {
  return {
    name: project?.name ?? '',
    client: project?.client ?? '',
    description: project?.description ?? '',
    category: allowedValue(
      project?.category,
      PROJECT_CATEGORIES,
      PROJECT_CATEGORIES[0]
    ),
    status: allowedValue(project?.status, PROJECT_STATUSES, 'In Progress'),
    priority: allowedValue(project?.priority, PROJECT_PRIORITIES, 'Medium'),
    budget: project?.budget ?? '',
    deadline: isValidDeadline(project?.deadline) ? project.deadline : '',
    color: isValidColor(project?.color) ? project.color : '#6366f1',
  }
}

export function validateProjectForm(values) {
  const errors = {}

  if (!asString(values?.name)) {
    errors.name = 'Project name is required.'
  }

  if (!PROJECT_CATEGORIES.includes(values?.category)) {
    errors.category = 'Select a valid project category.'
  }

  if (!PROJECT_STATUSES.includes(values?.status)) {
    errors.status = 'Select a valid project status.'
  }

  if (!PROJECT_PRIORITIES.includes(values?.priority)) {
    errors.priority = 'Select a valid project priority.'
  }

  if (!isValidDeadline(values?.deadline)) {
    errors.deadline = 'Enter a valid deadline date.'
  }

  if (!isValidColor(values?.color)) {
    errors.color = 'Select a valid project color.'
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
  }
}

export function normalizeProjectForm(values) {
  return {
    name: asString(values?.name),
    client: asString(values?.client),
    description: asString(values?.description),
    category: values?.category,
    status: values?.status,
    priority: values?.priority,
    budget: asString(values?.budget),
    deadline: asString(values?.deadline),
    color: asString(values?.color),
  }
}

export function applyProjectUpdate(projects, id, updatedFields) {
  if (!Array.isArray(projects)) {
    return {
      success: false,
      error: {
        code: 'INVALID_PROJECT_LIST',
        message: 'Project data could not be loaded.',
      },
    }
  }

  const index = projects.findIndex((project) => project?.id === id)

  if (index === -1) {
    return {
      success: false,
      error: {
        code: 'PROJECT_NOT_FOUND',
        message: 'This project no longer exists.',
      },
    }
  }

  const merged = { ...projects[index], ...updatedFields }
  const validation = validateProjectForm(merged)

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

  const normalized = normalizeProjectForm(merged)
  const nextProjects = projects.map((project, projectIndex) =>
    projectIndex === index ? { ...project, ...normalized } : project
  )

  return {
    success: true,
    projects: nextProjects,
    project: nextProjects[index],
  }
}
