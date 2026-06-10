import { useEffect, useState } from 'react'
import { Sparkles, Send, BarChart3 } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { creditApi, featureApi } from '../api/api'
import { title } from '../utils/format'
import { useAuth } from '../context/AuthContext'

const actions = [
  { code: 'generate_image', icon: Sparkles, label: 'Use Generate Image', cost: 5 },
  { code: 'auto_post', icon: Send, label: 'Use Auto Post', cost: 3 },
  { code: 'advanced_analytics', icon: BarChart3, label: 'Use Advanced Analytics', cost: 2 },
]

export default function Features() {
  const [features, setFeatures] = useState([])
  const [credits, setCredits] = useState(0)
  const [message, setMessage] = useState('')
  const { refreshMe } = useAuth()

  const load = async () => {
    const [mine, credit] = await Promise.all([featureApi.mine(), creditApi.current()])
    setFeatures(mine.data)
    setCredits(credit.data.credits_balance)
  }
  useEffect(() => { load().catch(console.error) }, [])

  const unlocked = (code) => features.some(f => f.code === code)
  const use = async (code) => {
    setMessage('')
    try { const res = await featureApi.use(code); setMessage(res.message); setCredits(res.data.credits_balance); await refreshMe() }
    catch (e) { setMessage(e.message) }
  }

  return <div className="space-y-6">
    <div><h2 className="text-3xl font-black">Feature Permissions</h2><p className="mt-2 text-slate-500">Test middleware/check logic. Locked features return 403 until user buys a suitable package.</p></div>
    <Card><p className="text-sm font-bold text-slate-500">Current Credits</p><h3 className="text-4xl font-black text-indigo-600">{credits}</h3></Card>
    {message && <div className="rounded-2xl bg-indigo-50 p-4 font-semibold text-indigo-700">{message}</div>}
    <div className="grid gap-6 lg:grid-cols-3">{actions.map(item => { const Icon = item.icon; const ok = unlocked(item.code); return <Card key={item.code}>
      <div className="flex items-start justify-between"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><Icon /></div><Badge type={ok ? item.code : 'user'}>{ok ? 'Unlocked' : 'Locked'}</Badge></div>
      <h3 className="mt-5 text-xl font-black">{title(item.code)}</h3>
      <p className="mt-2 text-sm text-slate-500">Cost: {item.cost} credits per usage.</p>
      <Button className="mt-6 w-full" disabled={!ok} onClick={() => use(item.code)}>{ok ? item.label : 'Buy package to unlock'}</Button>
    </Card> })}</div>
  </div>
}
