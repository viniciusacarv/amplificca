'use client'
const EQUIPE = [
  {
    nome: 'Anne Dias',
    cargo: 'Presidente',
    desc: 'Advogada, mestranda em Ciência Política pela UFPR e comunicadora. Atua como comentarista política na Gazeta do Povo. Selecionada como contributor da rede Young Voices 2026 — experiência que inspirou a criação do Amplifica.',
    instagram: 'annediasoficial',
  },
  {
    nome: 'Sara Ganime',
    cargo: 'Head de Comunicação',
    desc: 'Jornalista e editora-chefe do Boletim da Liberdade. Protagonizou o placar do Boletim que ajudou a barrar o "PL da Censura" em 2023. Colunista do Pleno.News e presidente do IFL Rio de Janeiro.',
    instagram: 'saraganime',
  },
]

const CONSELHO = [
  { nome: 'Mariana Braga', cargo: 'Jornalista — Gazeta do Povo' },
  { nome: 'Leandro Narloch', cargo: 'Jornalista e Escritor' },
]

function getInitials(nome: string) {
  return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export default function Sobre() {
  return (
    <section id="sobre" style={{ padding: '100px 0', background: '#0d0d0d' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>

        <span style={{ color: 'var(--verde)', fontSize: 12, letterSpacing: 2, fontWeight: 500 }}>QUEM SOMOS</span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 7vw, 80px)', color: '#fff', lineHeight: 0.95, marginTop: 12, marginBottom: 60 }}>
          A EQUIPE
        </h2>

        {/* Equipe */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 2, marginBottom: 80 }}>
          {EQUIPE.map(p => (
            <div key={p.nome} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', padding: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(126,211,33,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 500, color: 'var(--verde)', flexShrink: 0 }}>
                  {getInitials(p.nome)}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#fff' }}>{p.nome}</div>
                  <div style={{ fontSize: 12, color: 'var(--verde)', marginTop: 2 }}>{p.cargo}</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{p.desc}</p>
              <a href={`https://instagram.com/${p.instagram}`} target="_blank" rel="noopener" style={{ display: 'inline-block', marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
                @{p.instagram} ↗
              </a>
            </div>
          ))}
        </div>

        {/* Conselho */}
        <div>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, letterSpacing: 2 }}>CONSELHO ESTRATÉGICO</span>
          <div style={{ display: 'flex', gap: 2, marginTop: 20, flexWrap: 'wrap' }}>
            {CONSELHO.map(c => (
              <div key={c.nome} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '20px 28px', flex: '1 1 200px' }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{c.nome}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{c.cargo}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
