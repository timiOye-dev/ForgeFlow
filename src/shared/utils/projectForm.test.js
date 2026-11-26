import assert from 'node:assert/strict'
import test from 'node:test'

import { INITIAL_PROJECTS } from '../../mocks/initialData.js'
import {
  PROJECT_CATEGORIES,
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  applyProjectUpdate,
  getProjectCategoryOptions,
  getProjectFormValues,
  normalizeProjectForm,
  validateProjectForm,
} from './projectForm.js'

const clone = (value) => JSON.parse(JSON.stringify(value))

const makeProject = (overrides = {}) => ({
  id: 'proj_1',
  name: 'Alpha Project',
  client: 'Acme Corp',
  description: 'Original description',
  category: 'Web Application',
  status: 'In Progress',
  priority: 'High',
  budget: '$1,000',
  deadline: '2026-12-31',
  color: '#3b82f6',
  progress: 65,
  createdAt: '2026-01-01',
  milestones: [
    {
      id: 'm1',
      title: 'Kickoff',
      completed: false,
      dueDate: '2026-12-31',
    },
  ],
  notes: [
    {
      id: 'n1',
      title: 'Client note',
      content: 'Original note',
      updatedAt: '2026-01-01',
    },
  ],
  files: [
    {
      id: 'f1',
      name: 'brief.pdf',
      size: '1.0 MB',
      uploadedAt: '2026-01-01',
    },
  ],
  preservedFlag: 'keep',
  ...overrides,
})

const makeProjects = () => [
  makeProject(),
  makeProject({
    id: 'proj_2',
    name: 'Beta Project',
    client: 'Other Corp',
  }),
]

const validForm = (overrides = {}) => ({
  name: 'Updated Project',
  client: 'New Client',
  description: 'Updated description',
  category: 'Mobile App',
  status: 'Completed',
  priority: 'Low',
  budget: '$2,500',
  deadline: '2026-11-30',
  color: '#123456',
  ...overrides,
})

test('shared project constants match the existing creation options', () => {
  assert.deepEqual(PROJECT_CATEGORIES, [
    'Web Application',
    'Mobile App',
    'Brand Identity',
    'API Integration',
    'Design System',
  ])
  assert.deepEqual(PROJECT_STATUSES, [
    'Planned',
    'In Progress',
    'In Review',
    'Completed',
  ])
  assert.deepEqual(PROJECT_PRIORITIES, ['High', 'Medium', 'Low'])
})

test('getProjectFormValues pre-fills an existing project safely', () => {
  const project = makeProject()

  assert.deepEqual(getProjectFormValues(project), {
    name: 'Alpha Project',
    client: 'Acme Corp',
    description: 'Original description',
    category: 'Web Application',
    status: 'In Progress',
    priority: 'High',
    budget: '$1,000',
    deadline: '2026-12-31',
    color: '#3b82f6',
  })

  assert.deepEqual(getProjectFormValues(null), {
    name: '',
    client: '',
    description: '',
    category: 'Web Application',
    status: 'In Progress',
    priority: 'Medium',
    budget: '',
    deadline: '',
    color: '#6366f1',
  })
})

test('project validation accepts a complete form and empty optional fields', () => {
  assert.equal(validateProjectForm(validForm()).success, true)

  const result = validateProjectForm(
    validForm({
      client: '',
      description: '',
      budget: '',
      deadline: '',
    })
  )

  assert.equal(result.success, true)
  assert.deepEqual(result.errors, {})
})

test('project validation rejects a blank name and invalid select values', () => {
  assert.equal(
    validateProjectForm(validForm({ name: '   ' })).errors.name,
    'Project name is required.'
  )
  assert.equal(
    validateProjectForm(validForm({ category: 'Unknown' })).errors.category,
    'Select a valid project category.'
  )
  assert.equal(
    validateProjectForm(validForm({ status: 'Unknown' })).errors.status,
    'Select a valid project status.'
  )
  assert.equal(
    validateProjectForm(validForm({ priority: 'Unknown' })).errors.priority,
    'Select a valid project priority.'
  )
  assert.equal(
    validateProjectForm(validForm({ color: '#12345' })).errors.color,
    'Select a valid project color.'
  )
})

