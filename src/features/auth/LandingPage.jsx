import { Link, useNavigate } from 'react-router-dom';
import { Zap, FolderKanban, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">ForgeFlow</span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/20"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 md:py-24 flex-1 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
          <Zap className="w-3.5 h-3.5" />
          <span>ForgeFlow v1.0 Workspace Release</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
          Centralize projects, tasks, and deadlines in one <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">unified workspace.</span>
        </h1>

        <p className="mt-6 text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Designed for freelancers and independent software engineers. Streamline project management, track milestones, organize client deliverables, and stay on schedule.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-6 py-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base transition-all shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2"
          >
            <span>Launch Dashboard Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto px-6 py-6 rounded-xl bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold text-base transition-colors flex items-center justify-center"
          >
            Sign In to Account
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-20 text-left w-full">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <FolderKanban className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Project Hub</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Organize deliverables into discrete client projects with budgets, status tracking, milestones, notes, and attached files.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Task Management</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Track task priorities, log estimated and actual hours, set due dates, and update progress with seamless status cycles.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Milestones & Notes</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Set clear project checkpoints, track milestone completion, and maintain persistent notes for client specs and API endpoints.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 ForgeFlow. Designed for modern engineering and project workflows.</p>
      </footer>
    </div>
  );
};
