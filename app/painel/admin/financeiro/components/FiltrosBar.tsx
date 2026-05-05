'use client'
// Filtros do dashboard: mês, tipo de fellow, status. Reescreve a query string.

import { useRouter, useSearchParams } from 'next/navigation'

export default function FiltrosBar({ mes, tipo, status }: { mes: string; tipo: string; status: string }) {
  const router = useRouter()
  const params = useSearchParams()

  function setParam(name: string, value: string) {
    const sp = new URLSearchParams(params?.toString() ?? '')
    if (value) sp.set(name, value)
    else sp.delete(name)
    router.push(`/painel/admin/financeiro?${sp.toString()}`)
  }

  const baseSel =
    'rounded-lg bg-gray-900 border border-gray-800 px-3 py-1.5 text-sm text-gray-200 focus:border-amber-500/50 focus:outline-none'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="month"
        value={mes}
        onChange={(e) => setParam('mes', e.target.value)}
        className={baseSel}
      />
      <select value={tipo} onChange={(e) => setParam('tipo', e.target.value)} className={baseSel}>
        <option value="">Todos os fellows</option>
        <option value="autofinanciado">Autofinanciados</option>
        <option value="bolsista">Bolsistas</option>
      </select>
      <select value={status} onChange={(e) => setParam('status', e.target.value)} className={baseSel}>
        <option value="">Qualquer status</option>
        <option value="pendente">Pendente</option>
        <option value="pago">Pago</option>
        <option value="inadimplente">Inadimplente</option>
        <option value="sem_cobranca">Sem cobrança</option>
      </select>
    </div>
  )
}
