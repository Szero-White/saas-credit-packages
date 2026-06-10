import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: 'user@example.com', password: 'password' })
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    }
  }

  return <div className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
    <div className="hidden bg-gradient-to-br from-indigo-700 via-blue-700 to-sky-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20"><Sparkles /></div><span className="text-xl font-black">SaaS Credits</span></div>
      <div><h1 className="max-w-xl text-5xl font-black leading-tight">Sell credit packages and unlock premium SaaS features.</h1><p className="mt-5 max-w-lg text-lg text-indigo-100">A clean intern test assignment with JWT auth, PostgreSQL transactions, feature permissions and React dashboard.</p></div>
      <p className="text-sm text-indigo-100">FastAPI · React · PostgreSQL · Docker</p>
    </div>
    <div className="flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-3xl font-black text-slate-900">Welcome back</h2>
        <p className="mt-2 text-sm text-slate-500">Login to manage credits and packages.</p>
        {error && <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}
        <label className="mt-6 block text-sm font-bold text-slate-700">Email</label>
        <input className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label className="mt-4 block text-sm font-bold text-slate-700">Password</label>
        <input type="password" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Button className="mt-6 w-full py-3" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</Button>
        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs text-slate-600"><p><b>Admin:</b> admin@example.com / password</p><p><b>User:</b> user@example.com / password</p></div>
        <p className="mt-5 text-center text-sm text-slate-500">No account? <Link className="font-bold text-indigo-600" to="/register">Register</Link></p>
      </form>
    </div>
  </div>
}
