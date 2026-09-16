import { useNavigate, useOutletContext } from 'react-router-dom';
import { FolderKanban, FolderPlus, CheckSquare } from 'lucide-react';

export const QuickActions = () => {
  const { onOpenCreateProject, onOpenCreateTask } = useOutletContext();
  const navigate = useNavigate();

  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm">
      <h2 className="text-sm font-bold text-slate-100">Quick Actions</h2>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onOpenCreateProject}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-sm"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Project</span>
        </button>
        <button
          onClick={onOpenCreateTask}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
        >
          <CheckSquare className="w-4 h-4" />
          <span>Add Task</span>
        </button>
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
        >
          <FolderKanban className="w-4 h-4" />
          <span>View Projects</span>
        </button>
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
        >
          <CheckSquare className="w-4 h-4" />
          <span>View Tasks</span>
        </button>
      </div>
    </div>
  );
};