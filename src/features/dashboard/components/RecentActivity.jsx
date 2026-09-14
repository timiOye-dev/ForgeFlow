import { Activity, CheckCircle, Clock, FileText, FolderPlus } from 'lucide-react'
import { useActivities } from '../../../app/contexts/ActivityContext'

const ACTIVITY_ICONS = {
  CheckCircle,
  Clock,
  FileText,
  FolderPlus
}

export const RecentActivity = () => {
  const { activities } = useActivities()

  return (
    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm">
      <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
        <Activity className="w-4 h-4 text-indigo-400" />
        <span>Recent Activity</span>
      </h2>

      <div className="space-y-2">
        {activities.map((a) => {
          const Icon = ACTIVITY_ICONS[a.icon] || Activity
          return (
            <div
              key={a.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs"
            >
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <p className="flex-1 min-w-0 text-slate-300 leading-relaxed">
                <span className="font-semibold text-slate-100">{a.user}</span>{' '}
                <span className="text-slate-400">{a.action}</span>{' '}
                <span className="font-medium text-slate-200">{a.target}</span>
              </p>
              <span className="text-[10px] text-slate-500 shrink-0">{a.time}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}