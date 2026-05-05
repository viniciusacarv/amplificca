// lib/auth-financeiro.ts
// Whitelist do painel financeiro do Instituto Amplifica.
// Acesso restrito — defesa em profundidade junto com RLS no Supabase.

export const FINANCEIRO_EMAILS = [
  'anne@institutoamplifica.com',
  'vinicius_acarvalho@outlook.com',
] as const

export function canAccessFinanceiro(email?: string | null): boolean {
  if (!email) return false
  return FINANCEIRO_EMAILS.includes(email.trim().toLowerCase() as typeof FINANCEIRO_EMAILS[number])
}
