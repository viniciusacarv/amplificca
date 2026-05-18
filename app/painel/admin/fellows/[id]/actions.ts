'use server'

import { createClient } from '@/lib/supabase-server'
import { isAdminUser } from '@/lib/auth-profile'
import { redirect } from 'next/navigation'

function getBaseUrl() {
  return (
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    ''
  ).replace(/\/$/, '')
}

async function assertAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  const isAdmin = await isAdminUser(supabase, user.email)
  if (!isAdmin) redirect('/painel/dashboard')

  return { supabase, user }
}

export async function resetFellowPassword(email: string): Promise<{ sent: boolean }> {
  const { supabase } = await assertAdmin()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getBaseUrl()}/auth/callback?next=/painel/update-password`,
  })

  if (error) throw new Error(error.message)
  return { sent: true }
}
