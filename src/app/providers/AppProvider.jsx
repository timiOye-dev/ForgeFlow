import { AuthProvider } from '../contexts/AuthContext';
import { ProjectProvider } from '../contexts/ProjectContext';
import { TaskProvider } from '../contexts/TaskContext';
import { ActivityProvider } from '../contexts/ActivityContext';

export const AppProvider = ({ children }) => {
  return (
    <AuthProvider>
      <ProjectProvider>
        <TaskProvider>
          <ActivityProvider>
            {children}
          </ActivityProvider>
        </TaskProvider>
      </ProjectProvider>
    </AuthProvider>
  );
};
