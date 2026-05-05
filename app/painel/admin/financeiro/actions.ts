'use server'
// Server actions do painel financeiro. Tudo passa por requireFinanceiroUser + RLS.

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

function bumpAll() {
  revalidatePath('/painel/admin/financeiro')
  revalidatePath('/painel/admin/financeiro/custos')
  revalidatePath('/painel/admin/financeiro/turmas')
  revalidatePath('/painel/admin/financeiro/configuracoes')
}

// ----- Cobranças -----

export async function atualizarStatusCobranca(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const id = Number(formData.get('id'))
  const status = String(formData.get('status'))
  if (!id || !['pendente', 'pago', 'inadimplente'].includes(status)) throw new Error('Parâmetros inválidos.')

  const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() }
  update.data_pagamento = status === 'pago' ? new Date().toISOString().slice(0, 10) : null

  const { error } = await supabase.from('financeiro_cobrancas').update(update).eq('id', id)
  if (error) throw new Error(error.message)
  bumpAll()
}

export async function gerarCobrancasMes(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const mes = String(formData.get('mes'))
  if (!/^\d{4}-\d{2}$/.test(mes)) throw new Error('Mês inválido.')
  const mesRef = `${mes}-01`

  const { data: fellows, error: errFellows } = await supabase
    .from('fellows')
    .select('id')
    .eq('tipo_financiamento', 'autofinanciado')
    .eq('contrato_ativo', true)

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
  bumpAll()
}

