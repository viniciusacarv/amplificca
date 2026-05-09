// app/painel/admin/imprensa/[id]/page.tsx
// Painel de revisão individual — avalia submissão e gerencia tentativas de placement

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import { atualizarSubmissao, arquivarSubmissao } from '../actions'
import { atualizarTentativa } from '../../tentativas/actions'
import { ExcluirTentativaButton } from './ExcluirTentativaButton'
import { NovaTentativaForm, type VeiculoOpcao } from './NovaTentativaForm'

const STATUS_OPTIONS = [
  { value: 'recebido',            label: 'Recebido',           emoji: '📬', desc: 'Aguardando avaliação'              },
  { value: 'em_avaliacao',        label: 'Em avaliação',       emoji: '🔍', desc: 'Você está analisando agora'        },
  { value: 'ajustes_solicitados', label: 'Ajustes solicitados',emoji: '✏️', desc: 'Fellow precisa revisar o texto'   },
  { value: 'aprovado',            label: 'Aprovado',           emoji: '✅', desc: 'Pronto para enviar à imprensa'     },
  { value: 'enviado_imprensa',    label: 'Enviado à imprensa', emoji: '📤', desc: 'Em contato com o veículo'         },
  { value: 'publicado',           label: 'Publicado',          emoji: '🎉', desc: 'Artigo está no ar'                },
  { value: 'rejeitado',           label: 'Recusado',           emoji: '❌', desc: 'Não seguirá para publicação'      },
  { value: 'retirado_fellow',     label: 'Retirado pelo fellow', emoji: '↩️', desc: 'Submissão encerrada pelo autor' },
]

