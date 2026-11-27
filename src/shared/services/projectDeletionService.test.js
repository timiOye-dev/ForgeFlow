import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PROJECT_STORAGE_KEY,
  TASK_STORAGE_KEY,
  createProjectDeletionService,
  getProjectTaskCount,
  removeProjectById,
  removeTasksForProject,
} from './projectDeletionService.js'

const clone = (value) => JSON.parse(JSON.stringify(value))

function createMemoryStorage(initial = {}, failingWrites = new Set()) {
  const values = new Map()

  for (const [key, value] of Object.entries(initial)) {
    if (value !== null) values.set(key, String(value))
  }

  const writes = []
  const removals = []

  const shouldFail = (key) => {
    if (typeof failingWrites === 'function') {
      return failingWrites(key, writes.length)
    }

    return failingWrites.has(key)
  }

  return {
    writes,
    removals,
    getItem(key) {
      return values.has(key) ? values.get(key) : null
    },
    setItem(key, value) {
      writes.push([key, String(value)])

      if (shouldFail(key)) {
        throw new Error(`write failed: ${key}`)
      }

      values.set(key, String(value))
    },
    removeItem(key) {
      removals.push(key)
      values.delete(key)
    },
  }
}

const projects = [
  { id: 'proj_1', name: 'Alpha' },
  { id: 'proj_2', name: 'Beta' },
]

const tasks = [
  { id: 'task_1', projectId: 'proj_1' },
  { id: 'task_2', projectId: 'proj_1' },
  { id: 'task_3', projectId: 'proj_2' },
  { id: 'task_4', projectId: 'proj_deleted' },
]

test('getProjectTaskCount counts only tasks for the selected project', () => {
  assert.equal(getProjectTaskCount(tasks, 'proj_1'), 2)
  assert.equal(getProjectTaskCount(tasks, 'proj_2'), 1)
  assert.equal(getProjectTaskCount(tasks, 'proj_missing'), 0)
  assert.equal(getProjectTaskCount(tasks, ''), 0)
  assert.equal(getProjectTaskCount(null, 'proj_1'), 0)
})

test('cascade data helpers remove only the selected project and its tasks', () => {
  const originalProjects = clone(projects)
  const originalTasks = clone(tasks)

  const nextProjects = removeProjectById(projects, 'proj_1')
  const nextTasks = removeTasksForProject(tasks, 'proj_1')

  assert.deepEqual(nextProjects, [projects[1]])
  assert.deepEqual(nextTasks, [tasks[2], tasks[3]])
  assert.equal(
    nextTasks.some((task) => task.projectId === 'proj_deleted'),
    true
  )
  assert.notEqual(nextProjects, projects)
  assert.notEqual(nextTasks, tasks)
  assert.deepEqual(projects, originalProjects)
  assert.deepEqual(tasks, originalTasks)
})

test('successful cascade writes both keys before publishing state', () => {
  const storage = createMemoryStorage({
    [PROJECT_STORAGE_KEY]: JSON.stringify(projects),
    [TASK_STORAGE_KEY]: JSON.stringify(tasks),
  })
  const published = []
  const service = createProjectDeletionService({ storage })

  const result = service.deleteProjectCascade({
    projects,
    tasks,
    projectId: 'proj_1',
    publishDeletionState: (nextProjects, nextTasks) => {
      published.push({ nextProjects, nextTasks })
    },
  })

  assert.equal(result.success, true)
  assert.equal(result.removedTaskCount, 2)
  assert.deepEqual(JSON.parse(storage.getItem(PROJECT_STORAGE_KEY)), [
    projects[1],
  ])
  assert.deepEqual(JSON.parse(storage.getItem(TASK_STORAGE_KEY)), [
    tasks[2],
    tasks[3],
  ])
  assert.deepEqual(
    storage.writes.map(([key]) => key),
    [TASK_STORAGE_KEY, PROJECT_STORAGE_KEY]
  )
  assert.equal(published.length, 1)
  assert.deepEqual(published[0].nextProjects, result.projects)
  assert.deepEqual(published[0].nextTasks, result.tasks)
})

test('failure on the first storage write reports failure without publishing state', () => {
  const projectRaw = JSON.stringify(projects)
  const taskRaw = JSON.stringify(tasks)
  const storage = createMemoryStorage(
    {
      [PROJECT_STORAGE_KEY]: projectRaw,
      [TASK_STORAGE_KEY]: taskRaw,
    },
    new Set([TASK_STORAGE_KEY])
  )
  let publishCalls = 0
  const service = createProjectDeletionService({ storage })

  const result = service.deleteProjectCascade({
    projects,
    tasks,
    projectId: 'proj_1',
    publishDeletionState: () => {
      publishCalls += 1
    },
  })

  assert.equal(result.success, false)
  assert.equal(result.error.code, 'TASK_WRITE_FAILED')
  assert.equal(result.storageCommitted, false)
  assert.equal(result.statePublication, 'not_attempted')
  assert.equal(publishCalls, 0)
  assert.equal(storage.getItem(TASK_STORAGE_KEY), taskRaw)
  assert.equal(storage.getItem(PROJECT_STORAGE_KEY), projectRaw)
})

