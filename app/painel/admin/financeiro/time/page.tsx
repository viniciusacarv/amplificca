// CRUD do time financeiro: cadastro, pagamentos individuais, visão mensal e upload de arquivos.

import { createClient } from '@/lib/supabase-server'
import {
  criarMembroEquipe,
  editarMembroEquipe,
  excluirMembroEquipe,
  registrarPagamentoEquipe,
  editarPagamentoEquipe,
  excluirPagamentoEquipe,
  uploadContratoEquipe,
  uploadComprovantePagamento,
  removerArquivoEquipe,
  removerArquivoPagamento,
} from '../actions'
import FormWithFeedback, { SubmitButton } from '../components/FormWithFeedback'
import ConfirmAction from '../components/ConfirmAction'
import EditableRow from '../components/EditableRow'
import MesRefSelect from './components/MesRefSelect'
import ScrollToCurrent from './components/ScrollToCurrent'
import { UserCog, Mail, Phone, CheckCircle2, Clock, FileText, Receipt, Upload, ExternalLink } from 'lucide-react'

const inputCls = 'rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-gray-200'

function brl(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtData(s: string | null | undefined) {
  if (!s) return ''
  const d = new Date(s + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function fmtMesRef(s: string) {
  const d = new Date(s + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '')
}

function mesKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

// Range de meses do menor "contratado_em" até hoje + 12 meses (todos exibidos no scroll)
function gerarRangeMeses(contratadosEm: (string | null | undefined)[]): { key: string; label: string }[] {
  const hoje = new Date()
  const validas = contratadosEm.filter(Boolean) as string[]
  let inicio: Date
  if (validas.length === 0) {
    inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  } else {
    const primeiras = validas.map((s) => new Date(s + 'T00:00:00'))
    const min = primeiras.reduce((a, b) => (a < b ? a : b))
    inicio = new Date(min.getFullYear(), min.getMonth(), 1)
  }
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 12, 1)
  const out: { key: string; label: string }[] = []
  const cur = new Date(inicio)
  while (cur <= fim) {
    const key = mesKey(cur)
    const label = cur.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '')
    out.push({ key, label })
    cur.setMonth(cur.getMonth() + 1)
  }
  return out
}

export default async function TimePage() {
  const supabase = createClient()
  const [{ data: equipeRaw }, { data: pagamentosRaw }] = await Promise.all([
    supabase.from('equipe_financeiro').select('*').order('nome'),
    supabase.from('pagamentos_equipe').select('*').order('mes_referencia', { ascending: false }),
  ])
  const equipe = equipeRaw ?? []
  const pagamentos = pagamentosRaw ?? []

  // Gera signed URLs (1h) pra contratos e comprovantes
  const arquivosUrls = new Map<string, string>()
  const paths: string[] = []
  for (const m of equipe as any[]) if (m.contrato_url) paths.push(m.contrato_url)
  for (const p of pagamentos as any[]) {
    if (p.comprovante_url) paths.push(p.comprovante_url)
    if (p.nota_fiscal_url) paths.push(p.nota_fiscal_url)
  }
  if (paths.length) {
    const { data: signed } = await supabase.storage.from('financeiro').createSignedUrls(paths, 3600)
    for (const s of signed ?? []) {
      if (s.path && s.signedUrl) arquivosUrls.set(s.path, s.signedUrl)
    }
  }

  const totalAtivos = equipe.filter((m: any) => m.ativo).reduce((s: number, m: any) => s + Number(m.salario_mensal ?? 0), 0)
  const meses = gerarRangeMeses(equipe.map((m: any) => m.contratado_em))
  const hoje = new Date()
  const mesAtualKey = mesKey(new Date(hoje.getFullYear(), hoje.getMonth(), 1))
  const totalPagoMesAtual = pagamentos
    .filter((p: any) => p.mes_referencia === mesAtualKey)
    .reduce((s: number, p: any) => s + Number(p.valor_pago ?? 0), 0)

  // Map: equipe_id -> { mes_referencia -> pagamento }
  const pagamentosPorMembro = new Map<number, Map<string, any>>()
  for (const p of pagamentos as any[]) {
    if (!pagamentosPorMembro.has(p.equipe_id)) pagamentosPorMembro.set(p.equipe_id, new Map())
    pagamentosPorMembro.get(p.equipe_id)!.set(p.mes_referencia, p)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">Time financeiro</h1>
        <p className="text-sm text-gray-400">Cadastro, pagamentos individuais (sincronizados com Custos/Dashboard) e arquivos.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200">
          <p className="text-xs text-amber-300/70 uppercase tracking-wide">Custo recorrente do time</p>
          <p className="text-xl font-semibold mt-0.5">{brl(totalAtivos)} <span className="text-xs font-normal text-amber-300/70">/ mês</span></p>
        </div>
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-200">
          <p className="text-xs text-emerald-300/70 uppercase tracking-wide">Pago neste mês ({fmtMesRef(mesAtualKey)})</p>
          <p className="text-xl font-semibold mt-0.5">{brl(totalPagoMesAtual)}</p>
        </div>
      </div>

      {/* Cadastro de membro */}
      <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Adicionar membro</h3>
        <FormWithFeedback action={criarMembroEquipe} resetOnSuccess>
          <div className="grid grid-cols-2 gap-2">
            <input name="nome" placeholder="Nome completo" required className={`col-span-2 sm:col-span-1 ${inputCls}`} />
            <input name="funcao" placeholder="Função (ex: Presidente)" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
            <input name="email" type="email" placeholder="E-mail" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
            <input name="whatsapp" placeholder="WhatsApp" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
            <label className="col-span-2 sm:col-span-1">
              <span className="text-xs text-gray-500">Salário mensal (R$)</span>
              <input name="salario_mensal" type="number" step="0.01" min="0" placeholder="0,00" className={inputCls + ' w-full'} />
            </label>
            <label className="col-span-2 sm:col-span-1">
              <span className="text-xs text-gray-500">Contratado em</span>
              <input name="contratado_em" type="date" className={inputCls + ' w-full'} />
            </label>
            <input name="observacao" placeholder="Observação" className={`col-span-2 ${inputCls}`} />
            <SubmitButton>Adicionar membro</SubmitButton>
          </div>
        </FormWithFeedback>
      </section>

      {/* Visão Mensal Consolidada com scroll horizontal */}
      <section className="rounded-2xl border border-gray-800 bg-gray-900/60">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-semibold text-white">Visão mensal</h3>
            <p className="text-xs text-gray-500">
              Da contratação mais antiga até +12 meses. Role pra ver passado/futuro. Células antes da contratação ficam vazias.
            </p>
          </div>
        </div>
        <ScrollToCurrent>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-2 px-3 font-medium text-gray-400 sticky left-0 bg-gray-900 z-10 min-w-[180px]">Membro</th>
                {meses.map((m) => (
                  <th
                    key={m.key}
                    data-current={m.key === mesAtualKey ? 'true' : undefined}
                    className={`text-center py-2 px-2 font-medium min-w-[110px] ${m.key === mesAtualKey ? 'text-amber-400 bg-amber-500/5' : 'text-gray-400'}`}
                  >
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {equipe.length === 0 && (
                <tr>
                  <td colSpan={meses.length + 1} className="py-8 text-center text-gray-500">Nenhum membro cadastrado.</td>
                </tr>
              )}
              {equipe.map((m: any) => {
                const contratoData = m.contratado_em ? new Date(m.contratado_em + 'T00:00:00') : null
                return (
                  <tr key={m.id} className="border-b border-gray-800/60 hover:bg-gray-800/30">
                    <td className="py-2 px-3 sticky left-0 bg-gray-900 z-10">
                      <div className="font-medium text-gray-200">{m.nome}</div>
                      <div className="text-[10px] text-gray-500">{m.funcao ?? '—'}</div>
                    </td>
                    {meses.map((mes) => {
                      const mesDate = new Date(mes.key + 'T00:00:00')
                      const antesContratacao = contratoData && mesDate < new Date(contratoData.getFullYear(), contratoData.getMonth(), 1)
                      const pag = pagamentosPorMembro.get(m.id)?.get(mes.key)
                      if (antesContratacao) {
                        return <td key={mes.key} className="py-1.5 px-2 text-center text-gray-700">—</td>
                      }
                      if (pag) {
                        return (
                          <td key={mes.key} className="py-1.5 px-2 text-center">
                            <div className="inline-flex flex-col items-center gap-0.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                              <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-semibold uppercase tracking-wide">
                                <CheckCircle2 className="h-3 w-3" /> Pago
                              </span>
                              <span className="tabular-nums text-emerald-200 font-medium">{brl(Number(pag.valor_pago))}</span>
                              {pag.data_pagamento && (
                                <span className="text-[10px] text-emerald-300/70">{fmtData(pag.data_pagamento)}</span>
                              )}
                            </div>
                          </td>
                        )
                      }
                      return (
                        <td key={mes.key} className="py-1.5 px-2 text-center">
                          <div className="inline-flex flex-col items-center gap-0.5 px-2 py-1 rounded-md bg-rose-500/5 border border-rose-500/20">
                            <span className="inline-flex items-center gap-1 text-rose-400 text-[10px] font-semibold uppercase tracking-wide">
                              <Clock className="h-3 w-3" /> Pendente
                            </span>
                            <span className="tabular-nums text-rose-200/70 text-[10px]">{brl(Number(m.salario_mensal ?? 0))}</span>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </ScrollToCurrent>
      </section>

      {/* Lista de membros com pagamentos e arquivos */}
      <section className="rounded-2xl border border-gray-800 bg-gray-900/60">
        <div className="px-5 py-4 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-white">Membros</h3>
          <p className="text-xs text-gray-500">{equipe.length} registro(s)</p>
        </div>
        <ul className="divide-y divide-gray-800 px-5">
          {equipe.length === 0 && <li className="py-10 text-center text-sm text-gray-500">Nenhum membro cadastrado ainda.</li>}
          {equipe.map((m: any) => {
            const histMembro = (pagamentos as any[]).filter((p) => p.equipe_id === m.id)
            const contratoUrl = m.contrato_url ? arquivosUrls.get(m.contrato_url) : null
            return (
              <EditableRow
                key={m.id}
                summary={
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-200 inline-flex items-center gap-2">
                          <UserCog className="h-4 w-4 text-gray-500" /> {m.nome}
                          {m.funcao && <span className="text-xs text-gray-500">· {m.funcao}</span>}
                          {!m.ativo && <span className="text-xs px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400">inativo</span>}
                        </p>
                        <div className="flex flex-wrap gap-x-3 mt-0.5 text-xs text-gray-500">
                          {m.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{m.email}</span>}
                          {m.whatsapp && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{m.whatsapp}</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Salário: <span className="text-amber-400 tabular-nums">{brl(Number(m.salario_mensal ?? 0))}</span> / mês</p>
                      </div>
                    </div>

                    {/* Contrato */}
                    <div className="rounded-lg border border-gray-800 bg-gray-950/50 p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Contrato:</span>
                        {contratoUrl ? (
                          <a href={contratoUrl} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 inline-flex items-center gap-1">
                            ver arquivo <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-gray-500">não anexado</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <details className="relative">
                          <summary className="cursor-pointer text-xs text-amber-400 hover:text-amber-300 inline-flex items-center gap-1">
                            <Upload className="h-3 w-3" /> {contratoUrl ? 'substituir' : 'enviar'}
                          </summary>
                          <div className="mt-2 rounded-md border border-gray-800 bg-gray-950 p-2 w-72">
                            <FormWithFeedback action={uploadContratoEquipe} resetOnSuccess>
                              <input type="hidden" name="equipe_id" value={m.id} />
                              <input name="arquivo" type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" required className="block text-xs text-gray-300 mb-2" />
                              <SubmitButton className="bg-amber-500 text-gray-950 hover:bg-amber-400 px-3 py-1 rounded text-xs">Enviar</SubmitButton>
                            </FormWithFeedback>
                          </div>
                        </details>
                        {contratoUrl && (
                          <ConfirmAction action={removerArquivoEquipe} hidden={{ equipe_id: m.id }} label="🗑" message="Remover contrato?" className="p-1 text-gray-500 hover:text-rose-400 text-xs" />
                        )}
                      </div>
                    </div>

                    {/* Form de novo pagamento */}
                    <details className="rounded-lg border border-gray-800 bg-gray-950/50 p-3">
                      <summary className="cursor-pointer text-xs font-medium text-amber-400 hover:text-amber-300">+ Registrar pagamento</summary>
                      <div className="mt-3">
                        <FormWithFeedback action={registrarPagamentoEquipe} resetOnSuccess>
                          <div className="grid grid-cols-2 gap-2">
                            <input type="hidden" name="equipe_id" value={m.id} />
                            <div className="col-span-2 sm:col-span-1">
                              <span className="text-xs text-gray-500 block mb-1">Mês de referência</span>
                              <MesRefSelect defaultValue={mesAtualKey.slice(0, 7)} />
                            </div>
                            <label className="col-span-2 sm:col-span-1">
                              <span className="text-xs text-gray-500">Valor pago (R$)</span>
                              <input name="valor_pago" type="number" step="0.01" min="0" required defaultValue={m.salario_mensal ?? 0} className={inputCls + ' w-full'} />
                            </label>
                            <label className="col-span-2 sm:col-span-1">
                              <span className="text-xs text-gray-500">Data do pagamento</span>
                              <input name="data_pagamento" type="date" className={inputCls + ' w-full'} />
                            </label>
                            <input name="observacao" placeholder="Observação" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                            <SubmitButton>Registrar pagamento</SubmitButton>
                          </div>
                        </FormWithFeedback>
                        <p className="text-[10px] text-gray-500 mt-2">Cria/atualiza despesa em "Equipe" automaticamente. Anexe comprovante/NF depois de registrar.</p>
                      </div>
                    </details>

                    {/* Histórico de pagamentos */}
                    {histMembro.length > 0 && (
                      <details className="rounded-lg border border-gray-800 bg-gray-950/50 p-3">
                        <summary className="cursor-pointer text-xs font-medium text-gray-400 hover:text-gray-200">
                          Histórico ({histMembro.length} pagamento{histMembro.length !== 1 ? 's' : ''})
                        </summary>
                        <ul className="mt-3 space-y-2">
                          {histMembro.map((p: any) => {
                            const compUrl = p.comprovante_url ? arquivosUrls.get(p.comprovante_url) : null
                            const nfUrl = p.nota_fiscal_url ? arquivosUrls.get(p.nota_fiscal_url) : null
                            return (
                              <li key={p.id} className="rounded-md bg-gray-900 border border-gray-800 p-2 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 text-xs">
                                    <span className="font-semibold text-gray-200">{fmtMesRef(p.mes_referencia)}</span>
                                    <span className="text-emerald-400 tabular-nums ml-2">{brl(Number(p.valor_pago))}</span>
                                    {p.data_pagamento && <span className="text-gray-500 ml-2">pago em {fmtData(p.data_pagamento)}</span>}
                                    {p.observacao && <p className="text-gray-500 mt-0.5">{p.observacao}</p>}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <details className="relative">
                                      <summary className="cursor-pointer text-[10px] text-amber-400 hover:text-amber-300 px-1">editar</summary>
                                      <div className="mt-2 rounded-md border border-gray-800 bg-gray-950 p-2 w-72">
                                        <FormWithFeedback action={editarPagamentoEquipe}>
                                          <div className="grid grid-cols-2 gap-2">
                                            <input type="hidden" name="id" value={p.id} />
                                            <div className="col-span-2">
                                              <span className="text-[10px] text-gray-500 block mb-1">Mês ref.</span>
                                              <MesRefSelect defaultValue={p.mes_referencia.slice(0, 7)} />
                                            </div>
                                            <label className="col-span-2 sm:col-span-1">
                                              <span className="text-[10px] text-gray-500">Valor</span>
                                              <input name="valor_pago" type="number" step="0.01" min="0" defaultValue={p.valor_pago} className={inputCls + ' w-full text-xs'} />
                                            </label>
                                            <label className="col-span-2 sm:col-span-1">
                                              <span className="text-[10px] text-gray-500">Data pgto</span>
                                              <input name="data_pagamento" type="date" defaultValue={p.data_pagamento ?? ''} className={inputCls + ' w-full text-xs'} />
                                            </label>
                                            <input name="observacao" defaultValue={p.observacao ?? ''} placeholder="Obs" className={`col-span-2 ${inputCls} text-xs`} />
                                            <SubmitButton className="bg-amber-500 text-gray-950 hover:bg-amber-400 px-3 py-1 rounded text-xs">Salvar</SubmitButton>
                                          </div>
                                        </FormWithFeedback>
                                      </div>
                                    </details>
                                    <ConfirmAction action={excluirPagamentoEquipe} hidden={{ id: p.id }} label="🗑" message="Excluir pagamento? A despesa linkada também é removida." className="p-1 text-gray-500 hover:text-rose-400 text-xs" />
                                  </div>
                                </div>

                                {/* Anexos: comprovante + NF */}
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800/60">
                                  {(['comprovante', 'nota_fiscal'] as const).map((tipo) => {
                                    const url = tipo === 'comprovante' ? compUrl : nfUrl
                                    const Icon = tipo === 'comprovante' ? Receipt : FileText
                                    const label = tipo === 'comprovante' ? 'Comprovante' : 'Nota fiscal'
                                    return (
                                      <div key={tipo} className="flex items-center justify-between gap-1 rounded bg-gray-950 border border-gray-800 px-2 py-1">
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400 min-w-0">
                                          <Icon className="h-3 w-3 shrink-0" />
                                          <span className="truncate">{label}:</span>
                                          {url ? (
                                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 truncate inline-flex items-center gap-0.5">
                                              ver <ExternalLink className="h-2.5 w-2.5" />
                                            </a>
                                          ) : (
                                            <span className="text-gray-600">—</span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-0.5 shrink-0">
                                          <details className="relative">
                                            <summary className="cursor-pointer text-[10px] text-amber-400 hover:text-amber-300 px-1">{url ? 'trocar' : 'enviar'}</summary>
                                            <div className="absolute right-0 mt-1 z-10 rounded-md border border-gray-800 bg-gray-950 p-2 w-64 shadow-xl">
                                              <FormWithFeedback action={uploadComprovantePagamento} resetOnSuccess>
                                                <input type="hidden" name="pagamento_id" value={p.id} />
                                                <input type="hidden" name="tipo" value={tipo} />
                                                <input name="arquivo" type="file" accept=".pdf,.png,.jpg,.jpeg,.xml" required className="block text-[10px] text-gray-300 mb-2" />
                                                <SubmitButton className="bg-amber-500 text-gray-950 hover:bg-amber-400 px-2 py-0.5 rounded text-[10px]">Enviar</SubmitButton>
                                              </FormWithFeedback>
                                            </div>
                                          </details>
                                          {url && (
                                            <ConfirmAction action={removerArquivoPagamento} hidden={{ pagamento_id: p.id, tipo }} label="🗑" message={`Remover ${label.toLowerCase()}?`} className="p-0.5 text-gray-600 hover:text-rose-400 text-[10px]" />
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                      </details>
                    )}
                  </div>
                }
                editForm={
                  <FormWithFeedback action={editarMembroEquipe}>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="hidden" name="id" value={m.id} />
                      <input name="nome" defaultValue={m.nome} required className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                      <input name="funcao" defaultValue={m.funcao ?? ''} placeholder="Função" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                      <input name="email" defaultValue={m.email ?? ''} placeholder="E-mail" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                      <input name="whatsapp" defaultValue={m.whatsapp ?? ''} placeholder="WhatsApp" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                      <label className="col-span-2 sm:col-span-1">
                        <span className="text-xs text-gray-500">Salário (R$)</span>
                        <input name="salario_mensal" type="number" step="0.01" min="0" defaultValue={m.salario_mensal ?? 0} className={inputCls + ' w-full'} />
                      </label>
                      <label className="col-span-2 sm:col-span-1">
                        <span className="text-xs text-gray-500">Contratado em</span>
                        <input name="contratado_em" type="date" defaultValue={m.contratado_em ?? ''} className={inputCls + ' w-full'} />
                      </label>
                      <input name="observacao" defaultValue={m.observacao ?? ''} placeholder="Observação" className={`col-span-2 ${inputCls}`} />
                      <label className="col-span-2 inline-flex items-center gap-2 text-xs text-gray-400">
                        <input type="checkbox" name="ativo" defaultChecked={m.ativo} className="accent-amber-500" /> Ativo (gera despesa mensal)
                      </label>
                      <SubmitButton>Salvar alterações</SubmitButton>
                    </div>
                  </FormWithFeedback>
                }
                onDelete={
                  <ConfirmAction action={excluirMembroEquipe} hidden={{ id: m.id }} label="🗑" message="Excluir membro? Pagamentos e arquivos serão removidos." className="p-1 text-gray-500 hover:text-rose-400" />
                }
              />
            )
          })}
        </ul>
      </section>
    </div>
  )
}
