// app/painel/admin/layout.tsx
// Guard de autenticação para o painel admin
// Usa o mesmo padrão de ADMIN_EMAIL do layout principal

import { createClient } from '@/lib/supabase-server'
import { isAdminUser } from '@/lib/auth-profile'
import { canAccessFinanceiro } from '@/lib/auth-financeiro'
import { redirect } from 'next/navigation'
import AdminSubNav from './AdminSubNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  const isAdmin = await isAdminUser(supabase, user.email)

  if (!isAdmin) {
    redirect('/painel/dashboard')
  }

  const extraTabs = canAccessFinanceiro(user.email)
    ? [{ href: '/painel/admin/financeiro', label: 'Financeiro', match: '/painel/admin/financeiro' }]
    : []

  return (
    <div className="space-y-6">
      <AdminSubNav extraTabs={extraTabs} />
      {children}
    </div>
  )
}
