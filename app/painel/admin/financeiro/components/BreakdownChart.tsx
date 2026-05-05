// Donut SVG da composição da receita do mês por fonte.

type Item = { label: string; valor: number; color: string }

function brl(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function BreakdownChart({ items, total }: { items: Item[]; total: number }) {
  const size = 180
  const r = 70
  const stroke = 22
  const c = 2 * Math.PI * r
  let acc = 0

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5 h-full">
      <h3 className="text-sm font-semibold text-white mb-1">Receita por fonte</h3>
      <p className="text-xs text-gray-500 mb-4">Composição do mês</p>

      {items.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-sm text-gray-500">
          Sem receita registrada.
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0 -rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1f2937" strokeWidth={stroke} />
            {items.map((it) => {
              const frac = total > 0 ? it.valor / total : 0
              const len = c * frac
              const dasharray = `${len} ${c - len}`
              const offset = -acc
              acc += len
              return (
                <circle
                  key={it.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={it.color}
                  strokeWidth={stroke}
                  strokeDasharray={dasharray}
                  strokeDashoffset={offset}
                />
              )
            })}
          </svg>

          <ul className="flex-1 space-y-1.5 text-xs">
            {items.map((it) => (
              <li key={it.label} className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-gray-300">
                  <span className="h-2 w-2 rounded-full" style={{ background: it.color }} />
                  {it.label}
                </span>
                <span className="text-gray-400 tabular-nums">{brl(it.valor)}</span>
              </li>
            ))}
            <li className="flex items-center justify-between gap-2 pt-2 border-t border-gray-800 text-gray-200 font-medium">
              <span>Total</span>
              <span className="tabular-nums">{brl(total)}</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
