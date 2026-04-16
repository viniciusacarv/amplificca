function getInitials(nome: string) {
  return nome
    .split(' ')
    .filter(Boolean)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function getFallbackName(email?: string | null) {
  return email?.split('@')[0] ?? 'Usuario'
}

function getAdminEmailsFromEnv() {
  return (process.env.ADMIN_EMAIL ?? 'anne@institutoamplifica.com')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean)
}

export async function isAdminUser(supabase: any, email?: string | null) {
  if (!email) return false

  try {
    const { data: adminRecord } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (adminRecord) return true
  } catch {
    // Fallback para ambientes onde a tabela admins ainda nao existe.
  }

  return getAdminEmailsFromEnv().includes(email)
}

export async function getPanelUserProfile(supabase: any, user: any) {
  const email = user?.email ?? null
  const fallbackName =
    user?.user_metadata?.nome ??
    user?.user_metadata?.full_name ??
    getFallbackName(email)

  const isAdmin = await isAdminUser(supabase, email)

  if (isAdmin) {
    let equipeProfile: { nome?: string | null; foto_url?: string | null } | null = null

    try {
      const { data } = await supabase
        .from('equipe')
        .select('nome, foto_url')
        .eq('email', email)
        .maybeSingle()

      equipeProfile = data
    } catch {
      // Se a tabela equipe nao tiver coluna de email, mantemos o fallback.
    }

    const nomeExibicao = equipeProfile?.nome?.trim() || fallbackName

    return {
      isAdmin,
      fellow: null,
      nomeExibicao,
      fotoUrl: equipeProfile?.foto_url ?? null,
      iniciais: getInitials(nomeExibicao),
    }
  }

  const { data: fellow } = await supabase
    .from('fellows')
    .select('id, nome, foto_url, area, estado')
    .eq('email', email)
    .maybeSingle()

  const nomeExibicao = fellow?.nome ?? fallbackName

  return {
    isAdmin,
    fellow,
    nomeExibicao,
    fotoUrl: fellow?.foto_url ?? null,
    iniciais: getInitials(nomeExibicao),
  }
}
