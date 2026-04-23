// app/painel/admin/fellows/page.tsx
// Lista de todos os fellows — ponto de entrada para o perfil individual

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminFellowsPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  let query = supabase
    .from('fellows')
    .select('id, nome, foto_url, area, estado, email, created_at')
    .order('nome')

  if (searchParams.q) {
    query = query.ilike('nome', `%${searchParams.q}%`)
  }

  const { data: fellows } = await query

  // Contagem de submissões internas por fellow
  const { data: contagens } = await supabase
    .from('submissoes')
    .select('fellow_id')

  const submCount: Record<string, number> = {}
  contagens?.forEach((s: any) => {
    submCount[s.fellow_id] = (submCount[s.fellow_id] || 0) + 1
  })

  // Publicações reais = tabela artigos (inclui publicações independentes do Amplifica)
  const { data: artigos } = await supabase
    .from('artigos')
    .select('fellow_id')

  const pubCount: Record<number, number> = {}
  artigos?.forEach((a: any) => {
    if (a.fellow_id != null) {
      pubCount[a.fellow_id] = (pubCount[a.fellow_id] || 0) + 1
    }
  })

  return (
    <div className="space-y-8">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Fellows</h1>
          <p className="text-gray-400 mt-1 text-sm">
            {fellows?.length ?? 0} fellows cadastrados — clique para ver o histórico de imprensa
          </p>
        </div>
      </div>

      {/* ── Busca ─────────────────────────────────────────────────── */}
      <form method="get" className="flex items-center gap-3 max-w-md">
        <input
          name="q"
          type="text"
          defaultValue={searchParams.q || ''}
          placeholder="Buscar por nome…"
          className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
        />
        <button
          type="submit"
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm px-4 py-2.5 rounded-xl transition-colors"
        >
          Buscar
        </button>
        {searchParams.q && (
          <Link href="/painel/admin/fellows" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            Limpar
          </Link>
        )}
      </form>

      {/* ── Grid de fellows ───────────────────────────────────────── */}
      {!fellows || fellows.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-sm">Nenhum fellow encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fellows.map((f: any) => (
            <Link
              key={f.id}
              href={`/painel/admin/fellows/${f.id}`}
              className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                {f.foto_url ? (
                  <img src={f.foto_url} alt={f.nome} className="w-10 h-10 rounded-full object-cover border border-gray-700" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 text-sm font-bold">{f.nome?.charAt(0)}</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">{f.nome}</p>
                  <p className="text-xs text-gray-500 truncate">{f.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{f.area ?? '—'} · {f.estado ?? '—'}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">{submCount[f.id] ?? 0} submissões</span>
                  {(pubCount[f.id] ?? 0) > 0 && (
                    <span className="text-emerald-500 font-medium">{pubCount[f.id]} pub.</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
