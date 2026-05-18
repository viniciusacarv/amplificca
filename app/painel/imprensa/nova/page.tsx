// app/painel/imprensa/nova/page.tsx
// Formulário de envio de texto/pitch — fellow
// Server component que carrega as tags ativas; o form em si é client.

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { NovaSubmissaoForm } from './NovaSubmissaoForm'

export default async function NovaSubmissaoPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  const { data: tagsRaw } = await supabase
    .from('tags')
    .select('id, nome, slug, grupo')
    .eq('ativo', true)
    .eq('grupo', 'tema')
    .order('nome')

  return <NovaSubmissaoForm tagsTema={tagsRaw ?? []} />
}
