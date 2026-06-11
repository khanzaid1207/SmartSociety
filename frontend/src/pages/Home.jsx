import { useState } from 'react'
import { Plus, RefreshCw, WifiOff, Zap } from 'lucide-react'
import FeedTabs from '../components/FeedTabs'
import PostCard from '../components/PostCard'
import EmergencyBanner from '../components/EmergencyBanner'
import CreatePostModal from '../components/CreatePostModal'
import { usePosts, useInfiniteScroll } from '../hooks/usePosts'
import { useAuth } from '../context/AuthContext'

function PostSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
      <div className="flex gap-3">
        <div className="skeleton w-10 h-10 rounded-xl shrink-0"/>
        <div className="flex-1 space-y-2 pt-1">
          <div className="skeleton h-3 w-28 rounded"/>
          <div className="skeleton h-2 w-16 rounded"/>
        </div>
      </div>
      <div className="space-y-2">
        <div className="skeleton h-3 w-full rounded"/>
        <div className="skeleton h-3 w-4/5 rounded"/>
        <div className="skeleton h-3 w-3/5 rounded"/>
      </div>
    </div>
  )
}

const MOCK_POSTS = {
  society: [
    { _id:'s1', author:{_id:'u1',name:'Ravi Kumar',isVerified:false}, content:'Water pipe burst on 3rd floor corridor! Maintenance team needed urgently. Please avoid the area.', category:'emergency', level:'society', likesCount:0, likedByMe:false, comments:[], createdAt:new Date(Date.now()-2*60000).toISOString() },
    { _id:'s2', author:{_id:'u2',name:'Priya Sharma',isVerified:false}, content:'Society meeting this Sunday at 6 PM in the community hall. Agenda: parking rules & garden renovation. All residents please attend! 🌿', category:'event', level:'society', likesCount:14, likedByMe:false, comments:[{_id:'c1',author:{name:'Amit Nair'},text:'Will be there!',createdAt:new Date().toISOString()}], createdAt:new Date(Date.now()-18*60000).toISOString() },
    { _id:'s3', author:{_id:'u3',name:'Neha Gupta',isVerified:false}, content:'Has anyone seen a black Labrador near B-wing? Our dog Milo went missing this morning 😢 Please call if you spot him.', category:'help', level:'society', likesCount:22, likedByMe:false, comments:[], createdAt:new Date(Date.now()-3*3600000).toISOString() },
    { _id:'s4', author:{_id:'u4',name:'Amit Nair',isVerified:false}, content:'Selling a barely-used LG 7kg washing machine. ₹8,000 negotiable. Can deliver within society. DM me!', category:'general', level:'society', likesCount:3, likedByMe:false, comments:[], createdAt:new Date(Date.now()-5*3600000).toISOString() },
  ],
  area: [
    { _id:'a1', author:{_id:'u5',name:'Chai Tapri',isVerified:true}, content:'☕ New cutting chai flavors — masala, ginger lemon & rose! Near D-Mart gate, Andheri West. Open 7 AM–10 PM.', category:'business', level:'area', likesCount:31, likedByMe:false, comments:[], createdAt:new Date(Date.now()-10*60000).toISOString() },
    { _id:'a2', author:{_id:'u6',name:'Andheri West RWA',isVerified:true}, content:'Road repair on SV Road starts Monday. Expect traffic diversions near Lokhandwala from 9 AM–5 PM for 3 days.', category:'general', level:'area', likesCount:88, likedByMe:false, comments:[], createdAt:new Date(Date.now()-45*60000).toISOString() },
    { _id:'a3', author:{_id:'u7',name:'Yoga With Meena',isVerified:false}, content:'Free trial yoga session Saturday at Versova Beach, 6:30 AM. Bring a mat and water. All levels welcome! 🧘', category:'event', level:'area', likesCount:45, likedByMe:false, comments:[], createdAt:new Date(Date.now()-2*3600000).toISOString() },
  ],
  public: [
    { _id:'p1', author:{_id:'u8',name:'CityAlert Mumbai',isVerified:true}, content:'Heavy rain forecast for coastal areas tonight. BMC yellow alert issued. Avoid waterlogged roads.', category:'emergency', level:'public', likesCount:512, likedByMe:false, comments:[], createdAt:new Date(Date.now()-30*60000).toISOString() },
    { _id:'p2', author:{_id:'u9',name:'Rahul Mehta',isVerified:false}, content:'Mumbai local trains are way better than Bangalore Metro for daily commuters — fight me 😄', category:'general', level:'public', likesCount:204, likedByMe:false, comments:[], createdAt:new Date(Date.now()-5*60000).toISOString() },
    { _id:'p3', author:{_id:'u10',name:'Foodie Finds',isVerified:false}, content:'Best vada pav spots in Mumbai ranked — a definitive thread for true Mumbaikars 🧡', category:'general', level:'public', likesCount:1200, likedByMe:false, comments:[], createdAt:new Date(Date.now()-1*3600000).toISOString() },
  ]
}

