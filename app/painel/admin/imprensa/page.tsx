// app/painel/admin/imprensa/page.tsx
// Fila de submissões — visão do admin

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const STATUS_CONFIG = {
  recebido:            { label: 'Recebido',           emoji: '📬', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20'       },
  em_avaliacao:        { label: 'Em avaliação',        emoji: '🔍', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'  },
  ajustes_solicitados: { label: 'Ajustes',             emoji: '✏️', color: 'bg-orange-500/15 text-orange-400 border-orange-500/20'  },
  aprovado:            { label: 'Aprovado',            emoji: '✅', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'},
  enviado_imprensa:    { label: 'Na imprensa',         emoji: '📤', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20'       },
  publicado:           { label: 'Publicado',           emoji: '🎉', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'},
  rejeitado:           { label: 'Recusado',            emoji: '❌', color: 'bg-red-500/15 text-red-400 border-red-500/20'         },
  retirado_fellow:     { label: 'Retirado pelo fellow',emoji: '↩️', color: 'bg-gray-500/15 text-gray-300 border-gray-500/20'   },
  arquivado:           { label: 'Arquivado',            emoji: '🗄️', color: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/20'  },
} as const

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function diasDesde(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const dias = Math.floor(diff / 86400000)
  if (dias === 0) return 'hoje'
  if (dias === 1) return '1 dia atrás'
  return `${dias} dias atrás`
}

export default async function AdminImprensaPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  const filtroStatus = searchParams.status || 'pendentes'

  // Colunas base que sempre existem. autor_admin_id e o embed `admins:autor_admin_id`
  // só funcionam quando a migration supabase-imprensa-tags.sql foi aplicada
  // — fazemos a resolução desses dois em queries separadas e toleramos a ausência.
  const COLS_BASE = 'id, titulo, tipo, status, feedback, created_at, updated_at, fellow_id, fellows(nome, foto_url), veiculos(nome)'

  function aplicaFiltro(q: any) {
    if (filtroStatus === 'pendentes') {
      return q.in('status', ['recebido', 'em_avaliacao', 'ajustes_solicitados', 'aprovado'])
    }
    if (filtroStatus !== 'todos') {
      return q.eq('status', filtroStatus)
    }
    return q
  }

  // Tenta primeiro com autor_admin_id; em caso de erro, usa colunas base
  let { data: submissoesRaw, error: subErr } = await aplicaFiltro(
    supabase
      .from('submissoes')
      .select(`${COLS_BASE}, autor_admin_id`)
      .order('created_at', { ascending: true }),
  )
  if (subErr) {
    const fallback = await aplicaFiltro(
      supabase
        .from('submissoes')
        .select(COLS_BASE)
        .order('created_at', { ascending: true }),
    )
    submissoesRaw = fallback.data
  }
  let submissoes: any[] = submissoesRaw ?? []

  // Best-effort: resolve nomes dos admins autores
  const adminIds = Array.from(
    new Set(submissoes.map((s: any) => s.autor_admin_id).filter(Boolean)),
  )
  if (adminIds.length > 0) {
    try {
      const { data: adminsData } = await supabase
        .from('admins')
        .select('id, nome, email')
        .in('id', adminIds)
      const adminMap = new Map((adminsData ?? []).map((a: any) => [String(a.id), a]))
      submissoes = submissoes.map((s: any) =>
        s.autor_admin_id
          ? { ...s, admins: adminMap.get(String(s.autor_admin_id)) ?? null }
          : s,
      )
    } catch {
      // Tabela admins indisponível; segue sem autor admin nas linhas
    }
  }

  // Contagens para os filtros
  const { data: contagens } = await supabase
    .from('submissoes')
    .select('status')

  const countMap: Record<string, number> = {}
  contagens?.forEach((s: any) => {
    countMap[s.status] = (countMap[s.status] || 0) + 1
  })
  const pendentes = (countMap['recebido'] || 0) + (countMap['em_avaliacao'] || 0) +
    (countMap['ajustes_solicitados'] || 0) + (countMap['aprovado'] || 0)

  const filtros = [
    { key: 'pendentes',       label: 'Pendentes',    count: pendentes                       },
    { key: 'enviado_imprensa',label: 'Na imprensa',  count: countMap['enviado_imprensa'] || 0 },
    { key: 'publicado',       label: 'Publicados',   count: countMap['publicado'] || 0       },
    { key: 'rejeitado',       label: 'Recusados',    count: countMap['rejeitado'] || 0       },
    { key: 'retirado_fellow', label: 'Retirados',    count: countMap['retirado_fellow'] || 0 },
    { key: 'arquivado',       label: 'Arquivados',   count: countMap['arquivado'] || 0       },
    { key: 'todos',           label: 'Todos',        count: contagens?.length || 0           },
  ]

  return (
    <div className="space-y-8">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Assessoria de Imprensa</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Gerencie as submissões dos fellows
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2 flex-wrap justify-end">
          <Link
            href="/painel/admin/imprensa/nova"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Novo texto
          </Link>
          <Link
            href="/painel/admin/imprensa/relatorios"
            className="inline-flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Relatórios
          </Link>
          <Link
            href="/painel/admin/imprensa/fluxos"
            className="inline-flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            Fluxos do processo
          </Link>
          <Link
            href="/painel/admin/veiculos"
            className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5" />
            </svg>
            CRM de Veículos
          </Link>
        </div>
      </div>

      {/* ── Filtros ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filtros.map((f) => (
          <Link
            key={f.key}
            href={`/painel/admin/imprensa?status=${f.key}`}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              filtroStatus === f.key
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-300 hover:border-gray-700'
            }`}
          >
            {f.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-md ${
              filtroStatus === f.key ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'
            }`}>
              {f.count}
            </span>
          </Link>
        ))}
      </div>

      {/* ── Lista de submissões ───────────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {!submissoes || submissoes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">Nenhuma submissão neste filtro.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {(submissoes as any[]).map((sub) => {
              const st = STATUS_CONFIG[sub.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.recebido
              const isUrgente = sub.status === 'recebido' &&
                (Date.now() - new Date(sub.created_at).getTime()) > 86400000 // +1 dia

              const autorAdmin = sub.autor_admin_id ? sub.admins : null
              const autorNome  = sub.fellows?.nome ?? autorAdmin?.nome ?? autorAdmin?.email ?? 'Autor'
              const autorFoto  = sub.fellows?.foto_url ?? null
              const isAdminAutor = !!autorAdmin

              return (
                <Link
                  key={sub.id}
                  href={`/painel/admin/imprensa/${sub.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-800/50 transition-colors group"
                >
                  {/* Avatar do autor */}
                  <div className="flex-shrink-0">
                    {autorFoto ? (
                      <img
                        src={autorFoto}
                        alt={autorNome}
                        className="w-9 h-9 rounded-full object-cover border border-gray-700"
                      />
                    ) : (
                      <div className={`w-9 h-9 rounded-full ${isAdminAutor ? 'bg-amber-500/20 border-amber-500/30' : 'bg-emerald-500/20 border-emerald-500/30'} border flex items-center justify-center`}>
                        <span className={`${isAdminAutor ? 'text-amber-400' : 'text-emerald-400'} text-xs font-bold`}>
                          {autorNome?.charAt(0) ?? '?'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-white truncate">{sub.titulo}</p>
                      {isUrgente && (
                        <span className="flex-shrink-0 text-xs bg-red-500/15 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-md">
                          ⚠️ Aguardando resposta
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-xs text-gray-500">
                        {autorNome}
                        {isAdminAutor && (
                          <span className="ml-1.5 text-[10px] uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded">
                            Admin
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-gray-600">·</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded border ${
                        sub.tipo === 'artigo'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      }`}>
                        {sub.tipo === 'artigo' ? 'Artigo' : 'Pitch'}
                      </span>
                      <span className="text-xs text-gray-600">·</span>
                      <span className="text-xs text-gray-500">{diasDesde(sub.created_at)}</span>
                      {sub.veiculos?.nome && (
                        <>
                          <span className="text-xs text-gray-600">·</span>
                          <span className="text-xs text-gray-500">{sub.veiculos.nome}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status + seta */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${st.color}`}>
                      {st.emoji} {st.label}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
