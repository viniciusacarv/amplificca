'use client'
// Donut SVG da composição da receita do mês por fonte, com tooltip ao hover.

import { useState } from 'react'

type Item = { label: string; valor: number; color: string }

function brl(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function BreakdownChart({ items, total }: { items: Item[]; total: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const size = 180
  const r = 70
  const stroke = 22
  const cFull = 2 * Math.PI * r

  let acc = 0

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5 h-full">
      <h3 className="text-sm font-semibold text-white mb-1">Receita por fonte</h3>
      <p className="text-xs text-gray-500 mb-4">Composição do mês</p>

      {items.length === 0 || total === 0 ? (
        <div className="flex items-center justify-center h-40 text-sm text-gray-500">
          Sem receita registrada.
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <g transform={`translate(${size / 2} ${size / 2}) rotate(-90)`}>
                <circle cx={0} cy={0} r={r} fill="none" stroke="#1f2937" strokeWidth={stroke} />
                {items.map((it, idx) => {
                  const frac = it.valor / total
                  const len = cFull * frac
                  const dasharray = `${len} ${cFull - len}`
                  const offset = -acc
                  acc += len
                  const isHover = hover === idx
                  return (
                    <circle
                      key={it.label}
                      cx={0}
                      cy={0}
                      r={r}
                      fill="none"
                      stroke={it.color}
                      strokeWidth={isHover ? stroke + 4 : stroke}
                      strokeDasharray={dasharray}
                      strokeDashoffset={offset}
                      onMouseEnter={() => setHover(idx)}
                      onMouseLeave={() => setHover(null)}
                      style={{ cursor: 'pointer', transition: 'stroke-width 0.15s' }}
                    />
                  )
                })}
              </g>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {hover !== null ? (
                <>
                  <span className="text-xs text-gray-400">{items[hover].label}</span>
                  <span className="text-lg font-semibold tabular-nums" style={{ color: items[hover].color }}>
                    {brl(items[hover].valor)}
                  </span>
                  <span className="text-xs text-gray-500 tabular-nums">
                    {((items[hover].valor / total) * 100).toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xs text-gray-400">Total</span>
                  <span className="text-lg font-semibold text-white tabular-nums">{brl(total)}</span>
                </>
              )}
            </div>
          </div>

          <ul className="flex-1 space-y-1.5 text-xs">
            {items.map((it, idx) => (
              <li
                key={it.label}
                onMouseEnter={() => setHover(idx)}
                onMouseLeave={() => setHover(null)}
                className={`flex items-center justify-between gap-2 cursor-pointer rounded px-1 py-0.5 transition-colors ${
                  hover === idx ? 'bg-gray-800/60' : ''
                }`}
              >
                <span className="inline-flex items-center gap-1.5 text-gray-300 truncate">
                  <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: it.color }} />
                  {it.label}
                </span>
                <span className="text-gray-400 tabular-nums">{brl(it.valor)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
