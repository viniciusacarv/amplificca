// KPIs + gráficos do painel de custos. Estilo ERPVAC.

'use client'

import { useState } from 'react'
import { TrendingUp, Layers, Calendar, Building2 } from 'lucide-react'

type Despesa = {
  id: number
  categoria: string
  fornecedor: string | null
  valor: number
  data: string
  projeto: string | null
}

type Categoria = { id: number; nome: string; cor: string | null }

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function brl(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function brlCompact(n: number) {
  if (n >= 1000) return `R$ ${(n / 1000).toFixed(1)}k`
  return `R$ ${n.toFixed(0)}`
}

function corDe(nome: string, categorias: Categoria[]): string {
  const c = categorias.find((c) => c.nome === nome)
  return c?.cor ?? '#64748b'
}

export default function CustosOverview({ despesas, categorias, ano }: { despesas: Despesa[]; categorias: Categoria[]; ano: number }) {
  const [hoverCat, setHoverCat] = useState<string | null>(null)
  const [hoverMes, setHoverMes] = useState<number | null>(null)

  const totalAno = despesas.reduce((s, d) => s + Number(d.valor), 0)
  const mesAtualIdx = new Date().getMonth()
  const totalMesAtual = despesas
    .filter((d) => new Date(d.data).getMonth() === mesAtualIdx && d.data.startsWith(String(ano)))
    .reduce((s, d) => s + Number(d.valor), 0)

  // Por categoria
  const porCat = new Map<string, number>()
  despesas.forEach((d) => porCat.set(d.categoria, (porCat.get(d.categoria) ?? 0) + Number(d.valor)))
  const catSorted = Array.from(porCat.entries()).sort((a, b) => b[1] - a[1])
  const topCat = catSorted[0]

  // Por fornecedor (top 5)
  const porForn = new Map<string, number>()
  despesas.forEach((d) => {
    if (!d.fornecedor) return
    porForn.set(d.fornecedor, (porForn.get(d.fornecedor) ?? 0) + Number(d.valor))
  })
  const topForn = Array.from(porForn.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Por mês
  const porMes = Array(12).fill(0)
  despesas.forEach((d) => {
    if (!d.data.startsWith(String(ano))) return
    const m = Number(d.data.split('-')[1]) - 1
    porMes[m] += Number(d.valor)
  })
  const maxMes = Math.max(1, ...porMes)

  // Donut
  const size = 200, r = 76, stroke = 26
  const cFull = 2 * Math.PI * r
  let acc = 0

  const cards = [
    { label: 'Total no ano', value: brl(totalAno), icon: <TrendingUp className="h-5 w-5" />, bg: 'bg-rose-500/10 text-rose-400' },
    { label: 'Mês atual', value: brl(totalMesAtual), icon: <Calendar className="h-5 w-5" />, bg: 'bg-amber-500/10 text-amber-400' },
    { label: 'Top categoria', value: topCat ? topCat[0] : '—', sub: topCat ? brl(topCat[1]) : undefined, icon: <Layers className="h-5 w-5" />, bg: 'bg-purple-500/10 text-purple-400' },
    { label: 'Categorias usadas', value: String(porCat.size), icon: <Building2 className="h-5 w-5" />, bg: 'bg-blue-500/10 text-blue-400' },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-xs uppercase text-gray-500">{c.label}</p>
                <p className="mt-1.5 text-lg font-semibold text-white truncate">{c.value}</p>
                {c.sub && <p className="text-xs text-gray-500 mt-0.5">{c.sub}</p>}
              </div>
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${c.bg}`}>{c.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Donut por categoria */}
        <div className="lg:col-span-1 rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Distribuição por categoria</h3>
          {catSorted.length === 0 ? (
            <p className="text-sm text-gray-500">Sem despesas.</p>
          ) : (
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <svg width={size} height={size}>
                  <g transform={`translate(${size / 2} ${size / 2}) rotate(-90)`}>
                    <circle r={r} fill="none" stroke="#1f2937" strokeWidth={stroke} />
                    {catSorted.map(([cat, val]) => {
                      const frac = val / totalAno
                      const len = cFull * frac
                      const dasharray = `${len} ${cFull - len}`
                      const offset = -acc
                      acc += len
                      const isHover = hoverCat === cat
                      return (
                        <circle
                          key={cat}
                          r={r}
                          fill="none"
                          stroke={corDe(cat, categorias)}
                          strokeWidth={isHover ? stroke + 4 : stroke}
                          strokeDasharray={dasharray}
                          strokeDashoffset={offset}
                          onMouseEnter={() => setHoverCat(cat)}
                          onMouseLeave={() => setHoverCat(null)}
                          style={{ cursor: 'pointer', transition: 'stroke-width 0.15s' }}
                        />
                      )
                    })}
                  </g>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  {hoverCat ? (
                    <>
                      <span className="text-xs text-gray-400">{hoverCat}</span>
                      <span className="text-base font-semibold text-white tabular-nums">{brl(porCat.get(hoverCat) ?? 0)}</span>
                      <span className="text-xs text-gray-500">{((porCat.get(hoverCat) ?? 0) / totalAno * 100).toFixed(1)}%</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-gray-400">Total</span>
                      <span className="text-base font-semibold text-white tabular-nums">{brlCompact(totalAno)}</span>
                    </>
                  )}
                </div>
              </div>
              <ul className="flex-1 space-y-1 text-xs">
                {catSorted.slice(0, 6).map(([cat, val]) => (
                  <li
                    key={cat}
                    onMouseEnter={() => setHoverCat(cat)}
                    onMouseLeave={() => setHoverCat(null)}
                    className={`flex items-center justify-between gap-2 px-1 py-0.5 rounded cursor-pointer ${hoverCat === cat ? 'bg-gray-800/50' : ''}`}
                  >
                    <span className="inline-flex items-center gap-1.5 text-gray-300 truncate">
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: corDe(cat, categorias) }} />
                      {cat}
                    </span>
                    <span className="text-gray-400 tabular-nums">{brl(val)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bar chart por mês */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Despesas mês a mês — {ano}</h3>
          </div>
          <div className="relative">
            <svg viewBox="0 0 600 220" className="w-full">
              {[0, 0.25, 0.5, 0.75, 1].map((p) => (
                <g key={p}>
                  <line x1={36} x2={596} y1={20 + 160 * (1 - p)} y2={20 + 160 * (1 - p)} stroke="#1f2937" />
                  <text x={32} y={24 + 160 * (1 - p)} textAnchor="end" fontSize={9} fill="#6b7280">{brlCompact(maxMes * p)}</text>
                </g>
              ))}
              {porMes.map((v, i) => {
                const x = 40 + i * 46
                const h = (v / maxMes) * 160
                const y = 180 - h
                const isHover = hoverMes === i
                return (
                  <g key={i} onMouseEnter={() => setHoverMes(i)} onMouseLeave={() => setHoverMes(null)} style={{ cursor: 'pointer' }}>
                    <rect x={x - 14} y={20} width={28} height={160} fill={isHover ? '#1f293744' : 'transparent'} />
                    <rect
                      x={x - 12}
                      y={y}
                      width={24}
                      height={h}
                      rx={3}
                      fill={i === mesAtualIdx ? '#f59e0b' : '#f43f5e'}
                      opacity={hoverMes === null || isHover ? 1 : 0.5}
                    />
                    <text x={x} y={196} textAnchor="middle" fontSize={9} fill="#6b7280">{MESES[i]}</text>
                  </g>
                )
              })}
            </svg>
            {hoverMes !== null && (
              <div className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 rounded-lg bg-gray-950/95 border border-gray-700 px-3 py-2 text-xs text-gray-200 shadow-lg">
                <p className="font-semibold mb-1">{MESES[hoverMes]} de {ano}</p>
                <p className="tabular-nums text-rose-400">{brl(porMes[hoverMes])}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {topForn.length > 0 && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Top fornecedores (texto livre, do ano)</h3>
          <div className="space-y-2">
            {topForn.map(([nome, val]) => {
              const pct = (val / totalAno) * 100
              return (
                <div key={nome}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-300">{nome}</span>
                    <span className="text-gray-400 tabular-nums">{brl(val)} · {pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                    <div className="h-full bg-rose-400" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
