'use server'
// app/painel/admin/imprensa/actions.ts
// Server Actions do painel admin — gestão de submissões e veículos

import { createClient } from '@/lib/supabase-server'
import { isAdminUser } from '@/lib/auth-profile'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// Helper: verifica admin pelo mesmo padrão do layout (env var)
async function assertAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  const isAdmin = await isAdminUser(supabase, user.email)
  if (!isAdmin) redirect('/painel/dashboard')

  return { supabase, user }
}

// Atualiza status + veículo e notifica o fellow
// (feedback agora flui via Google Docs; doc_imprensa_url e artigo_url
// vivem por tentativa de placement)
export async function atualizarSubmissao(formData: FormData) {
  const { supabase } = await assertAdmin()

  const submissaoId   = formData.get('submissao_id') as string
  const nextStatus    = formData.get('next_status') as string | null
  const currentStatus = formData.get('status') as string | null
  const status        = (nextStatus || currentStatus || '').trim()
  const veiculo_id    = formData.get('veiculo_id') as string || null

  if (!status) return { error: 'Status inválido.' }

  // Busca a submissão para obter fellow_id e titulo
  const { data: submissao } = await supabase
    .from('submissoes')
    .select('fellow_id, titulo')
    .eq('id', submissaoId)
    .single()

  if (!submissao) return { error: 'Submissão não encontrada.' }

  // Atualiza a submissão
  const { error } = await supabase
    .from('submissoes')
    .update({
      status,
      veiculo_id: veiculo_id || null,
    })
    .eq('id', submissaoId)

  if (error) return { error: 'Erro ao atualizar submissão.' }

  // Notificações por status
  const NOTIF_MAP: Record<string, { titulo: string; mensagem: string }> = {
    em_avaliacao:        { titulo: 'Texto em avaliação',      mensagem: `Seu texto "${submissao.titulo}" está sendo avaliado pela Sara.`                           },
    ajustes_solicitados: { titulo: 'Ajustes solicitados',     mensagem: `Seu texto "${submissao.titulo}" precisa de ajustes. Veja o feedback no painel.`           },
    aprovado:            { titulo: 'Texto aprovado! ✅',       mensagem: `Seu texto "${submissao.titulo}" foi aprovado e será enviado à imprensa em breve.`         },
    enviado_imprensa:    { titulo: 'Enviado à imprensa 📤',   mensagem: `Seu texto "${submissao.titulo}" foi enviado a um veículo de imprensa.`                    },
    publicado:           { titulo: 'Texto publicado! 🎉',      mensagem: `Seu texto "${submissao.titulo}" foi publicado. Parabéns!`                                 },
    rejeitado:           { titulo: 'Retorno sobre seu texto', mensagem: `A Sara deixou um feedback sobre "${submissao.titulo}". Confira no painel.`                },
  }

  const notif = NOTIF_MAP[status]
  if (notif && submissao.fellow_id) {
    await supabase.from('notificacoes').insert({
      fellow_id:    submissao.fellow_id,
      is_admin:     false,
      tipo:         status,
      titulo:       notif.titulo,
      mensagem:     notif.mensagem,
      submissao_id: submissaoId,
    })
  }

  revalidatePath('/painel/admin/imprensa')
  revalidatePath(`/painel/admin/imprensa/${submissaoId}`)
  revalidatePath('/painel/imprensa')
  revalidatePath('/painel/notificacoes')
  revalidatePath('/painel/admin/notificacoes')
  redirect(`/painel/admin/imprensa/${submissaoId}?sucesso=1`)
}

