import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Zap } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 animate-fade-in bg-dark-300">
      {/* Glow bg */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(163,240,0,0.06) 0%,transparent 70%)' }}/>

      <div className="relative z-10">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-lime-400/20 animate-float shadow-lime"
          style={{ background:'linear-gradient(135deg,rgba(163,240,0,0.1),rgba(132,204,22,0.05))' }}>
          <Zap size={36} className="text-lime-400"/>
        </div>
        <h1 className="text-7xl font-black gradient-text mb-2">404</h1>
        <h2 className="text-xl font-black text-zinc-200 mb-2">Lane not found</h2>
        <p className="text-zinc-600 mb-8 max-w-xs text-sm">This page doesn't exist in SmartSociety. Let's get you back home.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => window.history.back()} className="btn-outline flex items-center gap-2">
            <ArrowLeft size={15}/> Go Back
          </button>
          <Link to="/home" className="btn-primary flex items-center gap-2 font-black">
            <Home size={15}/> Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
