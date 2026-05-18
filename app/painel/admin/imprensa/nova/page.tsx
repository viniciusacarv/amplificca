// app/painel/admin/imprensa/nova/page.tsx
// Admin submetendo texto em nome próprio
// Reusa o form do fellow; a action criarSubmissao detecta o autor automaticamente.

import { createClient } from '@/lib/supabase-server'
import { isAdminUser } from '@/lib/auth-profile'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NovaSubmissaoForm } from '@/app/painel/imprensa/nova/NovaSubmissaoForm'

export default async function AdminNovaSubmissaoPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  const isAdmin = await isAdminUser(supabase, user.email)
  if (!isAdmin) redirect('/painel/dashboard')

  const { data: tagsRaw } = await supabase
    .from('tags')
    .select('id, nome, slug, grupo')
    .eq('ativo', true)
    .eq('grupo', 'tema')
    .order('nome')

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/painel/admin/imprensa"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Assessoria de Imprensa
        </Link>
      </div>
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-6 max-w-2xl mx-auto text-xs text-amber-300">
        Você está submetendo um texto em nome próprio (admin). O texto entrará na fila como qualquer outra submissão.
      </div>
      <NovaSubmissaoForm tagsTema={tagsRaw ?? []} />
    </div>
  )
}
