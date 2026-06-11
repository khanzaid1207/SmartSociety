import { Building, MapPin, Globe } from 'lucide-react'

const TABS = [
  { key:'society', label:'Society', Icon:Building },
  { key:'area',    label:'Area',    Icon:MapPin   },
  { key:'public',  label:'Public',  Icon:Globe    },
]

export default function FeedTabs({ activeLevel, onChange }) {
  return (
    <div className="sticky top-14 z-30 border-b border-zinc-800"
      style={{ background:'rgba(10,10,10,0.95)', backdropFilter:'blur(12px)' }}>
      <div className="max-w-2xl mx-auto flex">
        {TABS.map(({ key, label, Icon }) => {
          const isActive = activeLevel === key
          return (
            <button key={key} onClick={() => onChange(key)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-bold border-b-2 transition-all duration-200 relative group
                ${isActive
                  ? 'border-lime-400 text-lime-400'
                  : 'border-transparent text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50'}`}>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-t-full"
                  style={{ background:'linear-gradient(90deg,#a3f000,#84cc16)', boxShadow:'0 0 8px rgba(163,240,0,0.6)' }}/>
              )}
              <Icon size={17} className={`transition-all duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}/>
              <span className="uppercase tracking-wider text-[10px]">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
