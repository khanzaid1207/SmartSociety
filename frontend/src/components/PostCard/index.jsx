import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, BadgeCheck, Cpu, Send } from 'lucide-react'
import { timeAgo, getInitials, avatarColor, formatCount, CATEGORY_CONFIG } from '../../utils/helpers'
import { postAPI } from '../../services/api'
import toast from 'react-hot-toast'

const CHIP_MAP = {
  help:      'bg-sky-500/10 text-sky-400 border-sky-500/20',
  event:     'bg-violet-500/10 text-violet-400 border-violet-500/20',
  business:  'bg-lime-400/10 text-lime-400 border-lime-400/20',
  emergency: 'bg-red-500/10 text-red-400 border-red-500/20',
  general:   'bg-zinc-800 text-zinc-400 border-zinc-700',
  lost_found:'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

const AVATAR_BG = [
  'bg-lime-400/20 text-lime-400',
  'bg-sky-500/20 text-sky-400',
  'bg-violet-500/20 text-violet-400',
  'bg-amber-500/20 text-amber-400',
  'bg-pink-500/20 text-pink-400',
]

function darkAvatarColor(name = '') {
  return AVATAR_BG[(name?.charCodeAt(0) || 0) % AVATAR_BG.length]
}

export default function PostCard({ post, onLike, onDelete, currentUser }) {
  const [showMenu, setShowMenu]         = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText]   = useState('')
  const [comments, setComments]         = useState(post.comments ?? [])
  const [submitting, setSubmitting]     = useState(false)

  const author     = post.author ?? {}
  const catConfig  = CATEGORY_CONFIG[post.category] ?? CATEGORY_CONFIG.general
  const isOwner    = currentUser?._id === author._id
  const isEmergency = post.category === 'emergency'

  async function submitComment(e) {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      const res = await postAPI.addComment(post._id, commentText.trim())
      setComments(res.data.comments); setCommentText('')
    } catch { toast.error('Could not add comment') }
    finally { setSubmitting(false) }
  }

  async function handleDelete() {
    if (!confirm('Delete this post?')) return
    try {
      await postAPI.deletePost(post._id); onDelete?.(post._id); toast.success('Post deleted')
    } catch { toast.error('Could not delete') }
  }

  return (
    <article className={`group rounded-2xl border transition-all duration-300
      hover:border-zinc-700 hover:shadow-card-hover hover:-translate-y-0.5 animate-fade-in
      ${isEmergency ? 'border-red-500/20 bg-zinc-900/80' : 'border-zinc-800 bg-zinc-900'}`}>

      {/* Lime accent top line on hover */}
      <div className="h-px rounded-t-2xl bg-gradient-to-r from-transparent via-lime-400/0 to-transparent group-hover:via-lime-400/30 transition-all duration-500"/>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Link to={`/profile/${author._id}`} className="shrink-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-black
                             ring-1 ring-zinc-800 hover:ring-lime-400/40 transition-all duration-200
                             ${darkAvatarColor(author.name)}`}>
              {author.avatar
                ? <img src={author.avatar} alt={author.name} className="w-full h-full rounded-xl object-cover"/>
                : getInitials(author.name)}
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link to={`/profile/${author._id}`}
                className="text-sm font-bold text-zinc-100 hover:text-lime-400 transition-colors">
                {author.name}
              </Link>
              {author.isVerified && <BadgeCheck size={14} className="text-lime-400 shrink-0"/>}
            </div>
            <p className="text-xs text-zinc-600">{timeAgo(post.createdAt)}</p>
          </div>
          <span className={`chip shrink-0 text-[10px] font-black ${CHIP_MAP[post.category] || CHIP_MAP.general}`}>
            {catConfig.label}
          </span>
          {isOwner && (
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300
                           opacity-0 group-hover:opacity-100 transition-all">
                <MoreHorizontal size={15}/>
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-1 z-10 w-36 animate-scale-in">
                  <button onClick={handleDelete}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 size={14}/> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <p className="text-sm text-zinc-300 leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>

        {/* Image */}
        {post.imageUrl && (
          <div className="mb-3 rounded-xl overflow-hidden border border-zinc-800">
            <img src={post.imageUrl} alt="Post" className="w-full max-h-72 object-cover hover:scale-105 transition-transform duration-500"/>
          </div>
        )}

        {/* AI tag */}
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-700 mb-3">
          <Cpu size={10} className="text-lime-400/50"/> AI categorised
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 pt-2.5 border-t border-zinc-800">
          <button onClick={() => onLike?.(post._id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95
              ${post.likedByMe
                ? 'text-red-400 bg-red-500/10 border border-red-500/20'
                : 'text-zinc-500 hover:bg-zinc-800 hover:text-red-400'}`}>
            <Heart size={15} fill={post.likedByMe?'currentColor':'none'}
              className={post.likedByMe?'animate-bounce-soft':''}/>
            {formatCount(post.likesCount ?? 0)}
          </button>

          <button onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95
              ${showComments ? 'text-lime-400 bg-lime-400/10 border border-lime-400/20' : 'text-zinc-500 hover:bg-zinc-800 hover:text-lime-400'}`}>
            <MessageCircle size={15}/> {formatCount(comments.length)}
          </button>

          <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`); toast.success('Link copied!') }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-all duration-200">
            <Share2 size={15}/>
          </button>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="mt-3 pt-3 border-t border-zinc-800 space-y-3 animate-slide-down">
            {comments.length === 0 && (
              <p className="text-xs text-zinc-600 text-center py-2">No comments yet 💬</p>
            )}
            {comments.map(c => (
              <div key={c._id} className="flex gap-2">
                <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black ${darkAvatarColor(c.author?.name)}`}>
                  {getInitials(c.author?.name)}
                </div>
                <div className="bg-zinc-800 rounded-xl px-3 py-2 flex-1 border border-zinc-700">
                  <span className="text-xs font-bold text-zinc-300 mr-1.5">{c.author?.name}</span>
                  <span className="text-xs text-zinc-400">{c.text}</span>
                  <p className="text-[10px] text-zinc-600 mt-0.5">{timeAgo(c.createdAt)}</p>
                </div>
              </div>
            ))}
            <form onSubmit={submitComment} className="flex gap-2 mt-2">
              <input value={commentText} onChange={e => setCommentText(e.target.value)}
                placeholder="Write a comment…" className="input-field text-sm py-2 flex-1" disabled={submitting}/>
              <button type="submit" disabled={submitting || !commentText.trim()}
                className="btn-primary px-3 py-2 shrink-0"><Send size={14}/></button>
            </form>
          </div>
        )}
      </div>
    </article>
  )
}
