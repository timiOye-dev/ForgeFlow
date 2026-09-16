import { Calendar, CheckSquare, FolderKanban } from 'lucide-react'
import { useProjects } from '../../../app/contexts/ProjectContext'
import { useTasks } from '../../../app/contexts/TaskContext'

const DAY_MS = 86400000

const getDueStatus = (dateStr) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(`${dateStr}T00:00:00`)
  const days = Math.ceil((dueDate - today) / DAY_MS)

  if (days < 0) return { label: 'Overdue', tone: 'overdue' }
  if (days === 0) return { label: 'Due today', tone: 'today' }
  return { label: `in ${days} days`, tone: 'upcoming' }
}

const getTypeStyles = (type) => {
  if (type === 'project') return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
  return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
}

const getStatusStyles = (tone) => {
  switch (tone) {
    case 'overdue':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    case 'today':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    default:
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
  }
}

export const UpcomingDeadlines = () => {
  const { projects } = useProjects()
  const { tasks } = useTasks()

  const isValidDate = (value) => value && !Number.isNaN(new Date(`${value}T00:00:00`).getTime())

  const deadlineItems = [
    ...projects
      .filter(p => isValidDate(p.deadline))
      .map(p => ({
        key: `p:${p.id}`,
        type: 'project',
        title: p.name,
        meta: p.client,
        date: p.deadline
      })),
    ...tasks
      .filter(t => isValidDate(t.dueDate))
      .map(t => ({
        key: `t:${t.id}`,
        type: 'task',
        title: t.title,
        meta: projects.find(p => p.id === t.projectId)?.name || 'General',
        date: t.dueDate
      }))
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)

  return (
    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm">
      <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-indigo-400" />
        <span>Upcoming Deadlines</span>
      </h2>

      {deadlineItems.length > 0 ? (
        <div className="space-y-2">
          {deadlineItems.map((item) => {
            const TypeIcon = item.type === 'project' ? FolderKanban : CheckSquare
            const status = getDueStatus(item.date)
            return (
              <div
                key={item.key}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs"
              >
                <div className={`p-2 rounded-lg border shrink-0 ${getTypeStyles(item.type)}`}>
                  <TypeIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-slate-100 truncate">{item.title}</p>
                    <span className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getStatusStyles(status.tone)}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="text-[10px] text-slate-500 truncate">{item.meta}</span>
                    <span className="text-[10px] text-slate-500 shrink-0">Due {item.date}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-xs text-slate-500 py-4 text-center">All caught up! No upcoming deadlines.</p>
      )}
    </div>
  )
}