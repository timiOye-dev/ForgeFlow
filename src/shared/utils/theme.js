export const THEME_DARK = 'dark'
export const THEME_LIGHT = 'light'

export const SUPPORTED_THEMES = Object.freeze([THEME_LIGHT, THEME_DARK])
export const DEFAULT_THEME = THEME_DARK

export function isSupportedTheme(value) {
  return value === THEME_LIGHT || value === THEME_DARK
}

export function normalizeTheme(value) {
  return isSupportedTheme(value) ? value : DEFAULT_THEME
}

export function applyThemeToDocument(
  theme,
  documentObject = globalThis.document
) {
  if (!documentObject?.documentElement) return

  documentObject.documentElement.dataset.theme = normalizeTheme(theme)
}
