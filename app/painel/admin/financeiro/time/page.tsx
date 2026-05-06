// CRUD do time financeiro com salário mensal recorrente.

import { createClient } from '@/lib/supabase-server'
import { criarMembroEquipe, editarMembroEquipe, excluirMembroEquipe } from '../actions'
import FormWithFeedback, { SubmitButton } from '../components/FormWithFeedback'
import ConfirmAction from '../components/ConfirmAction'
import EditableRow from '../components/EditableRow'
import { UserCog, Mail, Phone } from 'lucide-react'

const inputCls = 'rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-gray-200'

function brl(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function TimePage() {
  const supabase = createClient()
  const { data: equipe = [] } = await supabase.from('equipe_financeiro').select('*').order('nome')

  const totalAtivos = (equipe ?? []).filter((m: any) => m.ativo).reduce((s: number, m: any) => s + Number(m.salario_mensal ?? 0), 0)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">Time financeiro</h1>
        <p className="text-sm text-gray-400">Cadastro de membros do time. Salários ativos serão lançados automaticamente como despesa em "Equipe" no início de cada mês.</p>
      </header>

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200">
        <p>Custo mensal recorrente do time: <span className="font-semibold">{brl(totalAtivos)}</span></p>
      </div>

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

      <section className="rounded-2xl border border-gray-800 bg-gray-900/60">
        <div className="px-5 py-4 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-white">Membros</h3>
          <p className="text-xs text-gray-500">{equipe?.length ?? 0} registro(s)</p>
        </div>
        <ul className="divide-y divide-gray-800 px-5">
          {(!equipe || equipe.length === 0) && <li className="py-10 text-center text-sm text-gray-500">Nenhum membro cadastrado ainda.</li>}
          {equipe?.map((m: any) => (
            <EditableRow
              key={m.id}
              summary={
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
                <ConfirmAction action={excluirMembroEquipe} hidden={{ id: m.id }} label="🗑" message="Excluir?" className="p-1 text-gray-500 hover:text-rose-400" />
              }
            />
          ))}
        </ul>
      </section>
    </div>
  )
}
