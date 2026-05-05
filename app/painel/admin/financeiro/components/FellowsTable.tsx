// Tabela de fellows com turma, status do contrato, cobrança do mês e WhatsApp.

import { atualizarStatusCobranca, encerrarContrato, reativarContrato } from '../actions'
import WhatsAppButton from './WhatsAppButton'
import ConfirmAction from './ConfirmAction'

type Fellow = {
  id: number
  nome: string
  email: string | null
  whatsapp: string | null
  area: string | null
  estado: string | null
  tipo_financiamento: 'autofinanciado' | 'bolsista' | null
  bolsa_origem: string | null
  foto_url: string | null
  turma_id: number | null
  contrato_ativo: boolean
  contrato_encerrado_em: string | null
}

type Cobranca = {
  id: number
  fellow_id: number
  mes_referencia: string
  valor: number
  status: 'pendente' | 'pago' | 'inadimplente'
  data_pagamento: string | null
}

type Turma = { id: number; nome: string }

type Config = {
  pix_chave: string | null
  pix_tipo: string | null
  beneficiario: string | null
  banco: string | null
  prazo_dia: number | null
  whatsapp_template: string | null
}

function brl(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function StatusPill({ status }: { status: Cobranca['status'] | 'sem_cobranca' | 'bolsista' | 'encerrado' }) {
  const map = {
    pago: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pendente: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    inadimplente: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    sem_cobranca: 'bg-gray-700/30 text-gray-400 border-gray-600/30',
    bolsista: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    encerrado: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  }
  const labels = {
    pago: 'Pago',
    pendente: 'Pendente',
    inadimplente: 'Inadimplente',
    sem_cobranca: 'Sem cobrança',
    bolsista: 'Bolsista',
    encerrado: 'Encerrado',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${map[status]}`}>
      {labels[status]}
    </span>
  )
}

export default function FellowsTable({
  fellows,
  cobrancaPorFellow,
  turmas,
  config,
  mes,
}: {
  fellows: Fellow[]
  cobrancaPorFellow: Record<number, Cobranca>
  turmas: Turma[]
  config: Config | null
  mes: string
}) {
  const turmasMap = Object.fromEntries(turmas.map((t) => [t.id, t.nome]))

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Fellows e cobranças</h3>
          <p className="text-xs text-gray-500">Mês de referência: {mes}</p>
        </div>
        <span className="text-xs text-gray-500">{fellows.length} fellow(s)</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900/40 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Fellow</th>
              <th className="text-left px-3 py-3 font-medium">Tipo</th>
              <th className="text-left px-3 py-3 font-medium">Turma</th>
              <th className="text-left px-3 py-3 font-medium">Status</th>
              <th className="text-right px-3 py-3 font-medium">Valor</th>
              <th className="text-right px-5 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {fellows.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-500">Nenhum fellow corresponde ao filtro.</td></tr>
            )}
            {fellows.map((f) => {
              const c = cobrancaPorFellow[f.id]
              const isBolsista = f.tipo_financiamento === 'bolsista'
              const contratoEncerrado = !f.contrato_ativo
              const status: Cobranca['status'] | 'sem_cobranca' | 'bolsista' | 'encerrado' = contratoEncerrado
                ? 'encerrado'
                : isBolsista
                ? 'bolsista'
                : c
                ? c.status
                : 'sem_cobranca'

              return (
                <tr key={f.id} className="hover:bg-gray-900/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {f.foto_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={f.foto_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center text-xs text-gray-400">
                          {f.nome.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-gray-200 truncate">{f.nome}</p>
                        <p className="text-xs text-gray-500 truncate">{f.email ?? '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-300">
                    {f.tipo_financiamento === 'autofinanciado' && <span className="text-xs">Autofinanciado</span>}
                    {f.tipo_financiamento === 'bolsista' && <span className="text-xs">{f.bolsa_origem ?? 'Bolsista'}</span>}
                    {!f.tipo_financiamento && <span className="text-xs text-gray-500">—</span>}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-400">{f.turma_id ? turmasMap[f.turma_id] ?? '—' : '—'}</td>
                  <td className="px-3 py-3"><StatusPill status={status} /></td>
                  <td className="px-3 py-3 text-right tabular-nums text-gray-300">
                    {isBolsista || contratoEncerrado ? '—' : c ? brl(Number(c.valor)) : '—'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex flex-wrap justify-end gap-1">
                      {!isBolsista && !contratoEncerrado && c && (
                        <>
                          <WhatsAppButton fellow={{ nome: f.nome, whatsapp: f.whatsapp }} cobranca={c} config={config} />
                          {(['pago', 'pendente', 'inadimplente'] as const).filter((s) => s !== c.status).map((s) => (
                            <form key={s} action={atualizarStatusCobranca}>
                              <input type="hidden" name="id" value={c.id} />
                              <input type="hidden" name="status" value={s} />
                              <button
                                type="submit"
                                className="text-xs px-2 py-1 rounded-md border border-gray-700 text-gray-300 hover:border-amber-500/40 hover:text-amber-400"
                                title={`Marcar como ${s}`}
                              >
                                {s === 'pago' ? '✓ Pago' : s === 'pendente' ? '↻ Pend.' : '⚠ Inadimpl.'}
                              </button>
                            </form>
                          ))}
                        </>
                      )}
                      {!isBolsista && !contratoEncerrado && (
                        <ConfirmAction
                          action={encerrarContrato}
                          hidden={{ fellow_id: f.id }}
                          label="Encerrar"
                          confirmLabel="Encerrar contrato"
                          message="Tem certeza?"
                        />
                      )}
                      {contratoEncerrado && (
                        <form action={reativarContrato}>
                          <input type="hidden" name="fellow_id" value={f.id} />
                          <button type="submit" className="text-xs px-2 py-1 rounded-md border border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                            Reativar
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
