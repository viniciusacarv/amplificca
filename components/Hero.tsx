'use client'
import { useRef } from 'react'
import TextRotate from '@/components/ui/text-rotate'

const METRICAS = [
  { numero: '15', label: 'Fellows ativos' },
  { numero: '50+', label: 'Artigos publicados' },
  { numero: '12', label: 'Veículos alcançados' },
  { numero: '10', label: 'Estados representados' },
]

const VEICULOS = ['Folha de S.Paulo', 'Estadão', 'Gazeta do Povo', 'Revista Oeste', 'Jovem Pan', 'Pleno News', 'CNN Brasil', 'Valor Econômico']

export default function Hero() {
  const tickerRef = useRef<HTMLDivElement>(null)

  return (
    <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: '#0a0a0a' }}>

      {/* Grid background */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(126,211,33,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(126,211,33,0.04) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Green glow */}
      <div style={{
        position: 'absolute', top: '20%', right: '-10%', width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(126,211,33,0.08) 0%, transparent 70%)',
        zIndex: 0,
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 2rem 80px', zIndex: 1, width: '100%' }}>

        {/* Tag */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(126,211,33,0.1)', border: '1px solid rgba(126,211,33,0.3)', borderRadius: 100, padding: '6px 16px', marginBottom: 32 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--verde)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ color: 'var(--verde)', fontSize: 12, fontWeight: 500, letterSpacing: 1 }}>1ª TURMA ATIVA</span>
        </div>

        {/* Headline com TextRotate */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(64px, 10vw, 140px)',
          lineHeight: 0.9,
          letterSpacing: 2,
          color: '#fff',
          marginBottom: 32,
        }}>
          VOZES QUE<br />
          <TextRotate
            texts={['DEFENDEM', 'AMPLIFICAM']}
            rotationInterval={2800}
            staggerDuration={0.04}
            staggerFrom="first"
            style={{
              color: 'var(--verde)',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(64px, 10vw, 140px)',
              letterSpacing: 2,
              lineHeight: 0.9,
              display: 'inline-flex',
              overflow: 'hidden',
            }}
          /><br />
          LIBERDADE
        </h1>

        {/* Subtitle */}
        <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(255,255,255,0.55)', maxWidth: 520, lineHeight: 1.7, marginBottom: 48, fontWeight: 300 }}>
          O Amplifica conecta jovens lideranças comprometidas com as ideias de liberdade à imprensa brasileira — formando, treinando e amplificando vozes no debate público.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 80 }}>
          <a href="#fellows" style={{
            background: 'var(--verde)', color: '#000', padding: '14px 32px',
            borderRadius: 4, fontSize: 14, fontWeight: 500, textDecoration: 'none',
            letterSpacing: 0.5,
          }}>
            Conhecer os fellows →
          </a>
          <a href="#inscricao" style={{
            background: 'transparent', color: '#fff', padding: '14px 32px',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4,
            fontSize: 14, fontWeight: 400, textDecoration: 'none',
          }}>
            Inscreva-se
          </a>
        </div>

        {/* Métricas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 32, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 40, maxWidth: 640 }}>
          {METRICAS.map(m => (
            <div key={m.label}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, color: 'var(--verde)', letterSpacing: 1 }}>{m.numero}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4, letterSpacing: 0.5 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ticker veículos */}
      <div style={{ borderTop: '1px solid rgba(126,211,33,0.15)', borderBottom: '1px solid rgba(126,211,33,0.15)', background: 'rgba(126,211,33,0.03)', overflow: 'hidden', zIndex: 1 }}>
        <div ref={tickerRef} style={{
          display: 'flex', gap: 60, padding: '14px 0',
          animation: 'ticker 20s linear infinite', width: 'max-content'
        }}>
          {[...VEICULOS, ...VEICULOS, ...VEICULOS].map((v, i) => (
            <span key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, whiteSpace: 'nowrap', fontWeight: 300 }}>
              {v} <span style={{ color: 'var(--verde)', margin: '0 8px' }}>·</span>
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-33.33%) } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
      `}</style>
    </section>
  )
}
