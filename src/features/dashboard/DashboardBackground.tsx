import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { usePageVisible } from '../../hooks/usePageVisible'

const Scene3D = lazy(() => import('./Scene3D'))

function StaticBackdrop() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(55% 45% at 20% 12%, rgba(49,46,129,0.22), transparent 62%),' +
          'radial-gradient(48% 42% at 85% 18%, rgba(21,94,117,0.12), transparent 60%),' +
          'radial-gradient(60% 55% at 62% 105%, rgba(59,47,107,0.16), transparent 62%)',
      }}
    />
  )
}

export default function DashboardBackground() {
  const reduce = useReducedMotion()
  const pageVisible = usePageVisible()
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.01 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const active = pageVisible && inView

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <StaticBackdrop />
      {!reduce && (
        <Suspense fallback={null}>
          <Scene3D active={active} />
        </Suspense>
      )}
      <div className="absolute inset-0 bg-slate-950/55" />
    </div>
  )
}
