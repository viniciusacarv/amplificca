// lib/services/imprensa-relatorio.ts
// Camada de dados + cálculo dos indicadores da Assessoria de Imprensa.
// Reutilizada pela página /painel/admin/imprensa/relatorios e pelo route handler de export.

import { createClient } from '@/lib/supabase-server'

export type StatusSubmissao =
  | 'recebido'
  | 'em_avaliacao'
  | 'ajustes_solicitados'
  | 'aprovado'
  | 'enviado_imprensa'
  | 'publicado'
  | 'rejeitado'
  | 'retirado_fellow'

const STATUS_PENDENTE: StatusSubmissao[] = [
  'recebido',
  'em_avaliacao',
  'ajustes_solicitados',
  'aprovado',
]

export type SubmissaoRow = {
  id: string
  titulo: string
  tipo: string | null
  status: StatusSubmissao
  fellow_id: string | null
  veiculo_id: string | null
  artigo_url: string | null
  created_at: string
  updated_at: string | null
  fellows: { id: string; nome: string; area: string | null; estado: string | null } | null
  veiculos: { id: string; nome: string } | null
}

export type TentativaRow = {
  id: string
  submissao_id: string
  fellow_id: string | null
  veiculo_id: string | null
  status: 'aguardando' | 'sem_retorno' | 'negativo' | 'publicado'
  artigo_url: string | null
  enviado_em: string | null
  respondido_em: string | null
  veiculos: { id: string; nome: string } | null
}

export type VeiculoAgg = {
  veiculo_id: string
  nome: string
  publicacoes: number
  fellows_distintos: number
}

export type Indicadores = {
  fellowsUnicos: number
  totalSubmetidos: number
  pendentes: number
  naImprensa: number
  publicados: number
  recusados: number
  retirados: number
  enviadosOuPublicados: number
  taxaEnvio: number
  taxaPublicacaoSobreEnviados: number
  taxaPublicacaoSobreTotal: number
  fellowsPublicados: number
}

export type RelatorioImprensa = {
  periodo: { from: string | null; to: string | null }
  indicadores: Indicadores
  veiculos: VeiculoAgg[]
  submissoes: SubmissaoRow[]
  tentativas: TentativaRow[]
}

export type FiltroPeriodo = {
  from?: string | null
  to?: string | null
}

export function calcularIndicadores(
  submissoes: SubmissaoRow[],
  tentativas: TentativaRow[],
): Indicadores {
  const totalSubmetidos = submissoes.length
  const fellowsUnicos = new Set(
    submissoes.map((s) => s.fellow_id).filter((v): v is string => !!v),
  ).size

  let pendentes = 0
  let naImprensa = 0
  let publicados = 0
  let recusados = 0
  let retirados = 0

  for (const s of submissoes) {
    if (STATUS_PENDENTE.includes(s.status)) pendentes++
    else if (s.status === 'enviado_imprensa') naImprensa++
    else if (s.status === 'publicado') publicados++
    else if (s.status === 'rejeitado') recusados++
    else if (s.status === 'retirado_fellow') retirados++
  }

  const enviadosOuPublicados = naImprensa + publicados
  const taxaEnvio = totalSubmetidos > 0 ? enviadosOuPublicados / totalSubmetidos : 0
  const taxaPublicacaoSobreEnviados =
    enviadosOuPublicados > 0 ? publicados / enviadosOuPublicados : 0
  const taxaPublicacaoSobreTotal = totalSubmetidos > 0 ? publicados / totalSubmetidos : 0

  const fellowsPublicados = new Set(
    submissoes
      .filter((s) => s.status === 'publicado')
      .map((s) => s.fellow_id)
      .filter((v): v is string => !!v),
  ).size

  return {
    fellowsUnicos,
    totalSubmetidos,
    pendentes,
    naImprensa,
    publicados,
    recusados,
    retirados,
    enviadosOuPublicados,
    taxaEnvio,
    taxaPublicacaoSobreEnviados,
    taxaPublicacaoSobreTotal,
    fellowsPublicados,
  }
}

