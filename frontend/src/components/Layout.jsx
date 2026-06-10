import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { CreditCard, Home, LogOut, Package, ShieldCheck, Sparkles, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Badge from './Badge'

const base = 'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition'
const navClass = ({ isActive }) => `${base} ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const onLogout = () => {
    logout()
    navigate('/login')
  }

  const Sidebar = () => (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white p-5">
      <Link to="/dashboard" className="mb-8 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-white"><Sparkles size={22} /></div>
        <div>
          <p className="text-base font-black text-slate-900">SaaS Credits</p>
          <p className="text-xs text-slate-500">Credit Package System</p>
        </div>
      </Link>
      <nav className="space-y-2">
        <NavLink to="/dashboard" className={navClass}><Home size={18} />Dashboard</NavLink>
        <NavLink to="/pricing" className={navClass}><Package size={18} />Pricing</NavLink>
        <NavLink to="/transactions" className={navClass}><CreditCard size={18} />Transactions</NavLink>
        <NavLink to="/features" className={navClass}><ShieldCheck size={18} />Features</NavLink>
        {isAdmin && <NavLink to="/admin/packages" className={navClass}><Package size={18} />Admin Packages</NavLink>}
      </nav>
      <button onClick={onLogout} className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"><LogOut size={18} />Logout</button>
    </aside>
  )

  return <div className="min-h-screen bg-slate-50">
    <div className="hidden fixed inset-y-0 left-0 z-30 lg:block"><Sidebar /></div>
    {open && <div className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden" onClick={() => setOpen(false)}><div className="h-full" onClick={(e) => e.stopPropagation()}><Sidebar /></div></div>}
    <main className="lg:pl-72">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur lg:px-8">
        <div className="flex items-center justify-between">
          <button className="lg:hidden" onClick={() => setOpen(true)}><Menu /></button>
          <div>
            <h1 className="text-xl font-black text-slate-900">Credit Packages Dashboard</h1>
            <p className="text-sm text-slate-500">Manage credits, purchases and unlocked SaaS features.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block"><p className="text-sm font-bold text-slate-900">{user?.name}</p><p className="text-xs text-slate-500">{user?.email}</p></div>
            <Badge type={user?.role}>{user?.role}</Badge>
          </div>
        </div>
      </header>
      <section className="p-4 lg:p-8"><Outlet /></section>
    </main>
  </div>
}
