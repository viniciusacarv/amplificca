// Gráfico de barras receita x despesa nos últimos 12 meses. SVG puro, sem dependência extra.

type Serie = { mes: string; valor: number }

function brl(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function mesLabel(m: string) {
  const [, mm] = m.split('-')
  return ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][Number(mm) - 1]
}

export default function FluxoChart({ serieReceita, serieDespesa }: { serieReceita: Serie[]; serieDespesa: Serie[] }) {
  const max = Math.max(1, ...serieReceita.map((s) => s.valor), ...serieDespesa.map((s) => s.valor))
  const W = 720
  const H = 240
  const padL = 40
  const padR = 12
  const padT = 16
  const padB = 30
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const groupW = innerW / serieReceita.length
  const barW = Math.max(4, groupW / 2 - 4)

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Receita x Despesa</h3>
          <p className="text-xs text-gray-500">Últimos 12 meses</p>
        </div>
        <div className="flex gap-3 text-xs text-gray-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Receita
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-400" /> Despesa
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[600px]">
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <g key={p}>
              <line x1={padL} x2={W - padR} y1={padT + innerH * (1 - p)} y2={padT + innerH * (1 - p)} stroke="#1f2937" strokeWidth={1} />
              <text x={padL - 6} y={padT + innerH * (1 - p) + 3} textAnchor="end" fontSize={9} fill="#6b7280">
                {brl(max * p)}
              </text>
            </g>
          ))}
          {serieReceita.map((r, i) => {
            const d = serieDespesa[i]
            const cx = padL + i * groupW + groupW / 2
            const hR = (r.valor / max) * innerH
            const hD = (d.valor / max) * innerH
            return (
              <g key={r.mes}>
                <rect x={cx - barW - 1} y={padT + innerH - hR} width={barW} height={hR} rx={2} fill="#10b981" />
                <rect x={cx + 1} y={padT + innerH - hD} width={barW} height={hD} rx={2} fill="#f43f5e" />
                <text x={cx} y={H - 10} textAnchor="middle" fontSize={9} fill="#6b7280">
                  {mesLabel(r.mes)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
