'use server'
// app/painel/imprensa/actions.ts
// Server Actions do módulo de Assessoria de Imprensa (lado do fellow)

import { createClient } from '@/lib/supabase-server'
import { isAdminUser } from '@/lib/auth-profile'
import { enviarEmailNovaSubmissao } from '@/lib/imprensa-email'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function criarSubmissao(formData: FormData) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  // Detecta se quem submete é admin ou fellow
  const isAdmin = await isAdminUser(supabase, user.email)

  let fellowId: string | number | null = null
  let autorAdminId: string | number | null = null
  let autorNome = ''

  if (isAdmin) {
    const { data: adminRecord } = await supabase
      .from('admins')
      .select('id, nome, email')
      .eq('email', user.email)
      .maybeSingle()

    if (!adminRecord) {
      return { error: 'Admin não encontrado na tabela admins.' }
    }

    autorAdminId = adminRecord.id
    autorNome = adminRecord.nome ?? adminRecord.email ?? 'Admin'
  } else {
    const { data: fellow } = await supabase
      .from('fellows')
      .select('id, nome')
      .eq('email', user.email)
      .maybeSingle()

    if (!fellow) {
      return { error: 'Perfil de fellow não encontrado. Contacte o administrador.' }
    }

    fellowId = fellow.id
    autorNome = fellow.nome
  }

  const titulo = formData.get('titulo') as string
  const tipo = formData.get('tipo') as string
  const google_doc_url = formData.get('google_doc_url') as string
  const tagIds = formData.getAll('tag_ids')
    .map((v) => String(v).trim())
    .filter(Boolean)

  if (!titulo?.trim() || !tipo) {
    return { error: 'Preencha todos os campos obrigatórios.' }
  }

  if (tagIds.length === 0) {
    return { error: 'Selecione ao menos um tema.' }
  }

  // Payload base — só inclui autor_admin_id quando há admin autor,
  // para não quebrar em ambientes onde a migration ainda não foi aplicada.
  const insertPayload: Record<string, unknown> = {
    fellow_id: fellowId,
    titulo: titulo.trim(),
    tipo,
    google_doc_url: google_doc_url?.trim() || null,
    status: 'recebido',
  }
  if (autorAdminId !== null) {
    insertPayload.autor_admin_id = autorAdminId
  }

  // Cria a submissão
  const { data: submissao, error } = await supabase
    .from('submissoes')
    .insert(insertPayload)
    .select('id')
    .single()

  if (error) {
    console.error('Erro ao criar submissão:', error)
    if (isAdmin && /autor_admin_id/i.test(error.message)) {
      return {
        error:
          'A migration supabase-imprensa-tags.sql ainda não foi aplicada no Supabase. Sem ela, admins não conseguem submeter textos.',
      }
    }
    return { error: 'Erro ao enviar submissão. Tente novamente.' }
  }

  // Salva as tags associadas
  if (tagIds.length > 0) {
    const tagRows = tagIds.map((tagId) => ({
      submissao_id: submissao.id,
      tag_id: Number.isFinite(Number(tagId)) ? Number(tagId) : tagId,
    }))
    const { error: tagsError } = await supabase.from('submissao_tags').insert(tagRows)
    if (tagsError) {
      console.error('Erro ao salvar tags da submissão:', tagsError)
    }
  }

  // Notificação para admins (somente quando o autor é fellow — admin submetendo não precisa notificar a si mesmo)
  if (!isAdmin) {
    await supabase.from('notificacoes').insert({
      fellow_id: null,
      is_admin: true,
      tipo: 'nova_submissao',
      titulo: `Nova submissão: ${titulo.trim()}`,
      mensagem: `${autorNome} enviou um ${tipo === 'artigo' ? 'artigo' : 'pitch'} para avaliação.`,
      submissao_id: submissao.id,
    })

    try {
      await enviarEmailNovaSubmissao({
        submissaoId: submissao.id,
        fellowNome: autorNome,
        titulo: titulo.trim(),
        tipo,
        googleDocUrl: google_doc_url?.trim() || null,
      })
    } catch (emailError) {
      console.error('Erro ao enviar e-mail de nova submissão:', emailError)
    }
  }

  revalidatePath('/painel/imprensa')
  revalidatePath('/painel/admin/imprensa')
  redirect(isAdmin ? `/painel/admin/imprensa/${submissao.id}` : '/painel/imprensa')
}

export async function retirarSubmissao(formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  const { data: fellow } = await supabase
    .from('fellows')
    .select('id, nome')
    .eq('email', user.email)
    .maybeSingle()

  if (!fellow) {
    return { error: 'Perfil de fellow não encontrado. Contacte o administrador.' }
  }

  const submissaoId = formData.get('submissao_id') as string
  if (!submissaoId) {
    return { error: 'Submissão inválida.' }
  }

  const { data: submissao } = await supabase
    .from('submissoes')
    .select('id, titulo, fellow_id, status')
    .eq('id', submissaoId)
    .eq('fellow_id', fellow.id)
    .single()

  if (!submissao) {
    return { error: 'Submissão não encontrada.' }
  }

  if (['aprovado', 'enviado_imprensa', 'publicado', 'rejeitado', 'retirado_fellow'].includes(submissao.status)) {
    return { error: 'Esta submissão não pode mais ser retirada.' }
  }

  const { error } = await supabase
    .from('submissoes')
    .update({
      status: 'retirado_fellow',
    })
    .eq('id', submissaoId)
    .eq('fellow_id', fellow.id)

  if (error) {
    return { error: 'Erro ao retirar submissão. Tente novamente.' }
  }

  await supabase.from('notificacoes').insert({
    fellow_id: null,
    is_admin: true,
    tipo: 'retirado_fellow',
    titulo: 'Submissão retirada pelo fellow',
    mensagem: `${fellow.nome} retirou a submissão "${submissao.titulo}".`,
    submissao_id: submissaoId,
  })

  revalidatePath('/painel/imprensa')
  revalidatePath('/painel/admin/imprensa')
  revalidatePath(`/painel/admin/imprensa/${submissaoId}`)
  revalidatePath('/painel/admin/notificacoes')
  revalidatePath('/painel/admin/fellows')
  revalidatePath(`/painel/admin/fellows/${fellow.id}`)

  redirect('/painel/imprensa?retirada=1')
}

export async function marcarNotificacaoLida(notificacaoId: string) {
  const supabase = createClient()
  await supabase
    .from('notificacoes')
    .update({ lida: true })
    .eq('id', notificacaoId)
}

export async function marcarTodasLidas() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: fellow } = await supabase
    .from('fellows')
    .select('id')
    .eq('email', user.email)
    .maybeSingle()

  if (!fellow) return

  await supabase
    .from('notificacoes')
    .update({ lida: true })
    .eq('fellow_id', fellow.id)
    .eq('is_admin', false)
}
