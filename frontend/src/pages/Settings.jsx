import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Bell, Building2, LogOut, ChevronRight, Loader2, Shield, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { userAPI } from '../services/api'
import toast from 'react-hot-toast'

function Section({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden" style={{ background:'#0d0d0d' }}>
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2"
        style={{ background:'linear-gradient(135deg,#0a0a0a,#0d0d0d)' }}>
        {Icon && <Icon size={13} className="text-lime-400"/>}
        <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{title}</h2>
      </div>
      <div className="divide-y divide-zinc-900">{children}</div>
    </div>
  )
}

function Row({ icon: Icon, label, value, onClick, danger, iconColor = 'text-zinc-600' }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3.5 transition-colors text-left group
        ${danger ? 'hover:bg-red-500/5 text-red-400' : 'hover:bg-zinc-800/50 text-zinc-300'}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0
        ${danger ? 'bg-red-500/10 group-hover:bg-red-500/20' : 'bg-zinc-800 group-hover:bg-lime-400/10'}`}>
        <Icon size={15} className={danger ? 'text-red-400' : `${iconColor} group-hover:text-lime-400 transition-colors`}/>
      </div>
      <span className="flex-1 text-sm font-semibold">{label}</span>
      {value && <span className="text-xs text-zinc-600 mr-1 font-medium">{value}</span>}
      <ChevronRight size={14} className="text-zinc-700 group-hover:text-zinc-500 transition-colors"/>
    </button>
  )
}

export default function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showPw, setShowPw]   = useState(false)
  const [pw, setPw]           = useState({ current:'', new_:'', confirm:'' })
  const [saving, setSaving]   = useState(false)

  async function changePassword(e) {
    e.preventDefault()
    if (pw.new_ !== pw.confirm) { toast.error('Passwords do not match'); return }
    if (pw.new_.length < 6)     { toast.error('Min. 6 characters'); return }
    setSaving(true)
    try {
      await userAPI.updateProfile({ currentPassword:pw.current, newPassword:pw.new_ })
      toast.success('Password changed!'); setPw({ current:'', new_:'', confirm:'' }); setShowPw(false)
    } catch (err) { toast.error(err.response?.data?.message ?? 'Could not change password') }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-2xl mx-auto px-3 py-6 space-y-4 animate-fade-in">

      <div className="px-1 mb-2">
        <h1 className="text-xl font-black text-white">Settings</h1>
        <p className="text-sm text-zinc-600">Manage your account and preferences</p>
      </div>

      {/* Profile banner */}
      <div className="rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="p-5 relative overflow-hidden"
          style={{ background:'linear-gradient(135deg,#0a0a0a,#0d1a00,#1a2c00)' }}>
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage:'linear-gradient(rgba(163,240,0,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(163,240,0,0.4) 1px,transparent 1px)', backgroundSize:'30px 30px' }}/>
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black border-2 border-lime-400/30 bg-lime-400/10 text-lime-400 shadow-lime">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-black text-white text-lg">{user?.name}</p>
              <p className="text-zinc-500 text-xs">{user?.email}</p>
              <span className="chip chip-lime capitalize text-[10px] font-black mt-1 inline-flex">{user?.role ?? 'Resident'}</span>
            </div>
          </div>
        </div>
      </div>

      <Section title="Security" icon={Shield}>
        <Row icon={Lock} label="Change Password" iconColor="text-lime-400" onClick={() => setShowPw(!showPw)}/>
        {showPw && (
          <form onSubmit={changePassword} className="px-4 py-4 space-y-3 border-t border-zinc-800 animate-slide-down"
            style={{ background:'#0a0a0a' }}>
            {[['current','Current password'],['new_','New password'],['confirm','Confirm new password']].map(([k,ph]) => (
              <input key={k} type="password" value={pw[k]} onChange={e => setPw(p=>({...p,[k]:e.target.value}))}
                placeholder={ph} className="input-field text-sm" required/>
            ))}
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-1.5">
                {saving && <Loader2 size={12} className="animate-spin"/>} Save
              </button>
              <button type="button" onClick={() => setShowPw(false)} className="btn-outline text-sm">Cancel</button>
            </div>
          </form>
        )}
      </Section>

      <Section title="Notifications" icon={Bell}>
        <Row icon={Bell} label="Emergency alerts"   value="On" onClick={() => toast('Coming soon')} iconColor="text-red-400"/>
        <Row icon={Bell} label="Likes & comments"   value="On" onClick={() => toast('Coming soon')} iconColor="text-pink-400"/>
      </Section>

      <Section title="Society" icon={Building2}>
        <Row icon={Building2} label="My Society" value={user?.society?.name ?? 'Not joined'} iconColor="text-lime-400" onClick={() => navigate('/profile')}/>
      </Section>

      <Section title="Account" icon={User}>
        <Row icon={LogOut} label="Logout" onClick={() => { logout(); navigate('/login') }} danger/>
      </Section>

      <p className="text-center text-xs text-zinc-800 pt-2">SmartSociety v1.0 · Made with ❤️ in India</p>
    </div>
  )
}
