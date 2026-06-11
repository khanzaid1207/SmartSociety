import { useState, useEffect } from 'react'
import { Search, X, Compass } from 'lucide-react'
import { postAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'
import { CATEGORY_CONFIG } from '../utils/helpers'

const CATS = ['all', ...Object.keys(CATEGORY_CONFIG)]
const MOCK = [
  { _id:'e1', author:{_id:'u1',name:'Neha Gupta'}, content:'Lost black Labrador near B-wing. Please call if spotted! 🐶', category:'help',     level:'society', likesCount:22, likedByMe:false, comments:[], createdAt:new Date(Date.now()-3600000).toISOString() },
  { _id:'e2', author:{_id:'u2',name:'Chai Tapri',isVerified:true}, content:'New masala chai now available! Visit near D-Mart gate.', category:'business', level:'area',    likesCount:31, likedByMe:false, comments:[], createdAt:new Date(Date.now()-7200000).toISOString() },
  { _id:'e3', author:{_id:'u3',name:'Yoga With Meena'}, content:'Free trial yoga session at Versova Beach this Saturday 6:30 AM!', category:'event',    level:'area',    likesCount:45, likedByMe:false, comments:[], createdAt:new Date(Date.now()-10800000).toISOString() },
  { _id:'e4', author:{_id:'u4',name:'CityAlert Mumbai',isVerified:true}, content:'BMC yellow alert: Heavy rain expected tonight along coastal areas.', category:'emergency', level:'public', likesCount:510, likedByMe:false, comments:[], createdAt:new Date(Date.now()-1800000).toISOString() },
]

export default function Explore() {
  const { user } = useAuth()
  const [query, setQuery]       = useState('')
  const [category, setCategory] = useState('all')
  const [posts, setPosts]       = useState(MOCK)
  const [loading, setLoading]   = useState(false)

  async function search(e) {
    e?.preventDefault(); setLoading(true)
    try {
      const res = await postAPI.getFeed('public', { q:query||undefined, category:category!=='all'?category:undefined, limit:20 })
      setPosts(res.data.posts?.length ? res.data.posts : MOCK)
    } catch { setPosts(MOCK) }
    finally { setLoading(false) }
  }

  useEffect(() => { search() }, [category])

  return (
    <div className="max-w-2xl mx-auto px-3 py-4 space-y-4 animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-lime-400/20 shadow-lime"
          style={{ background:'linear-gradient(135deg,rgba(163,240,0,0.1),rgba(132,204,22,0.05))' }}>
          <Compass size={20} className="text-lime-400"/>
        </div>
        <div>
          <h1 className="text-lg font-black text-white">Explore</h1>
          <p className="text-xs text-zinc-600">Search posts across your community</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={search} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"/>
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search posts, businesses, topics…" className="input-field pl-9 pr-8"/>
          {query && (
            <button type="button" onClick={() => { setQuery(''); setPosts(MOCK) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-lime-400 transition-colors">
              <X size={14}/>
            </button>
          )}
        </div>
        <button type="submit" className="btn-primary px-4 font-bold">Search</button>
      </form>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATS.map(cat => {
          const isActive = category === cat
          return (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`shrink-0 text-xs font-black px-3.5 py-1.5 rounded-full border-2 capitalize transition-all duration-150 active:scale-95
                ${isActive
                  ? 'border-lime-400 text-black shadow-lime'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}`}
              style={isActive ? { background:'linear-gradient(135deg,#a3f000,#84cc16)' } : {}}>
              {cat === 'all' ? '⚡ All' : CATEGORY_CONFIG[cat]?.label ?? cat}
            </button>
          )
        })}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center">
          <Search size={32} className="mx-auto text-zinc-700 mb-3"/>
          <p className="font-bold text-zinc-500">No results found</p>
          <p className="text-sm text-zinc-700 mt-1">Try different keywords or category.</p>
        </div>
      ) : (
        posts.map(p => <PostCard key={p._id} post={p} currentUser={user} onLike={() => {}} onDelete={() => {}}/>)
      )}
    </div>
  )
}
