'use server'
// app/painel/imprensa/actions.ts
// Server Actions do módulo de Assessoria de Imprensa (lado do fellow)

import { createClient } from '@/lib/supabase-server'
import { enviarEmailNovaSubmissao } from '@/lib/imprensa-email'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function criarSubmissao(formData: FormData) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  // Busca o fellow pelo email autenticado
  const { data: fellow } = await supabase
    .from('fellows')
    .select('id, nome')
    .eq('email', user.email)
    .maybeSingle()

  if (!fellow) {
    return { error: 'Perfil de fellow não encontrado. Contacte o administrador.' }
  }

  const titulo = formData.get('titulo') as string
  const tipo = formData.get('tipo') as string
  const google_doc_url = formData.get('google_doc_url') as string

  if (!titulo?.trim() || !tipo) {
    return { error: 'Preencha todos os campos obrigatórios.' }
  }

  // Cria a submissão
  const { data: submissao, error } = await supabase
    .from('submissoes')
    .insert({
      fellow_id: fellow.id,
      titulo: titulo.trim(),
      tipo,
      google_doc_url: google_doc_url?.trim() || null,
      status: 'recebido',
    })
    .select('id')
    .single()

  if (error) {
    return { error: 'Erro ao enviar submissão. Tente novamente.' }
  }

  // Cria notificação para o admin
  await supabase.from('notificacoes').insert({
    fellow_id: null,
    is_admin: true,
    tipo: 'nova_submissao',
    titulo: `Nova submissão: ${titulo.trim()}`,
    mensagem: `${fellow.nome} enviou um ${tipo === 'artigo' ? 'artigo' : 'pitch'} para avaliação.`,
    submissao_id: submissao.id,
  })

  try {
    await enviarEmailNovaSubmissao({
      submissaoId: submissao.id,
      fellowNome: fellow.nome,
      titulo: titulo.trim(),
      tipo,
      googleDocUrl: google_doc_url?.trim() || null,
    })
  } catch (emailError) {
    console.error('Erro ao enviar e-mail de nova submissão:', emailError)
  }

  redirect('/painel/imprensa')
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

  if (['publicado', 'rejeitado', 'retirado_fellow'].includes(submissao.status)) {
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
