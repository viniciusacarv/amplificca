// app/painel/imprensa/page.tsx
// Módulo de Assessoria de Imprensa — visão do fellow

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const STATUS_CONFIG = {
  recebido:            { label: 'Recebido',           emoji: '📬', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20'     },
  em_avaliacao:        { label: 'Em avaliação',        emoji: '🔍', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  ajustes_solicitados: { label: 'Ajustes solicitados', emoji: '✏️', color: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
  aprovado:            { label: 'Aprovado',            emoji: '✅', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  enviado_imprensa:    { label: 'Enviado à imprensa',  emoji: '📤', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20'     },
  publicado:           { label: 'Publicado',           emoji: '🎉', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  rejeitado:           { label: 'Recusado',            emoji: '❌', color: 'bg-red-500/15 text-red-400 border-red-500/20'       },
} as const

const PIPELINE_STEPS = [
  { key: 'recebido',            label: 'Recebido',    emoji: '📬' },
  { key: 'em_avaliacao',        label: 'Avaliando',   emoji: '🔍' },
  { key: 'ajustes_solicitados', label: 'Ajustes',     emoji: '✏️' },
  { key: 'aprovado',            label: 'Aprovado',    emoji: '✅' },
  { key: 'enviado_imprensa',    label: 'Na imprensa', emoji: '📤' },
  { key: 'publicado',           label: 'Publicado',   emoji: '🎉' },
] as const

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default async function ImprensaPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  const { data: fellow } = await supabase
    .from('fellows')
    .select('id, nome')
    .eq('email', user.email)
    .maybeSingle()

  const { data: submissoes } = fellow
    ? await supabase
        .from('submissoes')
        .select('id, titulo, tipo, status, feedback, artigo_url, google_doc_url, created_at, updated_at, veiculos(nome)')
        .eq('fellow_id', fellow.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  // Conta por status para o pipeline
  const countByStatus: Record<string, number> = {}
  submissoes?.forEach((s: any) => {
    countByStatus[s.status] = (countByStatus[s.status] || 0) + 1
  })

  const totalPublicados = countByStatus['publicado'] || 0
  const totalAtivos = (submissoes?.length || 0) - (countByStatus['rejeitado'] || 0) - totalPublicados

  return (
    <div className="space-y-8">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Assessoria de Imprensa</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Envie seus textos e acompanhe cada etapa do processo
          </p>
        </div>
        <Link
          href="/painel/imprensa/nova"
          className="flex-shrink-0 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-semibold text-sm px-4 py-2.5 rounded-xl transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Enviar texto
        </Link>
      </div>

      {/* ── Cards rápidos ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total enviado</p>
          <span className="text-4xl font-bold text-white">{submissoes?.length ?? 0}</span>
          <p className="text-xs text-gray-500 mt-1">{totalAtivos} em andamento</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-600/10 to-teal-700/5 border border-emerald-600/20 rounded-2xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Publicados</p>
          <span className="text-4xl font-bold text-emerald-400">{totalPublicados}</span>
          <p className="text-xs text-gray-500 mt-1">artigos no ar</p>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Aguardando</p>
          <span className="text-4xl font-bold text-yellow-400">
            {(countByStatus['recebido'] || 0) + (countByStatus['em_avaliacao'] || 0)}
          </span>
          <p className="text-xs text-gray-500 mt-1">em avaliação</p>
        </div>
      </div>

      {/* ── Pipeline visual ──────────────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
          Pipeline de Status
        </h2>
        <div className="flex items-stretch gap-1.5 overflow-x-auto pb-1">
          {PIPELINE_STEPS.map((step, i) => {
            const count = countByStatus[step.key] || 0
            const active = count > 0
            return (
              <div key={step.key} className="flex items-center gap-1.5 flex-shrink-0">
                <div className={`flex flex-col items-center justify-between px-4 py-3 rounded-xl border min-w-[90px] transition-all ${
                  active
                    ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                    : 'bg-gray-800/40 border-gray-700/40'
                }`}>
                  <span className="text-xl">{step.emoji}</span>
                  <span className={`text-[11px] font-medium mt-1.5 text-center leading-tight ${active ? 'text-emerald-400' : 'text-gray-600'}`}>
                    {step.label}
                  </span>
                  <span className={`text-2xl font-bold mt-1 tabular-nums ${active ? 'text-white' : 'text-gray-700'}`}>
                    {count}
                  </span>
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-700 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                )}
              </div>
            )
          })}
          {/* Rejeitados fora do fluxo principal */}
          {(countByStatus['rejeitado'] || 0) > 0 && (
            <>
              <div className="w-px bg-gray-700/50 mx-1 self-stretch" />
              <div className="flex flex-col items-center justify-between px-4 py-3 rounded-xl border min-w-[90px] bg-red-500/10 border-red-500/20 flex-shrink-0">
                <span className="text-xl">❌</span>
                <span className="text-[11px] font-medium mt-1.5 text-red-400">Recusado</span>
                <span className="text-2xl font-bold mt-1 text-white">{countByStatus['rejeitado']}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Lista de submissões ───────────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
          Minhas Submissões
        </h2>

        {!submissoes || submissoes.length === 0 ? (
          <div className="text-center py-14">
            <div className="text-5xl mb-4">✍️</div>
            <p className="text-gray-400 text-sm font-medium">Você ainda não enviou nenhum texto.</p>
            <p className="text-gray-600 text-xs mt-1">Envie seu primeiro artigo ou pitch e acompanhe o processo aqui.</p>
            <Link
              href="/painel/imprensa/nova"
              className="mt-5 inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
            >
              Enviar agora →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {(submissoes as any[]).map((sub) => {
              const st = STATUS_CONFIG[sub.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.recebido
              const hasAjustes = sub.status === 'ajustes_solicitados' && sub.feedback
              const hasRejeicao = sub.status === 'rejeitado' && sub.feedback

              return (
                <div
                  key={sub.id}
                  className="group flex items-start gap-4 p-4 bg-gray-800/40 border border-gray-700/40 rounded-xl hover:border-gray-600/60 hover:bg-gray-800/60 transition-all"
                >
                  {/* Badge de tipo */}
                  <span className={`mt-0.5 flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
                    sub.tipo === 'artigo'
                      ? 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                      : 'bg-purple-500/15 text-purple-400 border-purple-500/20'
                  }`}>
                    {sub.tipo === 'artigo' ? 'Artigo' : 'Pitch'}
                  </span>

                  {/* Conteúdo principal */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white leading-snug truncate">{sub.titulo}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                      <p className="text-xs text-gray-500">{formatDate(sub.created_at)}</p>
                      {(sub.veiculos as any)?.nome && (
                        <p className="text-xs text-gray-500">· {(sub.veiculos as any).nome}</p>
                      )}
                      {sub.google_doc_url && (
                        <a
                          href={sub.google_doc_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          · Ver documento →
                        </a>
                      )}
                    </div>

                    {/* Feedback de ajustes ou rejeição */}
                    {(hasAjustes || hasRejeicao) && (
                      <div className={`mt-2.5 text-xs p-2.5 rounded-lg leading-relaxed ${
                        hasRejeicao
                          ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                          : 'bg-orange-500/10 text-orange-300 border border-orange-500/20'
                      }`}>
                        <span className="font-semibold">Feedback da Sara: </span>
                        {sub.feedback}
                      </div>
                    )}

                    {/* Link do artigo publicado */}
                    {sub.artigo_url && (
                      <a
                        href={sub.artigo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                        Ver artigo publicado
                      </a>
                    )}
                  </div>

                  {/* Badge de status */}
                  <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${st.color}`}>
                    {st.emoji} {st.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
