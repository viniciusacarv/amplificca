// Lista única de despesas do ano com edição inline.

import Link from 'next/link'
import { editarDespesaFb, excluirDespesa } from '../../actions'
import EditableRow from '../../components/EditableRow'
import ConfirmAction from '../../components/ConfirmAction'
import FormWithFeedback, { SubmitButton } from '../../components/FormWithFeedback'

type Despesa = {
  id: number
  categoria: string
  descricao: string
  fornecedor: string | null
  valor: number
  data: string
  projeto: string | null
  categoria_id: number | null
}

type Categoria = { id: number; nome: string; tipo: 'receita' | 'despesa' }

function brl(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const inputCls = 'rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-gray-200'

export default function VisaoSimples({
  despesas,
  categorias,
  ano,
  filtroCat,
  filtroProj,
}: {
  despesas: Despesa[]
  categorias: Categoria[]
  ano: number
  filtroCat: string
  filtroProj: string
}) {
  const ranqueadas = [...despesas].sort((a, b) => Number(b.valor) - Number(a.valor))
  const total = ranqueadas.reduce((s, d) => s + Number(d.valor), 0)
  const projetos = Array.from(new Set(despesas.map((d) => d.projeto).filter(Boolean) as string[])).sort()
  const cats = Array.from(new Set([...despesas.map((d) => d.categoria), ...categorias.map((c) => c.nome)])).sort()

  return (
    <section className="rounded-2xl border border-gray-800 bg-gray-900/60">
      <div className="px-5 py-4 border-b border-gray-800 flex flex-wrap items-center gap-3">
        <h3 className="text-sm font-semibold text-white flex-1">Lista de despesas — {ano}</h3>
        <form className="flex items-center gap-2">
          <input type="hidden" name="view" value="simples" />
          <input type="hidden" name="ano" value={ano} />
          <select name="categoria" defaultValue={filtroCat} className={`${inputCls} py-1.5`}>
            <option value="">Todas as categorias</option>
            {cats.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select name="projeto" defaultValue={filtroProj} className={`${inputCls} py-1.5`}>
            <option value="">Todos os projetos</option>
            {projetos.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <button type="submit" className="px-3 py-1.5 text-sm rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">Filtrar</button>
          {(filtroCat || filtroProj) && (
            <Link href={`/painel/admin/financeiro/custos?view=simples&ano=${ano}`} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-300">Limpar</Link>
          )}
        </form>
      </div>

      <ul className="divide-y divide-gray-800 px-5">
        {ranqueadas.length === 0 && <li className="py-10 text-center text-sm text-gray-500">Nenhuma despesa neste recorte.</li>}
        {ranqueadas.map((d) => (
          <EditableRow
            key={d.id}
            summary={
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-gray-200 truncate">
                    <span className="text-xs text-gray-500 mr-2">{d.categoria}</span>
                    {d.descricao}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {d.data}{d.fornecedor ? ` · ${d.fornecedor}` : ''}{d.projeto ? ` · ${d.projeto}` : ''}
                  </p>
                </div>
                <span className="text-sm tabular-nums text-rose-400">{brl(Number(d.valor))}</span>
              </div>
            }
            editForm={
              <FormWithFeedback action={editarDespesaFb}>
                <div className="grid grid-cols-2 gap-2">
                  <input type="hidden" name="id" value={d.id} />
                  <select name="categoria" defaultValue={d.categoria} required className={`col-span-2 sm:col-span-1 ${inputCls}`}>
                    {categorias.map((c) => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                    {!categorias.find((c) => c.nome === d.categoria) && <option value={d.categoria}>{d.categoria} (legacy)</option>}
                  </select>
                  <input name="data" type="date" defaultValue={d.data} required className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                  <input name="descricao" defaultValue={d.descricao} required className={`col-span-2 ${inputCls}`} />
                  <input name="fornecedor" defaultValue={d.fornecedor ?? ''} placeholder="Fornecedor" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                  <input name="valor" type="number" step="0.01" min="0" defaultValue={d.valor} required className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                  <select name="categoria_id" defaultValue={d.categoria_id ?? ''} className={`col-span-2 sm:col-span-1 ${inputCls}`}>
                    <option value="">Categoria (id, opcional)</option>
                    {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                  <input name="projeto" defaultValue={d.projeto ?? ''} placeholder="Projeto" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                  <SubmitButton className="bg-rose-500 text-gray-950 hover:bg-rose-400">Salvar alterações</SubmitButton>
                </div>
              </FormWithFeedback>
            }
            onDelete={
              <ConfirmAction action={excluirDespesa} hidden={{ id: d.id }} label="🗑" message="Excluir?" className="p-1 text-gray-500 hover:text-rose-400" />
            }
          />
        ))}
      </ul>

      <div className="px-5 py-4 border-t border-gray-800 flex items-center justify-between">
        <span className="text-xs text-gray-500">{ranqueadas.length} lançamento(s)</span>
        <span className="text-sm text-gray-300">Total: <span className="font-semibold text-rose-400 tabular-nums">{brl(total)}</span></span>
      </div>
    </section>
  )
}
