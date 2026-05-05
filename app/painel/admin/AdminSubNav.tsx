'use client'
// app/painel/admin/AdminSubNav.tsx
// Sub-navegação do painel admin — abas entre Imprensa, Veículos e Aulas.

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Tab = { href: string; label: string; match: string }

const BASE_TABS: Tab[] = [
  { href: '/painel/admin/imprensa',     label: 'Assessoria de Imprensa', match: '/painel/admin/imprensa'     },
  { href: '/painel/admin/fellows',      label: 'Fellows',                match: '/painel/admin/fellows'      },
  { href: '/painel/admin/veiculos',     label: 'Veículos',               match: '/painel/admin/veiculos'     },
  { href: '/painel/admin/aulas',        label: 'Aulas',                  match: '/painel/admin/aulas'        },
  { href: '/painel/admin/notificacoes', label: 'Notificações',           match: '/painel/admin/notificacoes' },
]

export default function AdminSubNav({ extraTabs = [] }: { extraTabs?: Tab[] }) {
  const pathname = usePathname() || ''
  const TABS = [...BASE_TABS, ...extraTabs]

  return (
    <nav
      aria-label="Sub-navegação do admin"
      className="flex items-center gap-2 overflow-x-auto -mx-1 px-1 pb-1 pt-1"
    >
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.match)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              active
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
