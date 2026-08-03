export const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const getStyles = () => {
    switch (variant) {
      case 'High':
      case 'high':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Medium':
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Low':
      case 'low':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Completed':
      case 'Done':
      case 'completed':
      case 'done':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'In Progress':
      case 'in-progress':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'In Review':
      case 'in-review':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Planned':
      case 'Todo':
      case 'todo':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center rounded-full border ${sizeClasses} ${getStyles()}`}>
      {children || variant}
    </span>
  );
};
