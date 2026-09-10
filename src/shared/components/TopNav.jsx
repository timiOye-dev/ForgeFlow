import { useState } from 'react';
import { Menu, Search, Bell, FolderPlus, CheckSquare, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../app/contexts/ProjectContext';
import { useTasks } from '../../app/contexts/TaskContext';
import { UserMenu } from './UserMenu';

export const TopNav = ({ onOpenCreateProject, onOpenCreateTask, onToggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const navigate = useNavigate();

  const filteredProjects = searchQuery.trim()
    ? projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.client.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const filteredTasks = searchQuery.trim()
    ? tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const notifications = [
    { id: '1', title: 'Task Due Soon', text: 'Design Figma Component Library is due in 3 days.', time: '10m ago' },
    { id: '2', title: 'Milestone Completed', text: 'Brand Guidelines Manual PDF completed.', time: '2h ago' },
  ];

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 md:px-6 flex items-center justify-between gap-3 sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0 flex-1 md:flex-none">
        <button
          onClick={onToggleSidebar}
          aria-label="Open navigation menu"
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors shrink-0 -ml-1"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative min-w-0 flex-1 md:w-72 lg:w-96 md:flex-none">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search projects, tasks, or clients..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {showSearchResults && searchQuery.trim() && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowSearchResults(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 max-h-80 overflow-y-auto">
                <div className="text-[11px] font-semibold text-slate-500 uppercase px-2 mb-1">Projects</div>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        navigate(`/projects/${p.id}`);
                        setShowSearchResults(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-800 cursor-pointer text-xs transition-colors"
                    >
                      <span className="font-medium text-slate-200">{p.name}</span>
                      <span className="text-[10px] text-slate-500">{p.client}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 px-2 py-1 italic">No projects found</div>
                )}

                <div className="text-[11px] font-semibold text-slate-500 uppercase px-2 mt-3 mb-1">Tasks</div>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map(t => (
                    <div
                      key={t.id}
                      onClick={() => {
                        navigate('/tasks');
                        setShowSearchResults(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-800 cursor-pointer text-xs transition-colors"
                    >
                      <span className="font-medium text-slate-200">{t.title}</span>
                      <span className="text-[10px] text-indigo-400">{t.status}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 px-2 py-1 italic">No tasks found</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={onOpenCreateTask}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
          >
            <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Add Task</span>
          </button>
          <button
            onClick={onOpenCreateProject}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-slate-900" />
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <span className="text-xs font-semibold text-slate-200">Notifications</span>
                  <span className="text-[10px] text-indigo-400 font-medium">2 New</span>
                </div>
                <div className="space-y-2">
                  {notifications.map(n => (
                    <div key={n.id} className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                      <div className="flex justify-between text-slate-200 font-medium mb-1">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-500">{n.time}</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <UserMenu />
      </div>
    </header>
  );
};
