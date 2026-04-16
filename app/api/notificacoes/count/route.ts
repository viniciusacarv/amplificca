// app/api/notificacoes/count/route.ts
// Retorna o número de notificações não lidas do usuário autenticado
// Usado pelo NotificationBell para polling leve

import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ count: 0 })

  // Verifica se é admin
  const { data: adminRecord } = await supabase
    .from('admins')
    .select('id')
    .eq('email', user.email)
    .maybeSingle()

  const isAdmin = !!adminRecord

  let query = supabase
    .from('notificacoes')
    .select('*', { count: 'exact', head: true })
    .eq('lida', false)

  if (isAdmin) {
    query = query.eq('is_admin', true)
  } else {
    // Busca o fellow_id pelo email
    const { data: fellow } = await supabase
      .from('fellows')
      .select('id')
      .eq('email', user.email)
      .maybeSingle()

    if (!fellow) return NextResponse.json({ count: 0 })

    query = query.eq('fellow_id', fellow.id).eq('is_admin', false)
  }

  const { count } = await query

  return NextResponse.json({ count: count ?? 0 })
}
