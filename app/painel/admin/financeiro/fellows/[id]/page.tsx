// Relatório financeiro individual por fellow.

import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, Mail, Phone, GraduationCap, Wallet, AlertTriangle, Package } from 'lucide-react'

function brl(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtData(d: string | null) {
  if (!d) return '—'
  const [y, m, dd] = d.split('-')
  return `${dd}/${m}/${y}`
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export default async function FellowReportPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!id) notFound()

  const supabase = createClient()
  const [fellowRes, cobrancasRes, vinculosRes, produtosRes, turmasRes] = await Promise.all([
    supabase.from('fellows').select('id, nome, email, whatsapp, area, estado, foto_url, tipo_financiamento, bolsa_origem, turma_id, contrato_ativo, contrato_encerrado_em, created_at').eq('id', id).maybeSingle(),
    supabase.from('financeiro_cobrancas').select('*').eq('fellow_id', id).order('mes_referencia', { ascending: true }),
    supabase.from('fellow_produtos').select('*').eq('fellow_id', id).order('data_inicio', { ascending: false }),
    supabase.from('produtos').select('id, nome, cor'),
    supabase.from('turmas').select('id, nome'),
  ])

  const fellow: any = fellowRes.data
  if (!fellow) notFound()

  const cobrancas: any[] = cobrancasRes.data ?? []
  const vinculos: any[] = vinculosRes.data ?? []
  const produtos: any[] = produtosRes.data ?? []
  const turmas: any[] = turmasRes.data ?? []
  const turmaNome = turmas.find((t) => t.id === fellow.turma_id)?.nome ?? '—'

  const totalPago = cobrancas.filter((c) => c.status === 'pago').reduce((s, c) => s + Number(c.valor), 0)
  const totalPendente = cobrancas.filter((c) => c.status === 'pendente').reduce((s, c) => s + Number(c.valor), 0)
  const totalInadimpl = cobrancas.filter((c) => c.status === 'inadimplente').reduce((s, c) => s + Number(c.valor), 0)
  const ativoDesde = fellow.created_at ? fmtData(String(fellow.created_at).slice(0, 10)) : '—'

  // Histórico mensal últimos 18 meses
  const hoje = new Date()
  const meses: { mes: string; status?: string; valor?: number }[] = []
  for (let i = 17; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const c = cobrancas.find((cc) => cc.mes_referencia.startsWith(k))
    meses.push({ mes: k, status: c?.status, valor: c ? Number(c.valor) : undefined })
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <Link href="/painel/admin/financeiro/turmas" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-amber-400">
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar para turmas
      </Link>

      <header className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        {fellow.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fellow.foto_url} alt="" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center text-xl text-gray-400">
            {fellow.nome.split(' ').map((p: string) => p[0]).slice(0, 2).join('')}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-white">{fellow.nome}</h1>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-400">
            {fellow.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{fellow.email}</span>}
            {fellow.whatsapp && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{fellow.whatsapp}</span>}
            {fellow.area && <span>· {fellow.area}</span>}
            {fellow.estado && <span>· {fellow.estado}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-gray-800 text-gray-300">
              <GraduationCap className="h-3 w-3" />{turmaNome}
            </span>
            {fellow.tipo_financiamento === 'autofinanciado' && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">Autofinanciado</span>
            )}
            {fellow.tipo_financiamento === 'bolsista' && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">{fellow.bolsa_origem ?? 'Bolsista'}</span>
            )}
            {fellow.contrato_ativo ? (
              <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Contrato ativo</span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Encerrado{fellow.contrato_encerrado_em ? ` em ${fmtData(fellow.contrato_encerrado_em)}` : ''}
              </span>
            )}
            <span className="text-xs text-gray-500">· Ativo desde {ativoDesde}</span>
          </div>
        </div>
        {fellow.whatsapp && (
          <a href={`https://wa.me/${fellow.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-sm">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        )}
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
          <p className="text-xs uppercase text-gray-500">Total pago</p>
          <p className="text-lg font-semibold text-emerald-400 mt-1 tabular-nums">{brl(totalPago)}</p>
          <p className="text-xs text-gray-500">{cobrancas.filter((c) => c.status === 'pago').length} cobrança(s) quitada(s)</p>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
          <p className="text-xs uppercase text-gray-500">Pendente</p>
          <p className="text-lg font-semibold text-amber-400 mt-1 tabular-nums">{brl(totalPendente)}</p>
          <p className="text-xs text-gray-500">{cobrancas.filter((c) => c.status === 'pendente').length} pendente(s)</p>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
          <p className="text-xs uppercase text-gray-500">Inadimplência</p>
          <p className="text-lg font-semibold text-rose-400 mt-1 tabular-nums">{brl(totalInadimpl)}</p>
          <p className="text-xs text-gray-500">{cobrancas.filter((c) => c.status === 'inadimplente').length} inadimplente(s)</p>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
          <p className="text-xs uppercase text-gray-500">Cobranças totais</p>
          <p className="text-lg font-semibold text-white mt-1 tabular-nums">{cobrancas.length}</p>
          <p className="text-xs text-gray-500">no histórico</p>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <h3 className="text-sm font-semibold text-white mb-3 inline-flex items-center gap-2">
          <Wallet className="h-4 w-4" /> Histórico de pagamentos (18 meses)
        </h3>
        <div className="grid grid-cols-6 sm:grid-cols-9 lg:grid-cols-18 gap-1">
          {meses.map((m) => {
            const [, mm] = m.mes.split('-')
            const cls = !m.status ? 'bg-gray-800 text-gray-600'
              : m.status === 'pago' ? 'bg-emerald-500/40 text-emerald-200'
              : m.status === 'pendente' ? 'bg-amber-500/40 text-amber-200'
              : 'bg-rose-500/40 text-rose-200'
            return (
              <div key={m.mes} className={`h-12 rounded-md flex flex-col items-center justify-center text-[10px] ${cls}`} title={`${m.mes} · ${m.status ?? 'sem cobrança'}`}>
                <span>{MESES[Number(mm) - 1]}</span>
                <span className="font-semibold">{m.mes.slice(2, 4)}</span>
              </div>
            )
          })}
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-400">
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-500/40" /> Pago</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-amber-500/40" /> Pendente</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-rose-500/40" /> Inadimplente</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-gray-800" /> Sem cobrança</span>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <h3 className="text-sm font-semibold text-white mb-3 inline-flex items-center gap-2">
          <Package className="h-4 w-4" /> Produtos contratados
        </h3>
        {vinculos.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum produto vinculado ainda.</p>
        ) : (
          <ul className="divide-y divide-gray-800">
            {vinculos.map((v) => {
              const p = produtos.find((pp) => pp.id === v.produto_id)
              return (
                <li key={v.id} className="py-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-200 inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: p?.cor ?? '#64748b' }} />
                      {p?.nome ?? '?'}
                    </p>
                    <p className="text-xs text-gray-500">{fmtData(v.data_inicio)} → {v.data_fim ? fmtData(v.data_fim) : 'em aberto'} · status {v.status}</p>
                  </div>
                  {v.valor_negociado && (
                    <span className="text-sm tabular-nums text-amber-400">{brl(Number(v.valor_negociado))}</span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Histórico completo de cobranças</h3>
        {cobrancas.length === 0 ? (
          <p className="text-sm text-gray-500">Sem cobranças registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-gray-500">
                <tr>
                  <th className="text-left py-2">Mês</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-right py-2">Valor</th>
                  <th className="text-left py-2 pl-4">Pagamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {cobrancas.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-900/40">
                    <td className="py-2 text-gray-300">{c.mes_referencia.slice(0, 7)}</td>
                    <td className="py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-md border ${
                        c.status === 'pago' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        c.status === 'pendente' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>{c.status}</span>
                    </td>
                    <td className="py-2 text-right tabular-nums text-gray-300">{brl(Number(c.valor))}</td>
                    <td className="py-2 pl-4 text-gray-400">{c.data_pagamento ? fmtData(c.data_pagamento) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
