// app/painel/admin/financeiro/layout.tsx
// Guard server-side do painel financeiro — apenas usuários da whitelist passam.

import { createClient } from '@/lib/supabase-server'
import { canAccessFinanceiro } from '@/lib/auth-financeiro'
import { redirect } from 'next/navigation'
import FinanceiroSubNav from './components/FinanceiroSubNav'

export default async function FinanceiroLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !canAccessFinanceiro(user.email)) {
    redirect('/painel/admin')
  }

  return (
    <div className="space-y-4">
      <FinanceiroSubNav />
      {children}
    </div>
  )
}
