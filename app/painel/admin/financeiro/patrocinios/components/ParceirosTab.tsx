'use client'
// Aba CRM de parceiros/doadores — cadastro + histórico de lançamentos por parceiro.

import { useState } from 'react'
import { criarParceiro, editarParceiro, excluirParceiro } from '../../actions'
import FormWithFeedback, { SubmitButton } from '../../components/FormWithFeedback'
import ConfirmAction from '../../components/ConfirmAction'
import { Mail, Phone, ChevronDown, ChevronRight, Building2, User } from 'lucide-react'

const inputCls = 'rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-gray-200 w-full'

const TIPO_LABELS: Record<string, string> = {
  pessoa_fisica: 'Pessoa Física',
  empresa: 'Empresa',
  instituto: 'Instituto',
  patrocinador: 'Patrocinador',
  doador: 'Doador',
  parceiro: 'Parceiro',
  outro: 'Outro',
}

const STATUS_COLORS: Record<string, string> = {
  ativo:     'bg-emerald-500/10 text-emerald-400',
  inativo:   'bg-gray-500/10 text-gray-400',
  prospect:  'bg-blue-500/10 text-blue-400',
  pausado:   'bg-amber-500/10 text-amber-400',
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function HistoricoParceiro({ receitas }: { receitas: any[] }) {
  if (!receitas.length) return <p className="text-xs text-gray-500 py-2">Nenhum lançamento registrado.</p>
  const total = receitas.filter((r) => r.status_receita !== 'cancelado').reduce((s, r) => s + r.valor, 0)
  return (
    <div className="mt-3 space-y-1">
      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
        <span>{receitas.length} lançamento(s)</span>
        <span className="text-emerald-400 font-medium">Total: {fmt(total)}</span>
      </div>
      {receitas.map((r) => (
        <div key={r.id} className="flex items-center justify-between text-xs bg-gray-950/60 rounded-lg px-3 py-2 gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-gray-300 truncate">{r.descricao}</p>
            <p className="text-gray-500">
              {new Date(r.data + 'T00:00:00').toLocaleDateString('pt-BR')}
              {r.recorrencia !== 'unica' && <span className="ml-2 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">{r.recorrencia}</span>}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className={`font-medium ${r.status_receita === 'cancelado' ? 'text-gray-500 line-through' : 'text-white'}`}>
              {fmt(r.valor)}
            </p>
            <p className={`text-xs px-1.5 py-0.5 rounded ${
              r.status_receita === 'pago' ? 'bg-emerald-500/10 text-emerald-400' :
              r.status_receita === 'pendente' ? 'bg-amber-500/10 text-amber-400' :
              'bg-gray-500/10 text-gray-500'
            }`}>{r.status_receita}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function ParceiroCard({ parceiro, receitas }: { parceiro: any; receitas: any[] }) {
  const [expandido, setExpandido] = useState(false)
  const [editando, setEditando] = useState(false)
  const receitasParceiro = receitas.filter((r) => r.parceiro_id === parceiro.id)
  const total = receitasParceiro.filter((r) => r.status_receita !== 'cancelado').reduce((s, r) => s + r.valor, 0)
  const Icon = ['pessoa_fisica'].includes(parceiro.tipo) ? User : Building2

  return (
    <li className="py-4 space-y-2">
      {!editando ? (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Icon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-200">{parceiro.nome}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{TIPO_LABELS[parceiro.tipo] ?? parceiro.tipo}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${STATUS_COLORS[parceiro.status] ?? ''}`}>{parceiro.status}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 mt-1 text-xs text-gray-500">
                {parceiro.contato_nome && <span>{parceiro.contato_nome}</span>}
                {parceiro.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{parceiro.email}</span>}
                {parceiro.telefone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{parceiro.telefone}</span>}
                {parceiro.projeto && <span className="text-blue-400">📁 {parceiro.projeto}</span>}
                {parceiro.tags && <span className="text-gray-400">🏷 {parceiro.tags}</span>}
              </div>
              {parceiro.observacao && <p className="text-xs text-gray-400 mt-1">{parceiro.observacao}</p>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {total > 0 && <span className="text-xs text-emerald-400 font-medium">{fmt(total)}</span>}
              <button
                onClick={() => setEditando(true)}
                className="text-xs px-2 py-1 rounded-md border border-gray-700 text-gray-400 hover:border-amber-500/50 hover:text-amber-400"
              >
                Editar
              </button>
              <ConfirmAction
                action={excluirParceiro}
                hidden={{ id: parceiro.id }}
                label="🗑"
                message="Excluir parceiro?"
                className="p-1 text-gray-500 hover:text-rose-400"
              />
              <button
                onClick={() => setExpandido((v) => !v)}
                className="p-1 text-gray-500 hover:text-gray-200"
                title="Ver histórico"
              >
                {expandido ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {expandido && <HistoricoParceiro receitas={receitasParceiro} />}
        </>
      ) : (
        <FormWithFeedback action={editarParceiro} onSuccess={() => setEditando(false)}>
          <input type="hidden" name="id" value={parceiro.id} />
          <div className="grid grid-cols-2 gap-2">
            <input name="nome" defaultValue={parceiro.nome} required placeholder="Nome" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
            <select name="tipo" defaultValue={parceiro.tipo} className={`col-span-2 sm:col-span-1 ${inputCls}`}>
              {Object.entries(TIPO_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <input name="documento" defaultValue={parceiro.documento ?? ''} placeholder="CPF / CNPJ (opcional)" className={inputCls} />
            <input name="email" type="email" defaultValue={parceiro.email ?? ''} placeholder="E-mail" className={inputCls} />
            <input name="telefone" defaultValue={parceiro.telefone ?? ''} placeholder="Telefone / WhatsApp" className={inputCls} />
            <input name="contato_nome" defaultValue={parceiro.contato_nome ?? ''} placeholder="Pessoa de contato" className={inputCls} />
            <select name="status" defaultValue={parceiro.status} className={inputCls}>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="prospect">Prospect</option>
              <option value="pausado">Pausado</option>
            </select>
            <input name="projeto" defaultValue={parceiro.projeto ?? ''} placeholder="Projeto vinculado" className={inputCls} />
            <input name="tags" defaultValue={parceiro.tags ?? ''} placeholder="Tags (ex: anual, educação)" className={inputCls} />
            <input name="observacao" defaultValue={parceiro.observacao ?? ''} placeholder="Observação" className={`col-span-2 ${inputCls}`} />
            <div className="col-span-2 flex items-center gap-2">
              <SubmitButton>Salvar</SubmitButton>
              <button type="button" onClick={() => setEditando(false)} className="px-3 py-2 rounded-lg text-sm border border-gray-700 text-gray-400 hover:text-gray-200">
                Cancelar
              </button>
            </div>
          </div>
        </FormWithFeedback>
      )}
    </li>
  )
}

export default function ParceirosTab({ parceiros, receitas }: { parceiros: any[]; receitas: any[] }) {
  return (
    <div className="space-y-6">
      {/* Formulário de novo parceiro */}
      <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Novo parceiro / doador</h3>
        <FormWithFeedback action={criarParceiro} resetOnSuccess>
          <div className="grid grid-cols-2 gap-2">
            <input name="nome" placeholder="Nome *" required className={`col-span-2 sm:col-span-1 ${inputCls}`} />
            <select name="tipo" defaultValue="doador" className={`col-span-2 sm:col-span-1 ${inputCls}`}>
              {Object.entries(TIPO_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <input name="documento" placeholder="CPF / CNPJ (opcional)" className={inputCls} />
            <input name="email" type="email" placeholder="E-mail" className={inputCls} />
            <input name="telefone" placeholder="Telefone / WhatsApp" className={inputCls} />
            <input name="contato_nome" placeholder="Pessoa de contato" className={inputCls} />
            <select name="status" defaultValue="ativo" className={inputCls}>
              <option value="ativo">Ativo</option>
              <option value="prospect">Prospect</option>
              <option value="pausado">Pausado</option>
              <option value="inativo">Inativo</option>
            </select>
            <input name="projeto" placeholder="Projeto vinculado (opcional)" className={inputCls} />
            <input name="tags" placeholder="Tags (ex: anual, educação)" className={inputCls} />
            <input name="observacao" placeholder="Observação" className={`col-span-2 ${inputCls}`} />
            <div className="col-span-2">
              <SubmitButton>Adicionar parceiro</SubmitButton>
            </div>
          </div>
        </FormWithFeedback>
      </section>

      {/* Lista de parceiros */}
      <section className="rounded-2xl border border-gray-800 bg-gray-900/60">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Cadastrados</h3>
            <p className="text-xs text-gray-500">{parceiros.length} parceiro(s)</p>
          </div>
        </div>
        <ul className="divide-y divide-gray-800 px-5">
          {parceiros.length === 0 && (
            <li className="py-10 text-center text-sm text-gray-500">Nenhum parceiro cadastrado ainda.</li>
          )}
          {parceiros.map((p) => (
            <ParceiroCard key={p.id} parceiro={p} receitas={receitas} />
          ))}
        </ul>
      </section>
    </div>
  )
}
