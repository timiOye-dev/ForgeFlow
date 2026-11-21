import { createContext, useContext, useState } from 'react'
import { authService } from '../../shared/services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => authService.restoreSession())

  const applyAuthResult = async (resultPromise) => {
    const result = await resultPromise
    if (result.success) {
      setAuthState({ isAuthenticated: true, user: result.user })
    }
    return result
  }

  const login = (credentials) => applyAuthResult(authService.login(credentials))

  const register = (accountData) =>
    applyAuthResult(authService.register(accountData))

  const loginDemo = () => applyAuthResult(authService.loginDemo())

  const logout = () => {
    authService.logout()
    setAuthState({ isAuthenticated: false, user: null })
  }

  const updateProfile = (updatedData) => {
    const result = authService.updateProfile(updatedData)
    if (result.success) {
      setAuthState((previous) => ({ ...previous, user: result.user }))
    }
    return result
  }

  const forgotPassword = (email) => authService.forgotPassword(email)

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        login,
        register,
        loginDemo,
        logout,
        updateProfile,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
