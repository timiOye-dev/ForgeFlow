import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FolderKanban, 
  Calendar, 
  DollarSign, 
  CheckSquare, 
  Layers, 
  FileText, 
  Paperclip, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Upload
} from 'lucide-react';
import { useProjects } from '../../app/contexts/ProjectContext';
import { useTasks } from '../../app/contexts/TaskContext';
import { Badge } from '../../shared/components/Badge';
import { EmptyState } from '../../shared/components/EmptyState';
import { CreateTaskModal } from '../tasks/components/CreateTaskModal';

export const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { 
    getProjectById, 
    addMilestone, 
    toggleMilestone, 
    addNote, 
    deleteNote, 
    addFile, 
    deleteFile 
  } = useProjects();
  const { tasks, toggleTaskStatus } = useTasks();

  const project = getProjectById(projectId);
  const projectTasks = tasks.filter(t => t.projectId === projectId);

  const [activeTab, setActiveTab] = useState('overview');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');

  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  if (!project) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="Project Not Found"
        description="The requested project could not be found."
        action={
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Back to Projects
          </button>
        }
      />
    )
  }

  const handleAddMilestoneSubmit = (e) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;
    addMilestone(project.id, newMilestoneTitle, newMilestoneDueDate);
    setNewMilestoneTitle('');
    setNewMilestoneDueDate('');
  };

  const handleAddNoteSubmit = (e) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    addNote(project.id, newNoteTitle, newNoteContent);
    setNewNoteTitle('');
    setNewNoteContent('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      addFile(project.id, file);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'tasks', label: `Tasks (${projectTasks.length})`, icon: CheckSquare },
    { id: 'milestones', label: `Milestones (${project.milestones?.length || 0})`, icon: CheckCircle2 },
    { id: 'notes', label: `Notes (${project.notes?.length || 0})`, icon: FileText },
    { id: 'files', label: `Files (${project.files?.length || 0})`, icon: Paperclip },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/projects')}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-xs text-slate-500">Projects /</span>
        <span className="text-xs text-slate-200 font-semibold">{project.name}</span>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{project.client}</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-indigo-400 font-medium">{project.category}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">{project.name}</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">{project.description}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={project.status}>{project.status}</Badge>
            <Badge variant={project.priority}>{project.priority}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-500 block">Deadline</span>
            <span className="font-semibold text-slate-200 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              {project.deadline}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Budget</span>
            <span className="font-semibold text-slate-200 flex items-center gap-1.5 mt-0.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              {project.budget}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Progress</span>
            <span className="font-semibold text-slate-200 mt-0.5 block">{project.progress}%</span>
          </div>
          <div>
            <span className="text-slate-500 block">Tasks</span>
            <span className="font-semibold text-slate-200 mt-0.5 block">
              {projectTasks.filter(t => t.status === 'Done').length} of {projectTasks.length} Completed
            </span>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-800 flex gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-100">Project Overview</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {project.description || 'No detailed overview provided yet.'}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100">Milestones Checklist</h3>
                <span className="text-xs text-slate-400">
                  {project.milestones?.filter(m => m.completed).length || 0} / {project.milestones?.length || 0} Done
                </span>
              </div>

              <div className="space-y-2">
                {project.milestones?.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => toggleMilestone(project.id, m.id)}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${m.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-600'}`}>
                        {m.completed && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      <span className={`font-medium ${m.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {m.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">{m.dueDate}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Client Details</h3>
              <div className="text-xs space-y-2 text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px]">Company Name</span>
                  <span className="font-semibold text-slate-200">{project.client}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Project Category</span>
                  <span className="text-slate-200">{project.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Created Date</span>
                  <span className="text-slate-200">{project.createdAt}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-100">Project Tasks</h3>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>

          <div className="space-y-2">
            {projectTasks.length > 0 ? (
              projectTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTaskStatus(t.id)}
                      className={`p-1 rounded border transition-colors ${
                        t.status === 'Done' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'border-slate-700 text-slate-400'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div>
                      <h4 className={`font-semibold ${t.status === 'Done' ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                        {t.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{t.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={t.status}>{t.status}</Badge>
                    <Badge variant={t.priority}>{t.priority}</Badge>
                    <span className="text-[11px] text-slate-500">{t.dueDate}</span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={CheckSquare}
                title="No tasks yet"
                description="No tasks created for this project yet."
                className="py-10"
                action={
                  <button
                    onClick={() => setIsTaskModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task</span>
                  </button>
                }
              />
            )}
          </div>
        </div>
      )}

      {activeTab === 'milestones' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Add New Milestone</h3>
            <form onSubmit={handleAddMilestoneSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                placeholder="Milestone title (e.g. Design Prototype Signoff)"
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="date"
                value={newMilestoneDueDate}
                onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shrink-0"
              >
                Add Milestone
              </button>
            </form>
          </div>

          <div className="space-y-2">
            {project.milestones?.map((m) => (
              <div
                key={m.id}
                onClick={() => toggleMilestone(project.id, m.id)}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border ${m.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-600'}`}>
                    {m.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`font-semibold ${m.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                    {m.title}
                  </span>
                </div>
                <span className="text-[11px] text-amber-400 font-medium">Due: {m.dueDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-100">Add Project Note</h3>
            <form onSubmit={handleAddNoteSubmit} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Note title (e.g. Client Feedback Summary)"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <textarea
                rows={3}
                required
                placeholder="Type note content..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
              >
                Save Note
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.notes?.map((n) => (
              <div key={n.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-100">{n.title}</h4>
                    <span className="text-[10px] text-slate-500">{n.updatedAt}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{n.content}</p>
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => deleteNote(project.id, n.id)}
                    className="text-[10px] text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'files' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-slate-900 border border-dashed border-slate-700 text-center space-y-2">
            <Upload className="w-8 h-8 mx-auto text-indigo-400" />
            <h4 className="text-xs font-semibold text-slate-200">Upload Project File</h4>
            <p className="text-[11px] text-slate-500">Attach design specs, SOW agreements, or wireframe exports</p>
            <label className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors">
              <span>Choose File</span>
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="space-y-2">
            {project.files?.map((f) => (
              <div key={f.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <Paperclip className="w-4 h-4 text-indigo-400" />
                  <div>
                    <h5 className="font-semibold text-slate-200">{f.name}</h5>
                    <span className="text-[10px] text-slate-500">{f.size} • Uploaded {f.uploadedAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteFile(project.id, f.id)}
                    className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        defaultProjectId={project.id}
      />
    </div>
  );
};
