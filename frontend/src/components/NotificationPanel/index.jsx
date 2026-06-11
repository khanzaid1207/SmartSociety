import { useEffect, useState } from 'react'
import { Bell, Check, AlertTriangle, MessageCircle, Heart, Info, X } from 'lucide-react'
import { notifAPI } from '../../services/api'
import { timeAgo } from '../../utils/helpers'

const STYLES = {
  emergency: { Icon:AlertTriangle, cls:'bg-red-500/10 text-red-400',   dot:'bg-red-400'   },
  comment:   { Icon:MessageCircle, cls:'bg-lime-400/10 text-lime-400', dot:'bg-lime-400'  },
  like:      { Icon:Heart,         cls:'bg-pink-500/10 text-pink-400', dot:'bg-pink-400'  },
  info:      { Icon:Info,          cls:'bg-zinc-800 text-zinc-400',    dot:'bg-zinc-500'  },
}
const MOCK = [
  { _id:'1', type:'emergency', message:'🚨 Emergency: Water pipe burst on 3rd floor!', read:false, createdAt:new Date(Date.now()-5*60000).toISOString() },
  { _id:'2', type:'like',      message:'Priya liked your post about the parking issue.', read:false, createdAt:new Date(Date.now()-30*60000).toISOString() },
  { _id:'3', type:'comment',   message:'Amit commented on your help request.',           read:true,  createdAt:new Date(Date.now()-2*3600000).toISOString() },
  { _id:'4', type:'info',      message:'New notice: Society meeting this Sunday 6 PM.',  read:true,  createdAt:new Date(Date.now()-5*3600000).toISOString() },
]

export default function NotificationPanel({ onClose }) {
  const [notifs, setNotifs]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notifAPI.getAll()
      .then(r => setNotifs(r.data.notifications?.length ? r.data.notifications : MOCK))
      .catch(() => setNotifs(MOCK))
      .finally(() => setLoading(false))
  }, [])

  async function markAll() {
    await notifAPI.markAllRead().catch(() => {})
    setNotifs(p => p.map(n => ({ ...n, read:true })))
  }
  const unread = notifs.filter(n => !n.read).length

  return (
    <div className="absolute right-0 mt-2 w-80 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-down"
      style={{ background:'#0d0d0d' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800"
        style={{ background:'linear-gradient(135deg,#0a0a0a,#0d1a00)' }}>
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-lime-400"/>
          <span className="font-black text-sm text-white">Notifications</span>
          {unread > 0 && (
            <span className="text-[10px] font-black text-black px-1.5 py-0.5 rounded-full"
              style={{ background:'linear-gradient(135deg,#a3f000,#84cc16)' }}>{unread}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unread > 0 && (
            <button onClick={markAll} className="text-xs text-lime-400 hover:text-lime-300 font-bold flex items-center gap-1 transition-colors">
              <Check size={11}/> All read
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-600 ml-1 transition-colors">
            <X size={14}/>
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-zinc-900">
        {loading && <p className="text-center py-8 text-sm text-zinc-600">Loading…</p>}
        {!loading && notifs.length === 0 && (
          <div className="py-10 text-center">
            <Bell size={28} className="mx-auto text-zinc-700 mb-2"/>
            <p className="text-sm text-zinc-600">All caught up!</p>
          </div>
        )}
        {notifs.map(n => {
          const s = STYLES[n.type] ?? STYLES.info
          return (
            <div key={n._id}
              className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-zinc-800/50 ${!n.read ? 'bg-lime-400/3' : ''}`}
              onClick={() => { notifAPI.markRead(n._id).catch(()=>{}); setNotifs(p => p.map(x => x._id===n._id?{...x,read:true}:x)) }}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s.cls}`}>
                <s.Icon size={14}/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-300 leading-snug">{n.message}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.read && <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${s.dot}`}
                style={n.type==='comment'?{boxShadow:'0 0 6px rgba(163,240,0,0.6)'}:{}}/>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
