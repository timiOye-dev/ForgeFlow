import { useState } from 'react'
import { User, Save, CheckCircle2, RefreshCw, Sun, Moon } from 'lucide-react'
import { useAuth } from '../../app/contexts/AuthContext'
import { useTheme } from '../../app/contexts/ThemeContext'
import { THEME_DARK, THEME_LIGHT } from '../../shared/utils/theme'
import { INITIAL_PROJECTS, INITIAL_TASKS } from '../../mocks/initialData'

export const AccountPage = () => {
  const { user, updateProfile } = useAuth()
  const { theme, saveTheme } = useTheme()

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    title: user?.title || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  })
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false)
  const [profileSaveError, setProfileSaveError] = useState('')

  const [themeDraft, setThemeDraft] = useState({
    theme,
    sourceTheme: theme,
  })
  const selectedTheme =
    themeDraft.sourceTheme === theme ? themeDraft.theme : theme
  const [appearanceSaving, setAppearanceSaving] = useState(false)
  const [appearanceSavedSuccess, setAppearanceSavedSuccess] = useState(false)
  const [appearanceError, setAppearanceError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProfileSaveError('')

    const result = await updateProfile(formData)
    if (!result.success) {
      setProfileSaveError(result.error.message)
      return
    }

    const updated = result.user
    setFormData({
      name: updated.name || '',
      email: updated.email || '',
      title: updated.title || '',
      bio: updated.bio || '',
      avatar: updated.avatar || '',
    })
    setProfileSavedSuccess(true)
    setTimeout(() => setProfileSavedSuccess(false), 3000)
  }

  const handleAppearanceSubmit = async (e) => {
    e.preventDefault()
    setAppearanceError('')
    setAppearanceSavedSuccess(false)
    setAppearanceSaving(true)

    const result = await saveTheme(selectedTheme)
    setAppearanceSaving(false)

    if (!result.success) {
      setAppearanceError(result.error.message)
      return
    }

    setAppearanceSavedSuccess(true)
    setTimeout(() => setAppearanceSavedSuccess(false), 3000)
  }

  const themeOptions = [
    {
      value: THEME_DARK,
      label: 'Dark',
      description: 'Low-light interface with dark surfaces.',
      icon: Moon,
    },
    {
      value: THEME_LIGHT,
      label: 'Light',
      description: 'Bright interface with light surfaces.',
      icon: Sun,
    },
  ]

  const handleResetData = () => {
    if (
      window.confirm(
        'Reset workspace data back to the initial demo state? Your account and profile settings will be preserved.'
      )
    ) {
      localStorage.setItem(
        'forgeflow_projects',
        JSON.stringify(INITIAL_PROJECTS)
      )
      localStorage.setItem('forgeflow_tasks', JSON.stringify(INITIAL_TASKS))
      window.location.reload()
    }
  }

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

      {profileSavedSuccess && (
        <div
          role="status"
          className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile settings updated successfully!</span>
        </div>
      )}

      {profileSaveError && (
        <div
          role="alert"
          className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs"
        >
          {profileSaveError}
        </div>
      )}

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-3">
          Profile Information
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="flex items-center gap-4">
            <img
              src={
                formData.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }
              alt={formData.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500"
            />
            <div className="flex-1">
              <label className="block font-medium text-slate-300 mb-1">
                Avatar Image URL
              </label>
              <input
                type="text"
                value={formData.avatar}
                onChange={(e) =>
                  setFormData({ ...formData, avatar: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Professional Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Bio</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
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
        <h2 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-3">
          Appearance
        </h2>

        <form onSubmit={handleAppearanceSubmit} className="space-y-4 text-xs">
          <fieldset>
            <legend className="font-medium text-slate-300 mb-3">Theme</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {themeOptions.map((option) => {
                const Icon = option.icon
                const isSelected = selectedTheme === option.value

                return (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-900 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-700 bg-slate-950 hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={option.value}
                      checked={isSelected}
                      onChange={() =>
                        setThemeDraft({
                          theme: option.value,
                          sourceTheme: theme,
                        })
                      }
                      className="sr-only"
                    />
                    <Icon className="w-4 h-4 mt-0.5 text-indigo-400" />
                    <span>
                      <span className="block font-semibold text-slate-100">
                        {option.label}
                      </span>
                      <span className="block text-slate-400 mt-0.5">
                        {option.description}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          {appearanceSavedSuccess && (
            <div
              role="status"
              className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Appearance updated successfully!</span>
            </div>
          )}

          {appearanceError && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300"
            >
              {appearanceError}
            </div>
          )}

          <button
            type="submit"
            disabled={appearanceSaving}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>
              {appearanceSaving ? 'Saving Appearance...' : 'Save Appearance'}
            </span>
          </button>
        </form>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-3">
          Workspace Data & Persistence
        </h2>

        <div className="flex items-center justify-between text-xs">
          <div>
            <h4 className="font-semibold text-slate-200">Reset Demo Data</h4>
            <p className="text-slate-400 mt-0.5">
              Restore initial sample projects, tasks, and milestone records.
            </p>
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
  )
}
