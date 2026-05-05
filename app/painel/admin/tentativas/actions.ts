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
// Aceita um contato pré-cadastrado do veículo OU os dados de um novo contato,
// que será anexado a `veiculos.contatos` e usado como responsável.
export async function registrarTentativa(formData: FormData) {
  const { supabase } = await assertAdmin()

  const submissao_id     = formData.get('submissao_id') as string
  const veiculo_id       = formData.get('veiculo_id') as string
  const enviado_em       = formData.get('enviado_em') as string
  const notas            = formData.get('notas') as string
  const doc_imprensa_url = formData.get('doc_imprensa_url') as string

  // Modo de seleção do responsável: 'existente' usa contato_existente_nome,
  // 'novo' lê os campos novo_contato_*
  const contato_modo            = (formData.get('contato_modo') as string) || 'existente'
  const contato_existente_nome  = formData.get('contato_existente_nome') as string
  const novo_contato_nome       = formData.get('novo_contato_nome') as string
  const novo_contato_funcao     = formData.get('novo_contato_funcao') as string
  const novo_contato_email      = formData.get('novo_contato_email') as string
  const novo_contato_whatsapp   = formData.get('novo_contato_whatsapp') as string

  if (!submissao_id) redirect('/painel/admin/imprensa')
  if (!veiculo_id)   redirect(`/painel/admin/imprensa/${submissao_id}?erro=tentativa`)

  // Busca fellow_id, titulo e status da submissão
  const { data: sub } = await supabase
    .from('submissoes')
    .select('fellow_id, titulo, status')
    .eq('id', submissao_id)
    .single()

  if (!sub) redirect(`/painel/admin/imprensa/${submissao_id}?erro=submissao`)

  const fellow_id   = sub.fellow_id   as string | null
  const statusAtual = sub.status      as string

  // Resolve o nome do responsável + sincroniza contatos do veículo
  let responsavel_nome: string | null = null

  if (contato_modo === 'novo' && novo_contato_nome?.trim()) {
    // Anexa o novo contato em veiculos.contatos
    const { data: veiculoAtual } = await supabase
      .from('veiculos')
      .select('contatos')
      .eq('id', veiculo_id)
      .single()

    const contatosAtuais: any[] = Array.isArray(veiculoAtual?.contatos) ? veiculoAtual!.contatos : []
    const novoContato = {
      nome:       novo_contato_nome.trim(),
      funcao:     novo_contato_funcao?.trim() || '',
      email:      novo_contato_email?.trim() || '',
      whatsapp:   novo_contato_whatsapp?.trim() || '',
      admin_id:   '',
      admin_nome: '',
      admin_foto: null,
    }

    await supabase
      .from('veiculos')
      .update({ contatos: [...contatosAtuais, novoContato] })
      .eq('id', veiculo_id)

    responsavel_nome = novoContato.nome
  } else {
    responsavel_nome = contato_existente_nome?.trim() || null
  }

  const { error } = await supabase
    .from('tentativas_placement')
    .insert({
      submissao_id,
      fellow_id,
      veiculo_id,
      responsavel_nome,
      status:           'aguardando',
      notas:            notas?.trim() || null,
      enviado_em:       enviado_em || new Date().toISOString(),
      doc_imprensa_url: doc_imprensa_url?.trim() || null,
    })

  if (error) redirect(`/painel/admin/imprensa/${submissao_id}?erro=tentativa`)

  // Avança para 'enviado_imprensa' na primeira tentativa.
  // Tentativas subsequentes NÃO sobrescrevem o veículo principal da submissão.
  if (statusAtual === 'aprovado') {
    await supabase
      .from('submissoes')
      .update({ status: 'enviado_imprensa', veiculo_id })
      .eq('id', submissao_id)
  }

  revalidatePath(`/painel/admin/imprensa/${submissao_id}`)
  revalidatePath('/painel/admin/imprensa')
  revalidatePath('/painel/admin/veiculos')
  revalidatePath(`/painel/admin/veiculos/${veiculo_id}`)
  revalidatePath(`/painel/admin/veiculos/${veiculo_id}/view`)
  if (fellow_id) revalidatePath(`/painel/admin/fellows/${fellow_id}`)
  redirect(`/painel/admin/imprensa/${submissao_id}?tentativa=1`)
}

