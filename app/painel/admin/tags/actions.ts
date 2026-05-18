'use server'
// app/painel/admin/tags/actions.ts
// Server Actions do CRUD de tags

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

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function criarTag(formData: FormData) {
  const { supabase } = await assertAdmin()

  const nome = (formData.get('nome') as string | null)?.trim() ?? ''
  const grupo = (formData.get('grupo') as string | null)?.trim() || null
  const descricao = (formData.get('descricao') as string | null)?.trim() || null

  if (!nome) {
    redirect('/painel/admin/tags?erro=nome_obrigatorio')
  }

  const slug = slugify(nome)
  if (!slug) {
    redirect('/painel/admin/tags?erro=slug_invalido')
  }

  const { error } = await supabase.from('tags').insert({
    nome,
    slug,
    grupo,
    descricao,
    ativo: true,
  })

  if (error) {
    const detalhe = encodeURIComponent(error.message || 'desconhecido')
    redirect(`/painel/admin/tags?erro=criar&detalhe=${detalhe}`)
  }

  revalidatePath('/painel/admin/tags')
  redirect('/painel/admin/tags?sucesso=criada')
}

export async function atualizarTag(formData: FormData) {
  const { supabase } = await assertAdmin()

  const id = formData.get('id') as string
  const nome = (formData.get('nome') as string | null)?.trim() ?? ''
  const grupo = (formData.get('grupo') as string | null)?.trim() || null
  const descricao = (formData.get('descricao') as string | null)?.trim() || null
  const ativo = formData.get('ativo') === 'on'

  if (!id || !nome) {
    redirect('/painel/admin/tags?erro=nome_obrigatorio')
  }

  const { error } = await supabase
    .from('tags')
    .update({
      nome,
      grupo,
      descricao,
      ativo,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    const detalhe = encodeURIComponent(error.message || 'desconhecido')
    redirect(`/painel/admin/tags?erro=atualizar&detalhe=${detalhe}`)
  }

  revalidatePath('/painel/admin/tags')
  redirect('/painel/admin/tags?sucesso=atualizada')
}

export async function alternarAtivoTag(formData: FormData) {
  const { supabase } = await assertAdmin()

  const id = formData.get('id') as string
  const ativoAtual = formData.get('ativo') === 'true'

  if (!id) redirect('/painel/admin/tags?erro=id_invalido')

  await supabase
    .from('tags')
    .update({ ativo: !ativoAtual, updated_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath('/painel/admin/tags')
}

export async function excluirTag(formData: FormData) {
  const { supabase } = await assertAdmin()

  const id = formData.get('id') as string
  if (!id) redirect('/painel/admin/tags?erro=id_invalido')

  // Soft delete (mantém histórico de associações)
  await supabase
    .from('tags')
    .update({ ativo: false, updated_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath('/painel/admin/tags')
  redirect('/painel/admin/tags?sucesso=desativada')
}
