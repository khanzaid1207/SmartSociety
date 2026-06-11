import { AlertTriangle, Clock } from 'lucide-react'
import { timeAgo } from '../../utils/helpers'

export default function EmergencyBanner({ post }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-red-500/30 animate-slide-up"
      style={{ background:'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(220,38,38,0.04))' }}>
      {/* Glow bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-red-400 to-red-600"
        style={{ boxShadow:'0 0 12px rgba(239,68,68,0.7)' }}/>

      <div className="flex gap-4 p-4">
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-red-500/20 border border-red-500/30">
            <AlertTriangle size={20} className="text-red-400"/>
          </div>
          <span className="absolute inset-0 rounded-xl border border-red-400/30 animate-ping-slow"/>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-black text-red-400 uppercase tracking-wider bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
              🚨 Emergency Alert
            </span>
            <span className="text-[10px] font-bold text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">
              AI Pinned
            </span>
          </div>
          <p className="text-sm font-semibold text-zinc-100 leading-snug mb-1.5">{post.content}</p>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Clock size={11}/> {post.author?.name ?? 'Unknown'} · {timeAgo(post.createdAt)}
          </div>
        </div>
      </div>
    </div>
  )
}
