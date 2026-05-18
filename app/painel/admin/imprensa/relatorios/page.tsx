// app/painel/admin/imprensa/relatorios/page.tsx
// Relatórios consolidados da Assessoria de Imprensa

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  ArrowLeft,
  TrendingUp,
  Newspaper,
  FileSpreadsheet,
  FileDown,
} from 'lucide-react'
import {
  getRelatorioImprensa,
  resolverPeriodo,
} from '@/lib/services/imprensa-relatorio'
import { KpiInterativo, type KpiItem } from './components/KpiInterativo'
import { VisaoPorFellow } from './components/VisaoPorFellow'
import { FellowsEmAtencao } from './components/FellowsEmAtencao'
import { HeatmapFellowMes } from './components/HeatmapFellowMes'

export const dynamic = 'force-dynamic'

function formatPct(v: number) {
  return `${(v * 100).toFixed(1).replace('.', ',')}%`
}

function formatDateBR(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const PRESETS = [
  { key: 'tudo', label: 'Todo o período' },
  { key: '30d', label: 'Últimos 30 dias' },
  { key: '90d', label: 'Últimos 90 dias' },
  { key: 'ano', label: 'Ano atual' },
] as const

export default async function RelatoriosImprensaPage({
  searchParams,
}: {
  searchParams: { preset?: string; from?: string; to?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  const periodo = resolverPeriodo(searchParams)
  const relatorio = await getRelatorioImprensa({
    from: periodo.from,
    to: periodo.to,
  })

  const k = relatorio.indicadores
  const exportQuery = new URLSearchParams()
  if (periodo.presetAtivo !== 'custom') exportQuery.set('preset', periodo.presetAtivo)
  if (searchParams.from) exportQuery.set('from', searchParams.from)
  if (searchParams.to) exportQuery.set('to', searchParams.to)
  const baseExport = `/painel/admin/imprensa/relatorios/export?${exportQuery.toString()}`

  const empty = k.totalSubmetidos === 0

  // ── Listas para os drill-downs dos KPIs ────────────────────────
  // 1) Fellows únicos: fellows com pelo menos 1 submissão no período
  const fellowsItens: KpiItem[] = relatorio.fellows
    .filter((f) => f.submetidos > 0)
    .map((f) => ({
      key: f.fellow_id,
      primary: f.nome,
      secondary: `${f.submetidos} subm. · ${f.publicados} publ.`,
      tertiary: [f.area, f.estado].filter(Boolean).join(' · '),
    }))

  // 2) Artigos submetidos: lista de submissões
  const submissoesItens: KpiItem[] = relatorio.submissoes.map((s) => ({
    key: s.id,
    primary: s.titulo,
    secondary: formatDateBR(s.created_at),
    tertiary: `${s.fellows?.nome ?? 'Admin'} · ${s.status}`,
  }))

  // 3) Na imprensa: tentativas aguardando ou já publicadas (e por veículo)
  const veiculosImprensaMap = new Map<string, { nome: string; pubs: number; pendentes: number }>()
  for (const t of relatorio.tentativas) {
    if (!t.veiculo_id) continue
    const nome = t.veiculos?.nome ?? '—'
    const e = veiculosImprensaMap.get(t.veiculo_id) ?? { nome, pubs: 0, pendentes: 0 }
    if (t.status === 'publicado') e.pubs += 1
    else if (t.status === 'aguardando') e.pendentes += 1
    veiculosImprensaMap.set(t.veiculo_id, e)
  }
  const naImprensaItens: KpiItem[] = Array.from(veiculosImprensaMap.entries())
    .filter(([, v]) => v.pendentes > 0 || v.pubs > 0)
    .map(([id, v]) => ({
      key: id,
      primary: v.nome,
      secondary: `${v.pendentes} aguardando · ${v.pubs} publ.`,
    }))
    .sort((a, b) => Number(b.secondary?.split(' ')[0] ?? 0) - Number(a.secondary?.split(' ')[0] ?? 0))

  // 4) Publicados: veículos com publicações
  const publicadosItens: KpiItem[] = relatorio.veiculos.map((v) => ({
    key: v.veiculo_id,
    primary: v.nome,
    secondary: `${v.publicacoes} publ.`,
    tertiary: `${v.fellows_distintos} fellow${v.fellows_distintos === 1 ? '' : 's'}`,
  }))

  return (
    <div className="space-y-8">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link
            href="/painel/admin/imprensa"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para a fila
          </Link>
          <h1 className="text-2xl font-bold text-white">Relatórios — Assessoria de Imprensa</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Indicadores consolidados, visão por fellow e sinais para mentoria proativa.
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2 flex-wrap justify-end">
          <a
            href={`${baseExport}&format=xlsx`}
            className="inline-flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar XLSX
          </a>
          <a
            href={`${baseExport}&format=pdf`}
            className="inline-flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Exportar PDF
          </a>
        </div>
      </div>

      {/* ── Filtros de período ────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {PRESETS.map((p) => {
            const ativo = periodo.presetAtivo === p.key
            return (
              <Link
                key={p.key}
                href={`/painel/admin/imprensa/relatorios?preset=${p.key}`}
                className={`flex-shrink-0 inline-flex items-center px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  ativo
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-300 hover:border-gray-700'
                }`}
              >
                {p.label}
              </Link>
            )
          })}
        </div>

        <form
          action="/painel/admin/imprensa/relatorios"
          method="get"
          className="flex items-center gap-2 flex-wrap text-sm"
        >
          <span className="text-xs text-gray-500">Ou período personalizado:</span>
          <input
            type="date"
            name="from"
            defaultValue={searchParams.from ?? ''}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-gray-300 text-xs focus:outline-none focus:border-emerald-500/50"
          />
          <span className="text-xs text-gray-600">até</span>
          <input
            type="date"
            name="to"
            defaultValue={searchParams.to ?? ''}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-gray-300 text-xs focus:outline-none focus:border-emerald-500/50"
          />
          <button
            type="submit"
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white transition-colors"
          >
            Aplicar
          </button>
          {periodo.presetAtivo === 'custom' && (
            <span className="text-xs text-gray-500">
              {formatDateBR(periodo.from)} → {formatDateBR(periodo.to)}
            </span>
          )}
        </form>
      </div>

      {empty ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl py-16 text-center">
          <p className="text-gray-500 text-sm">
            Nenhuma submissão encontrada no período selecionado.
          </p>
        </div>
      ) : (
        <>
          {/* ── KPI cards interativos (linha de topo) ──────────────── */}
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <KpiInterativo
              label="Fellows únicos"
              value={k.fellowsUnicos}
              hint={`${k.fellowsPublicados} já publicados`}
              tone="emerald"
              iconEmoji="👥"
              items={fellowsItens}
              modalTitle="Fellows que submeteram no período"
              emptyMessage="Nenhum fellow submeteu no período."
            />
            <KpiInterativo
              label="Artigos submetidos"
              value={k.totalSubmetidos}
              hint="No período"
              tone="blue"
              iconEmoji="📄"
              items={submissoesItens}
              modalTitle="Submissões do período"
            />
            <KpiInterativo
              label="Na imprensa"
              value={k.naImprensa}
              hint={`+ ${k.publicados} já publicados`}
              tone="blue"
              iconEmoji="📤"
              items={naImprensaItens}
              modalTitle="Veículos contactados / com publicação"
              emptyMessage="Nenhum veículo contactado no período."
            />
            <KpiInterativo
              label="Publicados"
              value={k.publicados}
              hint={`${formatPct(k.taxaPublicacaoSobreTotal)} do total`}
              tone="emerald"
              iconEmoji="🏆"
              items={publicadosItens}
              modalTitle="Veículos com publicações no período"
              emptyMessage="Nenhuma publicação confirmada no período."
            />
          </div>

          {/* ── Funil + Taxas ──────────────────────────────────────── */}
          <div className="grid gap-px sm:grid-cols-5 bg-gray-800 rounded-2xl overflow-hidden border border-gray-800">
            <Card className="group sm:col-span-3 sm:rounded-none sm:rounded-l-2xl border-0 rounded-none">
              <CardHeader>
                <div className="md:p-2">
                  <p className="text-xs uppercase tracking-wider text-gray-500">Funil</p>
                  <p className="font-semibold text-white mt-1">Fluxo dos artigos por status</p>
                  <p className="text-gray-400 mt-1.5 text-sm">
                    Visão completa do pipeline da assessoria — do recebimento à publicação.
                  </p>
                </div>
              </CardHeader>
              <CardContent className="md:px-8 md:pb-8">
                <div className="space-y-3">
                  <FunilBar label="Submetidos" value={k.totalSubmetidos} total={k.totalSubmetidos} color="bg-gray-500" icon="📥" />
                  <FunilBar label="Pendentes" value={k.pendentes} total={k.totalSubmetidos} color="bg-yellow-500" icon="🔍" />
                  <FunilBar label="Na imprensa" value={k.naImprensa} total={k.totalSubmetidos} color="bg-blue-500" icon="📤" />
                  <FunilBar label="Publicados" value={k.publicados} total={k.totalSubmetidos} color="bg-emerald-500" icon="🎉" />
                  <FunilBar label="Recusados" value={k.recusados} total={k.totalSubmetidos} color="bg-red-500" icon="❌" />
                  <FunilBar label="Retirados" value={k.retirados} total={k.totalSubmetidos} color="bg-gray-500" icon="↩️" />
                  <FunilBar label="Arquivados" value={k.arquivados} total={k.totalSubmetidos} color="bg-zinc-500" icon="🗄️" />
                </div>
              </CardContent>
            </Card>

            <Card className="group sm:col-span-2 sm:rounded-none sm:rounded-r-2xl border-0 rounded-none flex flex-col">
              <CardHeader>
                <p className="text-xs uppercase tracking-wider text-gray-500">Conversão</p>
                <p className="font-semibold text-white mt-1">Taxas do processo</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center gap-6">
                <TaxaRing
                  label="Envio à imprensa"
                  sub={`${k.enviadosOuPublicados} de ${k.totalSubmetidos}`}
                  pct={k.taxaEnvio}
                  color="text-blue-400"
                />
                <TaxaRing
                  label="Publicação (sobre enviados)"
                  sub={`${k.publicados} de ${k.enviadosOuPublicados || 0}`}
                  pct={k.taxaPublicacaoSobreEnviados}
                  color="text-emerald-400"
                />
                <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-800">
                  Publicação sobre o total submetido:{' '}
                  <span className="text-emerald-400 font-medium">
                    {formatPct(k.taxaPublicacaoSobreTotal)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Visão por Fellow ────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <p className="text-xs uppercase tracking-wider text-gray-500">Performance</p>
                  </div>
                  <p className="font-semibold text-white mt-1">Visão por Fellow</p>
                  <p className="text-gray-400 mt-1.5 text-sm">
                    Detalhe de produção, taxa de aproveitamento e perfil editorial de cada fellow no período.
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  Status: <span className="text-emerald-400">Ativo</span> ≤60d ·{' '}
                  <span className="text-amber-400">Atenção</span> ≤120d ·{' '}
                  <span className="text-orange-400">Risco</span> {'>'}120d
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <VisaoPorFellow fellows={relatorio.fellows} />
            </CardContent>
          </Card>

          {/* ── Fellows em atenção/mentoria ─────────────────────────── */}
          <FellowsEmAtencao fellows={relatorio.fellows} />

          {/* ── Heatmap fellow × mês ────────────────────────────────── */}
          <Card>
            <CardHeader>
              <p className="text-xs uppercase tracking-wider text-gray-500">Atividade</p>
              <p className="font-semibold text-white mt-1">Publicações por fellow × mês (últimos 12 meses)</p>
              <p className="text-gray-400 mt-1.5 text-sm">
                Cada célula é o número de publicações daquele fellow no respectivo mês. Ajuda a visualizar consistência e quedas.
              </p>
            </CardHeader>
            <CardContent>
              <HeatmapFellowMes data={relatorio.heatmap} />
            </CardContent>
          </Card>

          {/* ── Veículos + Tags ────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-blue-400" />
                  <p className="text-xs uppercase tracking-wider text-gray-500">Imprensa</p>
                </div>
                <p className="font-semibold text-white mt-1">Veículos onde os fellows publicaram</p>
              </CardHeader>
              <CardContent>
                {relatorio.veiculos.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    Ainda não há veículos com publicações confirmadas no período.
                  </p>
                ) : (
                  <div className="rounded-xl border border-gray-800 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="text-left px-4 py-2 font-medium">Veículo</th>
                          <th className="text-right px-4 py-2 font-medium">Publ.</th>
                          <th className="text-right px-4 py-2 font-medium">Fellows</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {relatorio.veiculos.slice(0, 15).map((v) => (
                          <tr key={v.veiculo_id} className="hover:bg-gray-800/30 transition-colors">
                            <td className="px-4 py-2.5 text-white">{v.nome}</td>
                            <td className="px-4 py-2.5 text-right">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                                {v.publicacoes}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right text-gray-400">
                              {v.fellows_distintos}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <p className="text-xs uppercase tracking-wider text-gray-500">Categorização</p>
                <p className="font-semibold text-white mt-1">Temas com mais tração</p>
                <p className="text-gray-400 mt-1.5 text-sm">
                  Tags ordenadas por nº de publicações. Bom indicador de quais pautas o universo da imprensa mais aceita.
                </p>
              </CardHeader>
              <CardContent>
                {relatorio.tags.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    Submissões deste período ainda não foram categorizadas.
                  </p>
                ) : (
                  <div className="rounded-xl border border-gray-800 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="text-left px-4 py-2 font-medium">Tema</th>
                          <th className="text-right px-4 py-2 font-medium">Subm.</th>
                          <th className="text-right px-4 py-2 font-medium">Publ.</th>
                          <th className="text-right px-4 py-2 font-medium">Veíc.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {relatorio.tags.slice(0, 15).map((t) => (
                          <tr key={String(t.tag_id)} className="hover:bg-gray-800/30 transition-colors">
                            <td className="px-4 py-2.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                {t.nome}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right text-gray-300">{t.submissoes}</td>
                            <td className="px-4 py-2.5 text-right text-emerald-400 font-medium">{t.publicacoes}</td>
                            <td className="px-4 py-2.5 text-right text-gray-400">{t.veiculos_distintos}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <p className="text-xs text-gray-600 text-center">
            Período aplicado:{' '}
            <span className="text-gray-400">
              {periodo.from ? formatDateBR(periodo.from) : 'Início'} →{' '}
              {periodo.to ? formatDateBR(periodo.to) : 'Hoje'}
            </span>{' '}
            · {k.totalSubmetidos} artigos · {k.fellowsUnicos} fellows
          </p>
        </>
      )}
    </div>
  )
}

/* ─── Subcomponentes visuais reaproveitados ────────────────────── */

function FunilBar({
  label,
  value,
  total,
  color,
  icon,
}: {
  label: string
  value: number
  total: number
  color: string
  icon: string
}) {
  const pct = total > 0 ? (value / total) * 100 : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 text-sm">
        <span className="text-gray-300 flex items-center gap-1.5">
          <span>{icon}</span> {label}
        </span>
        <span className="text-gray-400">
          <span className="text-white font-semibold">{value}</span>
          <span className="text-xs text-gray-500 ml-2">
            {pct.toFixed(0).replace('.', ',')}%
          </span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
        <div
          className={`h-full ${color} transition-all`}
          style={{ width: `${Math.max(pct, value > 0 ? 2 : 0)}%` }}
        />
      </div>
    </div>
  )
}

function TaxaRing({
  label,
  sub,
  pct,
  color,
}: {
  label: string
  sub: string
  pct: number
  color: string
}) {
  const display = (pct * 100).toFixed(1).replace('.', ',')
  const angle = Math.min(Math.max(pct, 0), 1) * 360
  return (
    <div className="flex items-center gap-4">
      <div
        className="relative w-20 h-20 rounded-full flex-shrink-0"
        style={{
          background: `conic-gradient(currentColor ${angle}deg, rgb(31 41 55) ${angle}deg)`,
        }}
      >
        <div className={color}>
          <div className="absolute inset-1.5 rounded-full bg-gray-900 flex items-center justify-center">
            <span className="text-sm font-bold text-white">{display}%</span>
          </div>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
      </div>
    </div>
  )
}
