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
  revalidatePath('/painel/admin/financeiro/fornecedores')
  revalidatePath('/painel/admin/financeiro/time')
  revalidatePath('/painel/admin/financeiro/produtos')
}

// Tipo de retorno padrão para forms com feedback (useFormState).
export type ActionResult = { ok: boolean; message?: string }

async function safeRun(fn: () => Promise<void>): Promise<ActionResult> {
  try {
    await fn()
    return { ok: true, message: 'Salvo com sucesso.' }
  } catch (e: any) {
    return { ok: false, message: e?.message ?? 'Erro inesperado.' }
  }
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

// ----- Wrappers com feedback (useFormState) para as actions que retornavam void -----

export const lancarReceitaAvulsaFb = async (_p: ActionResult | undefined, fd: FormData) => safeRun(() => lancarReceitaAvulsa(fd))
export const editarReceitaAvulsaFb = async (_p: ActionResult | undefined, fd: FormData) => safeRun(() => editarReceitaAvulsa(fd))
export const lancarDespesaFb       = async (_p: ActionResult | undefined, fd: FormData) => safeRun(() => lancarDespesa(fd))
export const editarDespesaFb       = async (_p: ActionResult | undefined, fd: FormData) => safeRun(() => editarDespesa(fd))
export const editarCobrancaFb      = async (_p: ActionResult | undefined, fd: FormData) => safeRun(() => editarCobranca(fd))
export const salvarConfigFb        = async (_p: ActionResult | undefined, fd: FormData) => safeRun(() => salvarConfig(fd))
export const atualizarWhatsappFellowFb = async (_p: ActionResult | undefined, fd: FormData) => safeRun(() => atualizarWhatsappFellow(fd))

// ----- Editar fellow (modo edição na página de turmas) -----

export async function editarFellow(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  return safeRun(async () => {
    const supabase = await requireFinanceiroUser()
    const id = Number(formData.get('id'))
    if (!id) throw new Error('Fellow inválido.')

    const tipo = String(formData.get('tipo_financiamento') ?? '').trim() || null
    const bolsa = String(formData.get('bolsa_origem') ?? '').trim() || null
    const turma_id = formData.get('turma_id') ? Number(formData.get('turma_id')) : null
    const whatsapp = String(formData.get('whatsapp') ?? '').replace(/\D/g, '') || null
    const email = String(formData.get('email') ?? '').trim() || null
    const nome = String(formData.get('nome') ?? '').trim()

    if (!nome) throw new Error('Nome obrigatório.')
    if (tipo && !['autofinanciado', 'bolsista'].includes(tipo)) throw new Error('Tipo de financiamento inválido.')

    const { error } = await supabase.from('fellows').update({
      nome,
      email,
      whatsapp,
      tipo_financiamento: tipo,
      bolsa_origem: tipo === 'bolsista' ? bolsa : null,
      turma_id,
    }).eq('id', id)

    if (error) throw new Error(error.message)
    bumpAll()
  })
}

// ----- Importar fellows via CSV -----

export async function importarFellowsCsv(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  return safeRun(async () => {
    const supabase = await requireFinanceiroUser()
    const csv = String(formData.get('csv') ?? '').trim()
    if (!csv) throw new Error('CSV vazio.')

    const linhas = csv.split(/\r?\n/).filter(Boolean)
    if (linhas.length < 2) throw new Error('CSV precisa ter cabeçalho e ao menos uma linha.')

    const sep = linhas[0].includes(';') ? ';' : ','
    const headers = linhas[0].split(sep).map((h) => h.trim().toLowerCase())
    const required = ['nome', 'email', 'tipo_financiamento']
    for (const r of required) if (!headers.includes(r)) throw new Error(`Coluna obrigatória ausente: ${r}`)

    const idx = (h: string) => headers.indexOf(h)
    const turmasNomes = new Map<string, number>()
    const { data: turmasExistentes } = await supabase.from('turmas').select('id, nome')
    turmasExistentes?.forEach((t: any) => turmasNomes.set(t.nome.toLowerCase(), t.id))

    const rows: any[] = []
    let inseridos = 0
    let atualizados = 0

    for (let i = 1; i < linhas.length; i++) {
      const cols = linhas[i].split(sep).map((c) => c.trim().replace(/^"|"$/g, ''))
      const nome = cols[idx('nome')]
      const email = cols[idx('email')]?.toLowerCase() || null
      if (!nome || !email) continue

      const tipo = (cols[idx('tipo_financiamento')] ?? '').toLowerCase()
      if (!['autofinanciado', 'bolsista'].includes(tipo)) {
        throw new Error(`Linha ${i + 1}: tipo_financiamento "${cols[idx('tipo_financiamento')]}" inválido (use "autofinanciado" ou "bolsista").`)
      }

      let turma_id: number | null = null
      if (idx('turma_nome') >= 0 && cols[idx('turma_nome')]) {
        const nomeTurma = cols[idx('turma_nome')]
        turma_id = turmasNomes.get(nomeTurma.toLowerCase()) ?? null
        if (!turma_id) {
          const { data: nova, error: errT } = await supabase.from('turmas').insert({
            nome: nomeTurma,
            data_inicio: new Date().toISOString().slice(0, 10),
            data_fim: new Date(Date.now() + 180 * 86400_000).toISOString().slice(0, 10),
          }).select('id').single()
          if (errT) throw new Error(`Não foi possível criar a turma "${nomeTurma}": ${errT.message}`)
          turma_id = nova.id
          turmasNomes.set(nomeTurma.toLowerCase(), nova.id)
        }
      }

      const whatsapp = idx('whatsapp') >= 0 ? (cols[idx('whatsapp')] ?? '').replace(/\D/g, '') || null : null
      const bolsa = idx('bolsa_origem') >= 0 ? (cols[idx('bolsa_origem')] ?? '').trim() || null : null
      const bio = idx('bio') >= 0 ? (cols[idx('bio')] ?? '').trim() || null : null
      const area = idx('area') >= 0 ? (cols[idx('area')] ?? '').trim() || null : null
      const estado = idx('estado') >= 0 ? (cols[idx('estado')] ?? '').trim().slice(0, 2).toUpperCase() || null : null
      const instagram = idx('instagram') >= 0 ? (cols[idx('instagram')] ?? '').trim() || null : null

      // Tenta encontrar por email
      const { data: existente } = await supabase.from('fellows').select('id').ilike('email', email).maybeSingle()

      const payload: any = {
        nome,
        email,
        whatsapp,
        tipo_financiamento: tipo,
        bolsa_origem: tipo === 'bolsista' ? bolsa : null,
        turma_id,
        contrato_ativo: true,
      }
      if (bio) payload.bio = bio
      if (area) payload.area = area
      if (estado) payload.estado = estado
      if (instagram) payload.instagram = instagram

      if (existente?.id) {
        const { error: errU } = await supabase.from('fellows').update(payload).eq('id', existente.id)
        if (errU) throw new Error(`Linha ${i + 1}: ${errU.message}`)
        atualizados++
      } else {
        const { error: errI } = await supabase.from('fellows').insert(payload)
        if (errI) throw new Error(`Linha ${i + 1}: ${errI.message}`)
        inseridos++
      }
      rows.push(payload)
    }

    bumpAll()
    throw new Error(`__OK__:${inseridos} inseridos, ${atualizados} atualizados.`)
  }).then((r) => {
    // Hack: sucesso vem como erro com __OK__ para passar a contagem.
    if (!r.ok && r.message?.startsWith('__OK__:')) return { ok: true, message: r.message.replace('__OK__:', '') }
    return r
  })
}

// ----- Fornecedores -----

export async function criarFornecedor(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  return safeRun(async () => {
    const supabase = await requireFinanceiroUser()
    const nome = String(formData.get('nome')).trim()
    if (!nome) throw new Error('Nome obrigatório.')
    const { error } = await supabase.from('fornecedores').insert({
      nome,
      tipo: String(formData.get('tipo') ?? 'fornecedor'),
      contato_nome: String(formData.get('contato_nome') ?? '').trim() || null,
      contato_email: String(formData.get('contato_email') ?? '').trim() || null,
      contato_whatsapp: String(formData.get('contato_whatsapp') ?? '').replace(/\D/g, '') || null,
      observacao: String(formData.get('observacao') ?? '').trim() || null,
    })
    if (error) throw new Error(error.message)
    bumpAll()
  })
}

export async function editarFornecedor(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  return safeRun(async () => {
    const supabase = await requireFinanceiroUser()
    const id = Number(formData.get('id'))
    if (!id) throw new Error('Id inválido.')
    const { error } = await supabase.from('fornecedores').update({
      nome: String(formData.get('nome')).trim(),
      tipo: String(formData.get('tipo') ?? 'fornecedor'),
      contato_nome: String(formData.get('contato_nome') ?? '').trim() || null,
      contato_email: String(formData.get('contato_email') ?? '').trim() || null,
      contato_whatsapp: String(formData.get('contato_whatsapp') ?? '').replace(/\D/g, '') || null,
      observacao: String(formData.get('observacao') ?? '').trim() || null,
      ativo: formData.get('ativo') === 'on',
    }).eq('id', id)
    if (error) throw new Error(error.message)
    bumpAll()
  })
}

export async function excluirFornecedor(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const id = Number(formData.get('id'))
  if (!id) throw new Error('Id inválido.')
  const { error } = await supabase.from('fornecedores').delete().eq('id', id)
  if (error) throw new Error(error.message)
  bumpAll()
}

// ----- Equipe -----

export async function criarMembroEquipe(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  return safeRun(async () => {
    const supabase = await requireFinanceiroUser()
    const nome = String(formData.get('nome')).trim()
    if (!nome) throw new Error('Nome obrigatório.')
    const salario = Number(String(formData.get('salario_mensal') ?? '0').replace(',', '.'))
    const { error } = await supabase.from('equipe_financeiro').insert({
      nome,
      funcao: String(formData.get('funcao') ?? '').trim() || null,
      email: String(formData.get('email') ?? '').trim() || null,
      whatsapp: String(formData.get('whatsapp') ?? '').replace(/\D/g, '') || null,
      salario_mensal: Number.isFinite(salario) ? salario : 0,
      contratado_em: String(formData.get('contratado_em') ?? '') || null,
      observacao: String(formData.get('observacao') ?? '').trim() || null,
    })
    if (error) throw new Error(error.message)
    bumpAll()
  })
}

export async function editarMembroEquipe(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  return safeRun(async () => {
    const supabase = await requireFinanceiroUser()
    const id = Number(formData.get('id'))
    if (!id) throw new Error('Id inválido.')
    const salario = Number(String(formData.get('salario_mensal') ?? '0').replace(',', '.'))
    const { error } = await supabase.from('equipe_financeiro').update({
      nome: String(formData.get('nome')).trim(),
      funcao: String(formData.get('funcao') ?? '').trim() || null,
      email: String(formData.get('email') ?? '').trim() || null,
      whatsapp: String(formData.get('whatsapp') ?? '').replace(/\D/g, '') || null,
      salario_mensal: Number.isFinite(salario) ? salario : 0,
      contratado_em: String(formData.get('contratado_em') ?? '') || null,
      ativo: formData.get('ativo') === 'on',
      observacao: String(formData.get('observacao') ?? '').trim() || null,
    }).eq('id', id)
    if (error) throw new Error(error.message)
    bumpAll()
  })
}

export async function excluirMembroEquipe(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const id = Number(formData.get('id'))
  if (!id) throw new Error('Id inválido.')
  const { error } = await supabase.from('equipe_financeiro').delete().eq('id', id)
  if (error) throw new Error(error.message)
  bumpAll()
}

// ----- Pagamentos da Equipe -----

function normalizarMesReferencia(raw: string): string {
  // Aceita "YYYY-MM" ou "YYYY-MM-DD" e retorna sempre "YYYY-MM-01"
  const s = raw.trim()
  if (!s) throw new Error('Mês de referência obrigatório.')
  const m = s.match(/^(\d{4})-(\d{2})/)
  if (!m) throw new Error('Mês de referência inválido.')
  return `${m[1]}-${m[2]}-01`
}

function lerMesReferencia(formData: FormData): string {
  // Aceita campo único "mes_referencia" OU dois campos "mes_referencia_ano" + "mes_referencia_mes"
  const single = String(formData.get('mes_referencia') ?? '').trim()
  if (single) return normalizarMesReferencia(single)
  const ano = String(formData.get('mes_referencia_ano') ?? '').trim()
  const mes = String(formData.get('mes_referencia_mes') ?? '').trim().padStart(2, '0')
  if (!ano || !mes) throw new Error('Mês de referência obrigatório.')
  return normalizarMesReferencia(`${ano}-${mes}`)
}

// Sincroniza um pagamento da equipe com a tabela financeiro_despesas.
// Procura despesa do mesmo equipe_id no mês de referência. Se existir, atualiza
// (cron já criou previsão); senão, cria nova. Retorna o despesa_id resultante.
async function sincronizarDespesaPagamento(
  supabase: any,
  params: { equipe_id: number; mes_referencia: string; valor_pago: number; data_pagamento: string | null; observacao: string | null; despesa_id_atual: number | null }
): Promise<number | null> {
  const { equipe_id, mes_referencia, valor_pago, data_pagamento, observacao, despesa_id_atual } = params
  const { data: membro } = await supabase.from('equipe_financeiro').select('nome').eq('id', equipe_id).maybeSingle()
  const nomeMembro = membro?.nome ?? 'Membro'
  const [yyyy, mm] = mes_referencia.split('-')
  const ultimoDia = new Date(Number(yyyy), Number(mm), 0).getDate()
  const fimMes = `${yyyy}-${mm}-${String(ultimoDia).padStart(2, '0')}`
  const dataDespesa = data_pagamento ?? `${mes_referencia.slice(0, 8)}05` // dia 5 se sem data real
  const descricao = `Salário ${nomeMembro} - ${mes_referencia.slice(0, 7)}`
  const payload = {
    categoria: 'Equipe',
    descricao,
    valor: valor_pago,
    data: dataDespesa,
    equipe_id,
    observacao,
  }

  // Se já temos link, atualiza direto
  if (despesa_id_atual) {
    const { error } = await supabase.from('financeiro_despesas').update(payload).eq('id', despesa_id_atual)
    if (error) throw new Error(`Erro sincronizando despesa: ${error.message}`)
    return despesa_id_atual
  }

  // Procura despesa existente do mês (criada pelo cron)
  const { data: existente } = await supabase
    .from('financeiro_despesas')
    .select('id')
    .eq('equipe_id', equipe_id)
    .gte('data', mes_referencia)
    .lte('data', fimMes)
    .limit(1)
    .maybeSingle()

  if (existente?.id) {
    const { error } = await supabase.from('financeiro_despesas').update(payload).eq('id', existente.id)
    if (error) throw new Error(`Erro sincronizando despesa: ${error.message}`)
    return existente.id
  }

  // Cria nova
  const { data: nova, error } = await supabase.from('financeiro_despesas').insert(payload).select('id').single()
  if (error) throw new Error(`Erro criando despesa: ${error.message}`)
  return nova?.id ?? null
}

export async function registrarPagamentoEquipe(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  return safeRun(async () => {
    const supabase = await requireFinanceiroUser()
    const equipe_id = Number(formData.get('equipe_id'))
    if (!equipe_id) throw new Error('Membro inválido.')
    const mes_referencia = lerMesReferencia(formData)
    const valor = Number(String(formData.get('valor_pago') ?? '0').replace(',', '.'))
    if (!Number.isFinite(valor) || valor <= 0) throw new Error('Valor inválido.')
    const data_pagamento = String(formData.get('data_pagamento') ?? '') || null
    const observacao = String(formData.get('observacao') ?? '').trim() || null

    // Verifica se já existe pagamento (pra preservar despesa_id)
    const { data: jaExiste } = await supabase
      .from('pagamentos_equipe')
      .select('id, despesa_id')
      .eq('equipe_id', equipe_id)
      .eq('mes_referencia', mes_referencia)
      .maybeSingle()

    const despesa_id = await sincronizarDespesaPagamento(supabase, {
      equipe_id, mes_referencia, valor_pago: valor, data_pagamento, observacao,
      despesa_id_atual: jaExiste?.despesa_id ?? null,
    })

    const { error } = await supabase.from('pagamentos_equipe').upsert({
      equipe_id,
      mes_referencia,
      valor_pago: valor,
      data_pagamento,
      observacao,
      despesa_id,
    }, { onConflict: 'equipe_id,mes_referencia' })
    if (error) throw new Error(error.message)
    bumpAll()
  })
}

export async function editarPagamentoEquipe(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  return safeRun(async () => {
    const supabase = await requireFinanceiroUser()
    const id = Number(formData.get('id'))
    if (!id) throw new Error('Id inválido.')
    const valor = Number(String(formData.get('valor_pago') ?? '0').replace(',', '.'))
    if (!Number.isFinite(valor) || valor <= 0) throw new Error('Valor inválido.')
    const data_pagamento = String(formData.get('data_pagamento') ?? '') || null
    const observacao = String(formData.get('observacao') ?? '').trim() || null
    const { data: atual } = await supabase
      .from('pagamentos_equipe')
      .select('id, equipe_id, mes_referencia, despesa_id')
      .eq('id', id)
      .single()
    if (!atual) throw new Error('Pagamento não encontrado.')

    let mes_referencia = atual.mes_referencia
    try { mes_referencia = lerMesReferencia(formData) } catch {}
    const despesa_id = await sincronizarDespesaPagamento(supabase, {
      equipe_id: atual.equipe_id,
      mes_referencia,
      valor_pago: valor,
      data_pagamento,
      observacao,
      despesa_id_atual: atual.despesa_id,
    })

    const { error } = await supabase.from('pagamentos_equipe')
      .update({ valor_pago: valor, data_pagamento, observacao, mes_referencia, despesa_id })
      .eq('id', id)
    if (error) throw new Error(error.message)
    bumpAll()
  })
}

export async function excluirPagamentoEquipe(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const id = Number(formData.get('id'))
  if (!id) throw new Error('Id inválido.')
  // Pega despesa_id antes de deletar pra remover a despesa também
  const { data: pag } = await supabase
    .from('pagamentos_equipe')
    .select('despesa_id')
    .eq('id', id)
    .maybeSingle()
  const { error } = await supabase.from('pagamentos_equipe').delete().eq('id', id)
  if (error) throw new Error(error.message)
  if (pag?.despesa_id) {
    await supabase.from('financeiro_despesas').delete().eq('id', pag.despesa_id)
  }
  bumpAll()
}

// ----- Upload de arquivos -----

async function uploadParaBucket(supabase: any, file: File, prefixo: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'bin'
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${prefixo}/${Date.now()}-${safe}`
  const { error } = await supabase.storage.from('financeiro').upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  })
  if (error) throw new Error(`Falha no upload: ${error.message}`)
  return path
}

export async function uploadContratoEquipe(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  return safeRun(async () => {
    const supabase = await requireFinanceiroUser()
    const equipe_id = Number(formData.get('equipe_id'))
    if (!equipe_id) throw new Error('Membro inválido.')
    const file = formData.get('arquivo') as File | null
    if (!file || file.size === 0) throw new Error('Arquivo obrigatório.')
    if (file.size > 20 * 1024 * 1024) throw new Error('Arquivo maior que 20 MB.')
    const path = await uploadParaBucket(supabase, file, `equipe/${equipe_id}/contrato`)
    const { error } = await supabase.from('equipe_financeiro').update({ contrato_url: path }).eq('id', equipe_id)
    if (error) throw new Error(error.message)
    bumpAll()
  })
}

export async function uploadComprovantePagamento(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  return safeRun(async () => {
    const supabase = await requireFinanceiroUser()
    const pagamento_id = Number(formData.get('pagamento_id'))
    const tipo = String(formData.get('tipo') ?? 'comprovante') // 'comprovante' | 'nota_fiscal'
    if (!pagamento_id) throw new Error('Pagamento inválido.')
    if (!['comprovante', 'nota_fiscal'].includes(tipo)) throw new Error('Tipo inválido.')
    const file = formData.get('arquivo') as File | null
    if (!file || file.size === 0) throw new Error('Arquivo obrigatório.')
    if (file.size > 20 * 1024 * 1024) throw new Error('Arquivo maior que 20 MB.')
    const path = await uploadParaBucket(supabase, file, `pagamentos/${pagamento_id}/${tipo}`)
    const col = tipo === 'comprovante' ? 'comprovante_url' : 'nota_fiscal_url'
    const { error } = await supabase.from('pagamentos_equipe').update({ [col]: path }).eq('id', pagamento_id)
    if (error) throw new Error(error.message)
    bumpAll()
  })
}

export async function removerArquivoEquipe(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const equipe_id = Number(formData.get('equipe_id'))
  if (!equipe_id) throw new Error('Membro inválido.')
  const { data: m } = await supabase.from('equipe_financeiro').select('contrato_url').eq('id', equipe_id).maybeSingle()
  if (m?.contrato_url) await supabase.storage.from('financeiro').remove([m.contrato_url])
  await supabase.from('equipe_financeiro').update({ contrato_url: null }).eq('id', equipe_id)
  bumpAll()
}

export async function removerArquivoPagamento(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const pagamento_id = Number(formData.get('pagamento_id'))
  const tipo = String(formData.get('tipo') ?? 'comprovante')
  if (!pagamento_id) throw new Error('Pagamento inválido.')
  if (!['comprovante', 'nota_fiscal'].includes(tipo)) throw new Error('Tipo inválido.')
  const col = tipo === 'comprovante' ? 'comprovante_url' : 'nota_fiscal_url'
  const { data: p } = await supabase.from('pagamentos_equipe').select(col).eq('id', pagamento_id).maybeSingle()
  const url = (p as any)?.[col]
  if (url) await supabase.storage.from('financeiro').remove([url])
  await supabase.from('pagamentos_equipe').update({ [col]: null }).eq('id', pagamento_id)
  bumpAll()
}

// ----- Produtos -----

export async function criarProduto(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  return safeRun(async () => {
    const supabase = await requireFinanceiroUser()
    const nome = String(formData.get('nome')).trim()
    if (!nome) throw new Error('Nome obrigatório.')
    const valor = Number(String(formData.get('valor') ?? '0').replace(',', '.'))
    const duracao = formData.get('duracao_meses') ? Number(formData.get('duracao_meses')) : null
    const { error } = await supabase.from('produtos').insert({
      nome,
      descricao: String(formData.get('descricao') ?? '').trim() || null,
      modelo: String(formData.get('modelo') ?? 'pacote'),
      valor: Number.isFinite(valor) ? valor : 0,
      recorrencia: String(formData.get('recorrencia') ?? 'unica') || null,
      duracao_meses: duracao,
      cor: String(formData.get('cor') ?? '#64748b'),
    })
    if (error) throw new Error(error.message)
    bumpAll()
  })
}

export async function editarProduto(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  return safeRun(async () => {
    const supabase = await requireFinanceiroUser()
    const id = Number(formData.get('id'))
    if (!id) throw new Error('Id inválido.')
    const valor = Number(String(formData.get('valor') ?? '0').replace(',', '.'))
    const duracao = formData.get('duracao_meses') ? Number(formData.get('duracao_meses')) : null
    const { error } = await supabase.from('produtos').update({
      nome: String(formData.get('nome')).trim(),
      descricao: String(formData.get('descricao') ?? '').trim() || null,
      modelo: String(formData.get('modelo') ?? 'pacote'),
      valor: Number.isFinite(valor) ? valor : 0,
      recorrencia: String(formData.get('recorrencia') ?? 'unica') || null,
      duracao_meses: duracao,
      cor: String(formData.get('cor') ?? '#64748b'),
      ativo: formData.get('ativo') === 'on',
    }).eq('id', id)
    if (error) throw new Error(error.message)
    bumpAll()
  })
}

export async function excluirProduto(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const id = Number(formData.get('id'))
  if (!id) throw new Error('Id inválido.')
  const { error } = await supabase.from('produtos').delete().eq('id', id)
  if (error) throw new Error(error.message)
  bumpAll()
}

// ----- Fellow × Produto -----

export async function vincularFellowProduto(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  return safeRun(async () => {
    const supabase = await requireFinanceiroUser()
    const fellow_id = Number(formData.get('fellow_id'))
    const produto_id = Number(formData.get('produto_id'))
    if (!fellow_id || !produto_id) throw new Error('Fellow e produto obrigatórios.')
    const data_inicio = String(formData.get('data_inicio') || new Date().toISOString().slice(0, 10))
    const data_fim = String(formData.get('data_fim') || '') || null
    const valor_negociado = formData.get('valor_negociado') ? Number(String(formData.get('valor_negociado')).replace(',', '.')) : null
    const { error } = await supabase.from('fellow_produtos').insert({
      fellow_id, produto_id, data_inicio, data_fim, valor_negociado,
      observacao: String(formData.get('observacao') ?? '').trim() || null,
    })
    if (error) throw new Error(error.message)
    bumpAll()
  })
}

export async function desvincularFellowProduto(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const id = Number(formData.get('id'))
  if (!id) throw new Error('Id inválido.')
  const { error } = await supabase.from('fellow_produtos').delete().eq('id', id)
  if (error) throw new Error(error.message)
  bumpAll()
}

export async function atualizarStatusFellowProduto(formData: FormData) {
  const supabase = await requireFinanceiroUser()
  const id = Number(formData.get('id'))
  const status = String(formData.get('status'))
  if (!id || !['ativo', 'encerrado', 'pausado'].includes(status)) throw new Error('Parâmetros inválidos.')
  const update: any = { status }
  if (status === 'encerrado' && !formData.get('data_fim')) update.data_fim = new Date().toISOString().slice(0, 10)
  const { error } = await supabase.from('fellow_produtos').update(update).eq('id', id)
  if (error) throw new Error(error.message)
  bumpAll()
}
