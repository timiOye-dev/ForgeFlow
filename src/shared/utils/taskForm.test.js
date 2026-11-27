import assert from 'node:assert/strict'
import test from 'node:test'

import { INITIAL_TASKS } from '../../mocks/initialData.js'
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  applyTaskCreate,
  applyTaskUpdate,
  getCreateTaskFormValues,
  getNextTaskStatus,
  getTaskFormValues,
  getTaskPriorityOptions,
  getTaskProjectOptions,
  getTaskStatusOptions,
  getTaskValidationContext,
  isValidTaskDueDate,
  normalizeTaskForm,
  reconcileCreateTaskForm,
  resolveCreateTaskProjectId,
  resolveTaskFormValues,
  validateCreateTaskInput,
  validateTaskForm,
} from './taskForm.js'

const clone = (value) => JSON.parse(JSON.stringify(value))

const makeProject = (overrides = {}) => ({
  id: 'proj_1',
  name: 'Alpha Project',
  client: 'Acme Corp',
  ...overrides,
})

const makeTask = (overrides = {}) => ({
  id: 'task_1',
  title: 'Original task',
  description: 'Original description',
  projectId: 'proj_1',
  status: 'Todo',
  priority: 'Medium',
  dueDate: '2026-12-31',
  assignee: 'Timilehin Oye',
  estimatedHours: 4,
  loggedHours: 1,
  createdAt: '2026-01-01',
  ...overrides,
})

const projects = [
  makeProject(),
  makeProject({ id: 'proj_2', name: 'Beta Project', client: 'Beta Co' }),
]

test('task status and priority constants match the current task UI and seed data', () => {
  assert.deepEqual(TASK_STATUSES, ['Todo', 'In Progress', 'In Review', 'Done'])
  assert.deepEqual(TASK_PRIORITIES, ['High', 'Medium', 'Low'])

  for (const task of INITIAL_TASKS) {
    assert.equal(TASK_STATUSES.includes(task.status), true)
    assert.equal(TASK_PRIORITIES.includes(task.priority), true)
  }
})

test('getNextTaskStatus preserves the existing status cycle and fallback', () => {
  assert.equal(getNextTaskStatus('Todo'), 'In Progress')
  assert.equal(getNextTaskStatus('In Progress'), 'In Review')
  assert.equal(getNextTaskStatus('In Review'), 'Done')
  assert.equal(getNextTaskStatus('Done'), 'Todo')
  assert.equal(getNextTaskStatus('Blocked'), 'Todo')
})

test('isValidTaskDueDate validates ISO dates and rejects malformed values', () => {
  assert.equal(isValidTaskDueDate(''), true)
  assert.equal(isValidTaskDueDate('2026-02-28'), true)
  assert.equal(isValidTaskDueDate('2024-02-29'), true)
  assert.equal(isValidTaskDueDate('2026-02-30'), false)
  assert.equal(isValidTaskDueDate('2026-13-01'), false)
  assert.equal(isValidTaskDueDate('13/02/2026'), false)
  assert.equal(isValidTaskDueDate(20260228), false)
})

test('getTaskFormValues preserves legacy strings and blanks malformed due dates', () => {
  const task = makeTask({
    title: '  Renamed  ',
    description: '  Updated description  ',
    status: 'Blocked',
    priority: 'Urgent',
    dueDate: '13/02/2026',
  })

  assert.deepEqual(getTaskFormValues(task), {
    title: 'Renamed',
    description: 'Updated description',
    projectId: 'proj_1',
    status: 'Blocked',
    priority: 'Urgent',
    dueDate: '',
  })
})

test('project options include current projects and an edit-only missing project', () => {
  assert.deepEqual(
    getTaskProjectOptions(makeTask(), projects).map((option) => option.value),
    ['proj_1', 'proj_2']
  )

  const missing = getTaskProjectOptions(
    makeTask({ projectId: 'proj_deleted' }),
    projects
  )

  assert.equal(missing[0].value, 'proj_deleted')
  assert.match(missing[0].label, /Missing project: proj_deleted/)
})

test('status and priority options include edit-only legacy values', () => {
  const task = makeTask({ status: 'Blocked', priority: 'Urgent' })

  assert.equal(getTaskStatusOptions(task)[0].label, 'Legacy status: Blocked')
  assert.equal(getTaskPriorityOptions(task)[0].label, 'Legacy priority: Urgent')
})