export function agregarVeiculos(
  tentativas: TentativaRow[],
  submissoes: SubmissaoRow[],
): VeiculoAgg[] {
  const submissoesIds = new Set(submissoes.map((s) => s.id))
  const map = new Map<string, { nome: string; publicacoes: number; fellows: Set<string> }>()

  for (const t of tentativas) {
    if (t.status !== 'publicado') continue
    if (!t.veiculo_id) continue
    if (!submissoesIds.has(t.submissao_id)) continue

    const nome = t.veiculos?.nome ?? '—'
    const entry = map.get(t.veiculo_id) ?? {
      nome,
      publicacoes: 0,
      fellows: new Set<string>(),
    }
    entry.publicacoes += 1
    if (t.fellow_id) entry.fellows.add(t.fellow_id)
    map.set(t.veiculo_id, entry)
  }

  return Array.from(map.entries())
    .map(([veiculo_id, v]) => ({
      veiculo_id,
      nome: v.nome,
      publicacoes: v.publicacoes,
      fellows_distintos: v.fellows.size,
    }))
    .sort((a, b) => b.publicacoes - a.publicacoes)
}

export async function getRelatorioImprensa(
  filtro: FiltroPeriodo = {},
): Promise<RelatorioImprensa> {
  const supabase = createClient()

  let q = supabase
    .from('submissoes')
    .select(
      'id, titulo, tipo, status, fellow_id, veiculo_id, artigo_url, created_at, updated_at, fellows(id, nome, area, estado), veiculos(id, nome)',
    )
    .order('created_at', { ascending: false })

  if (filtro.from) q = q.gte('created_at', filtro.from)
  if (filtro.to) q = q.lte('created_at', filtro.to)

  const { data: subData, error: subErr } = await q
  if (subErr) throw subErr
  const submissoes = ((subData ?? []) as unknown) as SubmissaoRow[]

  let tentativas: TentativaRow[] = []
  if (submissoes.length > 0) {
    const ids = submissoes.map((s) => s.id)
    const { data: tentData, error: tentErr } = await supabase
      .from('tentativas_placement')
      .select(
        'id, submissao_id, fellow_id, veiculo_id, status, artigo_url, enviado_em, respondido_em, veiculos(id, nome)',
      )
      .in('submissao_id', ids)
    if (tentErr) throw tentErr
    tentativas = ((tentData ?? []) as unknown) as TentativaRow[]
  }

  return {
    periodo: { from: filtro.from ?? null, to: filtro.to ?? null },
    indicadores: calcularIndicadores(submissoes, tentativas),
    veiculos: agregarVeiculos(tentativas, submissoes),
    submissoes,
    tentativas,
  }
}

export const STATUS_LABEL: Record<StatusSubmissao, string> = {
  recebido: 'Recebido',
  em_avaliacao: 'Em avaliação',
  ajustes_solicitados: 'Ajustes solicitados',
  aprovado: 'Aprovado',
  enviado_imprensa: 'Na imprensa',
  publicado: 'Publicado',
  rejeitado: 'Recusado',
  retirado_fellow: 'Retirado pelo fellow',
}

export function resolverPeriodo(searchParams: {
  preset?: string
  from?: string
  to?: string
}): { from: string | null; to: string | null; presetAtivo: string } {
  const presets = ['30d', '90d', 'ano', 'tudo'] as const
  const preset = (presets as readonly string[]).includes(searchParams.preset ?? '')
    ? searchParams.preset!
    : searchParams.from || searchParams.to
      ? 'custom'
      : 'tudo'

  if (searchParams.from || searchParams.to) {
    return {
      from: searchParams.from ? new Date(searchParams.from).toISOString() : null,
      to: searchParams.to ? new Date(searchParams.to + 'T23:59:59').toISOString() : null,
      presetAtivo: 'custom',
    }
  }

  const now = new Date()
  if (preset === '30d') {
    const d = new Date(now)
    d.setDate(d.getDate() - 30)
    return { from: d.toISOString(), to: now.toISOString(), presetAtivo: '30d' }
  }
  if (preset === '90d') {
    const d = new Date(now)
    d.setDate(d.getDate() - 90)
    return { from: d.toISOString(), to: now.toISOString(), presetAtivo: '90d' }
  }
  if (preset === 'ano') {
    const d = new Date(now.getFullYear(), 0, 1)
    return { from: d.toISOString(), to: now.toISOString(), presetAtivo: 'ano' }
  }
  return { from: null, to: null, presetAtivo: 'tudo' }
}