test('deadline validation rejects impossible and out-of-range calendar dates', () => {
  const invalidDates = [
    '0000-02-29',
    '2026-02-31',
    '2026-02-30',
    '2025-02-29',
    '2026-13-01',
    '2026-00-10',
    '2026-01-00',
    '2026/02/28',
    '2026-2-8',
  ]

  for (const deadline of invalidDates) {
    assert.equal(
      validateProjectForm(validForm({ deadline })).success,
      false,
      `expected ${deadline} to be rejected`
    )
  }

  assert.equal(validateProjectForm(validForm({ deadline: '' })).success, true)
  assert.equal(
    validateProjectForm(validForm({ deadline: '2024-02-29' })).success,
    true
  )
  assert.equal(
    validateProjectForm(validForm({ deadline: '2026-12-31' })).success,
    true
  )
})

test('project validation does not impose budget formats or arbitrary length limits', () => {
  assert.equal(
    validateProjectForm(validForm({ budget: 'not a currency value' })).success,
    true
  )
  assert.equal(
    validateProjectForm(validForm({ name: 'a'.repeat(500) })).success,
    true
  )
})

test('normalizeProjectForm trims strings, keeps empty budget, and returns only editable fields', () => {
  const normalized = normalizeProjectForm(
    validForm({
      name: '  Trimmed Name  ',
      client: '  Client  ',
      description: '  Notes  ',
      budget: '   ',
      color: '  #abcdef  ',
      id: 'should-be-dropped',
      milestones: [],
    })
  )

  assert.deepEqual(normalized, {
    name: 'Trimmed Name',
    client: 'Client',
    description: 'Notes',
    category: 'Mobile App',
    status: 'Completed',
    priority: 'Low',
    budget: '',
    deadline: '2026-11-30',
    color: '#abcdef',
  })
})

test('applyProjectUpdate updates only the target project and preserves related data', () => {
  const projects = makeProjects()
  const originalOther = clone(projects[1])

  const result = applyProjectUpdate(projects, 'proj_1', {
    name: 'Renamed Project',
    status: 'Completed',
    budget: '',
    color: '#654321',
  })

  assert.equal(result.success, true)
  assert.equal(result.projects.length, projects.length)
  assert.notEqual(result.projects, projects)
  assert.equal(result.project.id, 'proj_1')
  assert.equal(result.project.name, 'Renamed Project')
  assert.equal(result.project.status, 'Completed')
  assert.equal(result.project.budget, '')
  assert.equal(result.project.color, '#654321')
  assert.equal(result.project.createdAt, '2026-01-01')
  assert.equal(result.project.progress, 65)
  assert.equal(result.project.preservedFlag, 'keep')
  assert.strictEqual(result.project.milestones, projects[0].milestones)
  assert.strictEqual(result.project.notes, projects[0].notes)
  assert.strictEqual(result.project.files, projects[0].files)
  assert.deepEqual(result.projects[1], originalOther)
})

test('applyProjectUpdate ignores disallowed update fields', () => {
  const projects = makeProjects()

  const result = applyProjectUpdate(projects, 'proj_1', {
    name: 'Safe Update',
    id: 'proj_hacked',
    createdAt: '1999-01-01',
    progress: 100,
    milestones: [],
    notes: [],
    files: [],
    preservedFlag: 'changed',
  })

  assert.equal(result.success, true)
  assert.equal(result.project.id, 'proj_1')
  assert.equal(result.project.createdAt, '2026-01-01')
  assert.equal(result.project.progress, 65)
  assert.deepEqual(result.project.milestones, projects[0].milestones)
  assert.deepEqual(result.project.notes, projects[0].notes)
  assert.deepEqual(result.project.files, projects[0].files)
  assert.equal(result.project.preservedFlag, 'keep')
})

test('applyProjectUpdate allows manual status changes independently of progress', () => {
  const projects = makeProjects()

  const result = applyProjectUpdate(projects, 'proj_1', {
    status: 'Completed',
  })

  assert.equal(result.success, true)
  assert.equal(result.project.progress, 65)
  assert.equal(result.project.status, 'Completed')
})

test('applyProjectUpdate fails safely for missing records and invalid updates', () => {
  const projects = makeProjects()

  const missing = applyProjectUpdate(projects, 'proj_missing', {
    name: 'Ignored',
  })

  assert.equal(missing.success, false)
  assert.equal(missing.error.code, 'PROJECT_NOT_FOUND')

  const invalid = applyProjectUpdate(projects, 'proj_1', { name: '   ' })

  assert.equal(invalid.success, false)
  assert.equal(invalid.error.code, 'VALIDATION_ERROR')
})

