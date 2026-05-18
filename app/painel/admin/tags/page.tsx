// app/painel/admin/tags/page.tsx
// CRUD de tags — lista mestre usada em submissões e veículos

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import { criarTag, atualizarTag, excluirTag } from './actions'

const GRUPOS = [
  { value: 'tema',              label: 'Tema'              },
  { value: 'porte',              label: 'Porte'              },
  { value: 'perfil_editorial',   label: 'Perfil editorial'   },
  { value: 'outro',              label: 'Outro'              },
] as const

const GRUPO_LABEL: Record<string, string> = Object.fromEntries(
  GRUPOS.map((g) => [g.value, g.label])
)

type Tag = {
  id: string | number
  nome: string
  slug: string
  descricao: string | null
  grupo: string | null
  ativo: boolean
  created_at?: string
}

export default async function AdminTagsPage({
  searchParams,
}: {
  searchParams: { sucesso?: string; erro?: string; detalhe?: string; q?: string; grupo?: string; status?: string }
}) {
  noStore()
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  const filtroGrupo  = searchParams.grupo  || 'todos'
  const filtroStatus = searchParams.status || 'ativas'

  let query = supabase.from('tags').select('*').order('grupo', { nullsFirst: true }).order('nome')

  if (filtroGrupo !== 'todos') {
    if (filtroGrupo === 'sem_grupo') {
      query = query.is('grupo', null)
    } else {
      query = query.eq('grupo', filtroGrupo)
    }
  }
  if (filtroStatus === 'ativas')    query = query.eq('ativo', true)
  if (filtroStatus === 'inativas')  query = query.eq('ativo', false)
  if (searchParams.q)               query = query.ilike('nome', `%${searchParams.q}%`)

  const { data: tagsRaw } = await query
  const tags: Tag[] = tagsRaw ?? []

  // Contagem de uso (para mostrar quantas submissões/veículos cada tag tem)
  const { data: submTags }    = await supabase.from('submissao_tags').select('tag_id')
  const { data: veicTags }    = await supabase.from('veiculo_tags').select('tag_id')

  const usoSubmissoes: Record<string, number> = {}
  submTags?.forEach((r: any) => {
    const k = String(r.tag_id)
    usoSubmissoes[k] = (usoSubmissoes[k] || 0) + 1
  })
  const usoVeiculos: Record<string, number> = {}
  veicTags?.forEach((r: any) => {
    const k = String(r.tag_id)
    usoVeiculos[k] = (usoVeiculos[k] || 0) + 1
  })

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Tags</h1>
          <p className="text-sm text-gray-500 mt-1">
            Lista mestre de tags para categorizar submissões e veículos.
          </p>
        </div>
      </div>

      {/* ── Feedback ───────────────────────────────────────────── */}
      {searchParams.sucesso && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-sm text-emerald-400">
          ✅ Tag {searchParams.sucesso === 'criada' ? 'criada' : searchParams.sucesso === 'atualizada' ? 'atualizada' : 'desativada'} com sucesso.
        </div>
      )}
      {searchParams.erro && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
          ❌ Erro: {searchParams.erro}{searchParams.detalhe ? ` — ${decodeURIComponent(searchParams.detalhe)}` : ''}
        </div>
      )}

      {/* ── Form nova tag ──────────────────────────────────────── */}
      <form action={criarTag} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white">Nova tag</h2>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px_auto] gap-3">
          <input
            name="nome"
            type="text"
            required
            placeholder="Nome da tag (ex: Tributos)"
            className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
          />
          <select
            name="grupo"
            defaultValue=""
            className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60 transition-colors"
          >
            <option value="">— Sem grupo —</option>
            {GRUPOS.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-semibold text-sm px-4 py-2.5 rounded-xl transition-all"
          >
            Criar tag
          </button>
        </div>
        <input
          name="descricao"
          type="text"
          placeholder="Descrição (opcional, ajuda admins a usar a tag corretamente)"
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
        />
      </form>

      {/* ── Filtros ────────────────────────────────────────────── */}
      <form className="flex flex-wrap items-center gap-2">
        <input
          name="q"
          type="search"
          defaultValue={searchParams.q ?? ''}
          placeholder="Buscar por nome…"
          className="flex-1 min-w-[180px] bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
        />
        <select
          name="grupo"
          defaultValue={filtroGrupo}
          className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/60 transition-colors"
        >
          <option value="todos">Todos os grupos</option>
          {GRUPOS.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
          <option value="sem_grupo">Sem grupo</option>
        </select>
        <select
          name="status"
          defaultValue={filtroStatus}
          className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/60 transition-colors"
        >
          <option value="ativas">Ativas</option>
          <option value="inativas">Inativas</option>
          <option value="todas">Todas</option>
        </select>
        <button
          type="submit"
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm px-4 py-2 rounded-xl transition-colors"
        >
          Filtrar
        </button>
      </form>

      {/* ── Lista de tags ─────────────────────────────────────── */}
      {tags.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center text-sm text-gray-500">
          Nenhuma tag encontrada com os filtros atuais.
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/40 border-b border-gray-800">
              <tr className="text-left text-xs uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Grupo</th>
                <th className="px-4 py-3">Uso</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((t) => {
                const usoS = usoSubmissoes[String(t.id)] || 0
                const usoV = usoVeiculos[String(t.id)] || 0
                return (
                  <tr key={t.id} className="border-b border-gray-800/60 last:border-0 hover:bg-gray-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <details className="group">
                        <summary className="cursor-pointer list-none flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            {t.nome}
                          </span>
                          {t.descricao && (
                            <span className="text-xs text-gray-500 truncate max-w-[280px]">{t.descricao}</span>
                          )}
                        </summary>
                        <form action={atualizarTag} className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr_180px_auto_auto] gap-2 p-3 bg-gray-800/40 rounded-lg">
                          <input type="hidden" name="id" value={t.id} />
                          <input
                            name="nome"
                            type="text"
                            required
                            defaultValue={t.nome}
                            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/60 transition-colors"
                          />
                          <select
                            name="grupo"
                            defaultValue={t.grupo || ''}
                            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/60 transition-colors"
                          >
                            <option value="">— Sem grupo —</option>
                            {GRUPOS.map((g) => (
                              <option key={g.value} value={g.value}>{g.label}</option>
                            ))}
                          </select>
                          <label className="flex items-center gap-2 text-xs text-gray-400">
                            <input type="checkbox" name="ativo" defaultChecked={t.ativo} className="accent-emerald-500" />
                            Ativa
                          </label>
                          <button
                            type="submit"
                            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-3 py-2 rounded-lg transition-colors"
                          >
                            Salvar
                          </button>
                          <input
                            name="descricao"
                            type="text"
                            defaultValue={t.descricao ?? ''}
                            placeholder="Descrição (opcional)"
                            className="sm:col-span-4 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
                          />
                        </form>
                      </details>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{t.slug}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{t.grupo ? GRUPO_LABEL[t.grupo] ?? t.grupo : '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      <span title="Submissões">📝 {usoS}</span>
                      <span className="mx-2 text-gray-700">·</span>
                      <span title="Veículos">📰 {usoV}</span>
                    </td>
                    <td className="px-4 py-3">
                      {t.ativo ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Ativa</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-700/40 text-gray-400 border border-gray-600/30">Inativa</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {t.ativo && (
                        <form action={excluirTag} className="inline">
                          <input type="hidden" name="id" value={t.id} />
                          <button
                            type="submit"
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            Desativar
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
