// Painel com listas de receitas avulsas e despesas + modais de lançamento.

import { lancarReceitaAvulsa, lancarDespesa, excluirReceitaAvulsa, excluirDespesa } from '../actions'

type Receita = {
  id: number
  tipo: 'doacao' | 'patrocinio' | 'produto' | 'outro'
  descricao: string
  origem: string | null
  valor: number
  data: string
  projeto: string | null
}

type Despesa = {
  id: number
  categoria: string
  descricao: string
  fornecedor: string | null
  valor: number
  data: string
  projeto: string | null
}

function brl(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const TIPO_LABEL: Record<Receita['tipo'], string> = {
  doacao: 'Doação',
  patrocinio: 'Patrocínio',
  produto: 'Produto',
  outro: 'Outro',
}

function FormReceita({ mes }: { mes: string }) {
  const hojeNoMes = `${mes}-15`
  return (
    <form action={lancarReceitaAvulsa} className="grid grid-cols-2 gap-2 mt-3">
      <select name="tipo" required className="col-span-2 sm:col-span-1 rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-gray-200">
        <option value="doacao">Doação</option>
        <option value="patrocinio">Patrocínio</option>
        <option value="produto">Produto</option>
        <option value="outro">Outro</option>
      </select>
      <input name="data" type="date" defaultValue={hojeNoMes} required className="col-span-2 sm:col-span-1 rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-gray-200" />
      <input name="descricao" placeholder="Descrição" required className="col-span-2 rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-gray-200" />
      <input name="origem" placeholder="Origem (opcional)" className="col-span-2 sm:col-span-1 rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-gray-200" />
      <input name="valor" type="number" step="0.01" min="0" placeholder="Valor (R$)" required className="col-span-2 sm:col-span-1 rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-gray-200" />
      <input name="projeto" placeholder="Projeto/Produto (opcional)" className="col-span-2 rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-gray-200" />
      <button type="submit" className="col-span-2 mt-1 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-emerald-400">
        Lançar receita
      </button>
    </form>
  )
}

function FormDespesa({ mes }: { mes: string }) {
  const hojeNoMes = `${mes}-15`
  return (
    <form action={lancarDespesa} className="grid grid-cols-2 gap-2 mt-3">
      <input name="categoria" placeholder="Categoria (ex: Equipe)" required className="col-span-2 sm:col-span-1 rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-gray-200" />
      <input name="data" type="date" defaultValue={hojeNoMes} required className="col-span-2 sm:col-span-1 rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-gray-200" />
      <input name="descricao" placeholder="Descrição" required className="col-span-2 rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-gray-200" />
      <input name="fornecedor" placeholder="Fornecedor (opcional)" className="col-span-2 sm:col-span-1 rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-gray-200" />
      <input name="valor" type="number" step="0.01" min="0" placeholder="Valor (R$)" required className="col-span-2 sm:col-span-1 rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-gray-200" />
      <input name="projeto" placeholder="Projeto (opcional)" className="col-span-2 rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-gray-200" />
      <button type="submit" className="col-span-2 mt-1 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-rose-400">
        Lançar despesa
      </button>
    </form>
  )
}

export default function LancamentosPanel({
  receitas,
  despesas,
  mes,
}: {
  receitas: Receita[]
  despesas: Despesa[]
  mes: string
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Receitas avulsas</h3>
            <p className="text-xs text-gray-500">Doações, patrocínios e outros do mês</p>
          </div>
        </header>
        <ul className="mt-3 divide-y divide-gray-800">
          {receitas.length === 0 && <li className="py-4 text-sm text-gray-500">Nenhum lançamento neste mês.</li>}
          {receitas.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-2 gap-3">
              <div className="min-w-0">
                <p className="text-sm text-gray-200 truncate">
                  <span className="text-xs text-gray-500 mr-2">{TIPO_LABEL[r.tipo]}</span>
                  {r.descricao}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {r.data} {r.origem ? `· ${r.origem}` : ''} {r.projeto ? `· ${r.projeto}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm tabular-nums text-emerald-400">{brl(Number(r.valor))}</span>
                <form action={excluirReceitaAvulsa}>
                  <input type="hidden" name="id" value={r.id} />
                  <button type="submit" className="text-xs text-gray-500 hover:text-rose-400" title="Excluir">×</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
        <FormReceita mes={mes} />
      </section>

      <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Despesas</h3>
            <p className="text-xs text-gray-500">Custos do instituto no mês (inclui equipe)</p>
          </div>
        </header>
        <ul className="mt-3 divide-y divide-gray-800">
          {despesas.length === 0 && <li className="py-4 text-sm text-gray-500">Nenhuma despesa neste mês.</li>}
          {despesas.map((d) => (
            <li key={d.id} className="flex items-center justify-between py-2 gap-3">
              <div className="min-w-0">
                <p className="text-sm text-gray-200 truncate">
                  <span className="text-xs text-gray-500 mr-2">{d.categoria}</span>
                  {d.descricao}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {d.data} {d.fornecedor ? `· ${d.fornecedor}` : ''} {d.projeto ? `· ${d.projeto}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm tabular-nums text-rose-400">{brl(Number(d.valor))}</span>
                <form action={excluirDespesa}>
                  <input type="hidden" name="id" value={d.id} />
                  <button type="submit" className="text-xs text-gray-500 hover:text-rose-400" title="Excluir">×</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
        <FormDespesa mes={mes} />
      </section>
    </div>
  )
}
