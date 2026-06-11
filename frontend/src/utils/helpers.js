import { formatDistanceToNow } from 'date-fns'

export function timeAgo(dateString) {
  try { return formatDistanceToNow(new Date(dateString), { addSuffix: true }) }
  catch { return 'some time ago' }
}

export function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

const AVATAR_COLORS = [
  'bg-lime-400/20 text-lime-400',
  'bg-sky-400/20 text-sky-400',
  'bg-violet-400/20 text-violet-400',
  'bg-amber-400/20 text-amber-400',
  'bg-pink-400/20 text-pink-400',
]
export function avatarColor(name = '') {
  return AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length]
}

export const CATEGORY_CONFIG = {
  help:      { label: 'Help',         bg: 'bg-sky-500/10',    text: 'text-sky-400',    border: 'border-sky-500/20'    },
  event:     { label: 'Event',        bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  business:  { label: 'Business',     bg: 'bg-lime-400/10',   text: 'text-lime-400',   border: 'border-lime-400/20'   },
  emergency: { label: 'Emergency',    bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/20'    },
  general:   { label: 'General',      bg: 'bg-zinc-800',      text: 'text-zinc-400',   border: 'border-zinc-700'      },
  lost_found:{ label: 'Lost & Found', bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/20'  },
}

export const LEVEL_CONFIG = {
  society: { label: 'Society', icon: '🏢' },
  area:    { label: 'Area',    icon: '📍' },
  public:  { label: 'Public',  icon: '🌐' },
}

export function truncate(str = '', maxLen = 120) {
  return str.length <= maxLen ? str : str.slice(0, maxLen).trimEnd() + '…'
}

export function formatCount(n = 0) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1000)    return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}

export function isValidEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
