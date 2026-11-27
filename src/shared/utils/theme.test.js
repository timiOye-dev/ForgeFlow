import assert from 'node:assert/strict'
import test from 'node:test'

import {
  applyThemeToDocument,
  isSupportedTheme,
  normalizeTheme,
  THEME_DARK,
  THEME_LIGHT,
} from './theme.js'

test('supported themes are limited to light and dark', () => {
  assert.equal(isSupportedTheme(THEME_LIGHT), true)
  assert.equal(isSupportedTheme(THEME_DARK), true)
  assert.equal(isSupportedTheme('auto'), false)
  assert.equal(isSupportedTheme('LIGHT'), false)
  assert.equal(isSupportedTheme(undefined), false)
  assert.equal(isSupportedTheme(null), false)
})

test('missing or invalid themes normalize to dark', () => {
  const invalidValues = [
    undefined,
    null,
    '',
    '   ',
    'auto',
    'LIGHT',
    'system',
    42,
    {},
    [],
  ]

  for (const value of invalidValues) {
    assert.equal(normalizeTheme(value), THEME_DARK)
  }

  assert.equal(normalizeTheme(THEME_LIGHT), THEME_LIGHT)
  assert.equal(normalizeTheme(THEME_DARK), THEME_DARK)
})

test('applyThemeToDocument writes a normalized theme attribute', () => {
  const createDocument = () => ({ documentElement: { dataset: {} } })

  const lightDocument = createDocument()
  applyThemeToDocument(THEME_LIGHT, lightDocument)
  assert.equal(lightDocument.documentElement.dataset.theme, THEME_LIGHT)

  const darkDocument = createDocument()
  applyThemeToDocument(THEME_DARK, darkDocument)
  assert.equal(darkDocument.documentElement.dataset.theme, THEME_DARK)

  const invalidDocument = createDocument()
  applyThemeToDocument('auto', invalidDocument)
  assert.equal(invalidDocument.documentElement.dataset.theme, THEME_DARK)
})

test('applyThemeToDocument ignores an unavailable document', () => {
  assert.doesNotThrow(() => applyThemeToDocument(THEME_LIGHT, undefined))
  assert.doesNotThrow(() => applyThemeToDocument(THEME_LIGHT, {}))
})
