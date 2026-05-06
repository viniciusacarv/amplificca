'use client'
// Aba de lançamentos de patrocínios e doações.

import { useState } from 'react'
import { lancarReceitaPatrocinio, editarReceitaPatrocinio, excluirReceitaPatrocinio } from '../../actions'
import FormWithFeedback, { SubmitButton } from '../../components/FormWithFeedback'
import ConfirmAction from '../../components/ConfirmAction'

const inputCls = 'rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-gray-200 w-full'

const TIPO_LABELS: Record<string, string> = {
  doacao:    'Doação',
  patrocinio: 'Patrocínio',
  parceria:  'Parceria',
  produto:   'Produto',
  outro:     'Outro',
}

const RECORRENCIA_LABELS: Record<string, string> = {
  unica:      'Única',
  mensal:     'Mensal',
  trimestral: 'Trimestral',
  anual:      'Anual',
}

const METODO_LABELS: Record<string, string> = {
  pix:          'PIX',
  transferencia: 'Transferência',
  boleto:       'Boleto',
  cartao:       'Cartão',
  dinheiro:     'Dinheiro',
  outro:        'Outro',
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function statusPill(s: string) {
  if (s === 'pago')      return 'bg-emerald-500/10 text-emerald-400'
  if (s === 'pendente')  return 'bg-amber-500/10 text-amber-400'
  return 'bg-gray-500/10 text-gray-500'
}

function LancamentoForm({
  action,
  defaultValues,
  parceiros,
  categorias,
  onCancel,
  resetOnSuccess,
}: {
  action: any
  defaultValues?: any
  parceiros: any[]
  categorias: any[]
  onCancel?: () => void
  resetOnSuccess?: boolean
}) {
  return (
    <FormWithFeedback action={action} resetOnSuccess={resetOnSuccess} onSuccess={onCancel}>
      {defaultValues?.id && <input type="hidden" name="id" value={defaultValues.id} />}
      <div className="grid grid-cols-2 gap-2">
        <select name="tipo" defaultValue={defaultValues?.tipo ?? 'doacao'} className={`col-span-2 sm:col-span-1 ${inputCls}`}>
          {Object.entries(TIPO_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select name="parceiro_id" defaultValue={defaultValues?.parceiro_id ?? ''} className={`col-span-2 sm:col-span-1 ${inputCls}`}>
          <option value="">— Sem parceiro vinculado —</option>
          {parceiros.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
        <input
          name="descricao"
          defaultValue={defaultValues?.descricao ?? ''}
          placeholder="Descrição *"
          required
          className={`col-span-2 ${inputCls}`}
        />
        <input
          name="valor"
          type="number"
          step="0.01"
          min="0.01"
          defaultValue={defaultValues?.valor ?? ''}
          placeholder="Valor (R$) *"
          required
          className={inputCls}
        />
        <input
          name="data"
          type="date"
          defaultValue={defaultValues?.data ?? new Date().toISOString().slice(0, 10)}
          required
          className={inputCls}
        />
        <input
          name="mes_referencia"
          type="month"
          defaultValue={defaultValues?.mes_referencia ? defaultValues.mes_referencia.slice(0, 7) : new Date().toISOString().slice(0, 7)}
          className={inputCls}
        />
        <select name="recorrencia" defaultValue={defaultValues?.recorrencia ?? 'unica'} className={inputCls}>
          {Object.entries(RECORRENCIA_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select name="metodo_pagamento" defaultValue={defaultValues?.metodo_pagamento ?? ''} className={inputCls}>
          <option value="">— Método de pagamento —</option>
          {Object.entries(METODO_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select name="status_receita" defaultValue={defaultValues?.status_receita ?? 'pago'} className={inputCls}>
          <option value="pago">Pago</option>
          <option value="pendente">Pendente</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <select name="categoria_id" defaultValue={defaultValues?.categoria_id ?? ''} className={inputCls}>
          <option value="">— Categoria (opcional) —</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <input name="projeto" defaultValue={defaultValues?.projeto ?? ''} placeholder="Projeto / categoria" className={inputCls} />
        <input name="observacao" defaultValue={defaultValues?.observacao ?? ''} placeholder="Observação" className={`col-span-2 ${inputCls}`} />
        <div className="col-span-2 flex items-center gap-2">
          <SubmitButton>{defaultValues ? 'Salvar alterações' : 'Lançar receita'}</SubmitButton>
          {onCancel && (
            <button type="button" onClick={onCancel} className="px-3 py-2 rounded-lg text-sm border border-gray-700 text-gray-400 hover:text-gray-200">
              Cancelar
            </button>
          )}
        </div>
      </div>
    </FormWithFeedback>
  )
}

function LancamentoRow({ receita, parceiros, categorias }: { receita: any; parceiros: any[]; categorias: any[] }) {
  const [editando, setEditando] = useState(false)

  if (editando) {
    return (
      <li className="py-4">
        <LancamentoForm
          action={editarReceitaPatrocinio}
          defaultValues={receita}
          parceiros={parceiros}
          categorias={categorias}
          onCancel={() => setEditando(false)}
        />
      </li>
    )
  }

  const nomeParceiro = receita.parceiros_financeiros?.nome ?? receita.origem ?? '—'

  return (
    <li className="py-3 flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-200 truncate">{receita.descricao}</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{TIPO_LABELS[receita.tipo] ?? receita.tipo}</span>
          {receita.recorrencia !== 'unica' && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">{RECORRENCIA_LABELS[receita.recorrencia]}</span>
          )}
          <span className={`text-xs px-1.5 py-0.5 rounded ${statusPill(receita.status_receita ?? 'pago')}`}>
            {receita.status_receita ?? 'pago'}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-3 mt-0.5 text-xs text-gray-500">
          <span>{new Date(receita.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
          {nomeParceiro !== '—' && <span>📌 {nomeParceiro}</span>}
          {receita.projeto && <span>📁 {receita.projeto}</span>}
          {receita.metodo_pagamento && <span>{METODO_LABELS[receita.metodo_pagamento] ?? receita.metodo_pagamento}</span>}
        </div>
        {receita.observacao && <p className="text-xs text-gray-400 mt-0.5">{receita.observacao}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-sm font-semibold ${receita.status_receita === 'cancelado' ? 'text-gray-500 line-through' : 'text-white'}`}>
          {fmt(receita.valor)}
        </span>
        <button
          onClick={() => setEditando(true)}
          className="text-xs px-2 py-1 rounded-md border border-gray-700 text-gray-400 hover:border-amber-500/50 hover:text-amber-400"
        >
          Editar
        </button>
        <ConfirmAction
          action={excluirReceitaPatrocinio}
          hidden={{ id: receita.id }}
          label="🗑"
          message="Excluir lançamento?"
          className="p-1 text-gray-500 hover:text-rose-400"
        />
      </div>
    </li>
  )
}

export default function ReceitasTab({
  receitas,
  parceiros,
  categorias,
  ano,
}: {
  receitas: any[]
  parceiros: any[]
  categorias: any[]
  ano: number
}) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroParceiro, setFiltroParceiro] = useState('')

  const filtradas = receitas.filter((r) => {
    if (filtroTipo && r.tipo !== filtroTipo) return false
    if (filtroStatus && r.status_receita !== filtroStatus) return false
    if (filtroParceiro && r.parceiro_id !== Number(filtroParceiro)) return false
    return true
  })

  const total = filtradas.filter((r) => r.status_receita !== 'cancelado').reduce((s, r) => s + r.valor, 0)

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="rounded-lg bg-gray-900 border border-gray-800 px-3 py-1.5 text-sm text-gray-300">
          <option value="">Todos os tipos</option>
          {Object.entries(TIPO_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="rounded-lg bg-gray-900 border border-gray-800 px-3 py-1.5 text-sm text-gray-300">
          <option value="">Todos os status</option>
          <option value="pago">Pago</option>
          <option value="pendente">Pendente</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <select value={filtroParceiro} onChange={(e) => setFiltroParceiro(e.target.value)} className="rounded-lg bg-gray-900 border border-gray-800 px-3 py-1.5 text-sm text-gray-300">
          <option value="">Todos os parceiros</option>
          {parceiros.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
        <span className="ml-auto text-sm text-gray-400">{filtradas.length} registro(s) · <span className="text-emerald-400 font-medium">{fmt(total)}</span></span>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="px-3 py-1.5 rounded-lg bg-amber-500 text-gray-950 text-sm font-semibold hover:bg-amber-400"
        >
          {mostrarForm ? 'Cancelar' : '+ Novo lançamento'}
        </button>
      </div>

      {/* Formulário de novo lançamento */}
      {mostrarForm && (
        <section className="rounded-2xl border border-amber-500/20 bg-gray-900/60 p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Novo lançamento</h3>
          <LancamentoForm
            action={lancarReceitaPatrocinio}
            parceiros={parceiros}
            categorias={categorias}
            resetOnSuccess
            onCancel={() => setMostrarForm(false)}
          />
        </section>
      )}

      {/* Tabela de lançamentos */}
      <section className="rounded-2xl border border-gray-800 bg-gray-900/60">
        <div className="px-5 py-4 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-white">Lançamentos — {ano}</h3>
        </div>
        <ul className="divide-y divide-gray-800 px-5">
          {filtradas.length === 0 && (
            <li className="py-10 text-center text-sm text-gray-500">Nenhum lançamento encontrado.</li>
          )}
          {filtradas.map((r) => (
            <LancamentoRow key={r.id} receita={r} parceiros={parceiros} categorias={categorias} />
          ))}
        </ul>
      </section>
    </div>
  )
}
