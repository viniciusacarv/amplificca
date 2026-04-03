'use client'
import Image from 'next/image'

const VALORES = [
  { icon: '/LIVRE-MERCADO.svg',           titulo: 'Livre Mercado',              desc: 'Acreditamos que a liberdade econômica é a base para a prosperidade individual e coletiva.' },
  { icon: '/PROPRIEDADE-PRIVADA.svg',     titulo: 'Propriedade Privada',        desc: 'O direito à propriedade é fundamento da autonomia individual e do progresso social.' },
  { icon: '/LIBERDADE-DE-EXPRESSAO.svg',  titulo: 'Liberdade de Expressão',     desc: 'O debate livre de ideias é essencial para uma sociedade que evolui e se corrige.' },
  { icon: '/IMPERIO-DA-LEI.svg',          titulo: 'Império da Lei',             desc: 'A lei deve ser igual para todos, sem exceções políticas ou privilégios de poder.' },
  { icon: '/INDIVIDUO.svg',               titulo: 'Mais Indivíduo, Menos Estado', desc: 'Defendemos a autonomia individual contra o avanço do Estado em todas as esferas da vida.' },
  { icon: '/TRANSPARENCIA.svg',           titulo: 'Transparência e Ética',      desc: 'O poder público deve ser transparente e ético — sem negociatas, sem opacidade.' },
]

export default function Missao() {
  return (
    <section id="missao" style={{ padding: '100px 0', background: '#0a0a0a' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>

        {/* Missão statement */}
        <div style={{ borderLeft: '3px solid var(--verde)', paddingLeft: 32, marginBottom: 80, maxWidth: 700 }}>
          <span style={{ color: 'var(--verde)', fontSize: 12, letterSpacing: 2, fontWeight: 500, display: 'block', marginBottom: 16 }}>MISSÃO</span>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', color: '#fff', lineHeight: 1.1, letterSpacing: 1 }}>
            CONSTRUIR UM BRASIL PRÓSPERO E LIVRE AO AMPLIAR A PRESENÇA DAS IDEIAS DE LIBERDADE NO DEBATE PÚBLICO.
          </p>
        </div>

        {/* Valores */}
        <div>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, letterSpacing: 2 }}>O QUE DEFENDEMOS</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 1, marginTop: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
            {VALORES.map((v, i) => (
              <div key={i} style={{
                padding: '32px',
                background: 'rgba(255,255,255,0.01)',
                borderRight: '1px solid rgba(255,255,255,0.06)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(126,211,33,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}>
                <div style={{ width: 36, height: 36, marginBottom: 16, position: 'relative' }}>
                  <Image
                    src={v.icon}
                    alt={v.titulo}
                    width={36}
                    height={36}
                    style={{ width: 36, height: 36, objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                  />
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 8, letterSpacing: 0.3 }}>{v.titulo}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
