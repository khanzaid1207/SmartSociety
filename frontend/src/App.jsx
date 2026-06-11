import { useState } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar  from './components/Navbar'
import Sidebar from './components/Sidebar'
import Login    from './pages/Login'
import Register from './pages/Register'
import Home     from './pages/Home'
import Explore  from './pages/Explore'
import Business from './pages/Business'
import Profile  from './pages/Profile'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

function ProtectedLayout() {
  const { user, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-dark-300">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lime animate-glow-pulse"
          style={{ background:'linear-gradient(135deg,#a3f000,#65a30d)' }}>
          <span className="text-2xl">🏘️</span>
        </div>
        <div className="w-6 h-6 border-2 border-lime-400 border-t-transparent rounded-full animate-spin"/>
        <p className="text-xs text-zinc-600 font-semibold tracking-widest uppercase">Loading</p>
      </div>
    </div>
  )

  if (!user) return <Navigate to="/login" replace/>

  return (
    <div className="min-h-screen bg-dark-200">
      <Navbar onMenuToggle={() => setSidebarOpen(true)}/>
      <div className="flex max-w-6xl mx-auto">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}/>
        <main className="flex-1 min-w-0 pb-10">
          <Outlet/>
        </main>
      </div>
    </div>
  )
}

function GuestLayout() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/home" replace/>
  return <Outlet/>
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace/>}/>
        <Route element={<GuestLayout/>}>
          <Route path="/login"    element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
        </Route>
        <Route element={<ProtectedLayout/>}>
          <Route path="/home"        element={<Home/>}/>
          <Route path="/explore"     element={<Explore/>}/>
          <Route path="/business"    element={<Business/>}/>
          <Route path="/profile"     element={<Profile/>}/>
          <Route path="/profile/:id" element={<Profile/>}/>
          <Route path="/settings"    element={<Settings/>}/>
        </Route>
        <Route path="*" element={<NotFound/>}/>
      </Routes>
    </AuthProvider>
  )
}
