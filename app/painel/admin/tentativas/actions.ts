'use server'
// app/painel/admin/tentativas/actions.ts
// Server Actions para registro e gestão de tentativas de placement

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

// ─── Registra uma nova tentativa de placement ────────────────────────────────
export async function registrarTentativa(formData: FormData) {
  const { supabase } = await assertAdmin()

  const submissao_id     = formData.get('submissao_id') as string
  const veiculo_id       = formData.get('veiculo_id') as string
  const responsavel_nome = formData.get('responsavel_nome') as string
  const enviado_em       = formData.get('enviado_em') as string
  const notas            = formData.get('notas') as string

  if (!submissao_id || !veiculo_id) {
    return { error: 'Submissão e veículo são obrigatórios.' }
  }

  // Busca fellow_id da submissão
  const { data: sub } = await supabase
    .from('submissoes')
    .select('fellow_id, titulo')
    .eq('id', submissao_id)
    .single()

  if (!sub) return { error: 'Submissão não encontrada.' }

  const { error } = await supabase
    .from('tentativas_placement')
    .insert({
      submissao_id,
      fellow_id:       sub.fellow_id,
      veiculo_id,
      responsavel_nome: responsavel_nome?.trim() || null,
      status:          'aguardando',
      notas:           notas?.trim() || null,
      enviado_em:      enviado_em || new Date().toISOString(),
    })

  if (error) return { error: 'Erro ao registrar tentativa.' }

  // Se a submissão ainda está em 'aprovado', avança para 'enviado_imprensa'
  await supabase
    .from('submissoes')
    .update({ status: 'enviado_imprensa', veiculo_id })
    .eq('id', submissao_id)
    .eq('status', 'aprovado')

  revalidatePath(`/painel/admin/imprensa/${submissao_id}`)
  revalidatePath(`/painel/admin/fellows/${sub.fellow_id}`)
  revalidatePath('/painel/admin/veiculos')
  revalidatePath(`/painel/admin/veiculos/${veiculo_id}`)
  revalidatePath(`/painel/admin/veiculos/${veiculo_id}/view`)
  redirect(`/painel/admin/imprensa/${submissao_id}?tentativa=1`)
}

// ─── Atualiza resultado de uma tentativa existente ───────────────────────────
export async function atualizarTentativa(formData: FormData) {
  const { supabase } = await assertAdmin()

  const tentativa_id   = formData.get('tentativa_id') as string
  const status         = formData.get('status') as string
  const motivo         = formData.get('motivo') as string
  const respondido_em  = formData.get('respondido_em') as string
  const notas          = formData.get('notas') as string

  if (!tentativa_id || !status) return { error: 'Dados inválidos.' }

  // Busca a tentativa para pegar submissao_id, fellow_id, veiculo_id
  const { data: tentativa } = await supabase
    .from('tentativas_placement')
    .select('submissao_id, fellow_id, veiculo_id')
    .eq('id', tentativa_id)
    .single()

  if (!tentativa) return { error: 'Tentativa não encontrada.' }

  const { error } = await supabase
    .from('tentativas_placement')
    .update({
      status,
      motivo:        motivo?.trim() || null,
      notas:         notas?.trim() || null,
      respondido_em: respondido_em || (status !== 'aguardando' ? new Date().toISOString() : null),
    })
    .eq('id', tentativa_id)

  if (error) return { error: 'Erro ao atualizar tentativa.' }

  // Se publicado: atualiza submissão e notifica fellow
  if (status === 'publicado') {
    const artigo_url = formData.get('artigo_url') as string

    await supabase
      .from('submissoes')
      .update({ status: 'publicado', artigo_url: artigo_url?.trim() || null })
      .eq('id', tentativa.submissao_id)

    // Busca título da submissão para a notificação
    const { data: sub } = await supabase
      .from('submissoes')
      .select('titulo')
      .eq('id', tentativa.submissao_id)
      .single()

    if (sub && tentativa.fellow_id) {
      await supabase.from('notificacoes').insert({
        fellow_id:    tentativa.fellow_id,
        is_admin:     false,
        tipo:         'publicado',
        titulo:       'Texto publicado! 🎉',
        mensagem:     `Seu texto "${sub.titulo}" foi publicado. Parabéns!`,
        submissao_id: tentativa.submissao_id,
      })
    }
  }

  revalidatePath(`/painel/admin/imprensa/${tentativa.submissao_id}`)
  revalidatePath(`/painel/admin/fellows/${tentativa.fellow_id}`)
  revalidatePath('/painel/admin/veiculos')
  revalidatePath(`/painel/admin/veiculos/${tentativa.veiculo_id}`)
  revalidatePath(`/painel/admin/veiculos/${tentativa.veiculo_id}/view`)
  redirect(`/painel/admin/imprensa/${tentativa.submissao_id}?atualizado=1`)
}
