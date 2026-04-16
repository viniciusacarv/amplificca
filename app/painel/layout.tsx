// app/painel/layout.tsx
// Server Component — busca sessão, dados do fellow e contagem de notificações

import { createClient } from '@/lib/supabase-server'
import { getPanelUserProfile } from '@/lib/auth-profile'
import PainelNavbar from './components/PainelNavbar'

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Sem sessão (página de login) → renderiza sem navbar
  if (!user) return <>{children}</>

  const { fellow, nomeExibicao, fotoUrl, iniciais, isAdmin } =
    await getPanelUserProfile(supabase, user)

  // Conta notificações não lidas para o sino
  let notifCount = 0
  try {
    if (isAdmin) {
      const { count } = await supabase
        .from('notificacoes')
        .select('*', { count: 'exact', head: true })
        .eq('is_admin', true)
        .eq('lida', false)
      notifCount = count ?? 0
    } else if (fellow?.id) {
      const { count } = await supabase
        .from('notificacoes')
        .select('*', { count: 'exact', head: true })
        .eq('fellow_id', fellow.id)
        .eq('is_admin', false)
        .eq('lida', false)
      notifCount = count ?? 0
    }
  } catch {
    // Se a tabela ainda não existir (antes da migration), não quebra
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--preto)' }}>
      <PainelNavbar
        nome={nomeExibicao}
        fotoUrl={fotoUrl}
        iniciais={iniciais}
        isAdmin={isAdmin}
        notifCount={notifCount}
      />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        {children}
      </main>
    </div>
  )
}
