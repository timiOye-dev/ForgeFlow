import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../../shared/components/Sidebar';
import { TopNav } from '../../shared/components/TopNav';
import { CreateProjectModal } from '../../features/projects/components/CreateProjectModal';
import { CreateTaskModal } from '../../features/tasks/components/CreateTaskModal';

export const AuthenticatedLayout = () => {
  const { isAuthenticated } = useAuth();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar onOpenCreateProject={() => setIsProjectModalOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNav
          onOpenCreateProject={() => setIsProjectModalOpen(true)}
          onOpenCreateTask={() => setIsTaskModalOpen(true)}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />
    </div>
  );
};
