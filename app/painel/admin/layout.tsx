// app/painel/admin/layout.tsx
// Guard de autenticação para o painel admin
// Usa o mesmo padrão de ADMIN_EMAIL do layout principal

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  // Usa o mesmo padrão do painel layout (env var)
  const adminEmails = (process.env.ADMIN_EMAIL ?? 'anne@institutoamplifica.com')
    .split(',')
    .map((e) => e.trim())

  if (!adminEmails.includes(user.email ?? '')) {
    redirect('/painel/dashboard')
  }

  return <>{children}</>
}
