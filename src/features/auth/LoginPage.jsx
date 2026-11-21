import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../app/contexts/AuthContext'
import {
  DEMO_CREDENTIALS,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '../../shared/services/authService'

export const LoginPage = () => {
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email)
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, loginDemo } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const result = await login({ email, password })
    setIsSubmitting(false)

    if (result.success) {
      navigate('/dashboard')
      return
    }

    setError(result.error.message)
  }

  const handleDemoSignIn = async () => {
    setError('')
    setIsSubmitting(true)

    const result = await loginDemo()
    setIsSubmitting(false)

    if (result.success) {
      navigate('/dashboard')
      return
    }

    setError(result.error.message)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 cursor-pointer mb-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-white">
              ForgeFlow
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Welcome back</h2>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to your project workspace
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="font-medium text-slate-300">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-indigo-400 hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3 text-slate-500" />
                <input
                  type="password"
                  required
                  minLength={PASSWORD_MIN_LENGTH}
                  maxLength={PASSWORD_MAX_LENGTH}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-xs transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={isSubmitting}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Demo Quick Sign In ({DEMO_CREDENTIALS.label})</span>
            </button>
            <p className="mt-2 text-center text-[10px] text-slate-500">
              Demo credentials: {DEMO_CREDENTIALS.email} /{' '}
              {DEMO_CREDENTIALS.password}
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-indigo-400 hover:underline font-medium"
          >
            Register free
          </Link>
        </p>
      </div>
    </div>
  )
}
