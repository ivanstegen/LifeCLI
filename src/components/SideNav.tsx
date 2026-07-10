import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

export interface NavItem {
  to: string
  label: string
  icon: string
  end?: boolean
}

export const navItems: NavItem[] = [
  { to: '/', label: 'Табло', icon: '🏠', end: true },
  { to: '/finance', label: 'Финанси', icon: '💰' },
  { to: '/habits', label: 'Навици', icon: '✅' },
  { to: '/watch', label: 'Гледане', icon: '🎬' },
  { to: '/settings', label: 'Настройки', icon: '⚙️' },
]

function isActivePath(pathname: string, item: NavItem): boolean {
  if (item.end) return pathname === item.to
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

interface SideNavProps {
  layoutGroup: string
  onNavigate?: () => void
}

export default function SideNav({ layoutGroup, onNavigate }: SideNavProps) {
  const { pathname } = useLocation()

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const active = isActivePath(pathname, item)
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition ${
              active ? '' : 'hover:bg-white/5'
            }`}
          >
            {active && (
              <motion.span
                layoutId={`nav-active-${layoutGroup}`}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/90 to-violet-500/80 shadow-[0_0_22px_-6px_rgba(99,102,241,0.7)]"
              />
            )}
            <span aria-hidden className="relative z-10 text-base">
              {item.icon}
            </span>
            <span
              className={`relative z-10 transition-colors ${
                active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
              }`}
            >
              {item.label}
            </span>
          </NavLink>
        )
      })}
    </nav>
  )
}
