'use client'
// app/painel/admin/imprensa/relatorios/components/HeatmapFellowMes.tsx
// Heatmap fellow × mês com tooltip de detalhe.

import { useState } from 'react'
import type { HeatmapData } from '@/lib/services/imprensa-relatorio'

const MES_LABELS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function labelMes(mes: string): string {
  const [, m] = mes.split('-')
  const idx = Math.max(0, Math.min(11, Number(m) - 1))
  return MES_LABELS[idx]
}

function getCellColor(value: number, max: number): string {
  if (value === 0) return 'bg-gray-800/40'
  if (max === 0) return 'bg-gray-800/40'
  const ratio = value / max
  if (ratio >= 0.75) return 'bg-emerald-400'
  if (ratio >= 0.5)  return 'bg-emerald-500/80'
  if (ratio >= 0.25) return 'bg-emerald-500/50'
  return 'bg-emerald-500/25'
}

export function HeatmapFellowMes({ data }: { data: HeatmapData }) {
  const [hover, setHover] = useState<{ fellow: string; mes: string; valor: number } | null>(null)

  if (data.fellows.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        Sem publicações no período para montar o heatmap.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="text-xs" cellSpacing={2}>
          <thead>
            <tr>
              <th className="text-left p-1 sticky left-0 bg-gray-900 z-10 min-w-[140px] max-w-[180px]"></th>
              {data.meses.map((m) => (
                <th key={m} className="text-center p-1 text-[10px] text-gray-500 uppercase tracking-wider font-normal min-w-[28px]">
                  {labelMes(m)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.fellows.map((f) => (
              <tr key={f.id}>
                <td className="text-left p-1 pr-3 sticky left-0 bg-gray-900 z-10 truncate max-w-[180px] text-gray-300">
                  {f.nome}
                </td>
                {data.meses.map((m) => {
                  const v = data.matriz[f.id]?.[m] ?? 0
                  return (
                    <td key={m} className="p-0.5">
                      <div
                        onMouseEnter={() => setHover({ fellow: f.nome, mes: m, valor: v })}
                        onMouseLeave={() => setHover(null)}
                        className={`w-7 h-7 rounded ${getCellColor(v, data.max)} flex items-center justify-center text-[10px] font-medium ${
                          v > 0 ? 'text-black' : 'text-gray-700'
                        } cursor-help transition-transform hover:scale-110`}
                        title={`${f.nome} · ${m}: ${v} publicação${v === 1 ? '' : 'ões'}`}
                      >
                        {v > 0 ? v : ''}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Menos</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded bg-gray-800/40" />
          <div className="w-4 h-4 rounded bg-emerald-500/25" />
          <div className="w-4 h-4 rounded bg-emerald-500/50" />
          <div className="w-4 h-4 rounded bg-emerald-500/80" />
          <div className="w-4 h-4 rounded bg-emerald-400" />
        </div>
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Mais</span>
        {hover && (
          <span className="ml-auto text-xs text-emerald-400">
            {hover.fellow} · {hover.mes}: <strong>{hover.valor}</strong>
          </span>
        )}
      </div>
    </div>
  )
}
