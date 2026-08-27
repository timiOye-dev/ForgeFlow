import { Routes, Route } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import { AuthenticatedLayout } from '../layouts/AuthenticatedLayout';

import { LandingPage } from '../../features/auth/LandingPage';
import { LoginPage } from '../../features/auth/LoginPage';
import { RegisterPage } from '../../features/auth/RegisterPage';
import { ForgotPasswordPage } from '../../features/auth/ForgotPasswordPage';

import { DashboardPage } from '../../features/dashboard/DashboardPage';
import { ProjectListPage } from '../../features/projects/ProjectListPage';
import { ProjectDetailPage } from '../../features/projects/ProjectDetailPage';
import { TaskListPage } from '../../features/tasks/TaskListPage';
import { AccountPage } from '../../features/account/AccountPage';

export const AppRouter = () => {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="/tasks" element={<TaskListPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

