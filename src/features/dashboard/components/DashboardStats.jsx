import { FolderKanban, CheckSquare, Clock, DollarSign } from 'lucide-react'
import { useProjects } from '../../../app/contexts/ProjectContext'
import { useTasks } from '../../../app/contexts/TaskContext'
import { StatCard } from '../../../shared/components/StatCard'

export const DashboardStats = () => {
  const { projects } = useProjects()
  const { tasks } = useTasks()

  const totalProjects = projects.length
  const activeProjects = projects.filter(p => p.status === 'In Progress' || p.status === 'In Review').length
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'Done').length

  const totalLoggedHours = tasks.reduce((sum, t) => sum + (t.loggedHours || 0), 0)
  const totalEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Active Projects"
        value={`${activeProjects} / ${totalProjects}`}
        subtext="In progress or under review"
        icon={FolderKanban}
        color="indigo"
      />
      <StatCard
        title="Tasks Completed"
        value={`${completedTasks} / ${totalTasks}`}
        subtext={`${Math.round((completedTasks / (totalTasks || 1)) * 100)}% completion rate`}
        icon={CheckSquare}
        color="emerald"
      />
      <StatCard
        title="Hours Logged"
        value={`${totalLoggedHours} hrs`}
        subtext={`Target: ${totalEstimatedHours} hrs total`}
        icon={Clock}
        color="amber"
      />
      <StatCard
        title="Active Clients"
        value={new Set(projects.map(p => p.client)).size}
        subtext="Client accounts managed"
        icon={DollarSign}
        color="purple"
      />
    </div>
  )
}