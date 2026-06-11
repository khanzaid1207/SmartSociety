import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Building2, Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { isValidEmail } from '../utils/helpers'
import toast from 'react-hot-toast'

const ROLES = [
  { key:'resident', label:'Resident',  icon:'🏠', desc:'Live in a society' },
  { key:'business', label:'Business',  icon:'🏪', desc:'Run a local business' },
  { key:'rwa',      label:'RWA Admin', icon:'🏛️', desc:'Manage a society' },
]

export default function Register() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [step, setStep]         = useState(1)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState({})
  const [form, setForm] = useState({ name:'', email:'', password:'', societyName:'', societyCode:'', area:'', city:'', role:'resident' })

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  function validateStep1() {
    const e = {}
    if (!form.name.trim())         e.name     = 'Name is required'
    if (!isValidEmail(form.email)) e.email    = 'Enter a valid email'
    if (form.password.length < 6)  e.password = 'Min. 6 characters'
    setErrors(e); return Object.keys(e).length === 0
  }
  function validateStep2() {
    const e = {}
    if (!form.city.trim()) e.city = 'City is required'
    if (!form.area.trim()) e.area = 'Area is required'
    setErrors(e); return Object.keys(e).length === 0
  }
  function nextStep() { if (validateStep1()) { setErrors({}); setStep(2) } }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validateStep2()) return
    setLoading(true)
    try {
      const res = await authAPI.register(form)
      login(res.data.user, res.data.token)
      toast.success('Welcome to SmartSociety! 🎉')
      navigate('/home')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex bg-dark-300">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-center p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0a0a0a 0%, #0d1a00 60%, #1a2c00 100%)' }}>
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage:'linear-gradient(rgba(163,240,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(163,240,0,0.3) 1px, transparent 1px)', backgroundSize:'60px 60px' }} />
        <div className="absolute top-1/3 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ background:'radial-gradient(circle, rgba(163,240,0,0.1) 0%, transparent 70%)' }} />

        <div className="relative z-10 animate-slide-up">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lime"
              style={{ background:'linear-gradient(135deg,#a3f000,#65a30d)' }}>
              <Building2 size={20} className="text-black" />
            </div>
            <span className="font-black text-xl text-white">Smart<span className="gradient-text">Society</span></span>
          </div>

          <h2 className="text-3xl font-black text-white mb-3">Join your<br /><span className="gradient-text">community</span> today.</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-xs">
            Set up your account in 2 quick steps and start connecting with your neighbourhood.
          </p>
          <div className="space-y-3">
            {['Choose your role & set a password','Pick your city and society','Start posting and connecting!'].map((s,i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0
                  ${i < step ? 'shadow-lime text-black' : 'border border-zinc-700 text-zinc-500'}`}
                  style={i < step ? { background:'linear-gradient(135deg,#a3f000,#65a30d)' } : {}}>
                  {i < step ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span className={`text-sm ${i < step ? 'text-zinc-200' : 'text-zinc-600'}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-dark-200">
        <div className="w-full max-w-md animate-scale-in">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-zinc-500 mb-2 font-semibold">
              <span>Step {step} of 2 — {step===1?'Account Details':'Your Location'}</span>
              <span className="text-lime-400">{step * 50}%</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500 shadow-lime"
                style={{ width:`${step*50}%`, background:'linear-gradient(90deg,#a3f000,#84cc16)' }} />
            </div>
          </div>

          <div className="card p-7 border-zinc-800">
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="mb-5">
                  <h2 className="text-xl font-black text-white">Create Account</h2>
                  <p className="text-zinc-500 text-sm mt-1">Fill in your details to get started</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-widest">Full Name</label>
                  <input type="text" value={form.name} onChange={set('name')} placeholder="Ravi Kumar"
                    className={`input-field ${errors.name?'border-red-500':''}`} autoFocus />
                  {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-widest">Email</label>
                  <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com"
                    className={`input-field ${errors.email?'border-red-500':''}`} />
                  {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-widest">Password</label>
                  <div className="relative">
                    <input type={showPass?'text':'password'} value={form.password} onChange={set('password')}
                      placeholder="Min. 6 characters" className={`input-field pr-11 ${errors.password?'border-red-500':''}`} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-lime-400 transition-colors">
                      {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-widest">I am a…</label>
                  <div className="grid grid-cols-3 gap-2">
                    {ROLES.map(r => (
                      <button key={r.key} type="button" onClick={() => setForm(p=>({...p,role:r.key}))}
                        className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-bold transition-all duration-150 active:scale-95
                          ${form.role===r.key
                            ? 'border-lime-400 bg-lime-400/10 text-lime-400 shadow-lime'
                            : 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'}`}>
                        <span className="text-lg">{r.icon}</span>
                        <span>{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button type="button" onClick={nextStep}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3 font-black">
                  Next Step <ArrowRight size={16}/>
                </button>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
                <div className="mb-5">
                  <h2 className="text-xl font-black text-white">Your Location</h2>
                  <p className="text-zinc-500 text-sm mt-1">Help us show you relevant community content</p>
                </div>

                {[
                  { key:'city', label:'City', placeholder:'Mumbai', required:true },
                  { key:'area', label:'Area / Locality', placeholder:'Andheri West', required:true },
                  { key:'societyName', label:'Society Name', placeholder:'Sunrise Apartments', required:false },
                  { key:'societyCode', label:'Invite Code', placeholder:'ABC123 (if you have one)', required:false },
                ].map(({ key, label, placeholder, required }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-widest">
                      {label} {!required && <span className="text-zinc-700 font-normal normal-case">(optional)</span>}
                    </label>
                    <input type="text" value={form[key]} onChange={set(key)} placeholder={placeholder}
                      className={`input-field ${errors[key]?'border-red-500':''} ${key==='societyCode'?'uppercase tracking-widest':''}`}
                      maxLength={key==='societyCode'?8:undefined} autoFocus={key==='city'} />
                    {errors[key] && <p className="text-xs text-red-400 mt-1">{errors[key]}</p>}
                  </div>
                ))}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setErrors({}); setStep(1) }}
                    className="btn-outline flex items-center gap-1.5 px-4 py-3">
                    <ArrowLeft size={15}/> Back
                  </button>
                  <button type="submit" disabled={loading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 font-black">
                    {loading && <Loader2 size={16} className="animate-spin"/>}
                    {loading ? 'Creating…' : '🎉 Create Account'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className="text-center text-sm text-zinc-600 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-lime-400 font-bold hover:text-lime-300 transition-colors">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
