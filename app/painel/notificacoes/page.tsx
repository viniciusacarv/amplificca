// app/painel/notificacoes/page.tsx
// Caixa de entrada de notificações — fellow

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { marcarTodasLidas } from '../imprensa/actions'

const TIPO_CONFIG: Record<string, { emoji: string; color: string }> = {
  nova_submissao:     { emoji: '📬', color: 'text-blue-400'    },
  em_avaliacao:       { emoji: '🔍', color: 'text-yellow-400'  },
  ajustes_solicitados:{ emoji: '✏️', color: 'text-orange-400'  },
  aprovado:           { emoji: '✅', color: 'text-emerald-400'  },
  enviado_imprensa:   { emoji: '📤', color: 'text-blue-400'    },
  publicado:          { emoji: '🎉', color: 'text-emerald-400'  },
  rejeitado:          { emoji: '❌', color: 'text-red-400'      },
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min  = Math.floor(diff / 60000)
  if (min < 1)  return 'agora'
  if (min < 60) return `${min} min atrás`
  const h = Math.floor(min / 60)
  if (h < 24)   return `${h}h atrás`
  const d = Math.floor(h / 24)
  if (d < 7)    return `${d} dia${d > 1 ? 's' : ''} atrás`
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export default async function NotificacoesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  const { data: fellow } = await supabase
    .from('fellows')
    .select('id')
    .eq('email', user.email)
    .maybeSingle()

  const { data: notificacoes } = fellow
    ? await supabase
        .from('notificacoes')
        .select('*')
        .eq('fellow_id', fellow.id)
        .eq('is_admin', false)
        .order('created_at', { ascending: false })
        .limit(50)
    : { data: [] }

  const naoLidas = notificacoes?.filter((n: any) => !n.lida).length ?? 0

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notificações</h1>
          <p className="text-gray-400 mt-1 text-sm">
            {naoLidas > 0 ? `${naoLidas} não lida${naoLidas > 1 ? 's' : ''}` : 'Tudo em dia ✓'}
          </p>
        </div>
        {naoLidas > 0 && (
          <form action={marcarTodasLidas}>
            <button
              type="submit"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors border border-gray-700 hover:border-gray-600 px-3 py-1.5 rounded-lg"
            >
              Marcar todas como lidas
            </button>
          </form>
        )}
      </div>

      {/* ── Lista ────────────────────────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {!notificacoes || notificacoes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔔</p>
            <p className="text-gray-400 text-sm">Nenhuma notificação ainda.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {(notificacoes as any[]).map((notif) => {
              const cfg = TIPO_CONFIG[notif.tipo] ?? { emoji: '📢', color: 'text-gray-400' }
              const href = notif.submissao_id ? `/painel/imprensa` : null

              const Wrapper = href
                ? ({ children }: { children: React.ReactNode }) => (
                    <Link href={href} className="block hover:bg-gray-800/50 transition-colors">
                      {children}
                    </Link>
                  )
                : ({ children }: { children: React.ReactNode }) => <div>{children}</div>

              return (
                <Wrapper key={notif.id}>
                  <div className={`flex items-start gap-4 px-6 py-4 ${!notif.lida ? 'bg-emerald-500/5' : ''}`}>
                    {/* Ícone */}
                    <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-gray-800 text-lg mt-0.5`}>
                      {cfg.emoji}
                    </div>
                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <p className={`text-sm font-medium leading-snug ${notif.lida ? 'text-gray-300' : 'text-white'}`}>
                          {notif.titulo}
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notif.lida && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 mt-1" />
                          )}
                          <span className="text-xs text-gray-600 whitespace-nowrap">
                            {formatRelative(notif.created_at)}
                          </span>
                        </div>
                      </div>
                      {notif.mensagem && (
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.mensagem}</p>
                      )}
                    </div>
                  </div>
                </Wrapper>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