test('failure on the second write restores the exact original task string', () => {
  const projectRaw = '  original-projects-raw  '
  const taskRaw = '  original-tasks-raw  '
  const storage = createMemoryStorage(
    {
      [PROJECT_STORAGE_KEY]: projectRaw,
      [TASK_STORAGE_KEY]: taskRaw,
    },
    new Set([PROJECT_STORAGE_KEY])
  )
  let publishCalls = 0
  const service = createProjectDeletionService({ storage })

  const result = service.deleteProjectCascade({
    projects,
    tasks,
    projectId: 'proj_1',
    publishDeletionState: () => {
      publishCalls += 1
    },
  })

  assert.equal(result.success, false)
  assert.equal(result.error.code, 'PROJECT_WRITE_FAILED')
  assert.equal(result.rollbackSucceeded, true)
  assert.equal(result.statePublication, 'not_attempted')
  assert.equal(publishCalls, 0)
  assert.equal(storage.getItem(TASK_STORAGE_KEY), taskRaw)
  assert.equal(storage.getItem(PROJECT_STORAGE_KEY), projectRaw)
})

test('failure on the second write removes a task key that did not originally exist', () => {
  const storage = createMemoryStorage(
    {
      [PROJECT_STORAGE_KEY]: JSON.stringify(projects),
    },
    new Set([PROJECT_STORAGE_KEY])
  )
  const service = createProjectDeletionService({ storage })

  const result = service.deleteProjectCascade({
    projects,
    tasks,
    projectId: 'proj_1',
    publishDeletionState: () => {},
  })

  assert.equal(result.success, false)
  assert.equal(result.error.code, 'PROJECT_WRITE_FAILED')
  assert.equal(result.rollbackSucceeded, true)
  assert.equal(storage.getItem(TASK_STORAGE_KEY), null)
  assert.equal(storage.removals.includes(TASK_STORAGE_KEY), true)
})

test('failed rollback is reported as partial without false success', () => {
  const storage = createMemoryStorage(
    {
      [PROJECT_STORAGE_KEY]: JSON.stringify(projects),
      [TASK_STORAGE_KEY]: JSON.stringify(tasks),
    },
    (key, writeCount) =>
      key === PROJECT_STORAGE_KEY ||
      (key === TASK_STORAGE_KEY && writeCount >= 2)
  )
  let publishCalls = 0
  const service = createProjectDeletionService({ storage })

  const result = service.deleteProjectCascade({
    projects,
    tasks,
    projectId: 'proj_1',
    publishDeletionState: () => {
      publishCalls += 1
    },
  })

  assert.equal(result.success, false)
  assert.equal(result.error.code, 'PROJECT_WRITE_FAILED')
  assert.equal(result.rollbackSucceeded, false)
  assert.equal(result.statePublication, 'not_attempted')
  assert.match(result.error.message, /may be inconsistent/)
  assert.equal(publishCalls, 0)
})

test('serialization failure happens before any write or state publication', () => {
  const storage = createMemoryStorage({
    [PROJECT_STORAGE_KEY]: JSON.stringify(projects),
    [TASK_STORAGE_KEY]: JSON.stringify(tasks),
  })
  const badTasks = [{ id: 'task_bad', projectId: 'proj_2', value: 1n }]
  let publishCalls = 0
  const service = createProjectDeletionService({ storage })

  const result = service.deleteProjectCascade({
    projects,
    tasks: badTasks,
    projectId: 'proj_1',
    publishDeletionState: () => {
      publishCalls += 1
    },
  })

  assert.equal(result.success, false)
  assert.equal(result.error.code, 'SERIALIZATION_FAILED')
  assert.equal(storage.writes.length, 0)
  assert.equal(publishCalls, 0)
})

test('publication failure does not report success even after an idempotent retry', () => {
  const storage = createMemoryStorage({
    [PROJECT_STORAGE_KEY]: JSON.stringify(projects),
    [TASK_STORAGE_KEY]: JSON.stringify(tasks),
  })
  let publishCalls = 0
  const service = createProjectDeletionService({ storage })

  const result = service.deleteProjectCascade({
    projects,
    tasks,
    projectId: 'proj_1',
    publishDeletionState: () => {
      publishCalls += 1
      if (publishCalls === 1) throw new Error('unexpected publication error')
    },
  })

  assert.equal(result.success, false)
  assert.equal(result.error.code, 'STATE_PUBLICATION_FAILED')
  assert.equal(result.storageCommitted, true)
  assert.equal(result.statePublication, 'recovered')
  assert.equal(publishCalls, 2)
  assert.deepEqual(JSON.parse(storage.getItem(PROJECT_STORAGE_KEY)), [
    projects[1],
  ])
})
