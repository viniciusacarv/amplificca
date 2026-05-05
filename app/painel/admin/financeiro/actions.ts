'use server'
// Server actions do painel financeiro — todas verificam a whitelist e dependem da RLS.

import { createClient } from '@/lib/supabase-server'
import { canAccessFinanceiro } from '@/lib/auth-financeiro'
import { revalidatePath } from 'next/cache'

async function requireFinanceiroUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !canAccessFinanceiro(user.email)) {
    throw new Error('Acesso negado.')
  }
  return supabase
}

export async function atualizarStatusCobranca(formData: FormData) {
  const supabase = await requireFinanceiroUser()

  const id = Number(formData.get('id'))
  const status = String(formData.get('status'))
  if (!id || !['pendente', 'pago', 'inadimplente'].includes(status)) {
    throw new Error('Parâmetros inválidos.')
  }

  const update: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }
  update.data_pagamento = status === 'pago' ? new Date().toISOString().slice(0, 10) : null

  const { error } = await supabase.from('financeiro_cobrancas').update(update).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/painel/admin/financeiro')
}

export async function gerarCobrancasMes(formData: FormData) {
  const supabase = await requireFinanceiroUser()

  const mes = String(formData.get('mes')) // 'yyyy-mm'
  if (!/^\d{4}-\d{2}$/.test(mes)) throw new Error('Mês inválido.')
  const mesRef = `${mes}-01`

  const { data: fellows, error: errFellows } = await supabase
    .from('fellows')
    .select('id')
    .eq('tipo_financiamento', 'autofinanciado')

  if (errFellows) throw new Error(errFellows.message)
  if (!fellows?.length) return

  const rows = fellows.map((f) => ({
    fellow_id: f.id,
    mes_referencia: mesRef,
    valor: 300.0,
    status: 'pendente',
  }))

  const { error } = await supabase
    .from('financeiro_cobrancas')
    .upsert(rows, { onConflict: 'fellow_id,mes_referencia', ignoreDuplicates: true })

  if (error) throw new Error(error.message)

  revalidatePath('/painel/admin/financeiro')
}

export async function lancarReceitaAvulsa(formData: FormData) {
  const supabase = await requireFinanceiroUser()

  const tipo = String(formData.get('tipo'))
  const descricao = String(formData.get('descricao')).trim()
  const origem = String(formData.get('origem') ?? '').trim() || null
  const valor = Number(String(formData.get('valor')).replace(',', '.'))
  const data = String(formData.get('data'))
  const projeto = String(formData.get('projeto') ?? '').trim() || null

  if (!['doacao', 'patrocinio', 'produto', 'outro'].includes(tipo)) throw new Error('Tipo inválido.')
  if (!descricao) throw new Error('Descrição obrigatória.')
  if (!Number.isFinite(valor) || valor <= 0) throw new Error('Valor inválido.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) throw new Error('Data inválida.')

  const { error } = await supabase.from('financeiro_receitas_avulsas').insert({
    tipo, descricao, origem, valor, data, projeto,
  })
  if (error) throw new Error(error.message)

  revalidatePath('/painel/admin/financeiro')
}

export async function lancarDespesa(formData: FormData) {
  const supabase = await requireFinanceiroUser()

  const categoria = String(formData.get('categoria')).trim()
  const descricao = String(formData.get('descricao')).trim()
  const fornecedor = String(formData.get('fornecedor') ?? '').trim() || null
  const valor = Number(String(formData.get('valor')).replace(',', '.'))
  const data = String(formData.get('data'))
  const projeto = String(formData.get('projeto') ?? '').trim() || null

  if (!categoria) throw new Error('Categoria obrigatória.')
  if (!descricao) throw new Error('Descrição obrigatória.')
  if (!Number.isFinite(valor) || valor <= 0) throw new Error('Valor inválido.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) throw new Error('Data inválida.')

  const { error } = await supabase.from('financeiro_despesas').insert({
    categoria, descricao, fornecedor, valor, data, projeto,
  })
  if (error) throw new Error(error.message)

  revalidatePath('/painel/admin/financeiro')
}

export async function excluirReceitaAvulsa(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const id = Number(formData.get('id'))
  if (!id) throw new Error('Id inválido.')
  const { error } = await supabase.from('financeiro_receitas_avulsas').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/painel/admin/financeiro')
}

export async function excluirDespesa(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const id = Number(formData.get('id'))
  if (!id) throw new Error('Id inválido.')
  const { error } = await supabase.from('financeiro_despesas').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/painel/admin/financeiro')
}
