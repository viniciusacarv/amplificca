// app/painel/layout.tsx
// Server Component — busca sessão e dados do fellow, passa ao navbar Client

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

  // Dados do fellow
  const { data: fellow } = await supabase
    .from('fellows')
    .select('nome, foto_url')
    .eq('email', user.email)
    .maybeSingle()

  const nomeExibicao = fellow?.nome ?? user.email?.split('@')[0] ?? 'Fellow'
  const iniciais = nomeExibicao
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // Verifica admin
  const adminEmails = (process.env.ADMIN_EMAIL ?? 'anne@institutoamplifica.com')
    .split(',')
    .map((e) => e.trim())
  const isAdmin = adminEmails.includes(user.email ?? '')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--preto)' }}>
      <PainelNavbar
        nome={nomeExibicao}
        fotoUrl={fellow?.foto_url ?? null}
        iniciais={iniciais}
        isAdmin={isAdmin}
      />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        {children}
      </main>
    </div>
  )
}
