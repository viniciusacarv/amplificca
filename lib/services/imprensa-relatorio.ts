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
  | 'arquivado'

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
  motivo_arquivamento: string | null
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
  arquivados: number
  enviadosOuPublicados: number
  taxaEnvio: number
  taxaPublicacaoSobreEnviados: number
  taxaPublicacaoSobreTotal: number
  fellowsPublicados: number
}

export type TagInfo = {
  id: string | number
  nome: string
  slug: string
}

export type FellowAgg = {
  fellow_id: string
  nome: string
  area: string | null
  estado: string | null
  email: string | null
  submetidos: number
  publicados: number
  taxa: number
  topTags: string[]            // até 3 nomes
  topVeiculos: string[]        // até 3 nomes
  diasDesdeUltimaPublicacao: number | null
  ultimaPublicacaoEm: string | null
  ultimaSubmissaoEm: string | null
  statusAtividade: 'ativo' | 'atencao' | 'risco' | 'sem_atividade'
}

export type TagAgg = {
  tag_id: string | number
  nome: string
  slug: string
  submissoes: number
  publicacoes: number
  veiculos_distintos: number
}

export type HeatmapCell = {
  fellow_id: string
  fellow_nome: string
  mes: string             // 'YYYY-MM'
  publicacoes: number
}

export type HeatmapData = {
  fellows: { id: string; nome: string }[]
  meses: string[]         // ordenado crescente
  matriz: Record<string, Record<string, number>>  // matriz[fellow_id][mes] = count
  max: number
}

