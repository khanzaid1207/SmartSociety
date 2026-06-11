import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Search, Menu, LogOut, User, Settings, Building2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/helpers'
import NotificationPanel from '../NotificationPanel'

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showNotif, setShowNotif]       = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchQuery, setSearchQuery]   = useState('')

  function handleLogout() { logout(); navigate('/login') }
  function handleSearch(e) {
    e.preventDefault()
    if (searchQuery.trim()) navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  const initials = getInitials(user?.name)

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80"
      style={{ background:'rgba(10,10,10,0.92)', backdropFilter:'blur(16px)' }}>
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">

        {/* Hamburger */}
        <button onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-lime-400 transition-colors">
          <Menu size={20}/>
        </button>

        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lime group-hover:shadow-lime-lg transition-shadow duration-300"
            style={{ background:'linear-gradient(135deg,#a3f000,#65a30d)' }}>
            <Building2 size={16} className="text-black"/>
          </div>
          <span className="font-black text-[15px] hidden sm:block">
            <span className="text-white">Smart</span><span className="gradient-text">Society</span>
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-sm mx-auto">
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-lime-400 transition-colors pointer-events-none"/>
            <input type="search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search posts, neighbours…"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-sm text-zinc-200
                         focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400/60
                         hover:border-zinc-700 transition-all duration-200 placeholder-zinc-700"/>
          </div>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Bell */}
          <div className="relative">
            <button onClick={() => { setShowNotif(!showNotif); setShowDropdown(false) }}
              className="relative p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-lime-400 transition-all duration-150">
              <Bell size={20}/>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-lime-400 rounded-full border-2 border-black animate-ping-slow"/>
            </button>
            {showNotif && <NotificationPanel onClose={() => setShowNotif(false)}/>}
          </div>

          {/* Avatar dropdown */}
          <div className="relative">
            <button onClick={() => { setShowDropdown(!showDropdown); setShowNotif(false) }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-black
                         border-2 border-zinc-700 hover:border-lime-400/60 transition-all duration-200
                         bg-zinc-800 text-lime-400">
              {user?.avatar
                ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover"/>
                : initials}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl py-1.5 z-50 animate-slide-down">
                <div className="px-4 py-3 border-b border-zinc-800 mb-1">
                  <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                </div>
                {[
                  { to:'/profile',  Icon:User,     label:'My Profile' },
                  { to:'/settings', Icon:Settings, label:'Settings' },
                ].map(({ to, Icon, label }) => (
                  <Link key={to} to={to} onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-lime-400 hover:bg-lime-400/5 transition-colors">
                    <Icon size={15}/> {label}
                  </Link>
                ))}
                <div className="border-t border-zinc-800 mt-1.5 pt-1">
                  <button onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    <LogOut size={15}/> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
