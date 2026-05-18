// app/painel/admin/imprensa/relatorios/components/VisaoPorFellow.tsx
// Tabela densa: métricas + perfil editorial por fellow.

import Link from 'next/link'
import type { FellowAgg } from '@/lib/services/imprensa-relatorio'

function formatPct(v: number) {
  return `${(v * 100).toFixed(0)}%`
}

const STATUS_BADGE: Record<FellowAgg['statusAtividade'], { label: string; color: string }> = {
  ativo:          { label: 'Ativo',          color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  atencao:        { label: 'Atenção',        color: 'bg-amber-500/15 text-amber-400 border-amber-500/20'      },
  risco:          { label: 'Risco',          color: 'bg-orange-500/15 text-orange-400 border-orange-500/20'   },
  sem_atividade:  { label: 'Sem atividade',  color: 'bg-red-500/15 text-red-400 border-red-500/20'            },
}

export function VisaoPorFellow({ fellows }: { fellows: FellowAgg[] }) {
  if (fellows.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        Nenhum fellow para exibir.
      </p>
    )
  }

  // Esconde fellows que não submeteram E não estão cadastrados com publicação
  const ativos = fellows.filter((f) => f.submetidos > 0 || f.publicados > 0)
  const semAtividade = fellows.filter((f) => f.submetidos === 0 && f.publicados === 0)

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50 text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Fellow</th>
              <th className="text-right px-3 py-2.5 font-medium">Subm.</th>
              <th className="text-right px-3 py-2.5 font-medium">Publ.</th>
              <th className="text-right px-3 py-2.5 font-medium">Taxa</th>
              <th className="text-left px-3 py-2.5 font-medium">Top temas</th>
              <th className="text-left px-3 py-2.5 font-medium">Top veículos</th>
              <th className="text-right px-3 py-2.5 font-medium">Última publ.</th>
              <th className="text-left px-3 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {ativos.map((f) => {
              const badge = STATUS_BADGE[f.statusAtividade]
              return (
                <tr key={f.fellow_id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/painel/admin/fellows/${f.fellow_id}`}
                      className="text-white hover:text-emerald-400 transition-colors"
                    >
                      {f.nome}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {[f.area, f.estado].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </td>
                  <td className="px-3 py-2.5 text-right text-gray-300">{f.submetidos}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                      {f.publicados}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs text-gray-400">
                    {f.submetidos > 0 ? formatPct(f.taxa) : '—'}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {f.topTags.length === 0 ? (
                        <span className="text-xs text-gray-600 italic">—</span>
                      ) : (
                        f.topTags.map((t) => (
                          <span key={t} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            {t}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {f.topVeiculos.length === 0 ? (
                        <span className="text-xs text-gray-600 italic">—</span>
                      ) : (
                        f.topVeiculos.map((v) => (
                          <span key={v} className="text-[11px] text-gray-400 truncate max-w-[110px]" title={v}>
                            {v}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs text-gray-500 whitespace-nowrap">
                    {f.ultimaPublicacaoEm
                      ? `${f.diasDesdeUltimaPublicacao}d atrás`
                      : '—'}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {semAtividade.length > 0 && (
        <details className="rounded-xl border border-gray-800 overflow-hidden">
          <summary className="cursor-pointer px-4 py-3 text-xs text-gray-400 hover:bg-gray-800/30 transition-colors">
            + {semAtividade.length} fellow{semAtividade.length === 1 ? '' : 's'} sem atividade no período
          </summary>
          <ul className="divide-y divide-gray-800">
            {semAtividade.map((f) => (
              <li key={f.fellow_id} className="px-4 py-2 text-xs text-gray-500 flex justify-between">
                <Link href={`/painel/admin/fellows/${f.fellow_id}`} className="hover:text-gray-300 transition-colors">
                  {f.nome}
                </Link>
                <span>{[f.area, f.estado].filter(Boolean).join(' · ')}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
