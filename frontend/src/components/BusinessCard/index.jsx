import { BadgeCheck, Phone, MapPin } from 'lucide-react'
import { getInitials } from '../../utils/helpers'

const BIZ_CATS = {
  food:      { label:'Food & Drink',  emoji:'🍽️', color:'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  grocery:   { label:'Grocery',       emoji:'🛒', color:'text-lime-400 bg-lime-400/10 border-lime-400/20'       },
  education: { label:'Education',     emoji:'📚', color:'text-sky-400 bg-sky-500/10 border-sky-500/20'          },
  health:    { label:'Health',        emoji:'🏥', color:'text-red-400 bg-red-500/10 border-red-500/20'          },
  salon:     { label:'Salon',         emoji:'💈', color:'text-pink-400 bg-pink-500/10 border-pink-500/20'       },
  repair:    { label:'Repair',        emoji:'🔧', color:'text-amber-400 bg-amber-500/10 border-amber-500/20'    },
  other:     { label:'Other',         emoji:'🏪', color:'text-zinc-400 bg-zinc-800 border-zinc-700'             },
}
const DARK_AVATARS = [
  'bg-lime-400/15 text-lime-400',
  'bg-sky-400/15 text-sky-400',
  'bg-violet-400/15 text-violet-400',
  'bg-amber-400/15 text-amber-400',
  'bg-pink-400/15 text-pink-400',
]
function darkAvatar(name='') { return DARK_AVATARS[(name?.charCodeAt(0)||0)%DARK_AVATARS.length] }

export default function BusinessCard({ business }) {
  const cat = BIZ_CATS[business.category] ?? BIZ_CATS.other
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 flex gap-3
                    hover:border-zinc-700 hover:shadow-card-hover hover:-translate-y-0.5
                    transition-all duration-300 group">
      {business.logoUrl
        ? <img src={business.logoUrl} alt={business.name} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-zinc-800"/>
        : <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${darkAvatar(business.name)}`}>
            {getInitials(business.name)}
          </div>
      }
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <h3 className="font-black text-zinc-100 text-sm truncate group-hover:text-white transition-colors">{business.name}</h3>
          {business.isVerified && <BadgeCheck size={14} className="text-lime-400 shrink-0"/>}
        </div>
        <span className={`chip text-[10px] font-black mb-2 inline-flex border ${cat.color}`}>{cat.emoji} {cat.label}</span>
        {business.promoText && (
          <p className="text-xs text-zinc-400 rounded-xl px-2.5 py-2 mb-2 leading-snug border border-lime-400/10 bg-lime-400/5">
            ⚡ {business.promoText}
          </p>
        )}
        <div className="flex items-center gap-1 text-[11px] text-zinc-600">
          <MapPin size={11} className="text-lime-400/50"/> {business.area?.name ?? 'Local Area'}
        </div>
      </div>
      {business.phone && (
        <a href={`tel:${business.phone}`}
          className="shrink-0 self-start p-2.5 bg-lime-400/10 border border-lime-400/20
                     hover:bg-lime-400/20 text-lime-400 rounded-xl transition-all duration-200
                     hover:scale-105 active:scale-95 hover:shadow-lime"
          aria-label={`Call ${business.name}`}>
          <Phone size={16}/>
        </a>
      )}
    </div>
  )
}