test('legacy select values are preserved exactly instead of being trimmed', () => {
  const task = makeTask({ status: ' Todo ', priority: ' Medium ' })
  const context = getTaskValidationContext(task, projects)
  const formValues = getTaskFormValues(task)

  assert.equal(formValues.status, ' Todo ')
  assert.equal(formValues.priority, ' Medium ')

  const resolved = resolveTaskFormValues(formValues, context)

  assert.equal(resolved.status, ' Todo ')
  assert.equal(resolved.priority, ' Medium ')
  assert.equal(
    validateTaskForm(resolved, { ...context, dueDateTouched: false }).success,
    true
  )

  const projectTask = makeTask({ projectId: ' proj_1 ' })
  const projectContext = getTaskValidationContext(projectTask, projects)
  const projectValues = getTaskFormValues(projectTask)

  assert.equal(projectValues.projectId, ' proj_1 ')
  assert.equal(
    getTaskProjectOptions(projectTask, projects)[0].label,
    'Missing project:  proj_1 '
  )
  assert.equal(
    validateTaskForm(resolveTaskFormValues(projectValues, projectContext), {
      ...projectContext,
      dueDateTouched: false,
    }).success,
    true
  )
})

test('validateTaskForm rejects missing title, invalid project, status, priority, and date', () => {
  const task = makeTask()
  const context = getTaskValidationContext(task, projects)
  const values = getTaskFormValues(task)

  assert.equal(validateTaskForm(values, context).success, true)

  assert.equal(
    validateTaskForm({ ...values, title: '  ' }, context).errors.title,
    'Task title is required.'
  )
  assert.equal(
    validateTaskForm({ ...values, projectId: 'proj_unknown' }, context).errors
      .projectId,
    'Select a valid project.'
  )
  assert.equal(
    validateTaskForm({ ...values, status: 'Blocked' }, context).errors.status,
    'Select a valid task status.'
  )
  assert.equal(
    validateTaskForm({ ...values, priority: 'Urgent' }, context).errors
      .priority,
    'Select a valid task priority.'
  )
  assert.equal(
    validateTaskForm({ ...values, dueDate: '2026-02-30' }, context).errors
      .dueDate,
    'Enter a valid due date.'
  )
})

test('normalizeTaskForm returns only editable fields', () => {
  const normalized = normalizeTaskForm(
    makeTask({
      id: 'task_hacked',
      assignee: 'Someone Else',
      estimatedHours: 99,
      loggedHours: 99,
      createdAt: '2000-01-01',
      dueDateTouched: true,
    })
  )

  assert.deepEqual(Object.keys(normalized), [
    'title',
    'description',
    'projectId',
    'status',
    'priority',
    'dueDate',
  ])
  assert.equal('assignee' in normalized, false)
  assert.equal('dueDateTouched' in normalized, false)
})

test('resolveTaskFormValues preserves an untouched malformed due date', () => {
  const task = makeTask({ dueDate: 'bad-date' })
  const context = getTaskValidationContext(task, projects)
  const formData = getTaskFormValues(task)

  const resolved = resolveTaskFormValues(formData, context, {
    dueDateTouched: false,
    dueDateBadInput: false,
  })

  assert.equal(resolved.dueDate, 'bad-date')
  assert.equal(
    validateTaskForm(resolved, { ...context, dueDateTouched: false }).success,
    true
  )
})

test('resolveTaskFormValues saves a newly selected valid date', () => {
  const task = makeTask({ dueDate: 'bad-date' })
  const context = getTaskValidationContext(task, projects)
  const formData = {
    ...getTaskFormValues(task),
    dueDate: '2026-10-01',
  }

  const resolved = resolveTaskFormValues(formData, context, {
    dueDateTouched: true,
    dueDateBadInput: false,
  })

  assert.equal(resolved.dueDate, '2026-10-01')
  assert.equal(
    validateTaskForm(resolved, { ...context, dueDateTouched: true }).success,
    true
  )
})

test('resolveTaskFormValues clears a previously valid date when explicitly cleared', () => {
  const task = makeTask({ dueDate: '2026-12-31' })
  const context = getTaskValidationContext(task, projects)

  const resolved = resolveTaskFormValues(
    { ...getTaskFormValues(task), dueDate: '' },
    context,
    {
      dueDateTouched: true,
      dueDateBadInput: false,
    }
  )

  assert.equal(resolved.dueDate, '')
  assert.equal(
    validateTaskForm(resolved, { ...context, dueDateTouched: true }).success,
    true
  )
})

