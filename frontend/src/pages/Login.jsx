import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Building2, Loader2, Zap, Shield, Users, Bell } from 'lucide-react'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { isValidEmail } from '../utils/helpers'
import toast from 'react-hot-toast'

const FEATURES = [
  { icon: Zap,    label: 'Emergency Alerts',     desc: 'AI-powered real-time safety' },
  { icon: Users,  label: 'Community Feed',        desc: 'Society, area & public posts' },
  { icon: Shield, label: 'Spam Protection',       desc: 'AI filters toxic content' },
  { icon: Bell,   label: 'Smart Notifications',   desc: 'Only what matters to you' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [errors, setErrors]     = useState({})
  const [focused, setFocused]   = useState('')

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId || clientId === 'your-google-client-id-here') return
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true; script.defer = true
    script.onload = () => window.google?.accounts?.id?.initialize({
      client_id: clientId, callback: handleGoogleCallback, ux_mode: 'popup',
    })
    document.body.appendChild(script)
    return () => { try { document.body.removeChild(script) } catch {} }
  }, [])

  async function handleGoogleCallback(response) {
    setGLoading(true)
    try {
      const res = await authAPI.googleLogin(response.credential)
      login(res.data.user, res.data.token)
      toast.success(`Welcome, ${res.data.user.name}!`)
      navigate('/home')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google login failed')
    } finally { setGLoading(false) }
  }

  function triggerGoogle() {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId || clientId === 'your-google-client-id-here') {
      toast.error('Add VITE_GOOGLE_CLIENT_ID to your .env file'); return
    }
    if (window.google?.accounts?.id) window.google.accounts.id.prompt()
    else toast.error('Google Sign-In is loading, please try again')
  }

  function validate() {
    const e = {}
    if (!isValidEmail(form.email)) e.email = 'Enter a valid email'
    if (form.password.length < 6)  e.password = 'Min. 6 characters'
    setErrors(e); return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await authAPI.login(form)
      login(res.data.user, res.data.token)
      toast.success(`Welcome back, ${res.data.user.name}!`)
      navigate('/home')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  return (
    <div className="min-h-screen flex bg-dark-300">
      {/* LEFT — dark decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0a0a0a 0%, #0d1a00 60%, #1a2c00 100%)' }}>

        {/* Animated glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl animate-glow-pulse pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(163,240,0,0.12) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full blur-3xl animate-float pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(132,204,22,0.08) 0%, transparent 70%)', animationDelay:'1.5s' }} />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage:'linear-gradient(rgba(163,240,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(163,240,0,0.3) 1px, transparent 1px)', backgroundSize:'60px 60px' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lime"
            style={{ background: 'linear-gradient(135deg, #a3f000, #65a30d)' }}>
            <Building2 size={20} className="text-black font-bold" />
          </div>
          <span className="font-bold text-xl text-white">Smart<span className="gradient-text">Society</span></span>
        </div>

        {/* Main content */}
        <div className="relative z-10 animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-lime-400/10 border border-lime-400/20 rounded-full px-3 py-1.5 mb-6">
            <div className="glow-dot animate-ping-slow" />
            <span className="text-lime-400 text-xs font-bold tracking-wider uppercase">AI-Powered Platform</span>
          </div>
          <h1 className="text-5xl font-black text-white leading-tight mb-4">
            Your<br /><span className="gradient-text">Neighbourhood,</span><br />Your Network.
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed max-w-sm">
            Connect with neighbours, get emergency alerts, discover local businesses — all powered by AI.
          </p>

          {/* Feature list */}
          <div className="mt-8 space-y-3">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-lime-400/10 border border-lime-400/20 flex items-center justify-center shrink-0 group-hover:bg-lime-400/20 transition-colors">
                  <Icon size={14} className="text-lime-400" />
                </div>
                <div>
                  <p className="text-zinc-200 text-sm font-semibold">{label}</p>
                  <p className="text-zinc-500 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10 lime-divider" />
      </div>

      {/* RIGHT — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-dark-200">
        <div className="w-full max-w-md animate-scale-in">

          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lime animate-glow-pulse"
              style={{ background: 'linear-gradient(135deg, #a3f000, #65a30d)' }}>
              <Building2 size={28} className="text-black" />
            </div>
            <h1 className="text-2xl font-black"><span className="text-white">Smart</span><span className="gradient-text">Society</span></h1>
          </div>

          <div className="card p-8 border-zinc-800">
            <h2 className="text-2xl font-black text-white mb-1">Sign in</h2>
            <p className="text-zinc-500 text-sm mb-7">Welcome back to your community</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">Email</label>
                <input type="email" value={form.email} onChange={set('email')}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                  placeholder="you@example.com"
                  className={`input-field ${errors.email ? 'border-red-500 ring-2 ring-red-500/20' : focused === 'email' ? 'border-lime-400' : ''}`} />
                {errors.email && <p className="text-xs text-red-400 mt-1 flex items-center gap-1">⚠ {errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')}
                    onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                    placeholder="••••••••"
                    className={`input-field pr-11 ${errors.password ? 'border-red-500' : focused === 'password' ? 'border-lime-400' : ''}`} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-lime-400 transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400 mt-1">⚠ {errors.password}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base font-black mt-2">
                {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in…</> : '→  Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 lime-divider" />
              <span className="text-xs text-zinc-600 font-semibold">or</span>
              <div className="flex-1 lime-divider" />
            </div>

            {/* Google */}
            <button onClick={triggerGoogle} disabled={gLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4
                         bg-zinc-800 border border-zinc-700 hover:border-lime-400/50 hover:bg-zinc-750
                         rounded-xl font-semibold text-sm text-zinc-200 hover:text-white
                         transition-all duration-200 active:scale-95 disabled:opacity-50">
              {gLoading ? <Loader2 size={18} className="animate-spin text-lime-400" /> : (
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
              )}
              Continue with Google
            </button>
          </div>

          <p className="text-center text-sm text-zinc-600 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-lime-400 font-bold hover:text-lime-300 transition-colors">
              Sign up free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
