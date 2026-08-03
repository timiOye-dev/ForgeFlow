import { useState } from 'react';
import { 
  CheckSquare, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Folder 
} from 'lucide-react';
import { useTasks } from '../../app/contexts/TaskContext';
import { useProjects } from '../../app/contexts/ProjectContext';
import { Badge } from '../../shared/components/Badge';
import { CreateTaskModal } from './components/CreateTaskModal';

export const TaskListPage = () => {
  const { tasks, toggleTaskStatus, deleteTask } = useTasks();
  const { projects } = useProjects();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const matchesProject = projectFilter === 'All' || t.projectId === projectFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  const statuses = ['All', 'Todo', 'In Progress', 'In Review', 'Done'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            <span>Task Manager ({tasks.length})</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track deliverable items, estimated effort, and client task deadlines
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 overflow-x-auto w-full md:w-auto">
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === s
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 w-full md:w-auto justify-end">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((t) => {
            const project = projects.find(p => p.id === t.projectId);

            return (
              <div
                key={t.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTaskStatus(t.id)}
                    title="Click to cycle status"
                    className={`mt-0.5 p-1 rounded border transition-colors shrink-0 ${
                      t.status === 'Done'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'border-slate-700 text-slate-400 hover:text-indigo-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-indigo-400 flex items-center gap-1">
                        <Folder className="w-3 h-3" />
                        {project?.name || 'Unassigned'}
                      </span>
                    </div>

                    <h3 className={`font-bold text-sm ${t.status === 'Done' ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                      {t.title}
                    </h3>

                    {t.description && (
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed max-w-2xl">
                        {t.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <Badge variant={t.status}>{t.status}</Badge>
                  <Badge variant={t.priority}>{t.priority}</Badge>

                  <div className="text-right text-[11px] text-slate-400">
                    <div className="flex items-center gap-1 font-medium text-slate-300">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{t.loggedHours}h / {t.estimatedHours}h</span>
                    </div>
                    <span className="text-slate-500 text-[10px]">Due {t.dueDate}</span>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete task "${t.title}"?`)) {
                        deleteTask(t.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 p-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
            <CheckSquare className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-200">No tasks found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or adding a new task.</p>
          </div>
        )}
      </div>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
