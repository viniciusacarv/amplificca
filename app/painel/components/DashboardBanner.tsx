'use client'
// app/painel/components/DashboardBanner.tsx
// Banner rotativo do dashboard — inspirado no progressive-carousel
// Usa framer-motion (já instalado), sem dependências novas

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Slides de exemplo — admin poderá editar estes dados futuramente ──
const SLIDES = [
  {
    id: 'boas-vindas',
    tag: 'NOVO',
    eyebrow: 'PAINEL DO MEMBRO',
    headline: 'PAINEL AMPLIFICA',
    sub: 'Acompanhe seus pontos, posição no ranking e próximas aulas em tempo real.',
    ticker: 'PAINEL AMPLIFICA • BEM-VINDO AO SEU ESPAÇO • CONTEÚDOS ADICIONAIS • PRÓXIMAS AULAS • ',
    img: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1600&auto=format&fit=crop',
    accent: '#7ED321',
    href: '',  // Deixe vazio para sem link, ou ex: '/painel/ranking'
  },
  {
    id: 'debates',
    tag: 'EM BREVE',
    eyebrow: 'CAMPEONATO 2026',
    headline: 'DEBATES',
    sub: 'Os melhores fellows do programa vão se enfrentar. Prepare sua argumentação.',
    ticker: 'CAMPEONATO DE DEBATES 2026 • FASES ELIMINATÓRIAS • ATÉ 50 PONTOS • PREPARE-SE • ',
    img: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1600&auto=format&fit=crop',
    accent: '#fbbf24',
    href: '',  // Deixe vazio para sem link, ou ex: '/painel/ranking'
  },
  {
    id: 'oratoria',
    tag: 'TODA SEMANA',
    eyebrow: 'UNIÃO CONSERVADORA',
    headline: 'ORATÓRIA',
    sub: 'Com Mario — toda semana. Presença registrada pelo admin vale +5 pontos.',
    ticker: 'AULAS DE ORATÓRIA SEMANAIS • +5 PONTOS POR PRESENÇA • PARCERIA UNIÃO CONSERVADORA • ',
    img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1600&auto=format&fit=crop',
    accent: '#7ED321',
    href: 'https://www.instagram.com/uniaoconservadora.br/?hl=pt-br',
  },
]

const DURATION = 6000 // ms por slide

// ── Wrapper que vira <a> se tiver href, ou <div> se não tiver ────────
function ContentWrapper({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  const style: React.CSSProperties = {
    position: 'relative',
    zIndex: 2,
    padding: '36px 36px 72px',
    display: 'block',
    textDecoration: 'none',
    cursor: href ? 'pointer' : 'default',
  }

  if (!href) return <div style={style}>{children}</div>

  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : '_self'}
      rel="noopener noreferrer"
      style={style}
    >
      {children}
    </a>
  )
}

export default function DashboardBanner() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const frameRef   = useRef<number>(0)
  const startRef   = useRef<number>(performance.now())

  const advance = useCallback(() => {
    setActiveIndex((i) => (i + 1) % SLIDES.length)
    setProgress(0)
    startRef.current = performance.now()
  }, [])

  // Loop de animação do progress bar
  useEffect(() => {
    const tick = (now: number) => {
      const fraction = Math.min((now - startRef.current) / DURATION, 1)
      setProgress(fraction * 100)
      if (fraction >= 1) {
        advance()
      } else {
        frameRef.current = requestAnimationFrame(tick)
      }
    }
    startRef.current = performance.now()
    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [activeIndex, advance])

  const goTo = (index: number) => {
    if (index === activeIndex) return
    cancelAnimationFrame(frameRef.current)
    setActiveIndex(index)
    setProgress(0)
    startRef.current = performance.now()
  }

  const slide = SLIDES[activeIndex]

  return (
    <div style={{
      position: 'relative',
      borderRadius: 14,
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.07)',
      marginBottom: 36,
      minHeight: 260,
    }}>

      {/* ── Imagem de fundo ──────────────────────────────────────── */}
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id + '-bg'}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1,  scale: 1    }}
          exit={{    opacity: 0,  scale: 1.02 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${slide.img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
            zIndex: 0,
          }}
        />
      </AnimatePresence>

      {/* Gradiente escuro — legibilidade do texto à esquerda */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'linear-gradient(to right, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.88) 45%, rgba(10,10,10,0.35) 100%)',
      }} />

      {/* ── Conteúdo do slide (clicável se tiver href) ─────────────── */}
      <ContentWrapper href={slide.href}>
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0  }}
            exit={{    opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {/* Tag + eyebrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{
                background: slide.accent,
                color: '#000',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.1em',
                padding: '3px 9px',
                borderRadius: 4,
                fontFamily: 'var(--font-body)',
              }}>
                {slide.tag}
              </span>
              <span style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.15em',
                fontFamily: 'var(--font-body)',
                textTransform: 'uppercase' as const,
              }}>
                {slide.eyebrow}
              </span>
            </div>

            {/* Headline em Bebas Neue */}
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(38px, 5.5vw, 68px)',
              color: '#fff',
              letterSpacing: 2,
              lineHeight: 1,
              marginBottom: 14,
              maxWidth: 560,
            }}>
              {slide.headline}
            </h2>

            {/* Subtítulo */}
            <p style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.5)',
              maxWidth: 420,
              lineHeight: 1.65,
              fontFamily: 'var(--font-body)',
            }}>
              {slide.sub}
            </p>
          </motion.div>
        </AnimatePresence>
      </ContentWrapper>

      {/* ── Ticker marquee ──────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 40, left: 0, right: 0, zIndex: 3,
        height: 26,
        display: 'flex', alignItems: 'center', overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(0,0,0,0.45)',
      }}>
        <style>{`
          @keyframes amplifica-ticker {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
          .amplifica-ticker-track {
            display: flex;
            white-space: nowrap;
            animation: amplifica-ticker 40s linear infinite;
          }
        `}</style>
        <div className="amplifica-ticker-track">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.28)',
              letterSpacing: '0.12em',
              paddingRight: 60,
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
            }}>
              {slide.ticker}
            </span>
          ))}
        </div>
      </div>

      {/* ── Barra de navegação / progresso ──────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 4,
        display: 'flex',
        height: 40,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}>
        {SLIDES.map((s, i) => {
          const isActive = i === activeIndex
          return (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              style={{
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
                background: 'transparent',
                border: 'none',
                borderRight: i < SLIDES.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: isActive ? 1 : 0.4,
                transition: 'opacity 0.25s',
                padding: '0 12px',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.opacity = '0.7' }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.opacity = '0.4' }}
            >
              {/* Rótulo */}
              <span style={{
                fontSize: 10,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.8)',
                letterSpacing: '0.1em',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                position: 'relative',
                zIndex: 1,
                textTransform: 'uppercase' as const,
                whiteSpace: 'nowrap',
              }}>
                {s.headline}
              </span>

              {/* Fundo de progresso (fill) */}
              {isActive && (
                <span style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${progress}%`,
                  background: 'rgba(126,211,33,0.1)',
                  pointerEvents: 'none',
                  transition: 'none',
                }} />
              )}

              {/* Barra inferior de progresso */}
              {isActive && (
                <span style={{
                  position: 'absolute', bottom: 0, left: 0,
                  height: 2,
                  width: `${progress}%`,
                  background: 'var(--verde)',
                  pointerEvents: 'none',
                  transition: 'none',
                }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
