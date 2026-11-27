import { createContext, useContext, useEffect } from 'react'
import {
  applyThemeToDocument,
  isSupportedTheme,
  normalizeTheme,
} from '../../shared/utils/theme'
import { useAuth } from './AuthContext'

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  const { user, updateProfile } = useAuth()
  const theme = normalizeTheme(user?.theme)

  useEffect(() => {
    applyThemeToDocument(theme)
  }, [theme])

  const saveTheme = async (nextTheme) => {
    if (!isSupportedTheme(nextTheme)) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Unsupported appearance option. Choose Light or Dark.',
        },
      }
    }

    return updateProfile({ theme: nextTheme })
  }

  return (
    <ThemeContext.Provider value={{ theme, saveTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
