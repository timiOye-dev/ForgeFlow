import { AuthProvider } from '../contexts/AuthContext';
import { ProjectProvider } from '../contexts/ProjectContext';
import { TaskProvider } from '../contexts/TaskContext';

export const AppProvider = ({ children }) => {
  return (
    <AuthProvider>
      <ProjectProvider>
        <TaskProvider>
          {children}
        </TaskProvider>
      </ProjectProvider>
    </AuthProvider>
  );
};