// Arquiva uma submissão administrativamente (ex.: inadimplência do fellow).
// Diferente de 'retirado_fellow', esta ação é exclusiva do admin e exige
// justificativa, gravada em submissoes.motivo_arquivamento.
export async function arquivarSubmissao(formData: FormData) {
  const { supabase } = await assertAdmin()

  const submissaoId = formData.get('submissao_id') as string
  const motivo      = (formData.get('motivo_arquivamento') as string | null)?.trim() ?? ''

  if (!submissaoId) return { error: 'Submissão inválida.' }
  if (!motivo) {
    redirect(`/painel/admin/imprensa/${submissaoId}?erro=motivo_obrigatorio`)
  }

  const { data: submissao } = await supabase
    .from('submissoes')
    .select('fellow_id, titulo')
    .eq('id', submissaoId)
    .single()

  if (!submissao) {
    redirect(`/painel/admin/imprensa/${submissaoId}?erro=submissao`)
  }

  const { error } = await supabase
    .from('submissoes')
    .update({ status: 'arquivado', motivo_arquivamento: motivo })
    .eq('id', submissaoId)

  if (error) {
    console.error('Erro ao arquivar submissão:', error)
    const detalhe = encodeURIComponent(error.message || 'desconhecido')
    redirect(`/painel/admin/imprensa/${submissaoId}?erro=arquivar&detalhe=${detalhe}`)
  }

  if (submissao.fellow_id) {
    await supabase.from('notificacoes').insert({
      fellow_id:    submissao.fellow_id,
      is_admin:     false,
      tipo:         'arquivado',
      titulo:       'Submissão arquivada',
      mensagem:     `Sua submissão "${submissao.titulo}" foi arquivada pela administração. Motivo: ${motivo}`,
      submissao_id: submissaoId,
    })
  }

  revalidatePath('/painel/admin/imprensa')
  revalidatePath(`/painel/admin/imprensa/${submissaoId}`)
  revalidatePath('/painel/imprensa')
  revalidatePath('/painel/notificacoes')
  redirect(`/painel/admin/imprensa/${submissaoId}?arquivado=1`)
}

// Marca todas as notificações de admin como lidas
export async function marcarNotificacoesAdminLidas() {
  const { supabase } = await assertAdmin()

  await supabase
    .from('notificacoes')
    .update({ lida: true })
    .eq('is_admin', true)

  revalidatePath('/painel/admin/notificacoes')
}

// Exclui um veículo (soft delete: ativo = false)
export async function excluirVeiculo(formData: FormData) {
  const { supabase } = await assertAdmin()

  const id = formData.get('id') as string
  if (!id) return { error: 'ID inválido.' }

  await supabase.from('veiculos').update({ ativo: false }).eq('id', id)

  revalidatePath('/painel/admin/veiculos')
  redirect('/painel/admin/veiculos')
}

// Salva um veículo (novo ou edição)
export async function salvarVeiculo(formData: FormData) {
  const { supabase } = await assertAdmin()

  const id                     = formData.get('id') as string | null
  const nome                   = formData.get('nome') as string
  const website                = formData.get('website') as string
  const tipo_relacionamento    = formData.get('tipo_relacionamento') as string
  const notas_abordagem        = formData.get('notas_abordagem') as string
  const area_cobertura         = formData.get('area_cobertura') as string
  const estrategia_aproximacao = formData.get('estrategia_aproximacao') as string
  const proximos_passos        = formData.get('proximos_passos') as string
  const tagIds                 = formData.getAll('tag_ids')
    .map((v) => String(v).trim())
    .filter(Boolean)
  const contatosRaw            = formData.get('contatos') as string | null

  let contatos: object[] = []
  try {
    if (contatosRaw) contatos = JSON.parse(contatosRaw)
  } catch { /* mantém array vazio */ }

  const payload = {
    nome:                    nome.trim(),
    website:                 website?.trim() || null,
    tipo_relacionamento,
    notas_abordagem:         notas_abordagem?.trim() || null,
    area_cobertura:          area_cobertura?.trim() || null,
    estrategia_aproximacao:  estrategia_aproximacao?.trim() || null,
    proximos_passos:         proximos_passos?.trim() || null,
    contatos,
    // Mantém o array legado em sincronia com a tabela relacional veiculo_tags
    // até que todos os consumidores migrem para a junção.
    tags:                    [],
  }

  let veiculoId: string | number | null = id

  if (id) {
    await supabase.from('veiculos').update(payload).eq('id', id)
  } else {
    const { data: novo } = await supabase
      .from('veiculos')
      .insert(payload)
      .select('id')
      .single()
    veiculoId = novo?.id ?? null
  }

  // Sincroniza tags relacionais (veiculo_tags)
  if (veiculoId) {
    await supabase.from('veiculo_tags').delete().eq('veiculo_id', veiculoId)
    if (tagIds.length > 0) {
      const rows = tagIds.map((tagId) => ({
        veiculo_id: veiculoId,
        tag_id: Number.isFinite(Number(tagId)) ? Number(tagId) : tagId,
      }))
      await supabase.from('veiculo_tags').insert(rows)
    }
  }

  revalidatePath('/painel/admin/veiculos')
  redirect('/painel/admin/veiculos?sucesso=1')
}
