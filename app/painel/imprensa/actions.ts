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

  // Política de autoria: quem tem cadastro de fellow submete SEMPRE como fellow
  // (mesmo sendo admin — duplo papel). Só admin puro (sem cadastro de fellow) submete como equipe.
  const isAdmin = await isAdminUser(supabase, user.email)

  let fellowId: string | number | null = null
  let autorAdminId: string | number | null = null
  let autorNome = ''

  const { data: fellow } = await supabase
    .from('fellows')
    .select('id, nome')
    .eq('email', user.email)
    .maybeSingle()

  if (fellow) {
    // Fellow (puro ou com duplo papel de admin): conta como submissão de fellow.
    fellowId = fellow.id
    autorNome = fellow.nome
  } else if (isAdmin) {
    // Admin puro, sem cadastro de fellow (ex.: Sara): submete em nome da equipe.
    const { data: adminRecord } = await supabase
      .from('admins')
      .select('id, nome, email')
      .eq('email', user.email)
      .maybeSingle()

    if (!adminRecord) {
      redirect('/painel/imprensa?erro=admin_nao_encontrado')
    }

    autorAdminId = adminRecord.id
    autorNome = adminRecord.nome ?? adminRecord.email ?? 'Admin'
  } else {
    redirect('/painel/imprensa?erro=fellow_nao_encontrado')
  }

  // Submissão é "de fellow" sempre que houver fellowId (inclui o duplo papel).
  const submeteComoFellow = fellowId !== null

  const titulo = formData.get('titulo') as string
  const tipo = formData.get('tipo') as string
  const google_doc_url = formData.get('google_doc_url') as string
  const tagIds = formData.getAll('tag_ids')
    .map((v) => String(v).trim())
    .filter(Boolean)

  if (!titulo?.trim() || !tipo) {
    redirect('/painel/imprensa?erro=campos_obrigatorios')
  }

  if (tagIds.length === 0) {
    redirect('/painel/imprensa?erro=tema_obrigatorio')
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
    if (autorAdminId !== null && /autor_admin_id/i.test(error.message)) {
      redirect('/painel/imprensa?erro=migration_pendente')
    }
    redirect('/painel/imprensa?erro=enviar_submissao')
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

  // Notificação para admins (somente quando a submissão é de fellow — inclui duplo papel;
  // admin puro submetendo em nome da equipe não precisa notificar a si mesmo)
  if (submeteComoFellow) {
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
  redirect(submeteComoFellow ? '/painel/imprensa' : `/painel/admin/imprensa/${submissao.id}`)
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
    redirect('/painel/imprensa?erro=fellow_nao_encontrado')
  }

  const submissaoId = formData.get('submissao_id') as string
  if (!submissaoId) {
    redirect('/painel/imprensa?erro=submissao_invalida')
  }

  const { data: submissao } = await supabase
    .from('submissoes')
    .select('id, titulo, fellow_id, status')
    .eq('id', submissaoId)
    .eq('fellow_id', fellow.id)
    .single()

  if (!submissao) {
    redirect('/painel/imprensa?erro=submissao_nao_encontrada')
  }

  if (['aprovado', 'enviado_imprensa', 'publicado', 'rejeitado', 'retirado_fellow'].includes(submissao.status)) {
    redirect(`/painel/imprensa?erro=nao_pode_retirar`)
  }

  const { error } = await supabase
    .from('submissoes')
    .update({
      status: 'retirado_fellow',
    })
    .eq('id', submissaoId)
    .eq('fellow_id', fellow.id)

  if (error) {
    redirect('/painel/imprensa?erro=retirar')
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
