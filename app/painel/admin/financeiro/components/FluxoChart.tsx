'use client'
// Gráfico de barras receita x despesa nos últimos 12 meses, com tooltip ao hover.

import { useState } from 'react'

type Serie = { mes: string; valor: number }

function brl(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function brlFull(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function mesLabel(m: string) {
  const [, mm] = m.split('-')
  return ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][Number(mm) - 1]
}

export default function FluxoChart({ serieReceita, serieDespesa }: { serieReceita: Serie[]; serieDespesa: Serie[] }) {
  const [hover, setHover] = useState<number | null>(null)

  const max = Math.max(1, ...serieReceita.map((s) => s.valor), ...serieDespesa.map((s) => s.valor))
  const W = 720
  const H = 240
  const padL = 40, padR = 12, padT = 16, padB = 30
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
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Receita</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-400" /> Despesa</span>
        </div>
      </div>
      <div className="overflow-x-auto relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[600px]">
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <g key={p}>
              <line x1={padL} x2={W - padR} y1={padT + innerH * (1 - p)} y2={padT + innerH * (1 - p)} stroke="#1f2937" strokeWidth={1} />
              <text x={padL - 6} y={padT + innerH * (1 - p) + 3} textAnchor="end" fontSize={9} fill="#6b7280">{brl(max * p)}</text>
            </g>
          ))}

          {serieReceita.map((r, i) => {
            const d = serieDespesa[i]
            const cx = padL + i * groupW + groupW / 2
            const hR = (r.valor / max) * innerH
            const hD = (d.valor / max) * innerH
            const isHover = hover === i
            return (
              <g
                key={r.mes}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: 'pointer' }}
              >
                <rect x={padL + i * groupW} y={padT} width={groupW} height={innerH} fill={isHover ? '#1f293744' : 'transparent'} />
                <rect x={cx - barW - 1} y={padT + innerH - hR} width={barW} height={hR} rx={2} fill="#10b981" opacity={hover === null || isHover ? 1 : 0.5} />
                <rect x={cx + 1} y={padT + innerH - hD} width={barW} height={hD} rx={2} fill="#f43f5e" opacity={hover === null || isHover ? 1 : 0.5} />
                <text x={cx} y={H - 10} textAnchor="middle" fontSize={9} fill="#6b7280">{mesLabel(r.mes)}</text>
              </g>
            )
          })}
        </svg>

        {hover !== null && (
          <div
            className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 rounded-lg bg-gray-950/95 border border-gray-700 px-3 py-2 text-xs text-gray-200 shadow-lg"
          >
            <div className="font-semibold text-gray-300 mb-1">{mesLabel(serieReceita[hover].mes)}/{serieReceita[hover].mes.slice(0, 4)}</div>
            <div className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Receita</span>
              <span className="tabular-nums">{brlFull(serieReceita[hover].valor)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-400" /> Despesa</span>
              <span className="tabular-nums">{brlFull(serieDespesa[hover].valor)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-1 mt-1 border-t border-gray-800">
              <span className="text-gray-400">Saldo</span>
              <span className={`tabular-nums font-semibold ${serieReceita[hover].valor - serieDespesa[hover].valor >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {brlFull(serieReceita[hover].valor - serieDespesa[hover].valor)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