export async function editarCobranca(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const id = Number(formData.get('id'))
  const valor = Number(String(formData.get('valor')).replace(',', '.'))
  const observacao = String(formData.get('observacao') ?? '').trim() || null
  if (!id || !Number.isFinite(valor) || valor <= 0) throw new Error('Parâmetros inválidos.')
  const { error } = await supabase.from('financeiro_cobrancas').update({ valor, observacao, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  bumpAll()
}

export async function excluirCobranca(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const id = Number(formData.get('id'))
  if (!id) throw new Error('Id inválido.')
  const { error } = await supabase.from('financeiro_cobrancas').delete().eq('id', id)
  if (error) throw new Error(error.message)
  bumpAll()
}

// ----- Receitas avulsas -----

export async function lancarReceitaAvulsa(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const tipo = String(formData.get('tipo'))
  const descricao = String(formData.get('descricao')).trim()
  const origem = String(formData.get('origem') ?? '').trim() || null
  const valor = Number(String(formData.get('valor')).replace(',', '.'))
  const data = String(formData.get('data'))
  const projeto = String(formData.get('projeto') ?? '').trim() || null
  const categoria_id = formData.get('categoria_id') ? Number(formData.get('categoria_id')) : null

  if (!['doacao', 'patrocinio', 'produto', 'outro'].includes(tipo)) throw new Error('Tipo inválido.')
  if (!descricao) throw new Error('Descrição obrigatória.')
  if (!Number.isFinite(valor) || valor <= 0) throw new Error('Valor inválido.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) throw new Error('Data inválida.')

  const { error } = await supabase.from('financeiro_receitas_avulsas').insert({ tipo, descricao, origem, valor, data, projeto, categoria_id })
  if (error) throw new Error(error.message)
  bumpAll()
}

export async function editarReceitaAvulsa(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const id = Number(formData.get('id'))
  const tipo = String(formData.get('tipo'))
  const descricao = String(formData.get('descricao')).trim()
  const origem = String(formData.get('origem') ?? '').trim() || null
  const valor = Number(String(formData.get('valor')).replace(',', '.'))
  const data = String(formData.get('data'))
  const projeto = String(formData.get('projeto') ?? '').trim() || null
  const categoria_id = formData.get('categoria_id') ? Number(formData.get('categoria_id')) : null

  if (!id) throw new Error('Id inválido.')
  if (!['doacao', 'patrocinio', 'produto', 'outro'].includes(tipo)) throw new Error('Tipo inválido.')
  if (!descricao) throw new Error('Descrição obrigatória.')
  if (!Number.isFinite(valor) || valor <= 0) throw new Error('Valor inválido.')

  const { error } = await supabase.from('financeiro_receitas_avulsas').update({ tipo, descricao, origem, valor, data, projeto, categoria_id }).eq('id', id)
  if (error) throw new Error(error.message)
  bumpAll()
}

export async function excluirReceitaAvulsa(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const id = Number(formData.get('id'))
  if (!id) throw new Error('Id inválido.')
  const { error } = await supabase.from('financeiro_receitas_avulsas').delete().eq('id', id)
  if (error) throw new Error(error.message)
  bumpAll()
}

// ----- Despesas -----

export async function lancarDespesa(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const categoria = String(formData.get('categoria')).trim()
  const descricao = String(formData.get('descricao')).trim()
  const fornecedor = String(formData.get('fornecedor') ?? '').trim() || null
  const valor = Number(String(formData.get('valor')).replace(',', '.'))
  const data = String(formData.get('data'))
  const projeto = String(formData.get('projeto') ?? '').trim() || null
  const categoria_id = formData.get('categoria_id') ? Number(formData.get('categoria_id')) : null

  if (!categoria) throw new Error('Categoria obrigatória.')
  if (!descricao) throw new Error('Descrição obrigatória.')
  if (!Number.isFinite(valor) || valor <= 0) throw new Error('Valor inválido.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) throw new Error('Data inválida.')

  const { error } = await supabase.from('financeiro_despesas').insert({ categoria, descricao, fornecedor, valor, data, projeto, categoria_id })
  if (error) throw new Error(error.message)
  bumpAll()
}

export async function editarDespesa(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const id = Number(formData.get('id'))
  const categoria = String(formData.get('categoria')).trim()
  const descricao = String(formData.get('descricao')).trim()
  const fornecedor = String(formData.get('fornecedor') ?? '').trim() || null
  const valor = Number(String(formData.get('valor')).replace(',', '.'))
  const data = String(formData.get('data'))
  const projeto = String(formData.get('projeto') ?? '').trim() || null
  const categoria_id = formData.get('categoria_id') ? Number(formData.get('categoria_id')) : null

  if (!id) throw new Error('Id inválido.')
  if (!categoria) throw new Error('Categoria obrigatória.')
  if (!descricao) throw new Error('Descrição obrigatória.')
  if (!Number.isFinite(valor) || valor <= 0) throw new Error('Valor inválido.')

  const { error } = await supabase.from('financeiro_despesas').update({ categoria, descricao, fornecedor, valor, data, projeto, categoria_id }).eq('id', id)
  if (error) throw new Error(error.message)
  bumpAll()
}

export async function excluirDespesa(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const id = Number(formData.get('id'))
  if (!id) throw new Error('Id inválido.')
  const { error } = await supabase.from('financeiro_despesas').delete().eq('id', id)
  if (error) throw new Error(error.message)
  bumpAll()
}

// ----- Turmas -----

export async function criarTurma(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const nome = String(formData.get('nome')).trim()
  const data_inicio = String(formData.get('data_inicio'))
  const data_fim = String(formData.get('data_fim'))
  const descricao = String(formData.get('descricao') ?? '').trim() || null
  if (!nome || !data_inicio || !data_fim) throw new Error('Campos obrigatórios em falta.')
  const { error } = await supabase.from('turmas').insert({ nome, data_inicio, data_fim, descricao })
  if (error) throw new Error(error.message)
  bumpAll()
}

export async function editarTurma(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const id = Number(formData.get('id'))
  const nome = String(formData.get('nome')).trim()
  const data_inicio = String(formData.get('data_inicio'))
  const data_fim = String(formData.get('data_fim'))
  const descricao = String(formData.get('descricao') ?? '').trim() || null
  if (!id || !nome) throw new Error('Parâmetros inválidos.')
  const { error } = await supabase.from('turmas').update({ nome, data_inicio, data_fim, descricao }).eq('id', id)
  if (error) throw new Error(error.message)
  bumpAll()
}

export async function excluirTurma(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const id = Number(formData.get('id'))
  if (!id) throw new Error('Id inválido.')
  const { error } = await supabase.from('turmas').delete().eq('id', id)
  if (error) throw new Error(error.message)
  bumpAll()
}

export async function atribuirTurma(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const fellow_id = Number(formData.get('fellow_id'))
  const turma_id = formData.get('turma_id') ? Number(formData.get('turma_id')) : null
  if (!fellow_id) throw new Error('Fellow inválido.')
  const { error } = await supabase.from('fellows').update({ turma_id }).eq('id', fellow_id)
  if (error) throw new Error(error.message)
  bumpAll()
}

// ----- Contrato -----

export async function encerrarContrato(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const fellow_id = Number(formData.get('fellow_id'))
  if (!fellow_id) throw new Error('Fellow inválido.')
  const { error } = await supabase.from('fellows')
    .update({ contrato_ativo: false, contrato_encerrado_em: new Date().toISOString().slice(0, 10) })
    .eq('id', fellow_id)
  if (error) throw new Error(error.message)
  bumpAll()
}

export async function reativarContrato(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const fellow_id = Number(formData.get('fellow_id'))
  if (!fellow_id) throw new Error('Fellow inválido.')
  const { error } = await supabase.from('fellows')
    .update({ contrato_ativo: true, contrato_encerrado_em: null })
    .eq('id', fellow_id)
  if (error) throw new Error(error.message)
  bumpAll()
}

export async function atualizarWhatsappFellow(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const fellow_id = Number(formData.get('fellow_id'))
  const whatsapp = String(formData.get('whatsapp') ?? '').replace(/\D/g, '') || null
  if (!fellow_id) throw new Error('Fellow inválido.')
  const { error } = await supabase.from('fellows').update({ whatsapp }).eq('id', fellow_id)
  if (error) throw new Error(error.message)
  bumpAll()
}

// ----- Configurações -----

export async function salvarConfig(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const pix_chave = String(formData.get('pix_chave') ?? '').trim() || null
  const pix_tipo = String(formData.get('pix_tipo') ?? '').trim() || null
  const beneficiario = String(formData.get('beneficiario') ?? '').trim() || null
  const banco = String(formData.get('banco') ?? '').trim() || null
  const prazo_dia = Number(formData.get('prazo_dia') ?? 10)
  const instrucoes = String(formData.get('instrucoes') ?? '').trim() || null
  const whatsapp_template = String(formData.get('whatsapp_template') ?? '').trim() || null

  const { error } = await supabase.from('financeiro_config').upsert({
    id: 1,
    pix_chave,
    pix_tipo,
    beneficiario,
    banco,
    prazo_dia,
    instrucoes,
    whatsapp_template,
  })
  if (error) throw new Error(error.message)
  bumpAll()
}

// ----- Categorias -----

export async function criarCategoria(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const nome = String(formData.get('nome')).trim()
  const tipo = String(formData.get('tipo'))
  const cor = String(formData.get('cor') ?? '#64748b')
  if (!nome || !['receita', 'despesa'].includes(tipo)) throw new Error('Parâmetros inválidos.')
  const { error } = await supabase.from('financeiro_categorias').insert({ nome, tipo, cor })
  if (error) throw new Error(error.message)
  bumpAll()
}

export async function excluirCategoria(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const id = Number(formData.get('id'))
  if (!id) throw new Error('Id inválido.')
  const { error } = await supabase.from('financeiro_categorias').delete().eq('id', id)
  if (error) throw new Error(error.message)
  bumpAll()
}
