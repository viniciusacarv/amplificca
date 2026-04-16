// app/painel/dashboard/page.tsx
// Dashboard principal do aluno — Server Component

import { createClient } from '@/lib/supabase-server'
import { getPanelUserProfile } from '@/lib/auth-profile'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardBanner from '../components/DashboardBanner'
import ArticleSubmitCTA from '../components/ArticleSubmitCTA'

// Mapeia tipo → rótulo + cor do badge
const TIPO_LABELS: Record<string, { label: string; cor: string }> = {
  artigo_nacional:     { label: 'Nacional',   cor: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  artigo_regional:     { label: 'Regional',   cor: 'bg-slate-500/15 text-slate-300 border-slate-500/20' },
  debate_participacao: { label: 'Debate',     cor: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  debate_oitavas:      { label: 'Oitavas',    cor: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  debate_quartas:      { label: 'Quartas',    cor: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  debate_semi:         { label: 'Semifinal',  cor: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  debate_final:        { label: 'Final',      cor: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  debate_campeonato:   { label: 'Campeão',    cor: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  aula_presenca:       { label: 'Aula',       cor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatarDataHora(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/painel/login')

  const { fellow, isAdmin, nomeExibicao } = await getPanelUserProfile(supabase, user)

  // Busca posição no ranking
  const { data: rankEntry } = fellow
    ? await supabase
        .from('ranking')
        .select('posicao, total_pontos, total_eventos')
        .eq('fellow_id', fellow.id)
        .maybeSingle()
    : { data: null }

  // Conta total de fellows no ranking (para "X de Y")
  const { count: totalFellows } = await supabase
    .from('ranking')
    .select('*', { count: 'exact', head: true })

  // Busca últimos 10 eventos de pontos
  const { data: historico } = fellow
    ? await supabase
        .from('pontos')
        .select('id, tipo, descricao, valor, created_at')
        .eq('fellow_id', fellow.id)
        .order('created_at', { ascending: false })
        .limit(10)
    : { data: [] }

  // Busca próximas 3 aulas
  const { data: proximasAulas } = await supabase
    .from('aulas')
    .select('id, titulo, descricao, data_hora, duracao_min, link_acesso')
    .gte('data_hora', new Date().toISOString())
    .order('data_hora')
    .limit(3)

  const nome = nomeExibicao
  const primeiroNome = nome.split(' ')[0]
  const posicao = rankEntry?.posicao ?? null
  const totalPontos = rankEntry?.total_pontos ?? 0
  const totalEventos = rankEntry?.total_eventos ?? 0

  // Cor do card de ranking baseada na posição
  const rankCardStyle =
    posicao === 1
      ? 'from-yellow-500/20 to-amber-600/10 border-yellow-500/30'
      : posicao === 2
      ? 'from-slate-400/20 to-slate-500/10 border-slate-400/30'
      : posicao === 3
      ? 'from-orange-600/20 to-orange-700/10 border-orange-600/30'
      : 'from-emerald-600/10 to-teal-700/5 border-emerald-600/20'

  const rankEmoji =
    posicao === 1 ? '🥇' : posicao === 2 ? '🥈' : posicao === 3 ? '🥉' : '🏅'

  return (
    <div className="space-y-8">
      {/* Banner rotativo */}
      <DashboardBanner />

      {/* Saudação */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Olá, {primeiroNome}! 👋
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Bem-vindo ao seu painel. Aqui você acompanha seus pontos e próximas aulas.
        </p>
      </div>

      {/* Aviso se perfil não vinculado */}
      {!fellow && !isAdmin && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-400 text-sm">
          <strong>Atenção:</strong> Seu perfil ainda não foi vinculado. Peça ao administrador para adicionar seu email na tabela de fellows.
        </div>
      )}

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Card ranking */}
        <div className={`bg-gradient-to-br ${rankCardStyle} border rounded-2xl p-5`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Ranking</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">
                  {posicao !== null ? `#${posicao}` : '—'}
                </span>
                {totalFellows && posicao && (
                  <span className="text-sm text-gray-400">de {totalFellows}</span>
                )}
              </div>
            </div>
            <span className="text-3xl">{posicao ? rankEmoji : '🏅'}</span>
          </div>
          <Link
            href="/painel/ranking"
            className="mt-3 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
          >
            Ver ranking completo →
          </Link>
        </div>

        {/* Card pontos */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Pontos totais</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-emerald-400">{totalPontos}</span>
            <span className="text-sm text-gray-400">pts</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {totalEventos} {totalEventos === 1 ? 'evento' : 'eventos'} registrado{totalEventos !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Card próximas aulas */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Próximas aulas</p>
          {proximasAulas && proximasAulas.length > 0 ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{proximasAulas.length}</span>
                <span className="text-sm text-gray-400">agendada{proximasAulas.length !== 1 ? 's' : ''}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500 truncate">
                {new Date(proximasAulas[0].data_hora).toLocaleDateString('pt-BR', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                })}
              </p>
            </>
          ) : (
            <>
              <span className="text-4xl font-bold text-gray-600">0</span>
              <p className="mt-1 text-xs text-gray-600">Nenhuma aula agendada</p>
            </>
          )}
          <Link
            href="/painel/aulas"
            className="mt-3 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
          >
            Ver todas as aulas →
          </Link>
        </div>
      </div>

      {/* CTA de submissão de artigos */}
      <ArticleSubmitCTA />

      {/* Grid: histórico + próximas aulas */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Histórico de pontos */}
        <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Histórico de Pontos</h2>
          {historico && historico.length > 0 ? (
            <div className="space-y-3">
              {historico.map((item) => {
                const tipo = TIPO_LABELS[item.tipo] ?? { label: item.tipo, cor: 'bg-gray-500/15 text-gray-400 border-gray-500/20' }
                return (
                  <div key={item.id} className="flex items-start gap-3">
                    {/* Badge tipo */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${tipo.cor} flex-shrink-0 mt-0.5`}>
                      {tipo.label}
                    </span>
                    {/* Descrição */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300 truncate">{item.descricao}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatarData(item.created_at)}</p>
                    </div>
                    {/* Pontos */}
                    <span className="text-emerald-400 font-semibold text-sm flex-shrink-0">
                      +{item.valor}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Nenhum ponto registrado ainda.</p>
              <p className="text-gray-600 text-xs mt-1">Publique um artigo para começar!</p>
            </div>
          )}
        </div>

        {/* Próximas aulas */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Próximas Aulas</h2>
          {proximasAulas && proximasAulas.length > 0 ? (
            <div className="space-y-4">
              {proximasAulas.map((aula) => (
                <div key={aula.id} className="border border-gray-800 rounded-xl p-3">
                  <p className="text-sm font-medium text-white leading-tight">{aula.titulo}</p>
                  <p className="text-xs text-emerald-400 mt-1">{formatarDataHora(aula.data_hora)}</p>
                  {aula.link_acesso && (
                    <a
                      href={aula.link_acesso}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                      Acessar aula
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Nenhuma aula agendada.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
