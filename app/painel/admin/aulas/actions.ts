'use server'
// app/painel/admin/aulas/actions.ts
// Server Actions do admin — gestão das aulas (link do Meet, material, descrição, data/hora)

import { createClient } from '@/lib/supabase-server'
import { isAdminUser } from '@/lib/auth-profile'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function assertAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  const isAdmin = await isAdminUser(supabase, user.email)
  if (!isAdmin) redirect('/painel/dashboard')

  return { supabase, user }
}

// Salva edição inline de uma aula (link do Meet, material, descrição, data/hora, duração)
export async function salvarAula(formData: FormData) {
  const { supabase } = await assertAdmin()

  const id           = formData.get('id') as string
  const titulo       = (formData.get('titulo')       as string || '').trim()
  const descricao    = (formData.get('descricao')    as string || '').trim()
  const data         = (formData.get('data')         as string || '').trim() // YYYY-MM-DD
  const hora         = (formData.get('hora')         as string || '').trim() // HH:MM
  const duracao_min  = formData.get('duracao_min') as string | null
  const link_acesso  = (formData.get('link_acesso')  as string || '').trim()
  const material_url = (formData.get('material_url') as string || '').trim()

  if (!id || !titulo || !data || !hora) {
    redirect('/painel/admin/aulas?erro=campos_obrigatorios')
  }

  // Monta timestamp no fuso America/Sao_Paulo (UTC-3, sem horário de verão desde 2019).
  // O Postgres aceita o formato ISO com offset explícito.
  const data_hora_iso = `${data}T${hora}:00-03:00`

  const payload: Record<string, any> = {
    titulo,
    descricao:    descricao || null,
    data_hora:    data_hora_iso,
    duracao_min:  duracao_min ? Number(duracao_min) : null,
    link_acesso:  link_acesso || null,
    material_url: material_url || null,
  }

  const { error } = await supabase.from('aulas').update(payload).eq('id', id)

  if (error) {
    redirect(`/painel/admin/aulas?erro=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/painel/admin/aulas')
  revalidatePath('/painel/aulas')
  revalidatePath('/painel/dashboard')
  redirect(`/painel/admin/aulas?sucesso=${id}`)
}

// Apaga uma aula
export async function excluirAula(formData: FormData) {
  const { supabase } = await assertAdmin()

  const id = formData.get('id') as string
  if (!id) redirect('/painel/admin/aulas?erro=id_invalido')

  const { error } = await supabase.from('aulas').delete().eq('id', id)
  if (error) {
    redirect(`/painel/admin/aulas?erro=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/painel/admin/aulas')
  revalidatePath('/painel/aulas')
  revalidatePath('/painel/dashboard')
  redirect('/painel/admin/aulas?excluida=1')
}

// Cria uma aula nova
export async function criarAula(formData: FormData) {
  const { supabase } = await assertAdmin()

  const titulo       = (formData.get('titulo')       as string || '').trim()
  const descricao    = (formData.get('descricao')    as string || '').trim()
  const data         = (formData.get('data')         as string || '').trim()
  const hora         = (formData.get('hora')         as string || '').trim()
  const duracao_min  = formData.get('duracao_min') as string | null
  const link_acesso  = (formData.get('link_acesso')  as string || '').trim()
  const material_url = (formData.get('material_url') as string || '').trim()

  if (!titulo || !data || !hora) {
    redirect('/painel/admin/aulas?erro=campos_obrigatorios')
  }

  const data_hora_iso = `${data}T${hora}:00-03:00`

  const { error } = await supabase.from('aulas').insert({
    titulo,
    descricao:    descricao || null,
    data_hora:    data_hora_iso,
    duracao_min:  duracao_min ? Number(duracao_min) : null,
    link_acesso:  link_acesso || null,
    material_url: material_url || null,
  })

  if (error) {
    redirect(`/painel/admin/aulas?erro=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/painel/admin/aulas')
  revalidatePath('/painel/aulas')
  revalidatePath('/painel/dashboard')
  redirect('/painel/admin/aulas?criada=1')
}
