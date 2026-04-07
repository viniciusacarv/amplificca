'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const FELLOWS_LOCATIONS = [
  { id: 'pr', location: [-25.4, -49.3] as [number, number], estado: 'PR - Paraná' },
  { id: 'sp', location: [-23.5, -46.6] as [number, number], estado: 'SP - São Paulo' },
  { id: 'rj', location: [-22.9, -43.2] as [number, number], estado: 'RJ - Rio de Janeiro' },
  { id: 'mg', location: [-19.9, -43.9] as [number, number], estado: 'MG - Minas Gerais' },
  { id: 'rs', location: [-30.0, -51.2] as [number, number], estado: 'RS - Rio Grande do Sul' },
  { id: 'go', location: [-16.7, -49.3] as [number, number], estado: 'GO - Goiás' },
  { id: 'df', location: [-15.8, -47.9] as [number, number], estado: 'DF - Distrito Federal' },
  { id: 'pe', location: [-8.0, -34.9] as [number, number], estado: 'PE - Pernambuco' },
  { id: 'ba', location: [-12.9, -38.4] as [number, number], estado: 'BA - Bahia' },
  { id: 'ac', location: [-9.97, -67.8] as [number, number], estado: 'AC - Acre' },
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

const CSS = `
  .mapa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
  .mapa-estados { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
  .mapa-globe-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
  @media (max-width: 768px) {
    .mapa-grid { grid-template-columns: 1fr; gap: 40px; }
    .mapa-text-col { order: 1; }
    .mapa-globe-col { order: 2; }
  }
`

export default function MapaBrasil() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)
  const phiRef = useRef(0.87)
  const [loaded, setLoaded] = useState(false)
  const [size, setSize] = useState(0)

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }

    pointerInteracting.current = null
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0

      if (width > 0) {
        setSize(width)
      }
    })

    resizeObserver.observe(containerRef.current)

    const width = containerRef.current.offsetWidth
    if (width > 0) {
      setSize(width)
    }

    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (event.clientX - pointerInteracting.current.x) / 300,
          theta: (event.clientY - pointerInteracting.current.y) / 1000,
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
    if (!canvasRef.current || size === 0) return

    const canvas = canvasRef.current
    let globe: { destroy: () => void } | null = null
    const thetaBase = 0.26

    async function init() {
      const createGlobe = (await import('cobe')).default

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width: size,
        height: size,
        phi: phiRef.current,
        theta: thetaBase,
        dark: 1,
        diffuse: 1.2,
        mapSamples: 20000,
        mapBrightness: 4,
        baseColor: [0.05, 0.05, 0.05],
        markerColor: [0.494, 0.827, 0.129],
        glowColor: [0.2, 0.45, 0.05],
        markers: FELLOWS_LOCATIONS.map((marker) => ({ location: marker.location, size: 0.05 })),
        arcs: ARCS,
        arcColor: [0.494, 0.827, 0.129],
        arcWidth: 1.5,
        arcHeight: 0.2,
        opacity: 0.85,
        onRender: (state: { phi: number; theta: number }) => {
          if (!isPausedRef.current) {
            phiRef.current += 0.002
          }

          state.phi = phiRef.current + phiOffsetRef.current + dragOffset.current.phi
          state.theta = thetaBase + thetaOffsetRef.current + dragOffset.current.theta
        },
      })

      window.setTimeout(() => {
        canvas.style.opacity = '1'
        setLoaded(true)
      }, 300)
    }

    init()

    return () => {
      if (globe) {
        globe.destroy()
      }
    }
  }, [size])

  return (
    <section style={{ padding: '80px 0', background: '#0d0d0d', overflow: 'hidden' }}>
      <style>{CSS}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
        <div className="mapa-grid">
          <div className="mapa-text-col">
            <span style={{ color: 'var(--verde)', fontSize: 12, letterSpacing: 2, fontWeight: 500 }}>PRESENÇA NACIONAL</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6vw, 72px)', color: '#fff', lineHeight: 0.95, marginTop: 12, marginBottom: 24 }}>
              DO ACRE AO
              <br />
              RIO GRANDE
              <br />
              DO SUL
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 32 }}>
              O Amplifica reúne fellows de {FELLOWS_LOCATIONS.length} estados brasileiros.
            </p>

            <div className="mapa-estados">
              {FELLOWS_LOCATIONS.map((fellow) => (
                <div key={fellow.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--verde)', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{fellow.estado}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mapa-globe-col">
            <div className="mapa-globe-wrap">
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 0,
                  background: 'radial-gradient(circle at center, rgba(126,211,33,0.12) 0%, transparent 65%)',
                  borderRadius: '50%',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  zIndex: 2,
                  background: 'rgba(126,211,33,0.08)',
                  border: '1px solid rgba(126,211,33,0.2)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--verde)', lineHeight: 1 }}>
                  {FELLOWS_LOCATIONS.length}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4, letterSpacing: 1 }}>ESTADOS</div>
              </div>

              <div ref={containerRef} style={{ position: 'relative', width: '100%', zIndex: 1 }}>
                {size > 0 && (
                  <canvas
                    ref={canvasRef}
                    width={size}
                    height={size}
                    onPointerDown={(event) => {
                      pointerInteracting.current = { x: event.clientX, y: event.clientY }
                      isPausedRef.current = true
                    }}
                    style={{
                      width: size,
                      height: size,
                      maxWidth: '100%',
                      cursor: 'grab',
                      opacity: 0,
                      transition: 'opacity 1.5s ease',
                      borderRadius: '50%',
                      touchAction: 'none',
                      display: 'block',
                      margin: '0 auto',
                    }}
                  />
                )}

                {loaded && (
                  <div
                    style={{
                      textAlign: 'center',
                      marginTop: 12,
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.25)',
                      letterSpacing: 1,
                    }}
                  >
                    arraste para girar
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
