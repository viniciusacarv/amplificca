// app/painel/admin/imprensa/[id]/page.tsx
// Painel de revisão individual — admin avalia e toma decisão sobre a submissão

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { atualizarSubmissao } from '../actions'

const STATUS_OPTIONS = [
  { value: 'recebido',            label: 'Recebido',           emoji: '📬', desc: 'Aguardando avaliação'              },
  { value: 'em_avaliacao',        label: 'Em avaliação',       emoji: '🔍', desc: 'Você está analisando agora'        },
  { value: 'ajustes_solicitados', label: 'Ajustes solicitados',emoji: '✏️', desc: 'Fellow precisa revisar o texto'   },
  { value: 'aprovado',            label: 'Aprovado',           emoji: '✅', desc: 'Pronto para enviar à imprensa'     },
  { value: 'enviado_imprensa',    label: 'Enviado à imprensa', emoji: '📤', desc: 'Em contato com o veículo'         },
  { value: 'publicado',           label: 'Publicado',          emoji: '🎉', desc: 'Artigo está no ar'                },
  { value: 'rejeitado',           label: 'Recusado',           emoji: '❌', desc: 'Não seguirá para publicação'      },
]

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function AdminImprensaReviewPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { sucesso?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  const { data: sub } = await supabase
    .from('submissoes')
    .select('*, fellows(id, nome, foto_url, area, estado, email), veiculos(id, nome)')
    .eq('id', params.id)
    .single()

  if (!sub) redirect('/painel/admin/imprensa')

  // Lista de veículos para o select
  const { data: veiculos } = await supabase
    .from('veiculos')
    .select('id, nome, tipo_relacionamento')
    .eq('ativo', true)
    .order('nome')

  const fellow = sub.fellows as any
  const veiculoAtual = sub.veiculos as any

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

      {/* ── Sucesso ──────────────────────────────────────────────── */}
      {searchParams.sucesso && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-400 text-sm">
          ✅ Submissão atualizada e fellow notificado com sucesso.
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

            {/* Google Doc */}
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
                Abrir Google Doc
              </a>
            ) : (
              <p className="text-sm text-gray-600 italic">Nenhum documento anexado.</p>
            )}

            {/* Feedback atual */}
            {sub.feedback && (
              <div className="mt-4 p-3 bg-gray-800 rounded-xl border border-gray-700">
                <p className="text-xs text-gray-500 mb-1">Último feedback:</p>
                <p className="text-sm text-gray-300 leading-relaxed">{sub.feedback}</p>
              </div>
            )}

            {/* Artigo publicado */}
            {sub.artigo_url && (
              <div className="mt-4">
                <a
                  href={sub.artigo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  Ver artigo publicado
                </a>
              </div>
            )}
          </div>

          {/* Card do fellow */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-4">Fellow</h3>
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

          {/* Veículo atual */}
          {veiculoAtual && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Veículo selecionado</h3>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">{veiculoAtual.nome}</p>
                <Link href="/painel/admin/veiculos" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                  Ver CRM →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── Coluna direita: painel de ação ────────────────────────── */}
        <div className="lg:col-span-2">
          <form action={atualizarSubmissao} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5 sticky top-20">
            <h3 className="text-sm font-semibold text-white">Atualizar submissão</h3>
            <input type="hidden" name="submissao_id" value={sub.id} />

            {/* Status */}
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-3">Status</label>
              <div className="space-y-2">
                {STATUS_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:border-gray-600 ${
                      sub.status === opt.value
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-gray-800/40 border-gray-700/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={opt.value}
                      defaultChecked={sub.status === opt.value}
                      className="sr-only"
                    />
                    <span className="text-base">{opt.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white">{opt.label}</p>
                      <p className="text-xs text-gray-600 leading-tight">{opt.desc}</p>
                    </div>
                    {sub.status === opt.value && (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-emerald-400 flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Veículo */}
            <div>
              <label htmlFor="veiculo_id" className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                Veículo de imprensa
              </label>
              <select
                id="veiculo_id"
                name="veiculo_id"
                defaultValue={sub.veiculo_id || ''}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60 transition-colors"
              >
                <option value="">— Selecionar veículo —</option>
                {(veiculos as any[])?.map((v) => (
                  <option key={v.id} value={v.id}>{v.nome}</option>
                ))}
              </select>
            </div>

            {/* Feedback */}
            <div>
              <label htmlFor="feedback" className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                Feedback para o fellow
              </label>
              <textarea
                id="feedback"
                name="feedback"
                rows={4}
                defaultValue={sub.feedback || ''}
                placeholder="Explique sua decisão, oriente o fellow sobre os próximos passos ou informe o status de envio..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
              <p className="text-xs text-gray-600 mt-1">Obrigatório para ajustes e recusa. Visível para o fellow.</p>
            </div>

            {/* URL de publicação */}
            <div>
              <label htmlFor="artigo_url" className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                URL do artigo publicado
              </label>
              <input
                id="artigo_url"
                name="artigo_url"
                type="url"
                defaultValue={sub.artigo_url || ''}
                placeholder="https://..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black font-semibold text-sm py-2.5 rounded-xl transition-all"
            >
              Salvar e notificar fellow
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
