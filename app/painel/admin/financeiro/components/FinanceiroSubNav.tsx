'use client'
// Sub-navegação interna do painel financeiro.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Receipt, Users, Settings, Package, Truck, UserCog } from 'lucide-react'

const TABS = [
  { href: '/painel/admin/financeiro',                label: 'Dashboard',     icon: LayoutDashboard, exact: true },
  { href: '/painel/admin/financeiro/custos',         label: 'Custos',        icon: Receipt },
  { href: '/painel/admin/financeiro/turmas',         label: 'Turmas',        icon: Users },
  { href: '/painel/admin/financeiro/produtos',       label: 'Produtos',      icon: Package },
  { href: '/painel/admin/financeiro/fornecedores',   label: 'Fornecedores',  icon: Truck },
  { href: '/painel/admin/financeiro/time',           label: 'Time',          icon: UserCog },
  { href: '/painel/admin/financeiro/configuracoes',  label: 'Configurações', icon: Settings },
]

export default function FinanceiroSubNav() {
  const pathname = usePathname() || ''
  return (
    <nav className="flex items-center gap-1 overflow-x-auto pb-1">
      {TABS.map((t) => {
        const active = t.exact ? pathname === t.href : pathname.startsWith(t.href)
        const Icon = t.icon
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              active
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
            }`}
          >
            <Icon className="h-4 w-4" />
            {t.label}
          </Link>
        )
      })}
    </nav>
  )
}