test('resolveTaskFormValues clears a previously malformed date when explicitly cleared', () => {
  const task = makeTask({ dueDate: 'bad-date' })
  const context = getTaskValidationContext(task, projects)

  const resolved = resolveTaskFormValues(getTaskFormValues(task), context, {
    dueDateTouched: true,
    dueDateBadInput: false,
  })

  assert.equal(resolved.dueDate, '')
  assert.equal(
    validateTaskForm(resolved, { ...context, dueDateTouched: true }).success,
    true
  )
})

test('resolveTaskFormValues rejects invalid date input without restoring the original', () => {
  const task = makeTask({ dueDate: 'bad-date' })
  const context = getTaskValidationContext(task, projects)
  const formData = { ...getTaskFormValues(task), dueDate: '' }

  const badInput = resolveTaskFormValues(formData, context, {
    dueDateTouched: true,
    dueDateBadInput: true,
  })
  const invalidValue = resolveTaskFormValues(
    { ...formData, dueDate: '2026-02-30' },
    context,
    { dueDateTouched: true, dueDateBadInput: false }
  )

  assert.equal(badInput.dueDate, '')
  assert.equal(
    validateTaskForm(badInput, {
      ...context,
      dueDateTouched: true,
      dueDateBadInput: true,
    }).errors.dueDate,
    'Enter a valid due date.'
  )
  assert.equal(
    validateTaskForm(invalidValue, { ...context, dueDateTouched: true }).errors
      .dueDate,
    'Enter a valid due date.'
  )
})

test('applyTaskUpdate preserves protected fields and does not mutate stored tasks', () => {
  const storedTask = makeTask()
  const tasks = [storedTask]
  const originalTasks = clone(tasks)
  const updatedFields = normalizeTaskForm({
    ...getTaskFormValues(storedTask),
    title: 'Renamed task',
  })

  const result = applyTaskUpdate(tasks, projects, 'task_1', updatedFields)

  assert.equal(result.success, true)
  assert.equal(result.task.id, 'task_1')
  assert.equal(result.task.title, 'Renamed task')
  assert.equal(result.task.assignee, 'Timilehin Oye')
  assert.equal(result.task.estimatedHours, 4)
  assert.equal(result.task.loggedHours, 1)
  assert.equal(result.task.createdAt, '2026-01-01')
  assert.notEqual(result.tasks, tasks)
  assert.notEqual(result.task, storedTask)
  assert.deepEqual(tasks, originalTasks)
})

test('applyTaskUpdate ignores caller-supplied protected fields', () => {
  const storedTask = makeTask()
  const result = applyTaskUpdate(
    [storedTask],
    projects,
    'task_1',
    normalizeTaskForm({
      ...getTaskFormValues(storedTask),
      id: 'task_hacked',
      assignee: 'Someone Else',
      estimatedHours: 99,
      loggedHours: 99,
      createdAt: '2000-01-01',
      dueDateTouched: true,
      dueDateBadInput: true,
    })
  )

  assert.equal(result.success, true)
  assert.equal(result.task.id, 'task_1')
  assert.equal(result.task.assignee, 'Timilehin Oye')
  assert.equal(result.task.estimatedHours, 4)
  assert.equal(result.task.loggedHours, 1)
  assert.equal(result.task.createdAt, '2026-01-01')
  assert.equal('dueDateTouched' in result.task, false)
  assert.equal('dueDateBadInput' in result.task, false)
})

test('applyTaskUpdate derives legacy validation context from the stored task', () => {
  const storedTask = makeTask({
    projectId: 'proj_deleted',
    status: 'Blocked',
    priority: 'Urgent',
    dueDate: 'bad-date',
  })

  const result = applyTaskUpdate(
    [storedTask],
    projects,
    'task_1',
    normalizeTaskForm({
      ...getTaskFormValues(storedTask),
      originalProjectId: 'proj_1',
      originalStatus: 'Todo',
      originalPriority: 'Medium',
      originalDueDate: '2026-12-31',
    })
  )

  assert.equal(result.success, true)
  assert.equal(result.task.projectId, 'proj_deleted')
  assert.equal(result.task.status, 'Blocked')
  assert.equal(result.task.priority, 'Urgent')
  assert.equal(result.task.dueDate, 'bad-date')
  assert.equal('originalProjectId' in result.task, false)
  assert.equal('originalStatus' in result.task, false)
  assert.equal('originalPriority' in result.task, false)
  assert.equal('originalDueDate' in result.task, false)
})

