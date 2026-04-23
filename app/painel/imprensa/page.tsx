// app/painel/imprensa/page.tsx
// Modulo de Assessoria de Imprensa - visao do fellow

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { retirarSubmissao } from './actions'

const STATUS_CONFIG = {
  recebido: { label: 'Recebido', emoji: '📬', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  em_avaliacao: { label: 'Em avaliação', emoji: '🔍', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  ajustes_solicitados: { label: 'Ajustes solicitados', emoji: '✏️', color: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
  aprovado: { label: 'Aprovado', emoji: '✅', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  enviado_imprensa: { label: 'Enviado à imprensa', emoji: '📤', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  publicado: { label: 'Publicado', emoji: '🎉', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  rejeitado: { label: 'Recusado', emoji: '❌', color: 'bg-red-500/15 text-red-400 border-red-500/20' },
  retirado_fellow: { label: 'Retirado por você', emoji: '↩️', color: 'bg-gray-500/15 text-gray-300 border-gray-500/20' },
} as const

const PIPELINE_STEPS = [
  { key: 'recebido', label: 'Recebido', emoji: '📬' },
  { key: 'em_avaliacao', label: 'Avaliando', emoji: '🔍' },
  { key: 'ajustes_solicitados', label: 'Ajustes', emoji: '✏️' },
  { key: 'aprovado', label: 'Aprovado', emoji: '✅' },
  { key: 'enviado_imprensa', label: 'Na imprensa', emoji: '📤' },
  { key: 'publicado', label: 'Publicado', emoji: '🎉' },
] as const

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getPipelineIndex(status: string) {
  return PIPELINE_STEPS.findIndex((step) => step.key === status)
}

export default async function ImprensaPage({
  searchParams,
}: {
  searchParams: { retirada?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
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

  const countByStatus: Record<string, number> = {}
  submissoes?.forEach((s: any) => {
    countByStatus[s.status] = (countByStatus[s.status] || 0) + 1
  })

  const totalPublicados = countByStatus.publicado || 0
  const totalAtivos =
    (submissoes?.length || 0) -
    (countByStatus.rejeitado || 0) -
    (countByStatus.retirado_fellow || 0) -
    totalPublicados

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Assessoria de Imprensa</h1>
          <p className="mt-1 text-sm text-gray-400">Envie seus textos e acompanhe cada etapa do processo</p>
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
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
            {(countByStatus.recebido || 0) + (countByStatus.em_avaliacao || 0)}
          </span>
          <p className="text-xs text-gray-500 mt-1">em avaliação</p>
        </div>
      </div>

      <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-200">
        Vocë pode retirar sua submissão enquanto ela ainda estiver em análise. Após a aprovação, essa opção deixa de ficar disponível.
      </div>

      {searchParams?.retirada && (
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 text-sm text-orange-300">
          Sua submissão foi retirada e a equipe do admin foi avisada.
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">Pipeline de Status</h2>
        <div className="flex items-stretch gap-1.5 overflow-x-auto pb-1">
          {PIPELINE_STEPS.map((step, i) => {
            const count = countByStatus[step.key] || 0
            const active = count > 0
            return (
              <div key={step.key} className="flex items-center gap-1.5 flex-shrink-0">
                <div
                  className={`flex min-w-[90px] flex-col items-center justify-between rounded-xl border px-4 py-3 transition-all ${
                    active
                      ? 'border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                      : 'border-gray-700/40 bg-gray-800/40'
                  }`}
                >
                  <span className="text-xl">{step.emoji}</span>
                  <span className={`mt-1.5 text-center text-[11px] font-medium leading-tight ${active ? 'text-emerald-400' : 'text-gray-600'}`}>
                    {step.label}
                  </span>
                  <span className={`mt-1 text-2xl font-bold tabular-nums ${active ? 'text-white' : 'text-gray-700'}`}>{count}</span>
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-700 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                )}
              </div>
            )
          })}
          {(countByStatus.rejeitado || 0) > 0 && (
            <>
              <div className="mx-1 w-px self-stretch bg-gray-700/50" />
              <div className="flex min-w-[90px] flex-shrink-0 flex-col items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                <span className="text-xl">❌</span>
                <span className="mt-1.5 text-[11px] font-medium text-red-400">Recusado</span>
                <span className="mt-1 text-2xl font-bold text-white">{countByStatus.rejeitado}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">Minhas Submissões</h2>

        {!submissoes || submissoes.length === 0 ? (
          <div className="py-14 text-center">
            <div className="mb-4 text-5xl">✍️</div>
            <p className="text-sm font-medium text-gray-400">Você ainda não enviou nenhum texto.</p>
            <p className="mt-1 text-xs text-gray-600">Envie seu primeiro artigo ou pitch e acompanhe o processo aqui.</p>
            <Link href="/painel/imprensa/nova" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300">
              Enviar agora →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {(submissoes as any[]).map((sub) => {
              const st = STATUS_CONFIG[sub.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.recebido
              const currentStepIndex = getPipelineIndex(sub.status)
              const hasFeedback = Boolean(sub.feedback)
              const canWithdraw = ['recebido', 'em_avaliacao', 'ajustes_solicitados'].includes(sub.status)

              return (
                <div
                  key={sub.id}
                  className="space-y-4 rounded-xl border border-gray-700/40 bg-gray-800/40 p-4 transition-all hover:border-gray-600/60 hover:bg-gray-800/60"
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`mt-0.5 inline-flex flex-shrink-0 items-center rounded-md border px-2 py-0.5 text-xs font-medium ${
                        sub.tipo === 'artigo'
                          ? 'border-blue-500/20 bg-blue-500/15 text-blue-400'
                          : 'border-purple-500/20 bg-purple-500/15 text-purple-400'
                      }`}
                    >
                      {sub.tipo === 'artigo' ? 'Artigo' : 'Pitch'}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium leading-snug text-white">{sub.titulo}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                            <p className="text-xs text-gray-500">Enviado em {formatDate(sub.created_at)}</p>
                            <p className="text-xs text-gray-600">Atualizado em {formatDateTime(sub.updated_at)}</p>
                            {(sub.veiculos as any)?.nome && <p className="text-xs text-gray-500">· {(sub.veiculos as any).nome}</p>}
                            {sub.google_doc_url && (
                              <a
                                href={sub.google_doc_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-gray-500 transition-colors hover:text-gray-300"
                              >
                                · Ver documento →
                              </a>
                            )}
                          </div>
                        </div>

                        <span className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${st.color}`}>
                          {st.emoji} {st.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!['rejeitado', 'retirado_fellow'].includes(sub.status) ? (
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
                      {PIPELINE_STEPS.map((step, index) => {
                        const isCurrent = sub.status === step.key
                        const isReached = currentStepIndex >= 0 && index <= currentStepIndex

                        return (
                          <div
                            key={step.key}
                            className={`rounded-xl border px-3 py-2 text-center transition-all ${
                              isCurrent
                                ? 'border-emerald-500/40 bg-emerald-500/10'
                                : isReached
                                ? 'border-blue-500/20 bg-blue-500/5'
                                : 'border-gray-700/40 bg-gray-900/40'
                            }`}
                          >
                            <div className="text-sm">{step.emoji}</div>
                            <div
                              className={`mt-1 text-[11px] font-medium leading-tight ${
                                isCurrent ? 'text-emerald-400' : isReached ? 'text-blue-300' : 'text-gray-600'
                              }`}
                            >
                              {step.label}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : sub.status === 'rejeitado' ? (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                      Esta submissão foi encerrada com recusa editorial.
                    </div>
                  ) : (
                    <div className="rounded-xl border border-gray-500/20 bg-gray-500/10 px-4 py-3 text-sm text-gray-300">
                      Esta submissão foi retirada por você e encerrada no fluxo editorial.
                    </div>
                  )}

                  {hasFeedback && (
                    <div
                      className={`rounded-lg border p-3 text-xs leading-relaxed ${
                        sub.status === 'rejeitado'
                          ? 'border-red-500/20 bg-red-500/10 text-red-300'
                          : sub.status === 'ajustes_solicitados'
                          ? 'border-orange-500/20 bg-orange-500/10 text-orange-300'
                          : 'border-blue-500/20 bg-blue-500/10 text-blue-200'
                      }`}
                    >
                      <span className="font-semibold">Atualização Amplifica: </span>
                      {sub.feedback}
                    </div>
                  )}

                  {sub.artigo_url && (
                    <a
                      href={sub.artigo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                      Ver artigo publicado
                    </a>
                  )}

                  {canWithdraw && (
                    <form action={retirarSubmissao}>
                      <input type="hidden" name="submissao_id" value={sub.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/15 hover:text-red-200"
                      >
                        Retirar submissão
                      </button>
                    </form>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