// ─── Atualiza resultado de uma tentativa existente ───────────────────────────
export async function atualizarTentativa(formData: FormData) {
  const { supabase } = await assertAdmin()

  const tentativa_id     = formData.get('tentativa_id') as string
  const status           = formData.get('status') as string
  const motivo           = formData.get('motivo') as string
  const respondido_em    = formData.get('respondido_em') as string
  const notas            = formData.get('notas') as string
  const doc_imprensa_url = formData.get('doc_imprensa_url') as string
  const artigo_url       = formData.get('artigo_url') as string

  if (!tentativa_id) redirect('/painel/admin/imprensa')

  // Busca a tentativa para pegar submissao_id, fellow_id, veiculo_id
  const { data: tentativa } = await supabase
    .from('tentativas_placement')
    .select('submissao_id, fellow_id, veiculo_id')
    .eq('id', tentativa_id)
    .single()

  if (!tentativa) redirect('/painel/admin/imprensa')

  const submissao_id = tentativa.submissao_id as string

  // Sem status selecionado → apenas persiste doc/artigo URLs e notas
  const update: Record<string, any> = {
    doc_imprensa_url: doc_imprensa_url?.trim() || null,
    artigo_url:       artigo_url?.trim() || null,
  }

  if (status) {
    update.status        = status
    update.motivo        = motivo?.trim() || null
    update.notas         = notas?.trim() || null
    update.respondido_em = respondido_em || (status !== 'aguardando' ? new Date().toISOString() : null)
  }

  const { error } = await supabase
    .from('tentativas_placement')
    .update(update)
    .eq('id', tentativa_id)

  if (error) redirect(`/painel/admin/imprensa/${submissao_id}?erro=tentativa`)

  // Se publicado: avança a submissão e notifica o fellow.
  // O artigo_url é replicado em submissoes para manter o link no painel do fellow.
  if (status === 'publicado') {
    await supabase
      .from('submissoes')
      .update({
        status:     'publicado',
        artigo_url: artigo_url?.trim() || null,
      })
      .eq('id', submissao_id)

    const { data: sub } = await supabase
      .from('submissoes')
      .select('titulo')
      .eq('id', submissao_id)
      .single()

    if (sub && tentativa.fellow_id) {
      await supabase.from('notificacoes').insert({
        fellow_id:    tentativa.fellow_id,
        is_admin:     false,
        tipo:         'publicado',
        titulo:       'Texto publicado! 🎉',
        mensagem:     `Seu texto "${sub.titulo}" foi publicado. Parabéns!`,
        submissao_id,
      })
    }
  }

  revalidatePath(`/painel/admin/imprensa/${submissao_id}`)
  revalidatePath('/painel/admin/imprensa')
  revalidatePath('/painel/admin/veiculos')
  revalidatePath(`/painel/admin/veiculos/${tentativa.veiculo_id}`)
  revalidatePath(`/painel/admin/veiculos/${tentativa.veiculo_id}/view`)
  if (tentativa.fellow_id) revalidatePath(`/painel/admin/fellows/${tentativa.fellow_id}`)
  redirect(`/painel/admin/imprensa/${submissao_id}?atualizado=1`)
}

// ─── Exclui uma tentativa de placement ──────────────────────────────────────
export async function excluirTentativa(formData: FormData) {
  const { supabase } = await assertAdmin()

  const tentativa_id = formData.get('tentativa_id') as string
  if (!tentativa_id) redirect('/painel/admin/imprensa')

  const { data: tentativa } = await supabase
    .from('tentativas_placement')
    .select('submissao_id, fellow_id, veiculo_id')
    .eq('id', tentativa_id)
    .single()

  if (!tentativa) redirect('/painel/admin/imprensa')

  const submissao_id = tentativa.submissao_id as string

  await supabase
    .from('tentativas_placement')
    .delete()
    .eq('id', tentativa_id)

  revalidatePath(`/painel/admin/imprensa/${submissao_id}`)
  revalidatePath('/painel/admin/imprensa')
  if (tentativa.veiculo_id) {
    revalidatePath(`/painel/admin/veiculos/${tentativa.veiculo_id}`)
    revalidatePath(`/painel/admin/veiculos/${tentativa.veiculo_id}/view`)
  }
  if (tentativa.fellow_id) revalidatePath(`/painel/admin/fellows/${tentativa.fellow_id}`)
  redirect(`/painel/admin/imprensa/${submissao_id}?excluido=1`)
}
