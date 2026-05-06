'use client'
// Card de fellow com modo View vs Edit, feedback de salvamento, ações de turma e contrato.

import { useState } from 'react'
import { editarFellow } from '../../actions'
import FormWithFeedback, { SubmitButton } from '../../components/FormWithFeedback'
import { encerrarContrato, reativarContrato } from '../../actions'
import { Pencil, X, Phone, MessageCircle, GraduationCap, Mail } from 'lucide-react'
import Link from 'next/link'

type Fellow = {
  id: number
  nome: string
  email: string | null
  whatsapp: string | null
  tipo_financiamento: 'autofinanciado' | 'bolsista' | null
  bolsa_origem: string | null
  turma_id: number | null
  contrato_ativo: boolean
  contrato_encerrado_em: string | null
}

type Turma = { id: number; nome: string }

const inputCls = 'rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-gray-200 w-full'

function fmtPhone(s: string | null) {
  if (!s) return null
  const d = s.replace(/\D/g, '')
  if (d.length === 13) return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  return s
}

export default function FellowEditor({ fellow, turmas }: { fellow: Fellow; turmas: Turma[] }) {
  const [editing, setEditing] = useState(false)
  const [tipo, setTipo] = useState(fellow.tipo_financiamento ?? '')

  if (!editing) {
    return (
      <div className="rounded-xl bg-gray-950/40 border border-gray-800 p-3 hover:border-gray-700 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-200 truncate">{fellow.nome}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
              {fellow.email && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 truncate">
                  <Mail className="h-3 w-3" /> {fellow.email}
                </span>
              )}
              {fellow.whatsapp && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <Phone className="h-3 w-3" /> {fmtPhone(fellow.whatsapp)}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {fellow.tipo_financiamento === 'autofinanciado' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Autofinanciado
                </span>
              )}
              {fellow.tipo_financiamento === 'bolsista' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {fellow.bolsa_origem ?? 'Bolsista'}
                </span>
              )}
              {!fellow.tipo_financiamento && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-gray-700/30 text-gray-400 border border-gray-600/30">
                  Sem tipo
                </span>
              )}
              {fellow.contrato_ativo ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Contrato ativo
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Encerrado{fellow.contrato_encerrado_em ? ` ${fellow.contrato_encerrado_em.split('-').reverse().join('/')}` : ''}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-gray-700 text-gray-300 hover:border-amber-500/40 hover:text-amber-400"
            >
              <Pencil className="h-3 w-3" /> Editar
            </button>
            <Link
              href={`/painel/admin/financeiro/fellows/${fellow.id}`}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-gray-700 text-gray-300 hover:border-amber-500/40 hover:text-amber-400"
            >
              <GraduationCap className="h-3 w-3" /> Relatório
            </Link>
            {fellow.whatsapp && (
              <a
                href={`https://wa.me/${fellow.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              >
                <MessageCircle className="h-3 w-3" /> WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-gray-950/60 border border-amber-500/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-amber-400">Editando: {fellow.nome}</h4>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="p-1 text-gray-500 hover:text-gray-300"
          title="Fechar"
        ><X className="h-4 w-4" /></button>
      </div>

      <FormWithFeedback action={editarFellow} onSuccess={() => setTimeout(() => setEditing(false), 1200)}>
          <div className="grid grid-cols-2 gap-2">
            <input type="hidden" name="id" value={fellow.id} />
            <label className="col-span-2 sm:col-span-1">
              <span className="text-xs text-gray-500">Nome</span>
              <input name="nome" defaultValue={fellow.nome} required className={inputCls} />
            </label>
            <label className="col-span-2 sm:col-span-1">
              <span className="text-xs text-gray-500">E-mail</span>
              <input name="email" type="email" defaultValue={fellow.email ?? ''} className={inputCls} />
            </label>
            <label className="col-span-2 sm:col-span-1">
              <span className="text-xs text-gray-500">Tipo de financiamento</span>
              <select name="tipo_financiamento" value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputCls}>
                <option value="">—</option>
                <option value="autofinanciado">Autofinanciado</option>
                <option value="bolsista">Bolsista</option>
              </select>
            </label>
            <label className="col-span-2 sm:col-span-1">
              <span className="text-xs text-gray-500">Origem da bolsa</span>
              <input
                name="bolsa_origem"
                defaultValue={fellow.bolsa_origem ?? ''}
                placeholder="Ex: Bolsa SFL, Bolsa LOLA..."
                disabled={tipo !== 'bolsista'}
                className={`${inputCls} disabled:opacity-50`}
              />
            </label>
            <label className="col-span-2 sm:col-span-1">
              <span className="text-xs text-gray-500">Turma</span>
              <select name="turma_id" defaultValue={fellow.turma_id ?? ''} className={inputCls}>
                <option value="">Sem turma</option>
                {turmas.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            </label>
            <label className="col-span-2 sm:col-span-1">
              <span className="text-xs text-gray-500">WhatsApp (com DDD)</span>
              <input name="whatsapp" defaultValue={fellow.whatsapp ?? ''} placeholder="55 11 9..." className={inputCls} />
            </label>
            <div className="col-span-2 flex items-center justify-between gap-2 pt-2">
              <SubmitButton>Salvar alterações</SubmitButton>
              <div className="flex items-center gap-2">
                {fellow.contrato_ativo ? (
                  <form action={encerrarContrato}>
                    <input type="hidden" name="fellow_id" value={fellow.id} />
                    <button type="submit" className="text-xs px-2 py-1 rounded-md border border-rose-500/30 text-rose-400 hover:bg-rose-500/10">
                      Encerrar contrato
                    </button>
                  </form>
                ) : (
                  <form action={reativarContrato}>
                    <input type="hidden" name="fellow_id" value={fellow.id} />
                    <button type="submit" className="text-xs px-2 py-1 rounded-md border border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                      Reativar contrato
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
      </FormWithFeedback>
    </div>
  )
}
