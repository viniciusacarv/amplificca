// app/painel/admin/fellows/[id]/page.tsx
// Perfil completo do fellow — submissões + timeline de tentativas de placement

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const STATUS_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  recebido:            { label: 'Recebido',        emoji: '📬', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20'         },
  em_avaliacao:        { label: 'Em avaliação',     emoji: '🔍', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'   },
  ajustes_solicitados: { label: 'Ajustes',          emoji: '✏️', color: 'bg-orange-500/15 text-orange-400 border-orange-500/20'  },
  aprovado:            { label: 'Aprovado',         emoji: '✅', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'},
  enviado_imprensa:    { label: 'Na imprensa',      emoji: '📤', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20'         },
  publicado:           { label: 'Publicado',        emoji: '🎉', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'},
  rejeitado:           { label: 'Recusado',         emoji: '❌', color: 'bg-red-500/15 text-red-400 border-red-500/20'           },
}

const TENTATIVA_STATUS: Record<string, { label: string; emoji: string; color: string }> = {
  aguardando:  { label: 'Aguardando',  emoji: '⏳', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'  },
  sem_retorno: { label: 'Sem retorno', emoji: '🔇', color: 'bg-orange-500/15 text-orange-400 border-orange-500/20'  },
  negativo:    { label: 'Negativo',    emoji: '❌', color: 'bg-red-500/15 text-red-400 border-red-500/20'            },
  publicado:   { label: 'Publicado',  emoji: '🎉', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'},
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function FellowPerfilPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  const { data: fellow } = await supabase
    .from('fellows')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!fellow) redirect('/painel/admin/fellows')

  // Todas as submissões internas do fellow
  const { data: submissoes } = await supabase
    .from('submissoes')
    .select('id, titulo, tipo, status, created_at, updated_at, artigo_url, veiculos(id, nome)')
    .eq('fellow_id', params.id)
    .order('created_at', { ascending: false })

  // Artigos publicados reais (tabela artigos — inclui publicações independentes)
  const { data: artigos } = await supabase
    .from('artigos')
    .select('id, titulo, url, veiculo, data_publicacao')
    .eq('fellow_id', Number(params.id))
    .order('data_publicacao', { ascending: false })

  // Todas as tentativas de placement do fellow (histórico do CRM interno)
  const { data: tentativas } = await supabase
    .from('tentativas_placement')
    .select('*, submissoes(id, titulo), veiculos(id, nome, tipo_relacionamento)')
    .eq('fellow_id', params.id)
    .order('enviado_em', { ascending: false })

  // Métricas rápidas
  const totalSub       = submissoes?.length ?? 0
  // Publicações reais vêm da tabela artigos, não de submissoes
  const totalPub       = artigos?.length ?? 0
  const totalTentativas = tentativas?.length ?? 0
  const totalPublicadas = tentativas?.filter((t: any) => t.status === 'publicado').length ?? 0
  const taxaAceite = totalTentativas > 0
    ? Math.round((totalPublicadas / totalTentativas) * 100)
    : null

  return (
    <div className="space-y-8">

      {/* ── Breadcrumb ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/painel/admin/fellows" className="hover:text-gray-300 transition-colors">
          Fellows
        </Link>
        <span>›</span>
        <span className="text-gray-400">{fellow.nome}</span>
      </div>

      {/* ── Card do fellow ────────────────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          {fellow.foto_url ? (
            <img
              src={fellow.foto_url}
              alt={fellow.nome}
              className="w-16 h-16 rounded-2xl object-cover border border-gray-700 flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-400 text-2xl font-bold">{fellow.nome?.charAt(0)}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white">{fellow.nome}</h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-sm text-gray-400">{fellow.email}</span>
              {fellow.area && (
                <span className="text-xs text-gray-600 bg-gray-800 border border-gray-700 px-2.5 py-0.5 rounded-full">
                  {fellow.area}
                </span>
              )}
              {fellow.estado && (
                <span className="text-xs text-gray-600 bg-gray-800 border border-gray-700 px-2.5 py-0.5 rounded-full">
                  {fellow.estado}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-800">
          {[
            { label: 'Submissões',      value: totalSub,        color: 'text-white' },
            { label: 'Publicações',     value: totalPub,        color: 'text-emerald-400' },
            { label: 'Tentativas',      value: totalTentativas, color: 'text-blue-400' },
            { label: 'Taxa de aceite',  value: taxaAceite !== null ? `${taxaAceite}%` : '—', color: 'text-yellow-400' },
          ].map((m) => (
            <div key={m.label} className="text-center">
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
              <p className="text-xs text-gray-500 mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Coluna esquerda: artigos publicados + submissões ────── */}
        <div className="lg:col-span-3 space-y-8">

          {/* Artigos publicados — fonte: tabela artigos (verdade absoluta) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                Artigos publicados ({totalPub})
              </h2>
              <span className="text-xs text-gray-600">inclui publicações independentes</span>
            </div>

            {!artigos || artigos.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
                <p className="text-gray-500 text-sm">Nenhum artigo publicado ainda.</p>
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="divide-y divide-gray-800">
                  {(artigos as any[]).map((a) => (
                    <a
                      key={a.id}
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 px-5 py-4 hover:bg-gray-800/50 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors truncate">
                          {a.titulo}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-emerald-600 font-medium">{a.veiculo}</span>
                          <span className="text-xs text-gray-700">·</span>
                          <span className="text-xs text-gray-600">
                            {new Date(a.data_publicacao + 'T12:00:00').toLocaleDateString('pt-BR', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 flex-shrink-0 transition-colors">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submissões internas ao Amplifica */}
          <div className="space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            Submissões internas ({totalSub})
          </h2>

          {!submissoes || submissoes.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
              <p className="text-gray-500 text-sm">Nenhuma submissão ainda.</p>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="divide-y divide-gray-800">
                {(submissoes as any[]).map((sub) => {
                  const st = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.recebido
                  const veiculo = sub.veiculos as any
                  return (
                    <Link
                      key={sub.id}
                      href={`/painel/admin/imprensa/${sub.id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-gray-800/50 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-white truncate">{sub.titulo}</p>
                          <span className={`flex-shrink-0 text-xs px-1.5 py-0.5 rounded border ${
                            sub.tipo === 'artigo'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          }`}>
                            {sub.tipo === 'artigo' ? 'Artigo' : 'Pitch'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-gray-600">{formatDate(sub.created_at)}</span>
                          {veiculo?.nome && (
                            <>
                              <span className="text-xs text-gray-700">·</span>
                              <span className="text-xs text-gray-500">{veiculo.nome}</span>
                            </>
                          )}
                          {sub.artigo_url && (
                            <a
                              href={sub.artigo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                              Ver artigo ↗
                            </a>
                          )}
                        </div>
                      </div>
                      <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium border ${st.color}`}>
                        {st.emoji} {st.label}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-700 group-hover:text-gray-400 flex-shrink-0 transition-colors">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
          </div>{/* fecha space-y-4 das submissões */}
        </div>{/* fecha lg:col-span-3 */}

        {/* ── Coluna direita: timeline de tentativas ───────────────── */}
        <div className="lg:col-span-2 space-y-5">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            Histórico de Imprensa ({totalTentativas})
          </h2>

          {!tentativas || tentativas.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
              <p className="text-gray-500 text-sm">Nenhuma tentativa registrada ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(tentativas as any[]).map((t) => {
                const st = TENTATIVA_STATUS[t.status] ?? TENTATIVA_STATUS.aguardando
                const veiculo = t.veiculos as any
                const submissao = t.submissoes as any
                return (
                  <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-white">{veiculo?.nome ?? '—'}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${st.color}`}>
                          {st.emoji} {st.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-600 flex-shrink-0">{formatDate(t.enviado_em)}</span>
                    </div>

                    {submissao?.titulo && (
                      <Link
                        href={`/painel/admin/imprensa/${submissao.id}`}
                        className="block text-xs text-gray-500 hover:text-gray-300 transition-colors truncate"
                      >
                        {submissao.titulo} →
                      </Link>
                    )}

                    {t.responsavel_nome && (
                      <p className="text-xs text-gray-600">Por {t.responsavel_nome}</p>
                    )}

                    {t.motivo && (
                      <p className="text-xs text-orange-400 leading-relaxed">{t.motivo}</p>
                    )}

                    {t.notas && (
                      <p className="text-xs text-gray-500 leading-relaxed">{t.notas}</p>
                    )}

                    {t.respondido_em && (
                      <p className="text-xs text-gray-600">
                        Respondido em {formatDate(t.respondido_em)}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
