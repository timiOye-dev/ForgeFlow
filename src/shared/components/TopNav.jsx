import { useRef, useState } from 'react'
import { Menu, Search, FolderPlus, CheckSquare, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../../app/contexts/ProjectContext'
import { useTasks } from '../../app/contexts/TaskContext'
import { UserMenu } from './UserMenu'

export const TopNav = ({
  onOpenCreateProject,
  onOpenCreateTask,
  onToggleSidebar,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchInputRef = useRef(null)
  const searchResultsRef = useRef(null)
  const { projects } = useProjects()
  const { tasks } = useTasks()
  const navigate = useNavigate()

  const filteredProjects = searchQuery.trim()
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.client.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  const filteredTasks = searchQuery.trim()
    ? tasks.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  const getResultButtons = () =>
    Array.from(
      searchResultsRef.current?.querySelectorAll('[data-search-result]') || []
    )

  const closeSearchResults = () => {
    setShowSearchResults(false)
    searchInputRef.current?.focus()
  }

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Escape') {
      if (showSearchResults) {
        event.preventDefault()
        setShowSearchResults(false)
      }
      return
    }

    const results = getResultButtons()
    if (results.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      results[0].focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      results[results.length - 1].focus()
    }
  }

  const handleResultKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      closeSearchResults()
      return
    }

    const results = getResultButtons()
    if (results.length === 0) return

    const currentIndex = results.indexOf(event.currentTarget)
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      results[(currentIndex + 1) % results.length].focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      results[(currentIndex - 1 + results.length) % results.length].focus()
    }
  }

  const selectProjectResult = (projectId) => {
    navigate(`/projects/${projectId}`)
    setShowSearchResults(false)
    setSearchQuery('')
  }

  const selectTaskResult = () => {
    navigate('/tasks')
    setShowSearchResults(false)
    setSearchQuery('')
  }

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
              ref={searchInputRef}
              id="global-search"
              name="global-search"
              type="text"
              aria-label="Search projects, tasks, or clients"
              aria-autocomplete="list"
              aria-controls="global-search-results"
              aria-expanded={showSearchResults && Boolean(searchQuery.trim())}
              placeholder="Search projects, tasks, or clients..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowSearchResults(true)
              }}
              onFocus={() => setShowSearchResults(true)}
              onKeyDown={handleSearchKeyDown}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  searchInputRef.current?.focus()
                }}
                aria-label="Clear search"
                className="absolute right-2.5 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {showSearchResults && searchQuery.trim() && (
            <>
              <div
                aria-hidden="true"
                className="fixed inset-0 z-40"
                onClick={() => setShowSearchResults(false)}
              />
              <div
                id="global-search-results"
                ref={searchResultsRef}
                role="listbox"
                aria-label="Search results"
                className="absolute top-full left-0 right-0 max-w-full bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 max-h-80 overflow-y-auto"
              >
                <div
                  role="presentation"
                  className="text-[11px] font-semibold text-slate-500 uppercase px-2 mb-1"
                >
                  Projects
                </div>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      role="option"
                      aria-selected={false}
                      data-search-result
                      onClick={() => selectProjectResult(p.id)}
                      onKeyDown={handleResultKeyDown}
                      className="w-full flex items-center justify-between gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-800 cursor-pointer text-xs transition-colors text-left"
                    >
                      <span className="font-medium text-slate-200 truncate min-w-0">
                        {p.name}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate shrink-0">
                        {p.client}
                      </span>
                    </button>
                  ))
                ) : (
                  <div
                    role="presentation"
                    className="text-xs text-slate-500 px-2 py-1 italic"
                  >
                    No projects found
                  </div>
                )}

                <div
                  role="presentation"
                  className="text-[11px] font-semibold text-slate-500 uppercase px-2 mt-3 mb-1"
                >
                  Tasks
                </div>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      role="option"
                      aria-selected={false}
                      data-search-result
                      onClick={selectTaskResult}
                      onKeyDown={handleResultKeyDown}
                      className="w-full flex items-center justify-between gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-800 cursor-pointer text-xs transition-colors text-left"
                    >
                      <span className="font-medium text-slate-200 truncate min-w-0">
                        {t.title}
                      </span>
                      <span className="text-[10px] text-indigo-400 truncate shrink-0">
                        {t.status}
                      </span>
                    </button>
                  ))
                ) : (
                  <div
                    role="presentation"
                    className="text-xs text-slate-500 px-2 py-1 italic"
                  >
                    No tasks found
                  </div>
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

        <UserMenu />
      </div>
    </header>
  )
}
