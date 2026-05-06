// CRUD de produtos + lista de fellows vinculados.

import { createClient } from '@/lib/supabase-server'
import {
  criarProduto, editarProduto, excluirProduto,
  vincularFellowProduto, desvincularFellowProduto, atualizarStatusFellowProduto,
} from '../actions'
import FormWithFeedback, { SubmitButton } from '../components/FormWithFeedback'
import ConfirmAction from '../components/ConfirmAction'
import { Package } from 'lucide-react'

const inputCls = 'rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-gray-200'

function brl(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function ProdutosPage() {
  const supabase = createClient()
  const [produtosRes, fellowsRes, vinculosRes] = await Promise.all([
    supabase.from('produtos').select('*').order('nome'),
    supabase.from('fellows').select('id, nome').order('nome'),
    supabase.from('fellow_produtos').select('*').order('data_inicio', { ascending: false }),
  ])

  const produtos: any[] = produtosRes.data ?? []
  const fellows: any[] = fellowsRes.data ?? []
  const vinculos: any[] = vinculosRes.data ?? []

  const fellowMap = new Map(fellows.map((f) => [f.id, f.nome]))
  const vinculosPorProduto = new Map<number, any[]>()
  vinculos.forEach((v) => {
    if (!vinculosPorProduto.has(v.produto_id)) vinculosPorProduto.set(v.produto_id, [])
    vinculosPorProduto.get(v.produto_id)!.push(v)
  })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">Produtos</h1>
        <p className="text-sm text-gray-400">Catálogo de produtos do Amplifica e seus vínculos com fellows.</p>
      </header>

      <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Novo produto</h3>
        <FormWithFeedback action={criarProduto} resetOnSuccess>
          <div className="grid grid-cols-2 gap-2">
            <input name="nome" placeholder="Nome do produto" required className={`col-span-2 sm:col-span-1 ${inputCls}`} />
            <select name="modelo" defaultValue="pacote" className={`col-span-2 sm:col-span-1 ${inputCls}`}>
              <option value="pacote">Pacote (preço + duração)</option>
              <option value="avulso">Avulso (serviço único)</option>
            </select>
            <input name="descricao" placeholder="Descrição" className={`col-span-2 ${inputCls}`} />
            <input name="valor" type="number" step="0.01" min="0" placeholder="Valor (R$)" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
            <select name="recorrencia" defaultValue="mensal" className={`col-span-2 sm:col-span-1 ${inputCls}`}>
              <option value="unica">Única</option>
              <option value="mensal">Mensal</option>
            </select>
            <input name="duracao_meses" type="number" min="0" placeholder="Duração em meses (vazio = indefinido)" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
            <input name="cor" type="color" defaultValue="#f59e0b" className="col-span-2 sm:col-span-1 h-10 rounded-lg bg-gray-950 border border-gray-800" />
            <SubmitButton>Adicionar produto</SubmitButton>
          </div>
        </FormWithFeedback>
      </section>

      <section className="space-y-4">
        {produtos.length === 0 && <p className="text-sm text-gray-500 px-2">Nenhum produto cadastrado.</p>}
        {produtos.map((p: any) => {
          const vinculosDoP = vinculosPorProduto.get(p.id) ?? []
          return (
            <div key={p.id} className="rounded-2xl border border-gray-800 bg-gray-900/60 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-white inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: p.cor ?? '#64748b' }} />
                    <Package className="h-4 w-4 text-gray-500" />
                    {p.nome}
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{p.modelo}</span>
                    {!p.ativo && <span className="text-xs px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400">inativo</span>}
                  </h3>
                  {p.descricao && <p className="text-xs text-gray-400 mt-1">{p.descricao}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    Valor: <span className="text-amber-400 tabular-nums">{brl(Number(p.valor ?? 0))}</span>
                    {p.recorrencia && <> · Recorrência: {p.recorrencia}</>}
                    {p.duracao_meses && <> · Duração: {p.duracao_meses} meses</>}
                    {' · '}{vinculosDoP.length} fellow(s)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <details className="relative">
                    <summary className="cursor-pointer list-none text-xs px-2 py-1 rounded-md border border-gray-700 text-gray-300 hover:border-amber-500/40">Editar</summary>
                    <div className="absolute right-0 mt-2 z-10 w-80 rounded-xl bg-gray-950 border border-gray-800 p-3 shadow-xl">
                      <FormWithFeedback action={editarProduto}>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="hidden" name="id" value={p.id} />
                          <input name="nome" defaultValue={p.nome} required className={`col-span-2 ${inputCls}`} />
                          <input name="descricao" defaultValue={p.descricao ?? ''} className={`col-span-2 ${inputCls}`} />
                          <select name="modelo" defaultValue={p.modelo} className={`col-span-2 sm:col-span-1 ${inputCls}`}>
                            <option value="pacote">Pacote</option>
                            <option value="avulso">Avulso</option>
                          </select>
                          <input name="valor" type="number" step="0.01" defaultValue={p.valor} className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                          <select name="recorrencia" defaultValue={p.recorrencia ?? 'unica'} className={`col-span-2 sm:col-span-1 ${inputCls}`}>
                            <option value="unica">Única</option>
                            <option value="mensal">Mensal</option>
                          </select>
                          <input name="duracao_meses" type="number" defaultValue={p.duracao_meses ?? ''} placeholder="Duração" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                          <input name="cor" type="color" defaultValue={p.cor ?? '#64748b'} className="col-span-1 h-10 rounded-lg bg-gray-950 border border-gray-800" />
                          <label className="col-span-1 inline-flex items-center gap-2 text-xs text-gray-400">
                            <input type="checkbox" name="ativo" defaultChecked={p.ativo} className="accent-amber-500" /> Ativo
                          </label>
                          <SubmitButton>Salvar</SubmitButton>
                        </div>
                      </FormWithFeedback>
                    </div>
                  </details>
                  <ConfirmAction action={excluirProduto} hidden={{ id: p.id }} label="Excluir" message="Excluir?" />
                </div>
              </div>

              <div className="px-5 py-4 space-y-3">
                <h4 className="text-xs uppercase text-gray-500">Fellows vinculados</h4>
                <ul className="space-y-1.5">
                  {vinculosDoP.length === 0 && <li className="text-xs text-gray-500">Nenhum fellow vinculado a este produto.</li>}
                  {vinculosDoP.map((v) => (
                    <li key={v.id} className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-gray-950 border border-gray-800">
                      <div className="min-w-0">
                        <p className="text-sm text-gray-200 truncate">{fellowMap.get(v.fellow_id) ?? '?'}</p>
                        <p className="text-xs text-gray-500">
                          {v.data_inicio} {v.data_fim ? `→ ${v.data_fim}` : '(em aberto)'}
                          {v.valor_negociado ? ` · ${brl(Number(v.valor_negociado))}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${
                          v.status === 'ativo' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          v.status === 'pausado' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        }`}>
                          {v.status}
                        </span>
                        {v.status === 'ativo' && (
                          <form action={atualizarStatusFellowProduto}>
                            <input type="hidden" name="id" value={v.id} />
                            <input type="hidden" name="status" value="encerrado" />
                            <button type="submit" className="text-xs text-gray-500 hover:text-rose-400" title="Encerrar">⨯</button>
                          </form>
                        )}
                        <ConfirmAction action={desvincularFellowProduto} hidden={{ id: v.id }} label="🗑" message="Excluir?" className="text-xs text-gray-500 hover:text-rose-400" />
                      </div>
                    </li>
                  ))}
                </ul>

                <FormWithFeedback action={vincularFellowProduto} resetOnSuccess>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-800">
                    <input type="hidden" name="produto_id" value={p.id} />
                    <select name="fellow_id" required className={`col-span-3 sm:col-span-1 ${inputCls}`}>
                      <option value="">Selecionar fellow...</option>
                      {fellows.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
                    </select>
                    <input name="data_inicio" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required className={`col-span-3 sm:col-span-1 ${inputCls}`} />
                    <input name="valor_negociado" type="number" step="0.01" placeholder="Valor (R$)" defaultValue={p.valor} className={`col-span-3 sm:col-span-1 ${inputCls}`} />
                    <input name="data_fim" type="date" placeholder="Fim (opcional)" className={`col-span-3 sm:col-span-1 ${inputCls}`} />
                    <input name="observacao" placeholder="Observação (opcional)" className={`col-span-3 sm:col-span-2 ${inputCls}`} />
                    <SubmitButton className="col-span-3 sm:col-span-1 bg-amber-500 text-gray-950 hover:bg-amber-400">Vincular fellow</SubmitButton>
                  </div>
                </FormWithFeedback>
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}
