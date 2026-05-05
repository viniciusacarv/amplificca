// Cards-resumo no topo do dashboard. Estilo Horizon UI: rounded-2xl, ícone, valor grande.

import { TrendingUp, TrendingDown, Wallet, AlertTriangle } from 'lucide-react'

function brl(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

type Props = {
  receita: number
  despesa: number
  saldo: number
  inadimplencia: number
  qtdInadimplentes: number
  qtdPendentes: number
}

export default function SummaryCards({ receita, despesa, saldo, inadimplencia, qtdInadimplentes, qtdPendentes }: Props) {
  const cards = [
    {
      label: 'Receita do mês',
      value: brl(receita),
      icon: <TrendingUp className="h-5 w-5" />,
      iconBg: 'bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Despesas do mês',
      value: brl(despesa),
      icon: <TrendingDown className="h-5 w-5" />,
      iconBg: 'bg-rose-500/10 text-rose-400',
    },
    {
      label: 'Saldo do mês',
      value: brl(saldo),
      icon: <Wallet className="h-5 w-5" />,
      iconBg: saldo >= 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400',
    },
    {
      label: 'Inadimplência',
      value: brl(inadimplencia),
      hint: `${qtdInadimplentes} inadimplente(s) · ${qtdPendentes} pendente(s)`,
      icon: <AlertTriangle className="h-5 w-5" />,
      iconBg: 'bg-orange-500/10 text-orange-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5 shadow-sm hover:border-gray-700 transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-gray-400">{c.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white truncate">{c.value}</p>
              {c.hint && <p className="mt-1 text-xs text-gray-500">{c.hint}</p>}
            </div>
            <span className={`inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${c.iconBg}`}>
              {c.icon}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
