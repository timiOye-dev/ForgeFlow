import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  CheckSquare,
  Clock,
  Calendar,
  CheckCircle2,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../../app/contexts/AuthContext';
import { useProjects } from '../../app/contexts/ProjectContext';
import { useTasks } from '../../app/contexts/TaskContext';
import { Badge } from '../../shared/components/Badge';
import { DashboardStats } from './components/DashboardStats';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { projects } = useProjects();
  const { tasks, toggleTaskStatus } = useTasks();
  const navigate = useNavigate();

  // Metrics calculation
  const activeProjects = projects.filter(p => p.status === 'In Progress' || p.status === 'In Review').length;

  const pendingTasks = tasks.filter(t => t.status !== 'Done').slice(0, 5);
  const recentProjects = projects.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
            Freelance Engineering Hub
          </span>
          <h1 className="text-2xl font-bold text-slate-100 mt-2">
            Welcome back, {user?.name || 'Developer'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            You have <span className="text-indigo-400 font-semibold">{activeProjects} active projects</span> and <span className="text-amber-400 font-semibold">{pendingTasks.length} pending tasks</span> requiring action this week.
          </p>
        </div>
      </div>

      {/* High-level Metric Stat Cards */}
      <DashboardStats />

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Projects Overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-indigo-400" />
              <span>Project Workspaces</span>
            </h2>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentProjects.map((p) => {
              const projectTasks = tasks.filter(t => t.projectId === p.id);
              const doneTasksCount = projectTasks.filter(t => t.status === 'Done').length;

              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{p.client}</span>
                        <Badge variant={p.status}>{p.status}</Badge>
                      </div>
                      <h3 className="font-bold text-slate-100 group-hover:text-indigo-400 transition-colors text-sm">
                        {p.name}
                      </h3>
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{p.budget}</span>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Completion</span>
                      <span className="font-semibold text-slate-300">{p.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${p.progress}%`,
                          backgroundColor: p.color || '#3b82f6'
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
                      {doneTasksCount} / {projectTasks.length} tasks
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Due {p.deadline}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Urgent Tasks List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-400" />
              <span>Pending Tasks</span>
            </h2>
            <button
              onClick={() => navigate('/tasks')}
              className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Manage Tasks</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            {pendingTasks.length > 0 ? (
              pendingTasks.map((t) => {
                const project = projects.find(p => p.id === t.projectId);
                return (
                  <div
                    key={t.id}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors space-y-2 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => toggleTaskStatus(t.id)}
                        className="mt-0.5 text-slate-500 hover:text-emerald-400 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-200 line-clamp-1">{t.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            {project?.name || 'General'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                      <Badge variant={t.priority} size="sm">{t.priority}</Badge>
                      <span className="flex items-center gap-1 text-amber-400">
                        <Clock className="w-3 h-3" />
                        Due {t.dueDate}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">All caught up! No pending tasks.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
