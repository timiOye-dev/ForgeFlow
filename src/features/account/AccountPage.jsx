import { useState } from 'react';
import { User, Save, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../app/contexts/AuthContext';
import { INITIAL_USER, INITIAL_PROJECTS, INITIAL_TASKS } from '../../mocks/initialData';

export const AccountPage = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    title: user?.title || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset workspace data back to initial demo state? All local modifications will be restored.')) {
      localStorage.setItem('forgeflow_user', JSON.stringify(INITIAL_USER));
      localStorage.setItem('forgeflow_projects', JSON.stringify(INITIAL_PROJECTS));
      localStorage.setItem('forgeflow_tasks', JSON.stringify(INITIAL_TASKS));
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-400" />
          <span>Account Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your profile, workspace preferences, and application data
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile settings updated successfully!</span>
        </div>
      )}

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-3">Profile Information</h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="flex items-center gap-4">
            <img
              src={formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={formData.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500"
            />
            <div className="flex-1">
              <label className="block font-medium text-slate-300 mb-1">Avatar Image URL</label>
              <input
                type="text"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Professional Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Bio</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </form>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-3">Workspace Data & Persistence</h2>

        <div className="flex items-center justify-between text-xs">
          <div>
            <h4 className="font-semibold text-slate-200">Reset Demo Data</h4>
            <p className="text-slate-400 mt-0.5">Restore initial sample projects, tasks, and milestone records.</p>
          </div>
          <button
            onClick={handleResetData}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors border border-slate-700 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Restore Initial Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
