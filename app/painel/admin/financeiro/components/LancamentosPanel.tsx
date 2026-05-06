// Lançamentos de receitas e despesas com edição inline + feedback de salvamento.

import {
  lancarReceitaAvulsaFb,
  editarReceitaAvulsaFb,
  lancarDespesaFb,
  editarDespesaFb,
  excluirReceitaAvulsa,
  excluirDespesa,
} from '../actions'
import EditableRow from './EditableRow'
import ConfirmAction from './ConfirmAction'
import FormWithFeedback from './FormWithFeedback'

type Receita = {
  id: number
  tipo: 'doacao' | 'patrocinio' | 'produto' | 'outro'
  descricao: string
  origem: string | null
  valor: number
  data: string
  projeto: string | null
  categoria_id: number | null
}

type Despesa = {
  id: number
  categoria: string
  descricao: string
  fornecedor: string | null
  valor: number
  data: string
  projeto: string | null
  categoria_id: number | null
  fornecedor_id?: number | null
}

type Categoria = { id: number; nome: string; tipo: 'receita' | 'despesa' }
type Fornecedor = { id: number; nome: string }

function brl(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const TIPO_LABEL: Record<Receita['tipo'], string> = {
  doacao: 'Doação',
  patrocinio: 'Patrocínio',
  produto: 'Produto',
  outro: 'Outro',
}

const inputCls = 'rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-gray-200'

export default function LancamentosPanel({
  receitas,
  despesas,
  mes,
  categorias,
  fornecedores = [],
}: {
  receitas: Receita[]
  despesas: Despesa[]
  mes: string
  categorias: Categoria[]
  fornecedores?: Fornecedor[]
}) {
  const catReceita = categorias.filter((c) => c.tipo === 'receita')
  const catDespesa = categorias.filter((c) => c.tipo === 'despesa')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <header><h3 className="text-sm font-semibold text-white">Receitas avulsas</h3>
          <p className="text-xs text-gray-500">Doações, patrocínios e outros do mês</p></header>
        <ul className="mt-3 divide-y divide-gray-800">
          {receitas.length === 0 && <li className="py-4 text-sm text-gray-500">Nenhum lançamento neste mês.</li>}
          {receitas.map((r) => (
            <EditableRow
              key={r.id}
              summary={
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-200 truncate">
                      <span className="text-xs text-gray-500 mr-2">{TIPO_LABEL[r.tipo]}</span>
                      {r.descricao}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{r.data} {r.origem ? `· ${r.origem}` : ''} {r.projeto ? `· ${r.projeto}` : ''}</p>
                  </div>
                  <span className="text-sm tabular-nums text-emerald-400">{brl(Number(r.valor))}</span>
                </div>
              }
              editForm={({ close }) => (
                <FormWithFeedback action={editarReceitaAvulsaFb} onSuccess={() => setTimeout(close, 1200)}>
                  {({ SubmitButton }) => (
                    <div className="grid grid-cols-2 gap-2">
                      <input type="hidden" name="id" value={r.id} />
                      <select name="tipo" defaultValue={r.tipo} required className={`col-span-2 sm:col-span-1 ${inputCls}`}>
                        <option value="doacao">Doação</option>
                        <option value="patrocinio">Patrocínio</option>
                        <option value="produto">Produto</option>
                        <option value="outro">Outro</option>
                      </select>
                      <input name="data" type="date" defaultValue={r.data} required className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                      <input name="descricao" defaultValue={r.descricao} required className={`col-span-2 ${inputCls}`} />
                      <input name="origem" defaultValue={r.origem ?? ''} placeholder="Origem (opcional)" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                      <input name="valor" type="number" step="0.01" min="0" defaultValue={r.valor} required className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                      <select name="categoria_id" defaultValue={r.categoria_id ?? ''} className={`col-span-2 sm:col-span-1 ${inputCls}`}>
                        <option value="">Categoria (opcional)</option>
                        {catReceita.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                      </select>
                      <input name="projeto" defaultValue={r.projeto ?? ''} placeholder="Projeto" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                      <SubmitButton>Salvar alterações</SubmitButton>
                    </div>
                  )}
                </FormWithFeedback>
              )}
              onDelete={
                <ConfirmAction action={excluirReceitaAvulsa} hidden={{ id: r.id }} label="🗑" message="Excluir?" className="p-1 text-gray-500 hover:text-rose-400" />
              }
            />
          ))}
        </ul>
        <div className="mt-3 pt-3 border-t border-gray-800">
          <FormWithFeedback action={lancarReceitaAvulsaFb} resetOnSuccess>
            {({ SubmitButton }) => (
              <div className="grid grid-cols-2 gap-2">
                <select name="tipo" required className={`col-span-2 sm:col-span-1 ${inputCls}`}>
                  <option value="doacao">Doação</option>
                  <option value="patrocinio">Patrocínio</option>
                  <option value="produto">Produto</option>
                  <option value="outro">Outro</option>
                </select>
                <input name="data" type="date" defaultValue={`${mes}-15`} required className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                <input name="descricao" placeholder="Descrição" required className={`col-span-2 ${inputCls}`} />
                <input name="origem" placeholder="Origem (opcional)" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                <input name="valor" type="number" step="0.01" min="0" placeholder="Valor (R$)" required className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                <select name="categoria_id" className={`col-span-2 sm:col-span-1 ${inputCls}`}>
                  <option value="">Categoria (opcional)</option>
                  {catReceita.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                <input name="projeto" placeholder="Projeto" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                <SubmitButton className="bg-emerald-500 text-gray-950 hover:bg-emerald-400">Lançar receita</SubmitButton>
              </div>
            )}
          </FormWithFeedback>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <header><h3 className="text-sm font-semibold text-white">Despesas</h3>
          <p className="text-xs text-gray-500">Custos do instituto no mês (inclui equipe)</p></header>
        <ul className="mt-3 divide-y divide-gray-800">
          {despesas.length === 0 && <li className="py-4 text-sm text-gray-500">Nenhuma despesa neste mês.</li>}
          {despesas.map((d) => (
            <EditableRow
              key={d.id}
              summary={
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-200 truncate">
                      <span className="text-xs text-gray-500 mr-2">{d.categoria}</span>
                      {d.descricao}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{d.data} {d.fornecedor ? `· ${d.fornecedor}` : ''} {d.projeto ? `· ${d.projeto}` : ''}</p>
                  </div>
                  <span className="text-sm tabular-nums text-rose-400">{brl(Number(d.valor))}</span>
                </div>
              }
              editForm={({ close }) => (
                <FormWithFeedback action={editarDespesaFb} onSuccess={() => setTimeout(close, 1200)}>
                  {({ SubmitButton }) => (
                    <div className="grid grid-cols-2 gap-2">
                      <input type="hidden" name="id" value={d.id} />
                      <select name="categoria" defaultValue={d.categoria} required className={`col-span-2 sm:col-span-1 ${inputCls}`}>
                        {catDespesa.map((c) => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                        {!catDespesa.find((c) => c.nome === d.categoria) && <option value={d.categoria}>{d.categoria} (legacy)</option>}
                      </select>
                      <input name="data" type="date" defaultValue={d.data} required className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                      <input name="descricao" defaultValue={d.descricao} required className={`col-span-2 ${inputCls}`} />
                      <input name="fornecedor" defaultValue={d.fornecedor ?? ''} placeholder="Fornecedor" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                      <input name="valor" type="number" step="0.01" min="0" defaultValue={d.valor} required className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                      <select name="categoria_id" defaultValue={d.categoria_id ?? ''} className={`col-span-2 sm:col-span-1 ${inputCls}`}>
                        <option value="">Categoria (opcional)</option>
                        {catDespesa.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                      </select>
                      <input name="projeto" defaultValue={d.projeto ?? ''} placeholder="Projeto" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                      <SubmitButton className="bg-rose-500 text-gray-950 hover:bg-rose-400">Salvar alterações</SubmitButton>
                    </div>
                  )}
                </FormWithFeedback>
              )}
              onDelete={
                <ConfirmAction action={excluirDespesa} hidden={{ id: d.id }} label="🗑" message="Excluir?" className="p-1 text-gray-500 hover:text-rose-400" />
              }
            />
          ))}
        </ul>
        <div className="mt-3 pt-3 border-t border-gray-800">
          <FormWithFeedback action={lancarDespesaFb} resetOnSuccess>
            {({ SubmitButton }) => (
              <div className="grid grid-cols-2 gap-2">
                <select name="categoria" required className={`col-span-2 sm:col-span-1 ${inputCls}`}>
                  <option value="">Categoria *</option>
                  {catDespesa.map((c) => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                </select>
                <input name="data" type="date" defaultValue={`${mes}-15`} required className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                <input name="descricao" placeholder="Descrição" required className={`col-span-2 ${inputCls}`} />
                <input name="fornecedor" placeholder="Fornecedor (opcional)" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                <input name="valor" type="number" step="0.01" min="0" placeholder="Valor (R$)" required className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                <select name="categoria_id" className={`col-span-2 sm:col-span-1 ${inputCls}`}>
                  <option value="">Categoria (id, opcional)</option>
                  {catDespesa.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                <input name="projeto" placeholder="Projeto" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                <SubmitButton className="bg-rose-500 text-gray-950 hover:bg-rose-400">Lançar despesa</SubmitButton>
              </div>
            )}
          </FormWithFeedback>
        </div>
      </section>
    </div>
  )
}
