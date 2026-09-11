export const EmptyState = ({ icon: Icon, title, description, action, className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center px-4 py-16 ${className}`}>
      {Icon && (
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 mb-4">
          <Icon className="w-8 h-8 text-slate-400" />
        </div>
      )}
      {title && <h2 className="text-sm font-semibold text-slate-200">{title}</h2>}
      {description && (
        <p className="text-xs text-slate-500 mt-1.5 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}