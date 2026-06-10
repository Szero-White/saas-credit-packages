import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'

export default function Register() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try { await register(form); navigate('/dashboard') } catch (err) { setError(err.message) }
  }
  return <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
    <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-3xl font-black text-slate-900">Create account</h2>
      <p className="mt-2 text-sm text-slate-500">Register a normal user account.</p>
      {error && <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}
      {['name','email','password'].map((key) => <div key={key}><label className="mt-4 block text-sm font-bold capitalize text-slate-700">{key}</label><input type={key === 'password' ? 'password' : 'text'} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></div>)}
      <Button className="mt-6 w-full py-3" disabled={loading}>{loading ? 'Creating...' : 'Register'}</Button>
      <p className="mt-5 text-center text-sm text-slate-500">Already have account? <Link className="font-bold text-indigo-600" to="/login">Login</Link></p>
    </form>
  </div>
}
