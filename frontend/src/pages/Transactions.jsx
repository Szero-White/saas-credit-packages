import { useEffect, useState } from 'react'
import Card from '../components/Card'
import Badge from '../components/Badge'
import { purchaseApi } from '../api/api'
import { dateTime, money } from '../utils/format'

export default function Transactions() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { purchaseApi.transactions().then(res => setItems(res.data)).finally(() => setLoading(false)) }, [])
  if (loading) return <p className="font-semibold text-slate-500">Loading transactions...</p>
  return <Card><h2 className="text-2xl font-black">Purchase History</h2><div className="mt-6 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-slate-500"><tr><th className="py-3">Package</th><th>Amount</th><th>Credits</th><th>Status</th><th>Date</th></tr></thead><tbody>{items.map(t => <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50"><td className="py-4 font-bold">{t.package.name}</td><td>{money(t.amount)}</td><td>{t.credits}</td><td><Badge type={t.status}>{t.status}</Badge></td><td>{dateTime(t.created_at)}</td></tr>)}</tbody></table>{items.length === 0 && <p className="py-10 text-center text-slate-500">No transactions yet.</p>}</div></Card>
}
