import { useState, useRef } from 'react'
import { X, Image as ImageIcon, Building, MapPin, Globe, Loader2, Zap } from 'lucide-react'
import { postAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/helpers'
import toast from 'react-hot-toast'

const LEVELS = [
  { key:'society', label:'Society', Icon:Building, hint:'Building only',  active:'border-lime-400 bg-lime-400/10 text-lime-400' },
  { key:'area',    label:'Area',    Icon:MapPin,   hint:'Your locality',   active:'border-sky-400 bg-sky-400/10 text-sky-400'   },
  { key:'public',  label:'Public',  Icon:Globe,    hint:'City-wide',       active:'border-violet-400 bg-violet-400/10 text-violet-400' },
]
const MAX_CHARS = 500

export default function CreatePostModal({ isOpen, onClose, onPost, defaultLevel = 'society' }) {
  const { user } = useAuth()
  const [level, setLevel]          = useState(defaultLevel)
  const [content, setContent]      = useState('')
  const [imageFile, setImageFile]  = useState(null)
  const [imagePreview, setPreview] = useState(null)
  const [loading, setLoading]      = useState(false)
  const fileInputRef = useRef(null)
  const remaining = MAX_CHARS - content.length

  function handleImageChange(e) {
    const file = e.target.files?.[0]; if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return }
    setImageFile(file); setPreview(URL.createObjectURL(file))
  }
  function removeImage() { setImageFile(null); setPreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim()) { toast.error('Write something first!'); return }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('content', content.trim()); fd.append('level', level)
      if (imageFile) fd.append('image', imageFile)
      const res = await postAPI.createPost(fd)
      onPost?.(res.data.post); toast.success('Posted! 🎉'); handleClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Could not create post') }
    finally { setLoading(false) }
  }

  function handleClose() { setContent(''); removeImage(); setLevel(defaultLevel); onClose() }
  if (!isOpen) return null

  const lConfig = LEVELS.find(l => l.key === level)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      style={{ background:'rgba(0,0,0,0.8)', backdropFilter:'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && handleClose()}>

      <div className="w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl overflow-hidden animate-slide-up border border-zinc-800"
        style={{ background:'#0d0d0d' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800"
          style={{ background:'linear-gradient(135deg,#0a0a0a,#0d1a00)' }}>
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-lime-400"/>
            <h2 className="font-black text-white">Create Post</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors">
            <X size={16}/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Level selector */}
          <div>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Visibility</p>
            <div className="flex gap-2">
              {LEVELS.map(({ key, label, Icon, hint, active }) => (
                <button key={key} type="button" onClick={() => setLevel(key)} title={hint}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-xs font-black transition-all duration-150 active:scale-95
                    ${level === key ? `${active} shadow-sm` : 'border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400'}`}>
                  <Icon size={15}/> {label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-600 mt-1.5 text-center">{lConfig?.hint}</p>
          </div>

          {/* Author + textarea */}
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-[13px] font-black bg-lime-400/10 text-lime-400 border border-lime-400/20">
              {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full rounded-xl object-cover"/> : getInitials(user?.name)}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-zinc-300 mb-1">{user?.name}</p>
              <textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder="What's happening in your society?"
                rows={4} maxLength={MAX_CHARS + 50} autoFocus
                className="w-full text-sm text-zinc-200 placeholder-zinc-700 resize-none border-0 focus:outline-none bg-transparent leading-relaxed"/>
            </div>
          </div>

          {/* Image preview */}
          {imagePreview && (
            <div className="relative rounded-xl overflow-hidden border border-zinc-700 group">
              <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-cover"/>
              <button type="button" onClick={removeImage}
                className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={12}/>
              </button>
            </div>
          )}

          {/* AI notice */}
          <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 border border-lime-400/10 bg-lime-400/5">
            <Zap size={13} className="text-lime-400 shrink-0"/>
            <span className="text-[11px] text-zinc-500">AI will auto-categorise and spam-check before publishing.</span>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 pt-1 border-t border-zinc-800">
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-600 hover:text-lime-400 transition-colors">
              <ImageIcon size={20}/>
            </button>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden"/>
            <span className={`text-xs ml-auto font-bold ${remaining < 50 ? 'text-red-400' : 'text-zinc-700'}`}>
              {remaining}
            </span>
            <button type="submit" disabled={loading || !content.trim() || remaining < 0}
              className="btn-primary flex items-center gap-2 py-2 px-4">
              {loading && <Loader2 size={14} className="animate-spin"/>}
              {loading ? 'Posting…' : '⚡ Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
