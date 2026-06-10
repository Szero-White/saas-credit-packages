import { useEffect, useState } from 'react'
import { CreditCard, Package, ShieldCheck, Sparkles } from 'lucide-react'
import Card from '../components/Card'
import Badge from '../components/Badge'
import { creditApi, featureApi, purchaseApi } from '../api/api'
import { dateTime, title } from '../utils/format'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, refreshMe } = useAuth()
  const [data, setData] = useState({ credits: 0, transactions: [], features: [], logs: [] })
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const [credits, tx, features, logs] = await Promise.all([creditApi.current(), purchaseApi.transactions(), featureApi.mine(), creditApi.logs()])
    setData({ credits: credits.data.credits_balance, transactions: tx.data, features: features.data, logs: logs.data })
    await refreshMe()
    setLoading(false)
  }

  useEffect(() => { load().catch(console.error) }, [])

  if (loading) return <p className="font-semibold text-slate-500">Loading dashboard...</p>

  return <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card><CreditCard className="text-indigo-600" /><p className="mt-4 text-sm font-bold text-slate-500">Current Credits</p><h3 className="text-3xl font-black">{data.credits}</h3></Card>
      <Card><Package className="text-blue-600" /><p className="mt-4 text-sm font-bold text-slate-500">Purchases</p><h3 className="text-3xl font-black">{data.transactions.length}</h3></Card>
      <Card><ShieldCheck className="text-emerald-600" /><p className="mt-4 text-sm font-bold text-slate-500">Unlocked Features</p><h3 className="text-3xl font-black">{data.features.length}</h3></Card>
      <Card><Sparkles className="text-amber-600" /><p className="mt-4 text-sm font-bold text-slate-500">Role</p><h3 className="text-3xl font-black capitalize">{user?.role}</h3></Card>
    </div>

    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-2"><h2 className="text-xl font-black">Recent Transactions</h2><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-slate-500"><tr><th className="py-3">Package</th><th>Credits</th><th>Status</th><th>Date</th></tr></thead><tbody>{data.transactions.slice(0,5).map(t => <tr key={t.id} className="border-t border-slate-100"><td className="py-3 font-bold">{t.package.name}</td><td>{t.credits}</td><td><Badge type={t.status}>{t.status}</Badge></td><td>{dateTime(t.created_at)}</td></tr>)}</tbody></table>{data.transactions.length === 0 && <p className="py-8 text-center text-slate-500">No purchase yet.</p>}</div></Card>
      <Card><h2 className="text-xl font-black">Unlocked Features</h2><div className="mt-4 flex flex-wrap gap-2">{data.features.map(f => <Badge key={f.id} type={f.code}>{title(f.code)}</Badge>)}{data.features.length === 0 && <p className="text-sm text-slate-500">Buy a package to unlock features.</p>}</div></Card>
    </div>
  </div>
}