test('sequential project updates accumulate without stale data', () => {
  const projects = makeProjects()

  const first = applyProjectUpdate(projects, 'proj_1', { name: 'First Update' })
  const second = applyProjectUpdate(first.projects, 'proj_2', {
    client: 'Second Client',
  })
  const third = applyProjectUpdate(second.projects, 'proj_1', {
    status: 'In Review',
  })

  assert.equal(third.success, true)
  assert.equal(third.projects.length, 2)
  assert.equal(third.projects[0].name, 'First Update')
  assert.equal(third.projects[0].status, 'In Review')
  assert.equal(third.projects[1].client, 'Second Client')
})

test('getProjectFormValues preserves every seeded project category', () => {
  const seededCategories = new Set()

  for (const project of INITIAL_PROJECTS) {
    const values = getProjectFormValues(project)

    assert.equal(values.category, project.category)
    seededCategories.add(project.category)
  }

  for (const category of [
    'Mobile App',
    'Web Application',
    'Branding',
    'Developer Tools',
  ]) {
    assert.ok(
      seededCategories.has(category),
      `missing seeded category ${category}`
    )
  }
})

test('getProjectCategoryOptions adds an unsupported stored category for editing only', () => {
  const legacyOptions = getProjectCategoryOptions({ category: 'Branding' })

  assert.deepEqual(legacyOptions, ['Branding', ...PROJECT_CATEGORIES])
  assert.strictEqual(
    getProjectCategoryOptions({ category: 'Web Application' }),
    PROJECT_CATEGORIES
  )
  assert.deepEqual(PROJECT_CATEGORIES, [
    'Web Application',
    'Mobile App',
    'Brand Identity',
    'API Integration',
    'Design System',
  ])
})

test('category validation distinguishes unchanged legacy values from new invalid values', () => {
  const legacyForm = validForm({ category: 'Branding' })

  assert.equal(
    validateProjectForm(legacyForm).errors.category,
    'Select a valid project category.'
  )
  assert.equal(
    validateProjectForm(legacyForm, { originalCategory: 'Branding' }).success,
    true
  )
  assert.equal(
    validateProjectForm(legacyForm, {
      originalCategory: 'Developer Tools',
    }).errors.category,
    'Select a valid project category.'
  )
  assert.equal(
    validateProjectForm(validForm({ category: 'Design System' }), {
      originalCategory: 'Branding',
    }).success,
    true
  )
})

test('applyProjectUpdate preserves seeded categories when an unrelated field changes', () => {
  for (const seedProject of INITIAL_PROJECTS) {
    const projects = clone(INITIAL_PROJECTS)
    const storedProject = projects.find((p) => p.id === seedProject.id)
    const result = applyProjectUpdate(projects, seedProject.id, {
      name: `${seedProject.name} Updated`,
    })

    assert.equal(result.success, true, `failed to update ${seedProject.id}`)
    assert.equal(result.project.category, seedProject.category)
    assert.equal(result.project.id, seedProject.id)
    assert.equal(result.project.createdAt, seedProject.createdAt)
    assert.strictEqual(result.project.milestones, storedProject.milestones)
    assert.strictEqual(result.project.notes, storedProject.notes)
    assert.strictEqual(result.project.files, storedProject.files)
  }
})

test('applyProjectUpdate rejects an unsupported replacement category', () => {
  const projects = [makeProject({ id: 'proj_legacy', category: 'Branding' })]
  const original = clone(projects)

  const result = applyProjectUpdate(projects, 'proj_legacy', {
    category: 'Unknown',
  })

  assert.equal(result.success, false)
  assert.equal(result.error.code, 'VALIDATION_ERROR')
  assert.equal(result.error.errors.category, 'Select a valid project category.')
  assert.deepEqual(projects, original)
})

test('applyProjectUpdate allows changing a legacy category to a supported category', () => {
  const projects = [
    makeProject({ id: 'proj_legacy', category: 'Developer Tools' }),
  ]

  const result = applyProjectUpdate(projects, 'proj_legacy', {
    category: 'Design System',
  })

  assert.equal(result.success, true)
  assert.equal(result.project.category, 'Design System')
})

test('applyProjectUpdate derives legacy validation context from the stored project', () => {
  const projects = [makeProject({ id: 'proj_legacy', category: 'Branding' })]

  const result = applyProjectUpdate(projects, 'proj_legacy', {
    name: 'Renamed Legacy Project',
    category: 'Branding',
    originalCategory: 'Web Application',
  })

  assert.equal(result.success, true)
  assert.equal(result.project.category, 'Branding')
  assert.equal(result.project.name, 'Renamed Legacy Project')
  assert.equal('originalCategory' in result.project, false)
})
