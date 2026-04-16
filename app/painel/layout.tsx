// app/painel/layout.tsx
// Server Component — busca sessão, dados do fellow e contagem de notificações

import { createClient } from '@/lib/supabase-server'
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

  // Dados do fellow (adicionado id para a query de notificações)
  const { data: fellow } = await supabase
    .from('fellows')
    .select('id, nome, foto_url')
    .eq('email', user.email)
    .maybeSingle()

  const nomeExibicao = fellow?.nome ?? user.email?.split('@')[0] ?? 'Fellow'
  const iniciais = nomeExibicao
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // Verifica admin (mantém o padrão existente via env var)
  const adminEmails = (process.env.ADMIN_EMAIL ?? 'anne@institutoamplifica.com')
    .split(',')
    .map((e) => e.trim())
  const isAdmin = adminEmails.includes(user.email ?? '')

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
        fotoUrl={fellow?.foto_url ?? null}
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
