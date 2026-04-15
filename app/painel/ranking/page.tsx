// app/painel/ranking/page.tsx
// Ranking completo de todos os fellows — Server Component

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

function MedalhaOuNumero({ posicao }: { posicao: number }) {
  if (posicao === 1) return <span className="text-xl">🥇</span>
  if (posicao === 2) return <span className="text-xl">🥈</span>
  if (posicao === 3) return <span className="text-xl">🥉</span>
  return <span className="text-sm font-medium text-gray-400">{posicao}</span>
}

function LinhaDestaque({ posicao }: { posicao: number }) {
  if (posicao === 1) return 'bg-yellow-500/5 border-yellow-500/15'
  if (posicao === 2) return 'bg-slate-400/5 border-slate-400/15'
  if (posicao === 3) return 'bg-orange-600/5 border-orange-600/15'
  return 'bg-gray-900/50 border-gray-800/50'
}

export default async function RankingPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/painel/login')

  // Busca ranking completo
  const { data: rankingData } = await supabase
    .from('ranking')
    .select('fellow_id, fellow_nome, foto_url, area, estado, total_pontos, total_eventos, posicao')
    .order('posicao')

  // Busca fellow atual para destacar no ranking
  const { data: fellowAtual } = await supabase
    .from('fellows')
    .select('id')
    .eq('email', user.email)
    .maybeSingle()

  const minhaPos = rankingData?.find((r) => r.fellow_id === fellowAtual?.id)?.posicao

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Ranking Amplifica</h1>
        <p className="text-gray-400 text-sm mt-1">
          Pontuação acumulada por publicações, debates e presença em aulas.
        </p>
      </div>

      {/* Minha posição (destaque) */}
      {minhaPos && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-5 py-4 flex items-center gap-4">
          <div className="text-3xl font-bold text-emerald-400">#{minhaPos}</div>
          <div>
            <p className="text-sm font-medium text-white">Sua posição atual</p>
            <p className="text-xs text-gray-400">
              {rankingData?.find((r) => r.fellow_id === fellowAtual?.id)?.total_pontos ?? 0} pontos acumulados
            </p>
          </div>
        </div>
      )}

      {/* Tabela */}
      {rankingData && rankingData.length > 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          {/* Header da tabela — desktop */}
          <div className="hidden sm:grid grid-cols-[48px_1fr_120px_120px_80px] gap-4 px-5 py-3 border-b border-gray-800">
            <div className="text-xs text-gray-500 uppercase tracking-wider text-center">#</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Fellow</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Área</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Estado</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider text-right">Pontos</div>
          </div>

          {/* Linhas */}
          <div className="divide-y divide-gray-800">
            {rankingData.map((entry) => {
              const isMe = entry.fellow_id === fellowAtual?.id
              return (
                <div
                  key={entry.fellow_id}
                  className={`px-5 py-4 grid grid-cols-[48px_1fr_auto] sm:grid-cols-[48px_1fr_120px_120px_80px] gap-4 items-center border-l-2 transition-colors ${
                    isMe ? 'border-l-emerald-500 bg-emerald-500/5' : 'border-l-transparent hover:bg-gray-800/30'
                  }`}
                >
                  {/* Posição */}
                  <div className="flex justify-center">
                    <MedalhaOuNumero posicao={Number(entry.posicao)} />
                  </div>

                  {/* Fellow */}
                  <div className="flex items-center gap-3 min-w-0">
                    {entry.foto_url ? (
                      <img
                        src={entry.foto_url}
                        alt={entry.fellow_nome}
                        className="w-9 h-9 rounded-full object-cover border border-gray-700 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-400 text-xs font-semibold">
                          {entry.fellow_nome?.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${isMe ? 'text-emerald-300' : 'text-white'}`}>
                        {entry.fellow_nome}
                        {isMe && <span className="ml-2 text-xs text-emerald-500">(você)</span>}
                      </p>
                      {/* Mobile: área e estado abaixo do nome */}
                      <p className="text-xs text-gray-500 truncate sm:hidden">
                        {[entry.area, entry.estado].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </div>

                  {/* Área — desktop */}
                  <p className="hidden sm:block text-sm text-gray-400 truncate">{entry.area ?? '—'}</p>

                  {/* Estado — desktop */}
                  <p className="hidden sm:block text-sm text-gray-400">{entry.estado ?? '—'}</p>

                  {/* Pontos */}
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-400">{entry.total_pontos}</span>
                    <p className="text-xs text-gray-600 hidden sm:block">
                      {entry.total_eventos} evento{entry.total_eventos !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <p className="text-gray-500 text-sm">Nenhum ponto registrado ainda.</p>
          <p className="text-gray-600 text-xs mt-1">O ranking aparecerá quando os primeiros artigos forem publicados.</p>
        </div>
      )}

      {/* Legenda de pontuação */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Como ganhar pontos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400">
          <div className="flex justify-between gap-4 py-1 border-b border-gray-800/50">
            <span>Artigo em veículo nacional</span>
            <span className="text-emerald-400 font-semibold flex-shrink-0">+30 pts</span>
          </div>
          <div className="flex justify-between gap-4 py-1 border-b border-gray-800/50">
            <span>Artigo em veículo regional</span>
            <span className="text-emerald-400 font-semibold flex-shrink-0">+15 pts</span>
          </div>
          <div className="flex justify-between gap-4 py-1 border-b border-gray-800/50">
            <span>Participação no campeonato de debates</span>
            <span className="text-emerald-400 font-semibold flex-shrink-0">+10 pts</span>
          </div>
          <div className="flex justify-between gap-4 py-1 border-b border-gray-800/50">
            <span>Vitória nas oitavas</span>
            <span className="text-emerald-400 font-semibold flex-shrink-0">+10 pts</span>
          </div>
          <div className="flex justify-between gap-4 py-1 border-b border-gray-800/50">
            <span>Vitória nas quartas</span>
            <span className="text-emerald-400 font-semibold flex-shrink-0">+15 pts</span>
          </div>
          <div className="flex justify-between gap-4 py-1 border-b border-gray-800/50">
            <span>Vitória na semifinal</span>
            <span className="text-emerald-400 font-semibold flex-shrink-0">+25 pts</span>
          </div>
          <div className="flex justify-between gap-4 py-1 border-b border-gray-800/50">
            <span>Vice-campeão</span>
            <span className="text-emerald-400 font-semibold flex-shrink-0">+35 pts</span>
          </div>
          <div className="flex justify-between gap-4 py-1 border-b border-gray-800/50">
            <span>Campeão do debate</span>
            <span className="text-emerald-400 font-semibold flex-shrink-0">+50 pts</span>
          </div>
          <div className="flex justify-between gap-4 py-1">
            <span>Presença em aula de oratória</span>
            <span className="text-emerald-400 font-semibold flex-shrink-0">+5 pts</span>
          </div>
        </div>
      </div>
    </div>
  )
}