export default function Home() {
  const { user } = useAuth()
  const [activeLevel, setActiveLevel] = useState('society')
  const [showCreate, setShowCreate]   = useState(false)
  const { posts:apiPosts, loading, error, hasMore, loadMore, toggleLike, addPost, removePost } = usePosts(activeLevel)

  const posts = apiPosts.length > 0 ? apiPosts : (loading ? [] : (MOCK_POSTS[activeLevel] ?? []))
  const emergencyPosts = posts.filter(p => p.category === 'emergency')
  const regularPosts   = posts.filter(p => p.category !== 'emergency')
  const sentinelRef    = useInfiniteScroll(loadMore, hasMore)

  return (
    <div className="min-h-screen bg-dark-200">
      <FeedTabs activeLevel={activeLevel} onChange={setActiveLevel}/>

      <div className="max-w-2xl mx-auto px-3 py-4 space-y-3">
        {/* Quick create bar */}
        <button onClick={() => setShowCreate(true)}
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-3 flex items-center gap-3
                     hover:border-zinc-700 hover:bg-zinc-800/50 transition-all duration-300 group text-left">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black bg-lime-400/10 text-lime-400 border border-lime-400/20 shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <span className="text-sm text-zinc-700 group-hover:text-zinc-500 flex-1 transition-colors">
            What's happening in your society?
          </span>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lime group-hover:shadow-lime-lg transition-shadow"
            style={{ background:'linear-gradient(135deg,#a3f000,#84cc16)' }}>
            <Zap size={15} className="text-black"/>
          </div>
        </button>

        {/* Error banner */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 flex items-center gap-3 text-sm text-red-400">
            <WifiOff size={16}/> {error} — showing demo data.
          </div>
        )}

        {/* Emergency banners */}
        {emergencyPosts.map(p => <EmergencyBanner key={p._id} post={p}/>)}

        {/* Skeletons */}
        {loading && posts.length === 0 && [1,2,3].map(i => <PostSkeleton key={i}/>)}

        {/* Posts */}
        {regularPosts.map(post => (
          <PostCard key={post._id} post={post} onLike={toggleLike} onDelete={removePost} currentUser={user}/>
        ))}

        <div ref={sentinelRef} className="h-4"/>

        {loading && posts.length > 0 && (
          <div className="flex justify-center py-4">
            <RefreshCw size={20} className="animate-spin text-lime-400"/>
          </div>
        )}

        {!loading && !hasMore && posts.length > 0 && (
          <p className="text-center text-xs text-zinc-700 py-6">— End of feed —</p>
        )}

        {!loading && posts.length === 0 && !error && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-lime-400/20"
              style={{ background:'linear-gradient(135deg,rgba(163,240,0,0.08),transparent)' }}>
              <Zap size={28} className="text-lime-400"/>
            </div>
            <p className="font-black text-zinc-300 text-lg">No posts yet</p>
            <p className="text-sm text-zinc-600 mt-1">Be the first to post in this feed!</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary mt-5 mx-auto">
              ⚡ Create a post
            </button>
          </div>
        )}
      </div>

      {/* FAB */}
      <button onClick={() => setShowCreate(true)}
        className="fixed bottom-8 right-6 sm:right-10 w-14 h-14 rounded-full
                   flex items-center justify-center shadow-lime hover:shadow-lime-lg hover:scale-110
                   transition-all duration-200 active:scale-95 z-20 animate-glow-pulse"
        style={{ background:'linear-gradient(135deg,#a3f000,#84cc16)' }}
        aria-label="Create post">
        <Plus size={26} className="text-black font-black"/>
      </button>

      <CreatePostModal isOpen={showCreate} onClose={() => setShowCreate(false)}
        onPost={p => { addPost(p); setShowCreate(false) }} defaultLevel={activeLevel}/>
    </div>
  )
}
