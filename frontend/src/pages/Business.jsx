import { useState, useEffect } from 'react'
import { Store, Plus, MapPin, Loader2, Search, X } from 'lucide-react'
import { businessAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import BusinessCard from '../components/BusinessCard'
import toast from 'react-hot-toast'

const MOCK = [
  { _id:'b1', name:'Chai Tapri',        category:'food',      isVerified:true,  promoText:'New flavors this week — masala, rose & ginger lemon!', phone:'9800000001', area:{ name:'Andheri West' } },
  { _id:'b2', name:'Meena Grocery',     category:'grocery',   isVerified:false, promoText:'5% off on all pulses & oils this weekend.',             phone:'9800000002', area:{ name:'Andheri West' } },
  { _id:'b3', name:'Yoga With Meena',   category:'health',    isVerified:false, promoText:'Free trial class Saturday 6:30 AM at Versova Beach.',   phone:'9800000003', area:{ name:'Versova' } },
  { _id:'b4', name:'Quick Fix Repairs', category:'repair',    isVerified:true,  promoText:'AC servicing, plumbing & electrical — same day.',       phone:'9800000004', area:{ name:'Andheri West' } },
  { _id:'b5', name:'Bright Kids',       category:'education', isVerified:false, promoText:'Summer coding camp for kids 8–14. Limited seats!',      phone:'9800000005', area:{ name:'Andheri West' } },
  { _id:'b6', name:'Glam Studio',       category:'salon',     isVerified:false, promoText:'Flat ₹200 off on hair treatments this month.',          phone:'9800000006', area:{ name:'Andheri West' } },
]

const CATS = ['all','food','grocery','education','health','salon','repair','other']
const CAT_ICONS = { all:'⚡', food:'🍽️', grocery:'🛒', education:'📚', health:'🏥', salon:'💈', repair:'🔧', other:'🏪' }

export default function Business() {
  const { user } = useAuth()
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('all')
  const [searchQ, setSearchQ]       = useState('')
  const [showReg, setShowReg]       = useState(false)
  const [regForm, setRegForm]       = useState({ name:'', category:'food', phone:'', address:'', promoText:'' })
  const [saving, setSaving]         = useState(false)

  useEffect(() => {
    businessAPI.getNearby(user?.area?._id ?? 'demo')
      .then(r => setBusinesses(r.data.businesses?.length ? r.data.businesses : MOCK))
      .catch(() => setBusinesses(MOCK))
      .finally(() => setLoading(false))
  }, [])

  const filtered = businesses.filter(b => {
    const matchCat = filter === 'all' || b.category === filter
    const matchQ   = !searchQ || b.name.toLowerCase().includes(searchQ.toLowerCase()) || (b.promoText||'').toLowerCase().includes(searchQ.toLowerCase())
    return matchCat && matchQ
  })

  async function handleRegister(e) {
    e.preventDefault()
    if (!regForm.name.trim()) { toast.error('Business name required'); return }
    setSaving(true)
    try {
      const res = await businessAPI.register(regForm)
      setBusinesses(p => [res.data.business, ...p])
      setShowReg(false); setRegForm({ name:'', category:'food', phone:'', address:'', promoText:'' })
      toast.success('Business registered! 🎉')
    } catch { toast.error('Could not register business') }
    finally { setSaving(false) }
  }

  const sf = f => e => setRegForm(p => ({ ...p, [f]: e.target.value }))

  return (
    <div className="max-w-2xl mx-auto px-3 py-4 space-y-4 animate-fade-in">

      {/* Hero card */}
      <div className="rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="px-5 py-5 relative overflow-hidden"
          style={{ background:'linear-gradient(135deg,#0a0a0a 0%,#0d1a00 60%,#1a2c00 100%)' }}>
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage:'linear-gradient(rgba(163,240,0,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(163,240,0,0.4) 1px,transparent 1px)', backgroundSize:'40px 40px' }}/>
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Store size={20} className="text-lime-400"/>
                <h1 className="text-lg font-black text-white">Local Businesses</h1>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <MapPin size={11} className="text-lime-400/60"/> {user?.area ?? 'Your Area'}
                <span className="text-zinc-700">·</span>
                <span>{businesses.length} listed</span>
              </div>
            </div>
            <button onClick={() => setShowReg(!showReg)}
              className="flex items-center gap-1.5 font-black text-xs px-3 py-2 rounded-xl shadow-lime active:scale-95 transition-all"
              style={{ background:'linear-gradient(135deg,#a3f000,#84cc16)', color:'#000' }}>
              <Plus size={14}/> Register
            </button>
          </div>
        </div>

        {/* Register form */}
        {showReg && (
          <form onSubmit={handleRegister} className="p-4 space-y-3 border-t border-zinc-800 animate-slide-down"
            style={{ background:'#0d0d0d' }}>
            <h3 className="font-black text-sm text-zinc-200 flex items-center gap-2">
              <Store size={14} className="text-lime-400"/> Register your business
            </h3>
            <input value={regForm.name} onChange={sf('name')} placeholder="Business name *" className="input-field text-sm" required/>
            <select value={regForm.category} onChange={sf('category')} className="input-field text-sm">
              {CATS.filter(c=>c!=='all').map(c=>(
                <option key={c} value={c}>{CAT_ICONS[c]} {c.charAt(0).toUpperCase()+c.slice(1)}</option>
              ))}
            </select>
            <input value={regForm.phone} onChange={sf('phone')} placeholder="Contact number" className="input-field text-sm" type="tel"/>
            <input value={regForm.address} onChange={sf('address')} placeholder="Address" className="input-field text-sm"/>
            <textarea value={regForm.promoText} onChange={sf('promoText')} placeholder="Promo / description (optional)" className="input-field text-sm resize-none" rows={2}/>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-1.5">
                {saving && <Loader2 size={13} className="animate-spin"/>} Submit
              </button>
              <button type="button" onClick={() => setShowReg(false)} className="btn-outline text-sm">Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"/>
        <input value={searchQ} onChange={e=>setSearchQ(e.target.value)}
          placeholder="Search businesses…" className="input-field pl-9 pr-8"/>
        {searchQ && (
          <button onClick={()=>setSearchQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-lime-400 transition-colors">
            <X size={14}/>
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATS.map(cat => {
          const isActive = filter === cat
          return (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`shrink-0 text-xs font-black px-3 py-1.5 rounded-full border-2 capitalize transition-all duration-150 active:scale-95
                ${isActive ? 'border-lime-400 text-black shadow-lime' : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}`}
              style={isActive ? { background:'linear-gradient(135deg,#a3f000,#84cc16)' } : {}}>
              {CAT_ICONS[cat]} {cat === 'all' ? 'All' : cat}
            </button>
          )
        })}
      </div>

      {!loading && (
        <p className="text-xs text-zinc-700 px-1">{filtered.length} business{filtered.length!==1?'es':''} found</p>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 flex gap-3 animate-pulse">
              <div className="skeleton w-12 h-12 rounded-xl shrink-0"/>
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-1/3 rounded"/>
                <div className="skeleton h-2 w-1/2 rounded"/>
                <div className="skeleton h-2 w-2/3 rounded"/>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center">
          <Store size={32} className="mx-auto text-zinc-700 mb-3"/>
          <p className="font-bold text-zinc-500">No businesses found</p>
          <p className="text-sm text-zinc-700 mt-1">Try a different category or search term.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => <BusinessCard key={b._id} business={b}/>)}
        </div>
      )}
    </div>
  )
}