test('applyTaskUpdate preserves an unchanged missing project but rejects a new missing project', () => {
  const storedTask = makeTask({ projectId: 'proj_deleted' })
  const baseFields = normalizeTaskForm(getTaskFormValues(storedTask))

  const unchanged = applyTaskUpdate(
    [storedTask],
    projects,
    'task_1',
    baseFields
  )
  const newMissing = applyTaskUpdate([storedTask], projects, 'task_1', {
    ...baseFields,
    projectId: 'proj_another_missing',
  })
  const reassigned = applyTaskUpdate([storedTask], projects, 'task_1', {
    ...baseFields,
    projectId: 'proj_2',
  })

  assert.equal(unchanged.success, true)
  assert.equal(unchanged.task.projectId, 'proj_deleted')
  assert.equal(newMissing.success, false)
  assert.equal(newMissing.error.code, 'VALIDATION_ERROR')
  assert.equal(reassigned.success, true)
  assert.equal(reassigned.task.projectId, 'proj_2')
})

test('applyTaskUpdate preserves unchanged legacy status and priority but accepts valid replacements', () => {
  const storedTask = makeTask({ status: 'Blocked', priority: 'Urgent' })
  const baseFields = normalizeTaskForm(getTaskFormValues(storedTask))

  const unchanged = applyTaskUpdate(
    [storedTask],
    projects,
    'task_1',
    baseFields
  )
  const replaced = applyTaskUpdate([storedTask], projects, 'task_1', {
    ...baseFields,
    status: 'Done',
    priority: 'Low',
  })
  const rejected = applyTaskUpdate([storedTask], projects, 'task_1', {
    ...baseFields,
    status: 'Weird',
  })

  assert.equal(unchanged.success, true)
  assert.equal(unchanged.task.status, 'Blocked')
  assert.equal(unchanged.task.priority, 'Urgent')
  assert.equal(replaced.success, true)
  assert.equal(replaced.task.status, 'Done')
  assert.equal(replaced.task.priority, 'Low')
  assert.equal(rejected.success, false)
})

test('applyTaskUpdate preserves an untouched malformed due date while saving another field', () => {
  const storedTask = makeTask({ dueDate: 'bad-date' })
  const result = applyTaskUpdate(
    [storedTask],
    projects,
    'task_1',
    normalizeTaskForm({
      ...getTaskFormValues(storedTask),
      title: 'Renamed task',
    }),
    { dueDateTouched: false, dueDateBadInput: false }
  )

  assert.equal(result.success, true)
  assert.equal(result.task.title, 'Renamed task')
  assert.equal(result.task.dueDate, 'bad-date')
})

test('applyTaskUpdate saves an explicit clear and rejects bad date input', () => {
  const storedTask = makeTask({ dueDate: '2026-12-31' })
  const baseFields = normalizeTaskForm({
    ...getTaskFormValues(storedTask),
    dueDate: '',
  })

  const cleared = applyTaskUpdate(
    [storedTask],
    projects,
    'task_1',
    baseFields,
    { dueDateTouched: true, dueDateBadInput: false }
  )
  const badInput = applyTaskUpdate(
    [storedTask],
    projects,
    'task_1',
    baseFields,
    { dueDateTouched: true, dueDateBadInput: true }
  )

  assert.equal(cleared.success, true)
  assert.equal(cleared.task.dueDate, '')
  assert.equal(badInput.success, false)
  assert.equal(badInput.error.errors.dueDate, 'Enter a valid due date.')
})

test('applyTaskUpdate reports invalid task data and missing tasks', () => {
  const invalidList = applyTaskUpdate(null, projects, 'task_1', {})
  const missingTask = applyTaskUpdate(
    [makeTask()],
    projects,
    'task_missing',
    {}
  )

  assert.equal(invalidList.success, false)
  assert.equal(invalidList.error.code, 'INVALID_TASK_LIST')
  assert.equal(missingTask.success, false)
  assert.equal(missingTask.error.code, 'TASK_NOT_FOUND')
})

test('create form values use the intended project and fall back safely', () => {
  assert.deepEqual(getCreateTaskFormValues('proj_2', projects), {
    title: '',
    description: '',
    projectId: 'proj_2',
    priority: 'Medium',
    status: 'Todo',
    dueDate: '',
    estimatedHours: '4',
    loggedHours: '0',
  })

  assert.equal(resolveCreateTaskProjectId('proj_deleted', projects), 'proj_1')
  assert.equal(resolveCreateTaskProjectId('', projects), 'proj_1')
  assert.equal(resolveCreateTaskProjectId('proj_2', []), '')
  assert.equal(getCreateTaskFormValues('proj_1', []).projectId, '')
})

