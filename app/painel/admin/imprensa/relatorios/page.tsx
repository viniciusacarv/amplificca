// app/painel/admin/imprensa/relatorios/page.tsx
// Relatórios consolidados da Assessoria de Imprensa

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  ArrowLeft,
  Users,
  FileText,
  Send,
  Trophy,
  TrendingUp,
  Newspaper,
  XCircle,
  Undo2,
  Clock,
  Archive,
  FileSpreadsheet,
  FileDown,
} from 'lucide-react'
import {
  getRelatorioImprensa,
  resolverPeriodo,
} from '@/lib/services/imprensa-relatorio'

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
            Indicadores consolidados para apresentação institucional e captação de recursos.
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
          {/* ── KPI cards (linha de topo) ──────────────────────────── */}
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <KPI
              icon={<Users className="w-4 h-4" />}
              label="Fellows únicos"
              value={k.fellowsUnicos}
              tone="emerald"
              hint={`${k.fellowsPublicados} já publicados`}
            />
            <KPI
              icon={<FileText className="w-4 h-4" />}
              label="Artigos submetidos"
              value={k.totalSubmetidos}
              tone="blue"
              hint="No período"
            />
            <KPI
              icon={<Send className="w-4 h-4" />}
              label="Na imprensa"
              value={k.naImprensa}
              tone="blue"
              hint={`+ ${k.publicados} já publicados`}
            />
            <KPI
              icon={<Trophy className="w-4 h-4" />}
              label="Publicados"
              value={k.publicados}
              tone="emerald"
              hint={`${formatPct(k.taxaPublicacaoSobreTotal)} do total`}
            />
          </div>

          {/* ── Bento grid principal (mosaico 3+2 / 2+3) ───────────── */}
          <div className="mx-auto grid gap-px sm:grid-cols-5 bg-gray-800 rounded-2xl overflow-hidden border border-gray-800">
            {/* TL — Funil (3 cols) */}
            <Card className="group sm:col-span-3 sm:rounded-none sm:rounded-tl-2xl border-0 rounded-none">
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
                  <FunilBar
                    label="Submetidos"
                    value={k.totalSubmetidos}
                    total={k.totalSubmetidos}
                    color="bg-gray-500"
                    icon="📥"
                  />
                  <FunilBar
                    label="Pendentes"
                    value={k.pendentes}
                    total={k.totalSubmetidos}
                    color="bg-yellow-500"
                    icon="🔍"
                  />
                  <FunilBar
                    label="Na imprensa"
                    value={k.naImprensa}
                    total={k.totalSubmetidos}
                    color="bg-blue-500"
                    icon="📤"
                  />
                  <FunilBar
                    label="Publicados"
                    value={k.publicados}
                    total={k.totalSubmetidos}
                    color="bg-emerald-500"
                    icon="🎉"
                  />
                  <FunilBar
                    label="Recusados"
                    value={k.recusados}
                    total={k.totalSubmetidos}
                    color="bg-red-500"
                    icon="❌"
                  />
                  <FunilBar
                    label="Retirados"
                    value={k.retirados}
                    total={k.totalSubmetidos}
                    color="bg-gray-500"
                    icon="↩️"
                  />
                  <FunilBar
                    label="Arquivados"
                    value={k.arquivados}
                    total={k.totalSubmetidos}
                    color="bg-zinc-500"
                    icon="🗄️"
                  />
                </div>
              </CardContent>
            </Card>

            {/* TR — Taxas (2 cols) */}
            <Card className="group sm:col-span-2 sm:rounded-none sm:rounded-tr-2xl border-0 rounded-none flex flex-col">
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

            {/* BL — Mini stats (2 cols) */}
            <Card className="group sm:col-span-2 sm:rounded-none sm:rounded-bl-2xl border-0 rounded-none">
              <CardHeader>
                <p className="text-xs uppercase tracking-wider text-gray-500">Status</p>
                <p className="font-semibold text-white mt-1">Detalhamento</p>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <MiniStat
                  icon={<Clock className="w-4 h-4" />}
                  label="Pendentes"
                  value={k.pendentes}
                  tone="yellow"
                />
                <MiniStat
                  icon={<TrendingUp className="w-4 h-4" />}
                  label="Na imprensa"
                  value={k.naImprensa}
                  tone="blue"
                />
                <MiniStat
                  icon={<XCircle className="w-4 h-4" />}
                  label="Recusados"
                  value={k.recusados}
                  tone="red"
                />
                <MiniStat
                  icon={<Undo2 className="w-4 h-4" />}
                  label="Retirados"
                  value={k.retirados}
                  tone="gray"
                />
                <MiniStat
                  icon={<Archive className="w-4 h-4" />}
                  label="Arquivados"
                  value={k.arquivados}
                  tone="zinc"
                />
              </CardContent>
            </Card>

            {/* BR — Veículos (3 cols) */}
            <Card className="group sm:col-span-3 sm:rounded-none sm:rounded-br-2xl border-0 rounded-none">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-blue-400" />
                  <p className="text-xs uppercase tracking-wider text-gray-500">Imprensa</p>
                </div>
                <p className="font-semibold text-white mt-1">Veículos onde os fellows publicaram</p>
                <p className="text-gray-400 mt-1.5 text-sm">
                  Agregado a partir das tentativas de placement com publicação confirmada.
                </p>
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
                          <th className="text-right px-4 py-2 font-medium">Publicações</th>
                          <th className="text-right px-4 py-2 font-medium">Fellows</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {relatorio.veiculos.slice(0, 10).map((v) => (
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

/* ─── Subcomponentes visuais ──────────────────────────────────── */

const TONES = {
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  red: 'bg-red-500/10 border-red-500/20 text-red-400',
  gray: 'bg-gray-500/10 border-gray-500/20 text-gray-300',
  zinc: 'bg-zinc-500/10 border-zinc-500/20 text-zinc-300',
} as const

function KPI({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  hint?: string
  tone: keyof typeof TONES
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
        <span className={`p-1.5 rounded-lg border ${TONES[tone]}`}>{icon}</span>
      </div>
      <p className="text-3xl font-bold text-white mt-3">{value}</p>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </Card>
  )
}

function MiniStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: number
  tone: keyof typeof TONES
}) {
  return (
    <div className={`rounded-xl border p-3 ${TONES[tone]}`}>
      <div className="flex items-center justify-between">
        {icon}
        <span className="text-xl font-bold">{value}</span>
      </div>
      <p className="text-xs mt-1 opacity-80">{label}</p>
    </div>
  )
}

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
