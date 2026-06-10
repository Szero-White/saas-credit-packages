export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
  }
  return <button className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${styles[variant]} ${className}`} {...props}>{children}</button>
}
