import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Camera, MapPin, Building2, BadgeCheck, Loader2, Grid3X3, Heart, Users } from 'lucide-react'
import { userAPI, postAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'
import { getInitials } from '../utils/helpers'
import toast from 'react-hot-toast'

const DARK_AV = ['bg-lime-400/15 text-lime-400','bg-sky-400/15 text-sky-400','bg-violet-400/15 text-violet-400','bg-amber-400/15 text-amber-400','bg-pink-400/15 text-pink-400']
const darkAv = name => DARK_AV[(name?.charCodeAt(0)||0)%DARK_AV.length]

const MOCK_POSTS = [
  { _id:'pp1', author:{_id:'me',name:'You'}, content:'Society meeting this Sunday at 6 PM. See you all there! 🏘️', category:'event',   level:'society', likesCount:8,  likedByMe:false, comments:[], createdAt:new Date(Date.now()-2*3600000).toISOString() },
  { _id:'pp2', author:{_id:'me',name:'You'}, content:'Anyone know a good plumber in Andheri West? My kitchen tap is leaking.', category:'help',    level:'society', likesCount:3,  likedByMe:false, comments:[{_id:'c1',author:{name:'Amit'},text:'Try Ramesh plumbing!',createdAt:new Date().toISOString()}], createdAt:new Date(Date.now()-24*3600000).toISOString() },
  { _id:'pp3', author:{_id:'me',name:'You'}, content:'Beautiful sunset from the terrace today 🌅 Mumbai evenings are truly something else.', category:'general', level:'public', likesCount:41, likedByMe:false, comments:[], createdAt:new Date(Date.now()-48*3600000).toISOString() },
]

export default function Profile() {
  const { id } = useParams()
  const { user:me, updateUser } = useAuth()
  const isOwnProfile = !id || id === me?._id
  const targetId = isOwnProfile ? me?._id : id

  const [profile, setProfile]   = useState(isOwnProfile ? me : null)
  const [posts, setPosts]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [editing, setEditing]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [editForm, setEditForm] = useState({ name:'', bio:'' })

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [profRes, s, a, p] = await Promise.allSettled([
          userAPI.getProfile(targetId),
          postAPI.getFeed('society', { author:targetId, limit:50 }),
          postAPI.getFeed('area',    { author:targetId, limit:50 }),
          postAPI.getFeed('public',  { author:targetId, limit:50 }),
        ])
        if (profRes.status==='fulfilled') setProfile(profRes.value.data.user)
        const all = [
          ...(s.status==='fulfilled' ? s.value.data.posts??[] : []),
          ...(a.status==='fulfilled' ? a.value.data.posts??[] : []),
          ...(p.status==='fulfilled' ? p.value.data.posts??[] : []),
        ]
        const seen = new Set(); const unique = all.filter(x => { if(seen.has(x._id))return false; seen.add(x._id);return true })
        unique.sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt))
        setPosts(unique)
      } catch {
        setProfile(me)
        setPosts(isOwnProfile ? MOCK_POSTS.map(p=>({...p,author:{...p.author,_id:me?._id,name:me?.name}})) : [])
      } finally { setLoading(false) }
    }
    if (targetId) load()
  }, [targetId])

  const displayPosts = posts.length > 0 ? posts
    : (isOwnProfile ? MOCK_POSTS.map(p=>({...p,author:{...p.author,_id:me?._id,name:me?.name}})) : [])

  function startEdit() { setEditForm({ name:profile?.name??'', bio:profile?.bio??'' }); setEditing(true) }

  async function saveEdit() {
    setSaving(true)
    try {
      const res = await userAPI.updateProfile(editForm)
      updateUser(res.data.user); setProfile(res.data.user); setEditing(false)
      toast.success('Profile updated!')
    } catch { toast.error('Could not save changes') }
    finally { setSaving(false) }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]; if (!file) return
    try {
      const res = await userAPI.uploadAvatar(file)
      updateUser({ avatar:res.data.avatarUrl }); setProfile(p=>({...p,avatar:res.data.avatarUrl}))
      toast.success('Avatar updated!')
    } catch { toast.error('Could not upload image') }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-lime-400 border-t-transparent animate-spin"/>
      <p className="text-sm text-zinc-600">Loading profile…</p>
    </div>
  )

  const totalLikes = displayPosts.reduce((s,p) => s+(p.likesCount??0), 0)

  return (
    <div className="max-w-2xl mx-auto px-3 py-6 space-y-4 animate-fade-in">

      {/* Profile card */}
      <div className="rounded-2xl border border-zinc-800 overflow-hidden" style={{ background:'#0d0d0d' }}>
        {/* Cover */}
        <div className="h-28 relative overflow-hidden"
          style={{ background:'linear-gradient(135deg,#0a0a0a 0%,#0d1a00 50%,#1a2c00 100%)' }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage:'linear-gradient(rgba(163,240,0,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(163,240,0,0.4) 1px,transparent 1px)', backgroundSize:'40px 40px' }}/>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none"
            style={{ background:'radial-gradient(circle,rgba(163,240,0,0.12) 0%,transparent 70%)' }}/>
        </div>

        <div className="px-5 pb-5">
          <div className="relative -mt-12 mb-4 flex items-end justify-between">
            <div className="relative">
              {profile?.avatar
                ? <img src={profile.avatar} alt={profile.name} className="w-20 h-20 rounded-2xl object-cover border-4 shadow-lg" style={{ borderColor:'#0d0d0d' }}/>
                : <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black border-4 shadow-lg ${darkAv(profile?.name)}`} style={{ borderColor:'#0d0d0d' }}>
                    {getInitials(profile?.name)}
                  </div>
              }
              {isOwnProfile && (
                <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer shadow-lime transition-all hover:scale-110"
                  style={{ background:'linear-gradient(135deg,#a3f000,#65a30d)' }}>
                  <Camera size={13} className="text-black"/>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange}/>
                </label>
              )}
            </div>
            {isOwnProfile && !editing && (
              <button onClick={startEdit} className="btn-outline text-xs px-3 py-1.5">Edit Profile</button>
            )}
          </div>

          {editing ? (
            <div className="space-y-3">
              <input value={editForm.name} onChange={e=>setEditForm(p=>({...p,name:e.target.value}))}
                className="input-field font-bold" placeholder="Your name"/>
              <textarea value={editForm.bio} onChange={e=>setEditForm(p=>({...p,bio:e.target.value}))}
                className="input-field resize-none text-sm" rows={2} placeholder="Short bio…"/>
              <div className="flex gap-2">
                <button onClick={saveEdit} disabled={saving} className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5">
                  {saving && <Loader2 size={13} className="animate-spin"/>} Save
                </button>
                <button onClick={() => setEditing(false)} className="btn-outline text-sm px-4 py-2">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-black text-white">{profile?.name}</h1>
                {profile?.isVerified && <BadgeCheck size={17} className="text-lime-400"/>}
                <span className="chip chip-lime capitalize text-[10px] font-black">{profile?.role ?? 'Resident'}</span>
              </div>
              <p className="text-sm text-zinc-500 mb-3">{profile?.bio || 'No bio yet — click Edit Profile to add one.'}</p>
              <div className="flex flex-wrap gap-2">
                {profile?.society?.name && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-800 px-2.5 py-1 rounded-full border border-zinc-700">
                    <Building2 size={11} className="text-lime-400"/> {profile.society.name}
                  </div>
                )}
                {(profile?.area || profile?.city) && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-800 px-2.5 py-1 rounded-full border border-zinc-700">
                    <MapPin size={11} className="text-lime-400"/> {[profile.area, profile.city].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-zinc-800">
            {[
              { Icon:Grid3X3, label:'Posts',        value:displayPosts.length },
              { Icon:Heart,   label:'Likes',         value:totalLikes },
              { Icon:Users,   label:'Member since',  value:profile?.createdAt ? new Date(profile.createdAt).getFullYear() : '—' },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="text-center p-3 rounded-xl hover:bg-zinc-800/50 transition-colors group cursor-default">
                <p className="text-2xl font-black gradient-text">{value}</p>
                <p className="text-[11px] text-zinc-600 mt-0.5 flex items-center justify-center gap-1">
                  <Icon size={10} className="text-lime-400/50"/> {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="flex items-center gap-2 px-1">
        <div className="w-1 h-4 rounded-full" style={{ background:'linear-gradient(180deg,#a3f000,#65a30d)' }}/>
        <h2 className="text-sm font-black text-zinc-300">Posts ({displayPosts.length})</h2>
      </div>

      {displayPosts.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center">
          <Grid3X3 size={28} className="mx-auto text-zinc-700 mb-3"/>
          <p className="font-bold text-zinc-500">No posts yet</p>
        </div>
      ) : (
        displayPosts.map(p => (
          <PostCard key={p._id} post={p} currentUser={me}
            onLike={() => {}}
            onDelete={() => setPosts(prev => prev.filter(x => x._id !== p._id))}/>
        ))
      )}
    </div>
  )
}
