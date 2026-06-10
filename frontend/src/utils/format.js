export const money = (value) => `$${Number(value || 0).toFixed(2)}`
export const dateTime = (value) => {
	if (!value) return '-'
	// If the timestamp has no timezone offset, treat it as UTC by appending 'Z'
	const hasTZ = /[zZ]|[+-]\d{2}:?\d{2}$/.test(String(value))
	const v = hasTZ ? value : `${value}Z`
	return new Date(v).toLocaleString()
}
export const title = (value) => String(value || '').replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
