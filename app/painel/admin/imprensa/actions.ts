'use server'
// app/painel/admin/imprensa/actions.ts
// Server Actions do painel admin — gestão de submissões e veículos

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// Helper: verifica admin pelo mesmo padrão do layout (env var)
async function assertAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  const adminEmails = (process.env.ADMIN_EMAIL ?? 'anne@institutoamplifica.com')
    .split(',')
    .map((e) => e.trim())

  if (!adminEmails.includes(user.email ?? '')) redirect('/painel/dashboard')

  return { supabase, user }
}

// Atualiza status + feedback + veículo e notifica o fellow
export async function atualizarSubmissao(formData: FormData) {
  const { supabase } = await assertAdmin()

  const submissaoId = formData.get('submissao_id') as string
  const status      = formData.get('status') as string
  const feedback    = formData.get('feedback') as string
  const veiculo_id  = formData.get('veiculo_id') as string || null
  const artigo_url  = formData.get('artigo_url') as string || null

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
      feedback:    feedback?.trim() || null,
      veiculo_id:  veiculo_id || null,
      artigo_url:  artigo_url?.trim() || null,
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
  redirect(`/painel/admin/imprensa/${submissaoId}?sucesso=1`)
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

// Salva um veículo (novo ou edição)
export async function salvarVeiculo(formData: FormData) {
  const { supabase } = await assertAdmin()

  const id                  = formData.get('id') as string | null
  const nome                = formData.get('nome') as string
  const website             = formData.get('website') as string
  const tipo_relacionamento = formData.get('tipo_relacionamento') as string
  const contato_nome        = formData.get('contato_nome') as string
  const contato_email       = formData.get('contato_email') as string
  const contato_whatsapp    = formData.get('contato_whatsapp') as string
  const notas_abordagem     = formData.get('notas_abordagem') as string
  const area_cobertura      = formData.get('area_cobertura') as string

  const payload = {
    nome:                 nome.trim(),
    website:              website?.trim() || null,
    tipo_relacionamento,
    contato_nome:         contato_nome?.trim() || null,
    contato_email:        contato_email?.trim() || null,
    contato_whatsapp:     contato_whatsapp?.trim() || null,
    notas_abordagem:      notas_abordagem?.trim() || null,
    area_cobertura:       area_cobertura?.trim() || null,
  }

  if (id) {
    await supabase.from('veiculos').update(payload).eq('id', id)
  } else {
    await supabase.from('veiculos').insert(payload)
  }

  revalidatePath('/painel/admin/veiculos')
  redirect('/painel/admin/veiculos?sucesso=1')
}