test('create form reconciliation preserves unrelated form input', () => {
  const currentForm = {
    title: 'Draft title',
    description: 'Draft description',
    projectId: 'proj_1',
    priority: 'High',
    status: 'In Review',
    dueDate: '2026-11-01',
    estimatedHours: '8',
    loggedHours: '2',
  }

  assert.deepEqual(
    reconcileCreateTaskForm(currentForm, {
      defaultProjectId: 'proj_2',
      projects,
      sessionStart: true,
    }),
    getCreateTaskFormValues('proj_2', projects)
  )

  const defaultChanged = reconcileCreateTaskForm(currentForm, {
    defaultProjectId: 'proj_2',
    projects,
    defaultProjectIdChanged: true,
  })

  assert.equal(defaultChanged.projectId, 'proj_2')
  assert.equal(defaultChanged.title, 'Draft title')
  assert.equal(defaultChanged.description, 'Draft description')
  assert.equal(defaultChanged.priority, 'High')
  assert.equal(defaultChanged.status, 'In Review')
  assert.equal(defaultChanged.dueDate, '2026-11-01')

  const remainingProjects = [projects[1]]
  const selectedDeleted = reconcileCreateTaskForm(currentForm, {
    defaultProjectId: 'proj_1',
    projects: remainingProjects,
  })

  assert.equal(selectedDeleted.projectId, 'proj_2')
  assert.equal(selectedDeleted.title, 'Draft title')
  assert.equal(selectedDeleted.estimatedHours, '8')

  const renamedProjects = [{ ...projects[0], name: 'Renamed' }, projects[1]]
  assert.equal(
    reconcileCreateTaskForm(currentForm, {
      defaultProjectId: 'proj_1',
      projects: renamedProjects,
    }),
    currentForm
  )

  const noProjects = reconcileCreateTaskForm(currentForm, {
    defaultProjectId: 'proj_1',
    projects: [],
  })

  assert.equal(noProjects.projectId, '')
  assert.equal(noProjects.title, 'Draft title')
})

test('create validation complements the existing task validation rules', () => {
  assert.equal(validateCreateTaskInput(makeTask(), projects).success, true)
  assert.equal(
    validateCreateTaskInput({ ...makeTask(), title: '  ' }, projects).errors
      .title,
    'Task title is required.'
  )
  assert.equal(
    validateCreateTaskInput(
      { ...makeTask(), projectId: 'proj_deleted' },
      projects
    ).errors.projectId,
    'Select a valid project.'
  )
  assert.equal(
    validateCreateTaskInput({ ...makeTask(), projectId: '' }, projects).errors
      .projectId,
    'Select a valid project.'
  )
  assert.equal(
    validateCreateTaskInput({ ...makeTask(), status: 'Blocked' }, projects)
      .errors.status,
    'Select a valid task status.'
  )
  assert.equal(
    validateCreateTaskInput({ ...makeTask(), priority: 'Urgent' }, projects)
      .errors.priority,
    'Select a valid task priority.'
  )
  assert.equal(
    validateCreateTaskInput({ ...makeTask(), dueDate: '2026-02-30' }, projects)
      .errors.dueDate,
    'Enter a valid due date.'
  )
})

test('applyTaskCreate adds valid tasks and rejects invalid projects', () => {
  const tasks = [makeTask({ id: 'task_existing' })]
  const originalTasks = clone(tasks)
  const newTask = makeTask({ id: 'task_new', title: 'New task' })

  const created = applyTaskCreate(tasks, projects, newTask)

  assert.equal(created.success, true)
  assert.equal(created.tasks.length, 2)
  assert.equal(created.tasks[0], newTask)
  assert.notEqual(created.tasks, tasks)
  assert.deepEqual(tasks, originalTasks)

  const invalidProject = applyTaskCreate(tasks, projects, {
    ...newTask,
    projectId: 'proj_deleted',
  })
  const noProjects = applyTaskCreate(tasks, [], newTask)
  const invalidList = applyTaskCreate(null, projects, newTask)

  assert.equal(invalidProject.success, false)
  assert.equal(invalidProject.error.code, 'VALIDATION_ERROR')
  assert.equal(noProjects.success, false)
  assert.equal(invalidList.success, false)
  assert.equal(invalidList.error.code, 'INVALID_TASK_LIST')
  assert.deepEqual(tasks, originalTasks)
})