const TENTATIVA_STATUS = {
  aguardando:   { label: 'Aguardando',   emoji: '⏳', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  sem_retorno:  { label: 'Sem retorno',  emoji: '🔇', color: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
  negativo:     { label: 'Negativo',     emoji: '❌', color: 'bg-red-500/15 text-red-400 border-red-500/20'          },
  publicado:    { label: 'Publicado',    emoji: '🎉', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
} as const

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function toInputDate(iso?: string | null) {
  if (!iso) return ''
  return iso.slice(0, 10)
}

export default async function AdminImprensaReviewPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { sucesso?: string; tentativa?: string; atualizado?: string; excluido?: string; arquivado?: string; erro?: string }
}) {
  noStore()
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  const { data: sub } = await supabase
    .from('submissoes')
    .select('*, fellows(id, nome, foto_url, area, estado, email), veiculos(id, nome)')
    .eq('id', params.id)
    .single()

  if (!sub) redirect('/painel/admin/imprensa')

  // Lista de veículos ativos para selects (inclui contatos para o dropdown
  // de responsável no formulário de nova tentativa)
  const { data: veiculos } = await supabase
    .from('veiculos')
    .select('id, nome, tipo_relacionamento, contatos')
    .eq('ativo', true)
    .order('nome')

  const veiculosOpcoes: VeiculoOpcao[] = (veiculos ?? []).map((v: any) => ({
    id:       v.id,
    nome:     v.nome,
    contatos: Array.isArray(v.contatos) ? v.contatos : [],
  }))

  // Tentativas de placement desta submissão
  const { data: tentativasRaw } = await supabase
    .from('tentativas_placement')
    .select('*')
    .eq('submissao_id', params.id)
    .order('enviado_em', { ascending: false })

  const veiculoIds = [...new Set(tentativasRaw?.map(t => t.veiculo_id).filter(Boolean))]
  const { data: veiculosData } = await supabase
    .from('veiculos')
    .select('id, nome, tipo_relacionamento')
    .in('id', veiculoIds.length ? veiculoIds : [''])

  const tentativas = tentativasRaw?.map(t => ({
    ...t,
    veiculos: veiculosData?.find(v => String(v.id) === String(t.veiculo_id))
  })) || []

  const fellow = sub.fellows as any
  const veiculoAtual = sub.veiculos as any
  const podeTentativa = ['aprovado', 'enviado_imprensa', 'publicado'].includes(sub.status)

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="space-y-6">

      {/* ── Breadcrumb ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/painel/admin/imprensa" className="hover:text-gray-300 transition-colors">
          Assessoria de Imprensa
        </Link>
        <span>›</span>
        <span className="text-gray-400 truncate max-w-xs">{sub.titulo}</span>
      </div>

      {/* ── Alertas de sucesso ───────────────────────────────────── */}
      {searchParams.sucesso && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-400 text-sm">
          ✅ Submissão atualizada e fellow notificado com sucesso.
        </div>
      )}
      {searchParams.tentativa && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-blue-400 text-sm">
          📋 Tentativa de placement registrada com sucesso.
        </div>
      )}
      {searchParams.atualizado && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-400 text-sm">
          ✅ Resultado da tentativa atualizado.
        </div>
      )}
      {searchParams.erro === 'tentativa' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          ❌ Não foi possível registrar a tentativa. Verifique se este veículo já está cadastrado para esta submissão.
        </div>
      )}
      {searchParams.excluido && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          🗑️ Tentativa de placement excluída.
        </div>
      )}
      {searchParams.erro === 'submissao' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          ❌ Submissão não encontrada.
        </div>
      )}
      {searchParams.arquivado && (
        <div className="bg-zinc-500/10 border border-zinc-500/20 rounded-xl p-4 text-zinc-300 text-sm">
          🗄️ Submissão arquivada. O fellow foi notificado com o motivo informado.
        </div>
      )}
      {searchParams.erro === 'motivo_obrigatorio' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          ❌ É obrigatório informar um motivo para arquivar a submissão.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Coluna esquerda: info da submissão ───────────────────── */}
        <div className="lg:col-span-3 space-y-5">

          {/* Card da submissão */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-start gap-3 mb-5">
              <span className={`mt-0.5 flex-shrink-0 px-2 py-0.5 rounded-md text-xs font-medium border ${
                sub.tipo === 'artigo'
                  ? 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                  : 'bg-purple-500/15 text-purple-400 border-purple-500/20'
              }`}>
                {sub.tipo === 'artigo' ? 'Artigo' : 'Pitch'}
              </span>
              <span className="text-xs text-gray-500 mt-0.5">{formatDateTime(sub.created_at)}</span>
            </div>

            <h2 className="text-lg font-bold text-white leading-snug mb-4">{sub.titulo}</h2>

            {sub.status === 'arquivado' && sub.motivo_arquivamento && (
              <div className="mb-4 bg-zinc-500/10 border border-zinc-500/20 rounded-xl p-4">
                <p className="text-xs uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
                  🗄️ Submissão arquivada
                </p>
                <p className="text-sm text-zinc-200 whitespace-pre-wrap">{sub.motivo_arquivamento}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {sub.google_doc_url ? (
                <a
                  href={sub.google_doc_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-400 text-sm px-4 py-2.5 rounded-xl font-medium transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  Doc do fellow
                </a>
              ) : (
                <p className="text-sm text-gray-600 italic">Nenhum documento anexado.</p>
              )}
            </div>
          </div>

          {/* Card do fellow — com link para o perfil */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs text-gray-500 uppercase tracking-wider">Fellow</h3>
              {fellow?.id && (
                <Link
                  href={`/painel/admin/fellows/${fellow.id}`}
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Ver perfil completo →
                </Link>
              )}
            </div>
            <div className="flex items-center gap-3">
              {fellow?.foto_url ? (
                <img src={fellow.foto_url} alt={fellow.nome} className="w-10 h-10 rounded-full object-cover border border-gray-700" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <span className="text-emerald-400 text-sm font-bold">{fellow?.nome?.charAt(0)}</span>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-white">{fellow?.nome}</p>
                <p className="text-xs text-gray-500">{fellow?.email}</p>
                <p className="text-xs text-gray-600 mt-0.5">{fellow?.area} · {fellow?.estado}</p>
              </div>
            </div>
          </div>

          {/* ── Tentativas de placement ──────────────────────────── */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-white">Tentativas de placement</h3>
                {veiculoAtual && (
                  <p className="text-xs text-gray-600 mt-0.5">
                    Veículo principal:{' '}
                    <Link href={`/painel/admin/veiculos/${veiculoAtual.id}/view`} className="text-gray-400 hover:text-gray-200 transition-colors">
                      {veiculoAtual.nome} →
                    </Link>
                  </p>
                )}
              </div>
              <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">
                {tentativas?.length ?? 0}
              </span>
            </div>

            {/* Log de tentativas — ordem cronológica crescente (mais antiga primeiro) */}
            {tentativas && tentativas.length > 0 ? (
              <div className="relative mb-6">
                {/* linha vertical do timeline */}
                <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-800" />

                <div className="space-y-0">
                  {[...(tentativas as any[])].reverse().map((t, idx, arr) => {
                    const st = TENTATIVA_STATUS[t.status as keyof typeof TENTATIVA_STATUS] ?? TENTATIVA_STATUS.aguardando
                    const vt = t.veiculos as any
                    const isLast = idx === arr.length - 1
                    return (
                      <div key={t.id} className={`relative pl-8 ${isLast ? 'pb-0' : 'pb-5'}`}>
                        {/* ponto no timeline */}
                        <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] ${
                          t.status === 'publicado'   ? 'border-emerald-500 bg-emerald-500/20' :
                          t.status === 'negativo'    ? 'border-red-500 bg-red-500/20' :
                          t.status === 'sem_retorno' ? 'border-orange-500 bg-orange-500/20' :
                          'border-yellow-500 bg-yellow-500/20'
                        }`}>
                          {st.emoji}
                        </div>

                        <div className="border border-gray-800 rounded-xl p-3 space-y-2">
                          {/* cabeçalho: veículo + status + data */}
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <span className="text-sm font-semibold text-white truncate">{vt?.nome ?? '—'}</span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border flex-shrink-0 ${st.color}`}>
                                {st.emoji} {st.label}
                              </span>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs text-gray-500">{formatDateTime(t.enviado_em)}</p>
                              {t.respondido_em && (
                                <p className="text-xs text-gray-600">Resp. {formatDate(t.respondido_em)}</p>
                              )}
                            </div>
                          </div>

                          {/* metadados */}
                          {t.responsavel_nome && (
                            <p className="text-xs text-gray-600">por {t.responsavel_nome}</p>
                          )}
                          {t.notas && (
                            <p className="text-xs text-gray-400 leading-relaxed">{t.notas}</p>
                          )}
                          {t.motivo && (
                            <p className="text-xs text-orange-400 leading-relaxed">↳ {t.motivo}</p>
                          )}

                          {/* Links: doc do assessor + artigo publicado (por placement) */}
                          {(t.doc_imprensa_url || t.artigo_url) && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {t.doc_imprensa_url && (
                                <a
                                  href={t.doc_imprensa_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-400 text-xs px-2.5 py-1 rounded-lg font-medium transition-colors"
                                >
                                  📄 Doc para o assessor
                                </a>
                              )}
                              {t.artigo_url && (
                                <a
                                  href={t.artigo_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-lg font-medium transition-colors"
                                >
                                  🔗 Artigo publicado
                                </a>
                              )}
                            </div>
                          )}

                          {/* Excluir tentativa */}
                          <ExcluirTentativaButton tentativaId={t.id} />

                          {/* Formulário por tentativa: edita doc do assessor, URL do artigo
                              e (se aguardando) o resultado da tentativa */}
                          <form action={atualizarTentativa} className="pt-3 border-t border-gray-800 space-y-3">
                            <input type="hidden" name="tentativa_id" value={t.id} />

                            <div>
                              <label className="block text-[11px] text-gray-500 uppercase tracking-wider mb-1">
                                Doc para o assessor de imprensa
                              </label>
                              <input
                                name="doc_imprensa_url"
                                type="url"
                                defaultValue={t.doc_imprensa_url || ''}
                                placeholder="https://docs.google.com/..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 transition-colors"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] text-gray-500 uppercase tracking-wider mb-1">
                                URL do artigo publicado
                              </label>
                              <input
                                name="artigo_url"
                                type="url"
                                defaultValue={t.artigo_url || ''}
                                placeholder="https://..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
                              />
                            </div>

                            {t.status === 'aguardando' && (
                              <>
                                <p className="text-[11px] text-gray-500 uppercase tracking-wider pt-1">Atualizar resultado</p>

                                <div className="grid grid-cols-2 gap-2">
                                  {(['sem_retorno', 'negativo', 'publicado'] as const).map((s) => {
                                    const opt = TENTATIVA_STATUS[s]
                                    return (
                                      <label key={s} className="cursor-pointer">
                                        <input type="radio" name="status" value={s} className="sr-only peer" />
                                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer peer-checked:ring-1 peer-checked:ring-emerald-500 ${opt.color} transition-all`}>
                                          {opt.emoji} {opt.label}
                                        </span>
                                      </label>
                                    )
                                  })}
                                </div>

                                <input
                                  name="respondido_em"
                                  type="date"
                                  defaultValue={today}
                                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/60 transition-colors"
                                />

                                <textarea
                                  name="motivo"
                                  rows={2}
                                  placeholder="Motivo da negativa ou observações…"
                                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-emerald-500/60 transition-colors"
                                />
                              </>
                            )}

                            <button
                              type="submit"
                              className="w-full bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold py-2 rounded-xl transition-colors"
                            >
                              Salvar
                            </button>
                          </form>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600 italic mb-5">Nenhuma tentativa registrada ainda.</p>
            )}

            {/* Formulário: Nova tentativa */}
            {podeTentativa && (
              <div className="border-t border-gray-800 pt-5">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Registrar nova tentativa</p>
                <NovaTentativaForm
                  submissaoId={sub.id}
                  veiculos={veiculosOpcoes}
                  today={today}
                />
              </div>
            )}

            {!podeTentativa && (
              <p className="text-xs text-gray-600 italic">
                Tentativas de placement ficam disponíveis quando a submissão é aprovada.
              </p>
            )}
          </div>
        </div>

        {/* ── Coluna direita: painel de ação editorial ─────────────── */}
        <div className="lg:col-span-2 space-y-5 sticky top-20 self-start">
          <form action={atualizarSubmissao} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-semibold text-white">Atualizar submissão</h3>
            <input type="hidden" name="submissao_id" value={sub.id} />
            <input type="hidden" name="status" value={sub.status} />

            {/* Status */}
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-3">Status</label>
              <div className="space-y-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="submit"
                    name="next_status"
                    value={opt.value}
                    formNoValidate
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:border-gray-600 ${
                      sub.status === opt.value
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-gray-800/40 border-gray-700/40'
                    }`}
                  >
                    <span className="text-base">{opt.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white">{opt.label}</p>
                      <p className="text-xs text-gray-600 leading-tight">{opt.desc}</p>
                    </div>
                    {sub.status === opt.value && (
                      <span className="text-[11px] font-semibold text-emerald-400 flex-shrink-0">Atual</span>
                    )}
                    {sub.status !== opt.value && (
                      <span className="text-[11px] font-semibold text-gray-500 flex-shrink-0">Mover</span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Clique em uma etapa para mudar o status imediatamente. O feedback e o doc para a assessoria
                ficam diretamente no Google Docs e em cada placement.
              </p>
            </div>

          </form>

          {/* ── Arquivamento administrativo ─────────────────────────── */}
          <details className="bg-gray-900 border border-gray-800 rounded-2xl group">
            <summary className="cursor-pointer list-none p-5 flex items-center justify-between gap-3 hover:bg-gray-800/30 transition-colors rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="text-base">🗄️</span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {sub.status === 'arquivado' ? 'Atualizar arquivamento' : 'Arquivar submissão'}
                  </p>
                  <p className="text-xs text-gray-500 leading-tight">
                    Encerra a submissão fora do fluxo do fellow (ex.: inadimplência).
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500 group-open:rotate-180 transition-transform">▾</span>
            </summary>

            <form action={arquivarSubmissao} className="px-5 pb-5 space-y-3 border-t border-gray-800 pt-4">
              <input type="hidden" name="submissao_id" value={sub.id} />

              <label className="block">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Motivo (obrigatório)</span>
                <textarea
                  name="motivo_arquivamento"
                  rows={3}
                  required
                  defaultValue={sub.motivo_arquivamento ?? ''}
                  placeholder="Ex.: Fellow inadimplente desde MM/AAAA. Submissão suspensa até regularização."
                  className="mt-1.5 w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-zinc-500/60 transition-colors"
                />
              </label>

              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 text-xs text-yellow-300/90">
                ⚠️ O fellow será notificado e o motivo aparecerá na submissão. Esta ação substitui o status atual por <span className="font-semibold">Arquivado</span>.
              </div>

              <button
                type="submit"
                className="w-full bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                {sub.status === 'arquivado' ? 'Atualizar motivo' : 'Arquivar submissão'}
              </button>
            </form>
          </details>
        </div>
      </div>
    </div>
  )
}
