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

  // Busca com join em fellows e veiculos
  let query = supabase
    .from('submissoes')
    .select('id, titulo, tipo, status, feedback, created_at, updated_at, fellows(nome, foto_url), veiculos(nome)')
    .order('created_at', { ascending: true }) // mais antigas primeiro (fila de prioridade)

  if (filtroStatus === 'pendentes') {
    query = query.in('status', ['recebido', 'em_avaliacao', 'ajustes_solicitados', 'aprovado'])
  } else if (filtroStatus !== 'todos') {
    query = query.eq('status', filtroStatus)
  }

  const { data: submissoes } = await query

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
        <Link
          href="/painel/admin/veiculos"
          className="flex-shrink-0 inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm px-4 py-2.5 rounded-xl transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5" />
          </svg>
          CRM de Veículos
        </Link>
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

              return (
                <Link
                  key={sub.id}
                  href={`/painel/admin/imprensa/${sub.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-800/50 transition-colors group"
                >
                  {/* Avatar do fellow */}
                  <div className="flex-shrink-0">
                    {sub.fellows?.foto_url ? (
                      <img
                        src={sub.fellows.foto_url}
                        alt={sub.fellows.nome}
                        className="w-9 h-9 rounded-full object-cover border border-gray-700"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <span className="text-emerald-400 text-xs font-bold">
                          {sub.fellows?.nome?.charAt(0) ?? '?'}
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
                      <span className="text-xs text-gray-500">{sub.fellows?.nome ?? 'Fellow'}</span>
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
