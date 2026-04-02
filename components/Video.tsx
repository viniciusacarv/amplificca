'use client'

export default function Video() {
  return (
    <section style={{ padding: '80px 0', background: '#0a0a0a' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

          {/* Texto esquerdo */}
          <div>
            <span style={{ color: 'var(--verde)', fontSize: 12, letterSpacing: 2, fontWeight: 500 }}>O PROJETO</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5vw, 64px)', color: '#fff', lineHeight: 0.95, marginTop: 12, marginBottom: 24 }}>
              CONHEÇA O<br />AMPLIFICA
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, marginBottom: 32 }}>
              Entenda como o Amplifica está formando uma nova geração de vozes comprometidas com as ideias de liberdade — e conectando esses talentos com a imprensa brasileira.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                'Seleção criteriosa de jovens lideranças',
                'Treinamento em comunicação estratégica e media training',
                'Conexão direta com veículos de imprensa',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(126,211,33,0.15)', border: '1px solid rgba(126,211,33,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--verde)' }} />
                  </div>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vídeo direito */}
          <div style={{ position: 'relative' }}>
            {/* Glow atrás */}
            <div style={{
              position: 'absolute', inset: -20, zIndex: 0,
              background: 'radial-gradient(ellipse at center, rgba(126,211,33,0.08) 0%, transparent 70%)',
            }} />
            {/* Container do vídeo com borda verde */}
            <div style={{
              position: 'relative', zIndex: 1,
              borderRadius: 12,
              overflow: 'hidden',
              border: '1px solid rgba(126,211,33,0.2)',
              aspectRatio: '16/9',
              background: '#000',
            }}>
              <iframe
                src="https://www.youtube.com/embed/pT9MUllBsNY?rel=0&modestbranding=1"
                title="Conheça o Amplifica"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  display: 'block',
                }}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
