'use client'

const ESTADOS_FELLOWS = ['PR', 'SP', 'RJ', 'MG', 'RS', 'GO', 'DF', 'PE', 'BA', 'AC']

const ESTADOS_POS: Record<string, { x: number; y: number; label: string }> = {
  'AM': { x: 200, y: 120, label: 'AM' }, 'PA': { x: 310, y: 110, label: 'PA' },
  'MA': { x: 395, y: 105, label: 'MA' }, 'PI': { x: 415, y: 145, label: 'PI' },
  'CE': { x: 445, y: 120, label: 'CE' }, 'RN': { x: 475, y: 130, label: 'RN' },
  'PB': { x: 470, y: 145, label: 'PB' }, 'PE': { x: 455, y: 160, label: 'PE' },
  'AL': { x: 470, y: 170, label: 'AL' }, 'SE': { x: 460, y: 183, label: 'SE' },
  'BA': { x: 415, y: 200, label: 'BA' }, 'GO': { x: 340, y: 220, label: 'GO' },
  'DF': { x: 355, y: 235, label: 'DF' }, 'MG': { x: 385, y: 255, label: 'MG' },
  'ES': { x: 430, y: 265, label: 'ES' }, 'RJ': { x: 405, y: 290, label: 'RJ' },
  'SP': { x: 365, y: 290, label: 'SP' }, 'PR': { x: 345, y: 320, label: 'PR' },
  'SC': { x: 350, y: 345, label: 'SC' }, 'RS': { x: 330, y: 370, label: 'RS' },
  'MS': { x: 310, y: 280, label: 'MS' }, 'MT': { x: 270, y: 215, label: 'MT' },
  'RO': { x: 195, y: 190, label: 'RO' }, 'AC': { x: 140, y: 175, label: 'AC' },
  'RR': { x: 215, y: 70, label: 'RR' }, 'AP': { x: 345, y: 70, label: 'AP' },
  'TO': { x: 355, y: 175, label: 'TO' },
}

const ESTADOS_NOMES: Record<string, string> = {
  'PR': 'Paraná', 'SP': 'São Paulo', 'RJ': 'Rio de Janeiro', 'MG': 'Minas Gerais',
  'RS': 'Rio Grande do Sul', 'GO': 'Goiás', 'DF': 'Distrito Federal',
  'PE': 'Pernambuco', 'BA': 'Bahia', 'AC': 'Acre',
}

export default function MapaBrasil() {
  return (
    <section style={{ padding: '100px 0', background: '#0d0d0d' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>

          <div>
            <span style={{ color: 'var(--verde)', fontSize: 12, letterSpacing: 2, fontWeight: 500 }}>PRESENÇA NACIONAL</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 6vw, 72px)', color: '#fff', lineHeight: 0.95, marginTop: 12, marginBottom: 24 }}>
              DO ACRE AO<br />RIO GRANDE<br />DO SUL
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 40 }}>
              O Amplifica reúne fellows de {ESTADOS_FELLOWS.length} estados brasileiros, garantindo que as ideias de liberdade cheguem a todos os cantos do país.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ESTADOS_FELLOWS.map(uf => (
                <div key={uf} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--verde)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                    <strong style={{ color: 'var(--verde)', fontWeight: 500 }}>{uf}</strong> — {ESTADOS_NOMES[uf] || uf}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mapa SVG simplificado */}
          <div style={{ position: 'relative' }}>
            <svg viewBox="100 50 420 360" style={{ width: '100%', maxWidth: 480 }}>
              {Object.entries(ESTADOS_POS).map(([uf, pos]) => {
                const ativo = ESTADOS_FELLOWS.includes(uf)
                return (
                  <g key={uf}>
                    <circle
                      cx={pos.x} cy={pos.y} r={ativo ? 14 : 10}
                      fill={ativo ? 'rgba(126,211,33,0.2)' : 'rgba(255,255,255,0.03)'}
                      stroke={ativo ? '#7ED321' : 'rgba(255,255,255,0.1)'}
                      strokeWidth={ativo ? 1.5 : 0.5}
                    />
                    {ativo && (
                      <circle cx={pos.x} cy={pos.y} r={5} fill="#7ED321" opacity={0.9} />
                    )}
                    <text
                      x={pos.x} y={pos.y + (ativo ? 28 : 24)}
                      textAnchor="middle"
                      fontSize={ativo ? 9 : 7}
                      fill={ativo ? '#7ED321' : 'rgba(255,255,255,0.25)'}
                      fontFamily="var(--font-body)"
                      fontWeight={ativo ? '500' : '300'}
                    >{pos.label}</text>
                  </g>
                )
              })}
            </svg>
            <div style={{ position: 'absolute', bottom: 0, right: 0, display: 'flex', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--verde)' }} />
                Com fellow
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} />
                Sem fellow
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
