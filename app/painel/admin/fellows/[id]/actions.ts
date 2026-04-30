'use server'

import { createClient } from '@/lib/supabase-server'

function getBaseUrl() {
  return (
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    ''
  ).replace(/\/$/, '')
}

export async function resetFellowPassword(email: string): Promise<{ sent: boolean }> {
  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getBaseUrl()}/auth/callback?next=/painel/update-password`,
  })

  if (error) throw new Error(error.message)
  return { sent: true }
}
