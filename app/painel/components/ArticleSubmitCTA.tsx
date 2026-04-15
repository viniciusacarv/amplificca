'use client'
// app/painel/components/ArticleSubmitCTA.tsx
// CTA de submissão de artigos — efeito spotlight + identidade Amplifica

import { useState, useRef } from 'react'

const FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScVJ-khF3okK7ICUEg90dg1M117ahF2TLOofxzbwqoosl4iUw/viewform?usp=sharing&ouid=107264401382754200648'

export default function ArticleSubmitCTA() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mouse, setMouse] = useState({ x: -300, y: -300 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleMouseLeave = () => setMouse({ x: -300, y: -300 })

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 p-6 md:p-8"
      style={{ isolation: 'isolate' }}
    >
      {/* ── Spotlight radial (verde Amplifica) ─────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(500px circle at ${mouse.x}px ${mouse.y}px,
            rgba(126,211,33,0.07) 0%,
            rgba(126,211,33,0.03) 30%,
            transparent 70%)`,
        }}
      />

      {/* ── Linha de borda superior verde (sutil) ──────────────────── */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#7ED321]/30 to-transparent" />

      {/* ── Conteúdo ────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

        {/* Texto */}
        <div className="flex-1">
          {/* Tag */}
          <span
            className="mb-3 inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-bold tracking-widest"
            style={{
              background: 'rgba(126,211,33,0.12)',
              color: '#7ED321',
              border: '1px solid rgba(126,211,33,0.2)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {/* Ícone folha / artigo */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            PUBLICAÇÃO
          </span>

          {/* Headline Bebas Neue */}
          <h2
            className="leading-none tracking-wide text-white"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px, 3.5vw, 38px)',
              letterSpacing: 1,
            }}
          >
            SUBMETA SEU ARTIGO
          </h2>

          {/* Descrição */}
          <p
            className="mt-2 max-w-md text-sm leading-relaxed text-gray-400"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Publique sua análise e ganhe pontos no ranking. Artigos nacionais valem mais —
            mostre seu argumento ao Brasil.
          </p>

          {/* Micro-info: pontuação */}
          <div className="mt-3 flex flex-wrap gap-3">
            <PointBadge emoji="🗞️" label="Nacional" pts="+15 pts" color="#7ED321" />
            <PointBadge emoji="📰" label="Regional" pts="+8 pts"  color="#94a3b8" />
          </div>
        </div>

        {/* Botão CTA */}
        <div className="flex-shrink-0">
          <a
            href={FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group/btn inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-black transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #7ED321 0%, #5fb800 100%)',
              boxShadow: '0 0 0 0 rgba(126,211,33,0.4)',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow =
                '0 0 20px 4px rgba(126,211,33,0.25)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow =
                '0 0 0 0 rgba(126,211,33,0.4)'
            }}
          >
            Enviar artigo
            {/* Seta animada */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover/btn:translate-x-1"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>

          {/* Aviso prazo */}
          <p
            className="mt-2 text-center text-[11px] text-gray-600"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Toda sexta-feira · revisão em 15 min
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Sub-componente de badge de pontuação ─────────────────────────────
function PointBadge({
  emoji,
  label,
  pts,
  color,
}: {
  emoji: string
  label: string
  pts: string
  color: string
}) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px]"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        color: '#9ca3af',
        fontFamily: 'var(--font-body)',
      }}
    >
      <span>{emoji}</span>
      <span>{label}</span>
      <span style={{ color, fontWeight: 600 }}>{pts}</span>
    </span>
  )
}
