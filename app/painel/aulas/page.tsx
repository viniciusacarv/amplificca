// app/painel/aulas/page.tsx
// Lista de próximas aulas de oratória — Server Component

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

const TZ_BR = 'America/Sao_Paulo'

function formatarDataCompleta(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: TZ_BR,
  })
}

function formatarHora(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TZ_BR,
  })
}

function horaFim(iso: string, duracao: number) {
  const inicio = new Date(iso)
  const fim = new Date(inicio.getTime() + duracao * 60000)
  return fim.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TZ_BR,
  })
}

// Partes de data no fuso BR (para os blocos de calendário)
function parteData(iso: string, opts: Intl.DateTimeFormatOptions) {
  return new Date(iso).toLocaleDateString('pt-BR', { ...opts, timeZone: TZ_BR })
}

function diaBR(iso: string) {
  // Retorna o dia do mês no fuso BR como número
  return Number(new Date(iso).toLocaleDateString('en-US', { day: 'numeric', timeZone: TZ_BR }))
}

function isPassada(iso: string) {
  return new Date(iso) < new Date()
}

export default async function AulasPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/painel/login')

  // Busca todas as aulas (futuras primeiro, depois passadas)
  const agora = new Date().toISOString()

  const { data: aulasProximas } = await supabase
    .from('aulas')
    .select('*')
    .gte('data_hora', agora)
    .order('data_hora')

  const { data: aulasPassadas } = await supabase
    .from('aulas')
    .select('*')
    .lt('data_hora', agora)
    .order('data_hora', { ascending: false })
    .limit(10)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Aulas de Oratória</h1>
        <p className="text-gray-400 text-sm mt-1">
          Presença em aulas vale +5 pontos, registrados pelo administrador.
        </p>
      </div>

      {/* Aulas futuras */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Próximas aulas
        </h2>

        {aulasProximas && aulasProximas.length > 0 ? (
          <div className="space-y-4">
            {aulasProximas.map((aula) => (
              <div
                key={aula.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Data block */}
                  <div className="flex-shrink-0 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-center min-w-[80px]">
                    <p className="text-xs text-emerald-400 font-medium uppercase">
                      {parteData(aula.data_hora, { month: 'short' })}
                    </p>
                    <p className="text-2xl font-bold text-white leading-none mt-0.5">
                      {diaBR(aula.data_hora)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {parteData(aula.data_hora, { weekday: 'short' })}
                    </p>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white">{aula.titulo}</h3>

                    {/* Horário */}
                    <p className="flex items-center gap-1 text-sm text-emerald-400 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatarHora(aula.data_hora)}
                      {aula.duracao_min && ` – ${horaFim(aula.data_hora, aula.duracao_min)}`}
                      {aula.duracao_min && (
                        <span className="text-gray-500 text-xs ml-1">({aula.duracao_min} min)</span>
                      )}
                    </p>

                    {/* Descrição */}
                    {aula.descricao && (
                      <p className="text-sm text-gray-400 mt-2">{aula.descricao}</p>
                    )}

                    {/* Botões */}
                    <div className="flex flex-wrap gap-3 mt-3">
                      {aula.link_acesso && (
                        <a
                          href={aula.link_acesso}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                          Entrar na aula
                        </a>
                      )}
                      {aula.material_url && (
                        <a
                          href={aula.material_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                          Material
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-700 mx-auto mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <p className="text-gray-500 text-sm">Nenhuma aula agendada no momento.</p>
            <p className="text-gray-600 text-xs mt-1">Fique atento às novidades!</p>
          </div>
        )}
      </section>

      {/* Aulas passadas */}
      {aulasPassadas && aulasPassadas.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
            Aulas anteriores
          </h2>
          <div className="space-y-3">
            {aulasPassadas.map((aula) => (
              <div
                key={aula.id}
                className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 flex items-start gap-4 opacity-60"
              >
                {/* Data */}
                <div className="flex-shrink-0 text-center min-w-[48px]">
                  <p className="text-xs text-gray-500 uppercase">
                    {parteData(aula.data_hora, { month: 'short' })}
                  </p>
                  <p className="text-lg font-bold text-gray-500 leading-none mt-0.5">
                    {diaBR(aula.data_hora)}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-400">{aula.titulo}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {formatarDataCompleta(aula.data_hora)} · {formatarHora(aula.data_hora)}
                  </p>
                </div>
                {aula.material_url && (
                  <a
                    href={aula.material_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    Material
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
