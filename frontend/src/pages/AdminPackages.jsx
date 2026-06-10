import { useEffect, useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { featureApi, packageApi } from '../api/api'
import { money, title } from '../utils/format'

const empty = { name: '', description: '', price: 0, credits: 100, is_active: true, feature_codes: [] }

export default function AdminPackages() {
  const [packages, setPackages] = useState([])
  const [features, setFeatures] = useState([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [message, setMessage] = useState('')

  const load = async () => { const [p, f] = await Promise.all([packageApi.list(), featureApi.all()]); setPackages(p.data); setFeatures(f.data) }
  useEffect(() => { load().catch(console.error) }, [])

  const toggleFeature = (code) => {
    const exists = form.feature_codes.includes(code)
    setForm({ ...form, feature_codes: exists ? form.feature_codes.filter(c => c !== code) : [...form.feature_codes, code] })
  }

  const submit = async (e) => {
    e.preventDefault(); setMessage('')
    const payload = { ...form, price: Number(form.price), credits: Number(form.credits) }
    try {
      if (editing) await packageApi.update(editing, payload); else await packageApi.create(payload)
      setForm(empty); setEditing(null); setMessage('Saved successfully'); await load()
    } catch (e) { setMessage(e.message) }
  }

  const edit = (pkg) => { setEditing(pkg.id); setForm({ name: pkg.name, description: pkg.description || '', price: pkg.price, credits: pkg.credits, is_active: pkg.is_active, feature_codes: pkg.features.map(f => f.code) }) }
  const remove = async (id) => { if (!confirm('Delete this package?')) return; await packageApi.remove(id); await load() }

  return <div className="grid gap-6 xl:grid-cols-3">
    <Card><h2 className="text-2xl font-black">{editing ? 'Edit Package' : 'Create Package'}</h2>{message && <p className="mt-3 rounded-xl bg-indigo-50 p-3 text-sm font-bold text-indigo-700">{message}</p>}<form onSubmit={submit} className="mt-5 space-y-4">
      <input className="w-full rounded-xl border px-4 py-3" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
      <textarea className="w-full rounded-xl border px-4 py-3" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
      <div className="grid grid-cols-2 gap-3"><input type="number" className="rounded-xl border px-4 py-3" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /><input type="number" className="rounded-xl border px-4 py-3" placeholder="Credits" value={form.credits} onChange={e => setForm({ ...form, credits: e.target.value })} /></div>
      <div><p className="mb-2 text-sm font-bold text-slate-700">Features</p><div className="space-y-2">{features.map(f => <label key={f.id} className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.feature_codes.includes(f.code)} onChange={() => toggleFeature(f.code)} />{title(f.code)}</label>)}</div></div>
      <Button className="w-full">{editing ? 'Update Package' : 'Create Package'}</Button>{editing && <Button type="button" variant="secondary" className="w-full" onClick={() => { setEditing(null); setForm(empty) }}>Cancel</Button>}
    </form></Card>
    <Card className="xl:col-span-2"><h2 className="text-2xl font-black">Packages</h2><div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-slate-500"><tr><th className="py-3">Name</th><th>Price</th><th>Credits</th><th>Features</th><th>Actions</th></tr></thead><tbody>{packages.map(pkg => <tr key={pkg.id} className="border-t border-slate-100"><td className="py-4 font-bold">{pkg.name}</td><td>{money(pkg.price)}</td><td>{pkg.credits}</td><td><div className="flex flex-wrap gap-1">{pkg.features.map(f => <Badge key={f.id} type={f.code}>{title(f.code)}</Badge>)}</div></td><td><div className="flex gap-2"><Button variant="secondary" onClick={() => edit(pkg)}>Edit</Button><Button variant="danger" onClick={() => remove(pkg.id)}>Delete</Button></div></td></tr>)}</tbody></table></div></Card>
  </div>
}
