import { NavLink, Link } from 'react-router-dom'
import { Home, Compass, Store, User, Settings, Building2, MapPin, Users, X, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { to:'/home',     Icon:Home,     label:'Home',     accent:'text-lime-400' },
  { to:'/explore',  Icon:Compass,  label:'Explore',  accent:'text-sky-400' },
  { to:'/business', Icon:Store,    label:'Business', accent:'text-amber-400' },
  { to:'/profile',  Icon:User,     label:'Profile',  accent:'text-pink-400' },
  { to:'/settings', Icon:Settings, label:'Settings', accent:'text-zinc-400' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden animate-fade-in" onClick={onClose}/>
      )}
      <aside className={`
        fixed top-0 left-0 h-full w-64 z-40 flex flex-col border-r border-zinc-800
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:sticky lg:top-14 lg:h-[calc(100vh-56px)]
      `} style={{ background:'#0d0d0d' }}>

        {/* Mobile header */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-zinc-800"
          style={{ background:'linear-gradient(135deg,#0a0a0a,#0d1a00)' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background:'linear-gradient(135deg,#a3f000,#65a30d)' }}>
              <Building2 size={14} className="text-black"/>
            </div>
            <span className="font-black text-sm text-white">Smart<span className="gradient-text">Society</span></span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors">
            <X size={16}/>
          </button>
        </div>

        {/* Society card */}
        {user?.society && (
          <div className="mx-3 mt-4">
            <div className="rounded-xl p-3 border border-lime-400/20"
              style={{ background:'linear-gradient(135deg,rgba(163,240,0,0.05),rgba(132,204,22,0.03))' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-lg bg-lime-400/10 flex items-center justify-center">
                  <Building2 size={12} className="text-lime-400"/>
                </div>
                <span className="text-xs font-black text-lime-400 truncate">{user.society.name}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mb-0.5">
                <MapPin size={10}/> {[user.area, user.city].filter(Boolean).join(', ')}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                <Users size={10}/> {user.society.memberCount ?? 0} members
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 mt-4 space-y-0.5">
          {NAV_ITEMS.map(({ to, Icon, label, accent }) => (
            <NavLink key={to} to={to} onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group
                ${isActive
                  ? 'bg-lime-400/10 border border-lime-400/20 text-lime-400'
                  : 'text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-200'}`
              }>
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-lime-400' : `${accent} opacity-60 group-hover:opacity-100 transition-opacity`}/>
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={14} className="text-lime-400/50"/>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Invite */}
        <div className="p-3 mb-3">
          <div className="lime-divider mb-3"/>
          <Link to="/invite"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                       border-2 border-dashed border-lime-400/20 text-xs font-bold text-zinc-500
                       hover:border-lime-400/40 hover:text-lime-400 hover:bg-lime-400/5
                       transition-all duration-200 group">
            <Users size={14} className="group-hover:scale-110 transition-transform"/>
            Invite Neighbours
          </Link>
        </div>
      </aside>
    </>
  )
}
