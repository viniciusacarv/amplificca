'use client'
import AnimatedBorder from '@/components/AnimatedBorder'

export default function Video() {
  return (
    <section style={{ padding: '60px 0', background: '#0a0a0a' }}>
      <style>{`
        .video-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        .video-text-col { display: block; }
        @media (max-width: 768px) {
          .video-grid { grid-template-columns: 1fr; gap: 40px; }
          .video-text-col { order: 2; }
          .video-embed-col { order: 1; }
        }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
        <div className="video-grid">
          <div className="video-text-col">
            <span style={{ color: 'var(--verde)', fontSize: 12, letterSpacing: 2, fontWeight: 500 }}>O PROJETO</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 64px)', color: '#fff', lineHeight: 0.95, marginTop: 12, marginBottom: 24 }}>
              CONHEÇA O<br />AMPLIFICA
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, marginBottom: 32 }}>
              Entenda como o Amplifica está formando uma nova geração de vozes comprometidas com as ideias de liberdade — e conectando esses talentos com a imprensa brasileira.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {['Seleção criteriosa de jovens lideranças', 'Treinamento em comunicação estratégica e media training', 'Conexão direta com veículos de imprensa'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(126,211,33,0.15)', border: '1px solid rgba(126,211,33,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--verde)' }} />
                  </div>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="video-embed-col">
            <AnimatedBorder animationMode="auto-rotate" animationSpeed={5} borderRadius={12} borderWidth={1.5} style={{ '--ab-speed': '5s' } as React.CSSProperties}>
              <div style={{ borderRadius: 12, overflow: 'hidden', position: 'relative', paddingBottom: '56.25%', background: '#000' }}>
                <iframe
                  src="https://www.youtube.com/embed/pT9MUllBsNY?rel=0&modestbranding=1"
                  title="Conheça o Amplifica"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                />
              </div>
            </AnimatedBorder>
          </div>
        </div>
      </div>
    </section>
  )
}
