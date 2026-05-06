'use client'
// Wrapper que faz scroll horizontal automático até o elemento marcado data-current="true".

import { useEffect, useRef, ReactNode } from 'react'

export default function ScrollToCurrent({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const container = ref.current
    if (!container) return
    const target = container.querySelector('[data-current="true"]') as HTMLElement | null
    if (!target) return
    const offset = target.offsetLeft - 200
    container.scrollLeft = Math.max(0, offset)
  }, [])
  return (
    <div ref={ref} className="overflow-x-auto">
      {children}
    </div>
  )
}