export type RelatorioImprensa = {
  periodo: { from: string | null; to: string | null }
  indicadores: Indicadores
  veiculos: VeiculoAgg[]
  fellows: FellowAgg[]
  tags: TagAgg[]
  heatmap: HeatmapData
  submissoes: SubmissaoRow[]
  tentativas: TentativaRow[]
  /** Mapa submissao_id → array de tags (id + nome + slug) */
  tagsPorSubmissao: Record<string, TagInfo[]>
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
  let arquivados = 0

  for (const s of submissoes) {
    if (STATUS_PENDENTE.includes(s.status)) pendentes++
    else if (s.status === 'enviado_imprensa') naImprensa++
    else if (s.status === 'publicado') publicados++
    else if (s.status === 'rejeitado') recusados++
    else if (s.status === 'retirado_fellow') retirados++
    else if (s.status === 'arquivado') arquivados++
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
    arquivados,
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

/** Agrega métricas por fellow. Usa a data atual como referência para
 *  calcular dias desde a última publicação. */
export function agregarFellows(
  submissoes: SubmissaoRow[],
  tentativas: TentativaRow[],
  tagsPorSubmissao: Record<string, TagInfo[]>,
  todosFellows: { id: string; nome: string; area: string | null; estado: string | null; email: string | null }[],
): FellowAgg[] {
  const submissoesIds = new Set(submissoes.map((s) => s.id))

  // Map: fellow_id → agregação interna
  type Acc = {
    submetidos: number
    publicados: number
    tagCount: Map<string, number>
    veiculoCount: Map<string, number>
    ultimaPub: string | null
    ultimaSub: string | null
  }
  const map = new Map<string, Acc>()

  function getAcc(id: string): Acc {
    let a = map.get(id)
    if (!a) {
      a = {
        submetidos: 0,
        publicados: 0,
        tagCount: new Map(),
        veiculoCount: new Map(),
        ultimaPub: null,
        ultimaSub: null,
      }
      map.set(id, a)
    }
    return a
  }

  for (const s of submissoes) {
    if (!s.fellow_id) continue
    const acc = getAcc(s.fellow_id)
    acc.submetidos += 1
    if (!acc.ultimaSub || s.created_at > acc.ultimaSub) acc.ultimaSub = s.created_at
    if (s.status === 'publicado') {
      acc.publicados += 1
    }
    // Tags da submissão
    for (const t of tagsPorSubmissao[String(s.id)] ?? []) {
      acc.tagCount.set(t.nome, (acc.tagCount.get(t.nome) ?? 0) + 1)
    }
  }

  // Veículos: contar pelas tentativas publicadas
  for (const t of tentativas) {
    if (t.status !== 'publicado') continue
    if (!t.fellow_id) continue
    if (!submissoesIds.has(t.submissao_id)) continue
    const acc = getAcc(t.fellow_id)
    const nomeVeic = t.veiculos?.nome ?? null
    if (nomeVeic) {
      acc.veiculoCount.set(nomeVeic, (acc.veiculoCount.get(nomeVeic) ?? 0) + 1)
    }
    const data = t.respondido_em ?? t.enviado_em
    if (data && (!acc.ultimaPub || data > acc.ultimaPub)) {
      acc.ultimaPub = data
    }
  }

  const agora = Date.now()
  const fellowsIndex = new Map(todosFellows.map((f) => [String(f.id), f]))

  const fellows: FellowAgg[] = []

  // Inclui também fellows sem submissão no período (para "fellows em atenção")
  const todosIds = new Set<string>([
    ...todosFellows.map((f) => String(f.id)),
    ...Array.from(map.keys()),
  ])

  for (const fellowId of todosIds) {
    const acc = map.get(fellowId) ?? {
      submetidos: 0,
      publicados: 0,
      tagCount: new Map<string, number>(),
      veiculoCount: new Map<string, number>(),
      ultimaPub: null,
      ultimaSub: null,
    }
    const info = fellowsIndex.get(fellowId)
    if (!info) continue

    const dias = acc.ultimaPub
      ? Math.floor((agora - new Date(acc.ultimaPub).getTime()) / 86400000)
      : null

    let statusAtividade: FellowAgg['statusAtividade'] = 'sem_atividade'
    if (acc.publicados > 0) {
      if (dias !== null && dias <= 60) statusAtividade = 'ativo'
      else if (dias !== null && dias <= 120) statusAtividade = 'atencao'
      else statusAtividade = 'risco'
    } else if (acc.submetidos > 0) {
      statusAtividade = 'atencao'
    } else {
      statusAtividade = 'risco'
    }

    fellows.push({
      fellow_id: fellowId,
      nome: info.nome,
      area: info.area,
      estado: info.estado,
      email: info.email,
      submetidos: acc.submetidos,
      publicados: acc.publicados,
      taxa: acc.submetidos > 0 ? acc.publicados / acc.submetidos : 0,
      topTags: Array.from(acc.tagCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([nome]) => nome),
      topVeiculos: Array.from(acc.veiculoCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([nome]) => nome),
      diasDesdeUltimaPublicacao: dias,
      ultimaPublicacaoEm: acc.ultimaPub,
      ultimaSubmissaoEm: acc.ultimaSub,
      statusAtividade,
    })
  }

  return fellows.sort((a, b) => {
    if (b.publicados !== a.publicados) return b.publicados - a.publicados
    if (b.submetidos !== a.submetidos) return b.submetidos - a.submetidos
    return a.nome.localeCompare(b.nome)
  })
}

/** Agrega métricas por tag (submissões e publicações que possuem cada tag). */
export function agregarTags(
  submissoes: SubmissaoRow[],
  tentativas: TentativaRow[],
  tagsPorSubmissao: Record<string, TagInfo[]>,
): TagAgg[] {
  type Acc = {
    nome: string
    slug: string
    submissoes: number
    publicacoes: number
    veiculos: Set<string>
  }
  const map = new Map<string, Acc>()

  const subById = new Map(submissoes.map((s) => [String(s.id), s]))

  for (const s of submissoes) {
    for (const t of tagsPorSubmissao[String(s.id)] ?? []) {
      const key = String(t.id)
      const acc = map.get(key) ?? {
        nome: t.nome,
        slug: t.slug,
        submissoes: 0,
        publicacoes: 0,
        veiculos: new Set<string>(),
      }
      acc.submissoes += 1
      if (s.status === 'publicado') acc.publicacoes += 1
      map.set(key, acc)
    }
  }

  for (const t of tentativas) {
    if (t.status !== 'publicado') continue
    if (!t.veiculo_id) continue
    const sub = subById.get(String(t.submissao_id))
    if (!sub) continue
    for (const tag of tagsPorSubmissao[String(sub.id)] ?? []) {
      const acc = map.get(String(tag.id))
      if (acc) acc.veiculos.add(String(t.veiculo_id))
    }
  }

  return Array.from(map.entries())
    .map(([tag_id, a]) => ({
      tag_id,
      nome: a.nome,
      slug: a.slug,
      submissoes: a.submissoes,
      publicacoes: a.publicacoes,
      veiculos_distintos: a.veiculos.size,
    }))
    .sort((a, b) => b.publicacoes - a.publicacoes || b.submissoes - a.submissoes)
}

/** Heatmap fellow × mês com base nas tentativas publicadas. */
export function agregarHeatmap(
  submissoes: SubmissaoRow[],
  tentativas: TentativaRow[],
  todosFellows: { id: string; nome: string }[],
  mesesQty: number = 12,
): HeatmapData {
  const submissoesIds = new Set(submissoes.map((s) => s.id))
  const fellowsIndex = new Map(todosFellows.map((f) => [String(f.id), f]))

  // Lista de meses (últimos N, terminando no mês atual)
  const meses: string[] = []
  const hoje = new Date()
  for (let i = mesesQty - 1; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    meses.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  const mesesSet = new Set(meses)

  // Matriz vazia
  const matriz: Record<string, Record<string, number>> = {}
  const fellowsComAtividade = new Set<string>()

  for (const t of tentativas) {
    if (t.status !== 'publicado') continue
    if (!t.fellow_id) continue
    if (!submissoesIds.has(t.submissao_id)) continue
    const data = t.respondido_em ?? t.enviado_em
    if (!data) continue
    const d = new Date(data)
    const mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!mesesSet.has(mes)) continue

    const fid = String(t.fellow_id)
    if (!matriz[fid]) matriz[fid] = {}
    matriz[fid][mes] = (matriz[fid][mes] ?? 0) + 1
    fellowsComAtividade.add(fid)
  }

  // Inclui também fellows que submeteram mas não publicaram no período do heatmap
  for (const s of submissoes) {
    if (s.fellow_id) fellowsComAtividade.add(String(s.fellow_id))
  }

  // Lista final de fellows: prioriza quem teve atividade; ordena por total publicado desc
  const fellowsRanked = Array.from(fellowsComAtividade)
    .map((id) => {
      const info = fellowsIndex.get(id)
      const total = Object.values(matriz[id] ?? {}).reduce((a, b) => a + b, 0)
      return { id, nome: info?.nome ?? '—', total }
    })
    .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome))

  let max = 0
  for (const f of fellowsRanked) {
    for (const m of meses) {
      const v = matriz[f.id]?.[m] ?? 0
      if (v > max) max = v
    }
  }

  return {
    fellows: fellowsRanked.map(({ id, nome }) => ({ id, nome })),
    meses,
    matriz,
    max,
  }
}

