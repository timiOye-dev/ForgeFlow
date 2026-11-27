import { AuthProvider } from '../contexts/AuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { ProjectProvider } from '../contexts/ProjectContext'
import { TaskProvider } from '../contexts/TaskContext'
import { ActivityProvider } from '../contexts/ActivityContext'

export const AppProvider = ({ children }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ProjectProvider>
          <TaskProvider>
            <ActivityProvider>{children}</ActivityProvider>
          </TaskProvider>
        </ProjectProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
