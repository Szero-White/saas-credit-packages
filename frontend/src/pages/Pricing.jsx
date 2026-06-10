import { useEffect, useState } from 'react'
import { CheckCircle } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { packageApi, purchaseApi } from '../api/api'
import { money, title } from '../utils/format'
import { useAuth } from '../context/AuthContext'

export default function Pricing() {
  const [packages, setPackages] = useState([])
  const [message, setMessage] = useState('')
  const [buying, setBuying] = useState(null)
  const { refreshMe } = useAuth()

  const load = async () => { const res = await packageApi.list(); setPackages(res.data) }
  useEffect(() => { load().catch(console.error) }, [])

  const buy = async (id) => {
    setBuying(id); setMessage('')
    try { const res = await purchaseApi.buy(id); setMessage(res.message); await refreshMe() }
    catch (e) { setMessage(e.message) }
    finally { setBuying(null) }
  }

  return <div className="space-y-6">
    <div><h2 className="text-3xl font-black text-slate-900">Pricing Packages</h2><p className="mt-2 text-slate-500">Choose a credit package. Payment is simulated for this test assignment.</p></div>
    {message && <div className="rounded-2xl bg-indigo-50 p-4 font-semibold text-indigo-700">{message}</div>}
    <div className="grid gap-6 lg:grid-cols-3">{packages.map((pkg) => <Card key={pkg.id} className="flex flex-col">
      <div className="flex items-start justify-between"><div><h3 className="text-2xl font-black">{pkg.name}</h3><p className="mt-2 text-sm text-slate-500">{pkg.description}</p></div><Badge>{pkg.credits} credits</Badge></div>
      <p className="mt-6 text-4xl font-black">{money(pkg.price)}</p>
      <div className="my-6 h-px bg-slate-100" />
      <div className="flex-1 space-y-3">{pkg.features.map(f => <p key={f.id} className="flex items-center gap-2 text-sm font-semibold text-slate-700"><CheckCircle className="text-emerald-600" size={18} />{title(f.code)}</p>)}</div>
      <Button className="mt-8 w-full" onClick={() => buy(pkg.id)} disabled={buying === pkg.id}>{buying === pkg.id ? 'Processing...' : 'Buy Package'}</Button>
    </Card>)}</div>
  </div>
}
