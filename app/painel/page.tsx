// app/painel/page.tsx
// Redireciona /painel para /painel/dashboard

import { redirect } from 'next/navigation'

export default function PainelRoot() {
  redirect('/painel/dashboard')
}
