'use client'
// app/painel/admin/imprensa/relatorios/components/FellowsEmAtencao.tsx
// Bloco para identificar fellows que precisam de mentoria/atenção.

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { FellowAgg } from '@/lib/services/imprensa-relatorio'

type Janela = 30 | 60 | 90 | 120 | 180

export function FellowsEmAtencao({ fellows }: { fellows: FellowAgg[] }) {
  const [janela, setJanela] = useState<Janela>(60)
  const [minSubmissoes, setMinSubmissoes] = useState<number>(0)
  const [incluirNuncaPublicou, setIncluirNuncaPublicou] = useState(true)
  const [incluirNuncaSubmeteu, setIncluirNuncaSubmeteu] = useState(true)

  const filtrados = useMemo(() => {
    return fellows.filter((f) => {
      // Caso 1: nunca submeteu
      if (f.submetidos === 0) {
        return incluirNuncaSubmeteu
      }
      // Caso 2: submeteu mas nunca publicou
      if (f.publicados === 0) {
        return incluirNuncaPublicou && f.submetidos >= minSubmissoes
      }
      // Caso 3: publicou, mas a última publicação foi há mais que `janela`
      if (f.diasDesdeUltimaPublicacao !== null && f.diasDesdeUltimaPublicacao > janela) {
        return f.submetidos >= minSubmissoes
      }
      return false
    }).sort((a, b) => {
      // Pior caso primeiro: nunca submeteu > nunca publicou > inativo há muito
      const score = (f: FellowAgg) => {
        if (f.submetidos === 0) return 1000
        if (f.publicados === 0) return 500 + (f.diasDesdeUltimaPublicacao ?? 365)
        return f.diasDesdeUltimaPublicacao ?? 0
      }
      return score(b) - score(a)
    })
  }, [fellows, janela, minSubmissoes, incluirNuncaPublicou, incluirNuncaSubmeteu])

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wider text-amber-400">Mentoria</p>
        <h3 className="font-semibold text-white mt-1">Fellows em atenção</h3>
        <p className="text-gray-400 mt-1.5 text-sm">
          Identifica quem está parado para ações de mentoria proativa.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-800">
        <label className="text-xs text-gray-400 flex items-center gap-2">
          Janela inatividade:
          <select
            value={janela}
            onChange={(e) => setJanela(Number(e.target.value) as Janela)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500/60"
          >
            <option value={30}>30 dias</option>
            <option value={60}>60 dias</option>
            <option value={90}>90 dias</option>
            <option value={120}>120 dias</option>
            <option value={180}>180 dias</option>
          </select>
        </label>
        <label className="text-xs text-gray-400 flex items-center gap-2">
          Mín. submissões:
          <input
            type="number"
            min={0}
            value={minSubmissoes}
            onChange={(e) => setMinSubmissoes(Math.max(0, Number(e.target.value)))}
            className="w-16 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500/60"
          />
        </label>
        <label className="text-xs text-gray-400 flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={incluirNuncaPublicou}
            onChange={(e) => setIncluirNuncaPublicou(e.target.checked)}
            className="accent-amber-500"
          />
          Submeteu, nunca publicou
        </label>
        <label className="text-xs text-gray-400 flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={incluirNuncaSubmeteu}
            onChange={(e) => setIncluirNuncaSubmeteu(e.target.checked)}
            className="accent-amber-500"
          />
          Nunca submeteu
        </label>
        <span className="ml-auto text-xs text-gray-500">
          {filtrados.length} fellow{filtrados.length === 1 ? '' : 's'} na lista
        </span>
      </div>

      {filtrados.length === 0 ? (
        <p className="text-sm text-emerald-400 italic py-4 text-center">
          🎉 Nenhum fellow corresponde aos critérios — todos ativos!
        </p>
      ) : (
        <div className="rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/40 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Fellow</th>
                <th className="text-right px-3 py-2 font-medium">Submetidos</th>
                <th className="text-right px-3 py-2 font-medium">Publicados</th>
                <th className="text-right px-3 py-2 font-medium">Última publicação</th>
                <th className="text-left px-3 py-2 font-medium">Sinal</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtrados.map((f) => {
                let sinal: { texto: string; cor: string } = { texto: '—', cor: 'text-gray-400' }
                if (f.submetidos === 0) sinal = { texto: 'Nunca submeteu', cor: 'text-red-400' }
                else if (f.publicados === 0) sinal = { texto: 'Submeteu, ainda não publicou', cor: 'text-amber-400' }
                else if (f.diasDesdeUltimaPublicacao !== null)
                  sinal = { texto: `Inativo há ${f.diasDesdeUltimaPublicacao} dias`, cor: 'text-orange-400' }

                return (
                  <tr key={f.fellow_id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-3 py-2.5">
                      <p className="text-white">{f.nome}</p>
                      <p className="text-xs text-gray-500">{[f.area, f.estado].filter(Boolean).join(' · ') || '—'}</p>
                    </td>
                    <td className="px-3 py-2.5 text-right text-gray-300">{f.submetidos}</td>
                    <td className="px-3 py-2.5 text-right text-gray-300">{f.publicados}</td>
                    <td className="px-3 py-2.5 text-right text-xs text-gray-500">
                      {f.ultimaPublicacaoEm
                        ? new Date(f.ultimaPublicacaoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className={`px-3 py-2.5 text-xs ${sinal.cor}`}>{sinal.texto}</td>
                    <td className="px-3 py-2.5 text-right">
                      <Link
                        href={`/painel/admin/fellows/${f.fellow_id}`}
                        className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        Ver perfil →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
