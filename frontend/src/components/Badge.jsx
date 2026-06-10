const colors = {
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
  user: 'bg-slate-100 text-slate-700 border-slate-200',
  generate_image: 'bg-blue-100 text-blue-700 border-blue-200',
  auto_post: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  advanced_analytics: 'bg-amber-100 text-amber-700 border-amber-200',
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

export default function Badge({ children, type = 'default' }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${colors[type] || 'bg-indigo-100 text-indigo-700 border-indigo-200'}`}>{children}</span>
}
