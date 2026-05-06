// Página de turmas com modo view/edit por fellow + import CSV.

import { createClient } from '@/lib/supabase-server'
import { criarTurma, editarTurma, excluirTurma } from '../actions'
import ConfirmAction from '../components/ConfirmAction'
import FellowEditor from './components/FellowEditor'
import CsvImporter from './components/CsvImporter'

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
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Turmas</h1>
          <p className="text-sm text-gray-400">Cadastre turmas, edite fellows e gerencie contratos.</p>
        </div>
        <div className="flex items-center gap-2">
          <CsvImporter />
        </div>
      </header>

      <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Nova turma</h3>
        <form action={criarTurma} className="grid grid-cols-2 gap-2">
          <input name="nome" placeholder="Nome (ex: Turma 2026.2)" required className={`col-span-2 ${inputCls}`} />
          <input name="data_inicio" type="date" required className={`col-span-1 ${inputCls}`} />
          <input name="data_fim" type="date" required className={`col-span-1 ${inputCls}`} />
          <input name="descricao" placeholder="Descrição (opcional)" className={`col-span-2 ${inputCls}`} />
          <button type="submit" className="col-span-2 mt-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-amber-400">
            Criar turma
          </button>
        </form>
      </section>

      <section className="space-y-4">
        {turmas.length === 0 && <p className="text-sm text-gray-500 px-2">Nenhuma turma cadastrada.</p>}
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
                    <summary className="cursor-pointer list-none text-xs px-2 py-1 rounded-md border border-gray-700 text-gray-300 hover:border-amber-500/40">Editar turma</summary>
                    <form action={editarTurma} className="absolute right-0 mt-2 z-10 w-72 grid grid-cols-2 gap-2 rounded-xl bg-gray-950 border border-gray-800 p-3 shadow-xl">
                      <input type="hidden" name="id" value={t.id} />
                      <input name="nome" defaultValue={t.nome} required className={`col-span-2 ${inputCls}`} />
                      <input name="data_inicio" type="date" defaultValue={t.data_inicio} required className={`col-span-1 ${inputCls}`} />
                      <input name="data_fim" type="date" defaultValue={t.data_fim} required className={`col-span-1 ${inputCls}`} />
                      <input name="descricao" defaultValue={t.descricao ?? ''} placeholder="Descrição" className={`col-span-2 ${inputCls}`} />
                      <button type="submit" className="col-span-2 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-gray-950">Salvar</button>
                    </form>
                  </details>
                  <ConfirmAction action={excluirTurma} hidden={{ id: t.id }} label="Excluir" message="Excluir turma?" confirmLabel="Excluir" />
                </div>
              </div>

              {fellowsDaTurma.length === 0 ? (
                <div className="px-5 py-8 text-center text-xs text-gray-500">Nenhum fellow nessa turma.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                  {fellowsDaTurma.map((f) => (
                    <FellowEditor key={f.id} fellow={f} turmas={turmas} />
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {fellowsPorTurma.get(null)?.length ? (
          <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-900/30 p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Fellows sem turma</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fellowsPorTurma.get(null)!.map((f) => (
                <FellowEditor key={f.id} fellow={f} turmas={turmas} />
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
