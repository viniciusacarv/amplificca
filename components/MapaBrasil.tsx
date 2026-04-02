'use client'
import { useEffect, useRef, useCallback, useState } from 'react'

const FELLOWS_LOCATIONS = [
  { id: 'pr', location: [-25.4, -49.3] as [number, number], estado: 'PR — Paraná' },
  { id: 'sp', location: [-23.5, -46.6] as [number, number], estado: 'SP — São Paulo' },
  { id: 'rj', location: [-22.9, -43.2] as [number, number], estado: 'RJ — Rio de Janeiro' },
  { id: 'mg', location: [-19.9, -43.9] as [number, number], estado: 'MG — Minas Gerais' },
  { id: 'rs', location: [-30.0, -51.2] as [number, number], estado: 'RS — Rio Grande do Sul' },
  { id: 'go', location: [-16.7, -49.3] as [number, number], estado: 'GO — Goiás' },
  { id: 'df', location: [-15.8, -47.9] as [number, number], estado: 'DF — Brasília' },
  { id: 'pe', location: [-8.0, -34.9] as [number, number], estado: 'PE — Pernambuco' },
  { id: 'ba', location: [-12.9, -38.4] as [number, number], estado: 'BA — Bahia' },
  { id: 'ac', location: [-9.97, -67.8] as [number, number], estado: 'AC — Acre' },
]

const ARCS = [
  { from: [-25.4, -49.3] as [number, number], to: [-23.5, -46.6] as [number, number] },
  { from: [-23.5, -46.6] as [number, number], to: [-22.9, -43.2] as [number, number] },
  { from: [-15.8, -47.9] as [number, number], to: [-16.7, -49.3] as [number, number] },
  { from: [-15.8, -47.9] as [number, number], to: [-12.9, -38.4] as [number, number] },
  { from: [-8.0, -34.9] as [number, number], to: [-12.9, -38.4] as [number, number] },
  { from: [-9.97, -67.8] as [number, number], to: [-15.8, -47.9] as [number, number] },
  { from: [-30.0, -51.2] as [number, number], to: [-25.4, -49.3] as [number, number] },
]

export default function MapaBrasil() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)
  const phiRef = useRef(0.87)
  const [loaded, setLoaded] = useState(false)

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab'
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerup', handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: any = null
    const thetaBase = 0.26

    async function init() {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return
      const createGlobe = (await import('cobe')).default
      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width, height: width,
        phi: phiRef.current, theta: thetaBase,
        dark: 1, diffuse: 1.2,
        mapSamples: 20000, mapBrightness: 4,
        baseColor: [0.05, 0.05, 0.05],
        markerColor: [0.494, 0.827, 0.129],
        glowColor: [0.2, 0.45, 0.05],
        markers: FELLOWS_LOCATIONS.map(m => ({ location: m.location, size: 0.045 })),
        arcs: ARCS,
        arcColor: [0.494, 0.827, 0.129],
        arcWidth: 1.5, arcHeight: 0.2, opacity: 0.85,
        onRender: (state: any) => {
          if (!isPausedRef.current) phiRef.current += 0.002
          state.phi = phiRef.current + phiOffsetRef.current + dragOffset.current.phi
          state.theta = thetaBase + thetaOffsetRef.current + dragOffset.current.theta
        },
      })
      setTimeout(() => { canvas.style.opacity = '1'; setLoaded(true) }, 300)
    }

    if (canvas.offsetWidth > 0) { init() } else {
      const ro = new ResizeObserver(entries => {
        if (entries[0]?.contentRect.width > 0) { ro.disconnect(); init() }
      })
      ro.observe(canvas)
      return () => ro.disconnect()
    }
    return () => { if (globe) globe.destroy() }
  }, [])

  return (
    <section style={{ padding: '80px 0', background: '#0d0d0d', overflow: 'hidden' }}>
      <style>{`
        .mapa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .mapa-estados { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
        @media (max-width: 768px) {
          .mapa-grid { grid-template-columns: 1fr; gap: 40px; }
          .mapa-globe-col { max-width: 320px; margin: 0 auto; width: 100%; }
          .mapa-estados { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
        <div className="mapa-grid">
          <div>
            <span style={{ color: 'var(--verde)', fontSize: 12, letterSpacing: 2, fontWeight: 500 }}>PRESENÇA NACIONAL</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6vw, 72px)', color: '#fff', lineHeight: 0.95, marginTop: 12, marginBottom: 24 }}>
              DO ACRE AO<br />RIO GRANDE<br />DO SUL
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 32 }}>
              O Amplifica reúne fellows de {FELLOWS_LOCATIONS.length} estados brasileiros.
            </p>
            <div className="mapa-estados">
              {FELLOWS_LOCATIONS.map(f => (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--verde)', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{f.estado}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mapa-globe-col" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'radial-gradient(circle at center, rgba(126,211,33,0.12) 0%, transparent 65%)', borderRadius: '50%' }} />
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1', zIndex: 1 }}>
              <canvas
                ref={canvasRef}
                onPointerDown={e => { pointerInteracting.current = { x: e.clientX, y: e.clientY }; if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing'; isPausedRef.current = true }}
                style={{ width: '100%', height: '100%', cursor: 'grab', opacity: 0, transition: 'opacity 1.5s ease', borderRadius: '50%', touchAction: 'none', display: 'block' }}
              />
              {loaded && (
                <div style={{ position: 'absolute', bottom: -28, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: 1, whiteSpace: 'nowrap' }}>
                  arraste para girar
                </div>
              )}
            </div>
            <div style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(126,211,33,0.08)', border: '1px solid rgba(126,211,33,0.2)', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--verde)', lineHeight: 1 }}>{FELLOWS_LOCATIONS.length}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4, letterSpacing: 1 }}>ESTADOS</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
