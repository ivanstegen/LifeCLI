import { useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import SideNav from './components/SideNav'
import PageTransition from './components/PageTransition'
import DashboardPage from './features/dashboard/DashboardPage'
import FinancePage from './features/finance/FinancePage'
import HabitsPage from './features/habits/HabitsPage'
import WatchPage from './features/watch/WatchPage'
import SettingsPage from './features/settings/SettingsPage'

function BrandMark() {
  return (
    <div>
      <span className="font-display text-lg font-bold tracking-tight">
        <span aria-hidden>🌱 </span>
        <span className="text-gradient">LifeCLI</span>
      </span>
      <p className="mt-0.5 text-xs text-slate-500">Личен помощник</p>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><DashboardPage /></PageTransition>} />
        <Route path="/finance" element={<PageTransition><FinancePage /></PageTransition>} />
        <Route path="/habits" element={<PageTransition><HabitsPage /></PageTransition>} />
        <Route path="/watch" element={<PageTransition><WatchPage /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><SettingsPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-slate-950/60 px-4 py-3 backdrop-blur-xl md:hidden">
        <BrandMark />
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Отвори менюто"
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-slate-200 transition hover:bg-white/10"
        >
          ☰
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-[1680px]">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-8 border-r border-white/10 bg-white/[0.02] px-4 py-6 backdrop-blur-xl md:flex lg:w-64">
          <BrandMark />
          <SideNav layoutGroup="desktop" />
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 md:py-8 lg:px-8">
          <AnimatedRoutes />
        </main>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <div className="md:hidden">
            <motion.div
              className="fixed inset-0 z-40 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col gap-8 border-r border-white/10 bg-slate-950/90 px-4 py-6 backdrop-blur-2xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            >
              <div className="flex items-center justify-between">
                <BrandMark />
                <button
                  type="button"
                  onClick={closeMenu}
                  aria-label="Затвори менюто"
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-slate-300 transition hover:bg-white/10"
                >
                  ✕
                </button>
              </div>
              <SideNav layoutGroup="mobile" onNavigate={closeMenu} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
