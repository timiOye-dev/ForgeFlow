import { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_USER } from '../../mocks/initialData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('forgeflow_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedToken = localStorage.getItem('forgeflow_token');
    return savedToken !== 'false' && savedToken !== null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('forgeflow_user', JSON.stringify(user));
    }
  }, [user]);

  const login = (email) => {
    const loggedUser = {
      ...INITIAL_USER,
      email: email || INITIAL_USER.email,
      name: email ? email.split('@')[0] : INITIAL_USER.name,
    };
    setUser(loggedUser);
    setIsAuthenticated(true);
    localStorage.setItem('forgeflow_token', 'demo-auth-token-xyz');
    return { success: true };
  };

  const register = (name, email) => {
    const newUser = {
      ...INITIAL_USER,
      id: `usr_${Date.now()}`,
      name,
      email,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('forgeflow_token', 'demo-auth-token-xyz');
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('forgeflow_token', 'false');
  };

  const updateProfile = (updatedData) => {
    setUser(prev => {
      const next = { ...prev, ...updatedData };
      localStorage.setItem('forgeflow_user', JSON.stringify(next));
      return next;
    });
  };

  const forgotPassword = (email) => {
    return { success: true, message: `Password reset instructions sent to ${email}` };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