export async function getRelatorioImprensa(
  filtro: FiltroPeriodo = {},
): Promise<RelatorioImprensa> {
  const supabase = createClient()

  let q = supabase
    .from('submissoes')
    .select(
      'id, titulo, tipo, status, fellow_id, veiculo_id, artigo_url, motivo_arquivamento, created_at, updated_at, fellows(id, nome, area, estado), veiculos(id, nome)',
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
        'id, submissao_id, fellow_id, veiculo_id, status, artigo_url, enviado_em, respondido_em',
      )
      .in('submissao_id', ids)
    if (tentErr) throw tentErr

    // tentativas_placement não tem FK declarada para veiculos no PostgREST;
    // resolvemos o nome do veículo numa segunda query e juntamos em JS.
    const tentRaw = (tentData ?? []) as Array<Omit<TentativaRow, 'veiculos'>>
    const veiculoIds = Array.from(
      new Set(tentRaw.map((t) => t.veiculo_id).filter((v): v is string => !!v)),
    )

    let veiculosMap: Record<string, { id: string; nome: string }> = {}
    if (veiculoIds.length > 0) {
      const { data: vData } = await supabase
        .from('veiculos')
        .select('id, nome')
        .in('id', veiculoIds)
      veiculosMap = Object.fromEntries(
        ((vData ?? []) as Array<{ id: string; nome: string }>).map((v) => [v.id, v]),
      )
    }

    tentativas = tentRaw.map((t) => ({
      ...t,
      veiculos: t.veiculo_id ? veiculosMap[t.veiculo_id] ?? null : null,
    })) as TentativaRow[]
  }

  // Tags por submissão (silencioso se a tabela ainda não existir)
  const tagsPorSubmissao: Record<string, TagInfo[]> = {}
  if (submissoes.length > 0) {
    try {
      const { data: tagRows } = await supabase
        .from('submissao_tags')
        .select('submissao_id, tags(id, nome, slug)')
        .in('submissao_id', submissoes.map((s) => s.id))

      for (const r of (tagRows ?? []) as any[]) {
        if (!r?.tags) continue
        const k = String(r.submissao_id)
        if (!tagsPorSubmissao[k]) tagsPorSubmissao[k] = []
        tagsPorSubmissao[k].push({
          id: r.tags.id,
          nome: r.tags.nome,
          slug: r.tags.slug,
        })
      }
    } catch {
      // Tabela submissao_tags ainda não criada — ignora.
    }
  }

  // Lista mestre de fellows (para detectar quem nunca submeteu/publicou)
  let todosFellows: { id: string; nome: string; area: string | null; estado: string | null; email: string | null }[] = []
  try {
    const { data: fData } = await supabase
      .from('fellows')
      .select('id, nome, area, estado, email')
      .order('nome')
    todosFellows = ((fData ?? []) as any[]).map((f) => ({
      id: String(f.id),
      nome: f.nome,
      area: f.area ?? null,
      estado: f.estado ?? null,
      email: f.email ?? null,
    }))
  } catch {
    // Em caso de erro, usa apenas fellows com submissão no período.
    const map = new Map<string, { id: string; nome: string; area: string | null; estado: string | null; email: string | null }>()
    for (const s of submissoes) {
      if (s.fellow_id && s.fellows) {
        map.set(String(s.fellow_id), {
          id: String(s.fellow_id),
          nome: s.fellows.nome,
          area: s.fellows.area,
          estado: s.fellows.estado,
          email: null,
        })
      }
    }
    todosFellows = Array.from(map.values())
  }

  return {
    periodo: { from: filtro.from ?? null, to: filtro.to ?? null },
    indicadores: calcularIndicadores(submissoes, tentativas),
    veiculos: agregarVeiculos(tentativas, submissoes),
    fellows: agregarFellows(submissoes, tentativas, tagsPorSubmissao, todosFellows),
    tags: agregarTags(submissoes, tentativas, tagsPorSubmissao),
    heatmap: agregarHeatmap(submissoes, tentativas, todosFellows, 12),
    submissoes,
    tentativas,
    tagsPorSubmissao,
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
  arquivado: 'Arquivado',
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
