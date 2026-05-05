// app/painel/admin/financeiro/turmas/page.tsx
// CRUD de turmas + atribuição de fellows + atualização de WhatsApp por fellow.

import { createClient } from '@/lib/supabase-server'
import {
  criarTurma,
  editarTurma,
  excluirTurma,
  atribuirTurma,
  atualizarWhatsappFellow,
  encerrarContrato,
  reativarContrato,
} from '../actions'
import EditableRow from '../components/EditableRow'
import ConfirmAction from '../components/ConfirmAction'

const inputCls = 'rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-gray-200'

function fmtData(d: string) {
  const [y, m, dd] = d.split('-')
  return `${dd}/${m}/${y}`
}

export default async function TurmasPage() {
  const supabase = createClient()

  const [turmasRes, fellowsRes] = await Promise.all([
    supabase.from('turmas').select('*').order('data_inicio', { ascending: false }),
    supabase.from('fellows').select('id, nome, email, whatsapp, tipo_financiamento, bolsa_origem, turma_id, contrato_ativo, contrato_encerrado_em').order('nome'),
  ])

  const turmas: any[] = turmasRes.data ?? []
  const fellows: any[] = fellowsRes.data ?? []

  const fellowsPorTurma = new Map<number | null, any[]>()
  fellows.forEach((f) => {
    const k = f.turma_id ?? null
    if (!fellowsPorTurma.has(k)) fellowsPorTurma.set(k, [])
    fellowsPorTurma.get(k)!.push(f)
  })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">Turmas</h1>
        <p className="text-sm text-gray-400">Cadastre turmas, atribua fellows e gerencie contratos.</p>
      </header>

      <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Nova turma</h3>
        <form action={criarTurma} className="grid grid-cols-2 gap-2">
          <input name="nome" placeholder="Nome (ex: Turma 2026.2)" required className={`col-span-2 sm:col-span-2 ${inputCls}`} />
          <input name="data_inicio" type="date" required className={`col-span-1 ${inputCls}`} />
          <input name="data_fim" type="date" required className={`col-span-1 ${inputCls}`} />
          <input name="descricao" placeholder="Descrição (opcional)" className={`col-span-2 ${inputCls}`} />
          <button type="submit" className="col-span-2 mt-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-amber-400">
            Criar turma
          </button>
        </form>
      </section>

      <section className="space-y-4">
        {turmas.length === 0 && (
          <p className="text-sm text-gray-500 px-2">Nenhuma turma cadastrada.</p>
        )}
        {turmas.map((t) => {
          const fellowsDaTurma = fellowsPorTurma.get(t.id) ?? []
          return (
            <div key={t.id} className="rounded-2xl border border-gray-800 bg-gray-900/60 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-white">{t.nome}</h3>
                  <p className="text-xs text-gray-500">{fmtData(t.data_inicio)} → {fmtData(t.data_fim)} · {fellowsDaTurma.length} fellow(s)</p>
                  {t.descricao && <p className="text-xs text-gray-400 mt-1">{t.descricao}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <details className="relative">
                    <summary className="cursor-pointer list-none text-xs px-2 py-1 rounded-md border border-gray-700 text-gray-300 hover:border-amber-500/40">Editar</summary>
                    <form action={editarTurma} className="absolute right-0 mt-2 z-10 w-72 grid grid-cols-2 gap-2 rounded-xl bg-gray-950 border border-gray-800 p-3 shadow-xl">
                      <input type="hidden" name="id" value={t.id} />
                      <input name="nome" defaultValue={t.nome} required className={`col-span-2 ${inputCls}`} />
                      <input name="data_inicio" type="date" defaultValue={t.data_inicio} required className={`col-span-1 ${inputCls}`} />
                      <input name="data_fim" type="date" defaultValue={t.data_fim} required className={`col-span-1 ${inputCls}`} />
                      <input name="descricao" defaultValue={t.descricao ?? ''} placeholder="Descrição" className={`col-span-2 ${inputCls}`} />
                      <button type="submit" className="col-span-2 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-gray-950">Salvar</button>
                    </form>
                  </details>
                  <ConfirmAction
                    action={excluirTurma}
                    hidden={{ id: t.id }}
                    label="Excluir"
                    message="Excluir turma?"
                    confirmLabel="Excluir"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-900/40 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="text-left px-5 py-3 font-medium">Fellow</th>
                      <th className="text-left px-3 py-3 font-medium">Tipo</th>
                      <th className="text-left px-3 py-3 font-medium">WhatsApp</th>
                      <th className="text-left px-3 py-3 font-medium">Contrato</th>
                      <th className="text-right px-5 py-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {fellowsDaTurma.length === 0 && (
                      <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-500 text-xs">Nenhum fellow nessa turma.</td></tr>
                    )}
                    {fellowsDaTurma.map((f) => (
                      <tr key={f.id} className="hover:bg-gray-900/40">
                        <td className="px-5 py-3">
                          <p className="text-gray-200">{f.nome}</p>
                          <p className="text-xs text-gray-500">{f.email ?? '—'}</p>
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-300">
                          {f.tipo_financiamento === 'autofinanciado' ? 'Autofinanciado' : f.tipo_financiamento === 'bolsista' ? (f.bolsa_origem ?? 'Bolsista') : '—'}
                        </td>
                        <td className="px-3 py-3">
                          <form action={atualizarWhatsappFellow} className="flex items-center gap-1">
                            <input type="hidden" name="fellow_id" value={f.id} />
                            <input name="whatsapp" defaultValue={f.whatsapp ?? ''} placeholder="55 11 9..." className="rounded-md bg-gray-950 border border-gray-800 px-2 py-1 text-xs text-gray-200 w-32" />
                            <button type="submit" className="text-xs text-amber-400 hover:text-amber-300">✓</button>
                          </form>
                        </td>
                        <td className="px-3 py-3">
                          {f.contrato_ativo ? (
                            <span className="inline-flex px-2 py-0.5 rounded-md text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Ativo</span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded-md text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              Encerrado{f.contrato_encerrado_em ? ` em ${fmtData(f.contrato_encerrado_em)}` : ''}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="inline-flex flex-wrap gap-1 justify-end">
                            <details className="relative">
                              <summary className="cursor-pointer list-none text-xs px-2 py-1 rounded-md border border-gray-700 text-gray-400 hover:border-amber-500/40 hover:text-amber-400">Mover</summary>
                              <form action={atribuirTurma} className="absolute right-0 mt-2 z-10 w-56 rounded-xl bg-gray-950 border border-gray-800 p-2 shadow-xl flex gap-1">
                                <input type="hidden" name="fellow_id" value={f.id} />
                                <select name="turma_id" defaultValue={f.turma_id ?? ''} className={`flex-1 ${inputCls} py-1`}>
                                  <option value="">Sem turma</option>
                                  {turmas.map((tt) => <option key={tt.id} value={tt.id}>{tt.nome}</option>)}
                                </select>
                                <button type="submit" className="px-2 py-1 rounded-md bg-amber-500 text-gray-950 text-xs font-semibold">OK</button>
                              </form>
                            </details>
                            {f.contrato_ativo ? (
                              <ConfirmAction
                                action={encerrarContrato}
                                hidden={{ fellow_id: f.id }}
                                label="Encerrar"
                                message="Encerrar contrato?"
                              />
                            ) : (
                              <form action={reativarContrato}>
                                <input type="hidden" name="fellow_id" value={f.id} />
                                <button type="submit" className="text-xs px-2 py-1 rounded-md border border-purple-500/30 text-purple-400 hover:bg-purple-500/10">Reativar</button>
                              </form>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}

        {fellowsPorTurma.get(null)?.length ? (
          <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-900/30 p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Fellows sem turma</h3>
            <ul className="space-y-2">
              {fellowsPorTurma.get(null)!.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-300">{f.nome} <span className="text-xs text-gray-500">· {f.tipo_financiamento ?? '—'}</span></span>
                  <form action={atribuirTurma} className="flex items-center gap-1">
                    <input type="hidden" name="fellow_id" value={f.id} />
                    <select name="turma_id" className={`${inputCls} py-1`} required>
                      <option value="">Atribuir a turma...</option>
                      {turmas.map((tt) => <option key={tt.id} value={tt.id}>{tt.nome}</option>)}
                    </select>
                    <button type="submit" className="text-xs px-2 py-1 rounded-md bg-amber-500 text-gray-950 font-semibold">OK</button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  )
}
