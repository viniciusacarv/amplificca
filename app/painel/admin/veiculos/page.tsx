// app/painel/admin/veiculos/page.tsx
// CRM de veiculos de imprensa

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const TIPO_CONFIG = {
  parceiro: { label: 'Parceiro', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', emoji: '🤝' },
  acessivel: { label: 'Acessível', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20', emoji: '📨' },
  a_conquistar: { label: 'A conquistar', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20', emoji: '🎯' },
  inexistente: { label: 'Inexistente', color: 'bg-gray-500/15 text-gray-400 border-gray-500/20', emoji: '🧭' },
} as const

const CATEGORIA_LABEL: Record<string, string> = {
  midia_pro_liberdade: 'Mídia Pró-Liberdade',
  mainstream_pro_liberdade: 'Mainstream Pró-Liberdade',
  midia_de_ideias: 'Mídia de Ideias',
  documentarios_plataformas: 'Documentários/Plataformas',
  grandes_jornais: 'Grandes Jornais',
  politica_bastidores: 'Política e Bastidores',
  opiniao_analise: 'Opinião e Análise',
  economia_negocios: 'Economia e Negócios',
  judiciario_direito: 'Judiciário e Direito',
  radio: 'Rádio',
  tv_canais_noticia: 'TV e Canais de Notícia',
  municipal: 'Municipal',
  estadual: 'Estadual',
  regional: 'Regional',
  nacional: 'Nacional',
  internacional: 'Internacional',
}

export default async function AdminVeiculosPage({
  searchParams,
}: {
  searchParams: { tipo?: string; sucesso?: string; q?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  const filtroTipo = searchParams.tipo || 'todos'

  let query = supabase.from('veiculos').select('*').eq('ativo', true).order('nome')

  if (filtroTipo !== 'todos') {
    query = query.eq('tipo_relacionamento', filtroTipo)
  }

  if (searchParams.q) {
    query = query.ilike('nome', `%${searchParams.q}%`)
  }

  const { data: veiculos } = await query

  const { data: todos } = await supabase.from('veiculos').select('tipo_relacionamento').eq('ativo', true)
  const countMap: Record<string, number> = {}
  todos?.forEach((v: any) => {
    countMap[v.tipo_relacionamento] = (countMap[v.tipo_relacionamento] || 0) + 1
  })

  const buildFilterHref = (tipo: string, includeSearch = true) => {
    const params = new URLSearchParams()

    if (tipo !== 'todos') {
      params.set('tipo', tipo)
    }

    if (includeSearch && searchParams.q) {
      params.set('q', searchParams.q)
    }

    const queryString = params.toString()
    return queryString ? `/painel/admin/veiculos?${queryString}` : '/painel/admin/veiculos'
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/painel/admin/imprensa" className="transition-colors hover:text-gray-300">
              Assessoria de Imprensa
            </Link>
            <span>›</span>
            <span className="text-gray-400">CRM de Veículos</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Veículos de Imprensa</h1>
          <p className="mt-1 text-sm text-gray-400">Cadastro centralizado de veículos, contatos e estratégias de abordagem</p>
        </div>
        <Link
          href="/painel/admin/veiculos/novo"
          className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-emerald-400 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo veículo
        </Link>
      </div>

      {searchParams.sucesso && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          ✅ Veículo salvo com sucesso.
        </div>
      )}

      <form method="get" className="flex max-w-md items-center gap-3">
        {filtroTipo !== 'todos' && <input type="hidden" name="tipo" value={filtroTipo} />}
        <input
          name="q"
          type="text"
          defaultValue={searchParams.q || ''}
          placeholder="Buscar por nome..."
          className="flex-1 rounded-xl border border-gray-800 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder-gray-600 transition-colors focus:border-emerald-500/60 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white transition-colors hover:bg-gray-700"
        >
          Buscar
        </button>
        {searchParams.q && (
          <Link href={buildFilterHref(filtroTipo, false)} className="text-sm text-gray-500 transition-colors hover:text-gray-300">
            Limpar
          </Link>
        )}
      </form>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            key: 'parceiro',
            label: 'Parceiros',
            count: countMap.parceiro || 0,
            emoji: '🤝',
            color: 'from-emerald-600/10 to-teal-700/5 border-emerald-600/20',
            activeRing: 'ring-2 ring-emerald-500/40',
          },
          {
            key: 'acessivel',
            label: 'Acessíveis',
            count: countMap.acessivel || 0,
            emoji: '📨',
            color: 'from-blue-600/10 to-blue-700/5 border-blue-600/20',
            activeRing: 'ring-2 ring-blue-500/40',
          },
          {
            key: 'a_conquistar',
            label: 'A conquistar',
            count: countMap.a_conquistar || 0,
            emoji: '🎯',
            color: 'from-yellow-600/10 to-yellow-700/5 border-yellow-600/20',
            activeRing: 'ring-2 ring-yellow-500/40',
          },
          {
            key: 'inexistente',
            label: 'Inexistente',
            count: countMap.inexistente || 0,
            emoji: '🧭',
            color: 'from-gray-600/10 to-gray-700/5 border-gray-600/20',
            activeRing: 'ring-2 ring-gray-500/40',
          },
        ].map((c) => (
          <Link
            key={c.key}
            href={buildFilterHref(filtroTipo === c.key ? 'todos' : c.key)}
            className={`rounded-2xl border bg-gradient-to-br p-5 transition-all hover:opacity-90 ${c.color} ${filtroTipo === c.key ? c.activeRing : ''}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-1 text-xs uppercase tracking-wider text-gray-400">{c.label}</p>
                <span className="text-3xl font-bold text-white">{c.count}</span>
              </div>
              <span className="text-2xl">{c.emoji}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
        {!veiculos || veiculos.length === 0 ? (
          <div className="py-16 text-center">
            <p className="mb-3 text-4xl">📰</p>
            <p className="text-sm font-medium text-gray-400">
              {searchParams.q ? 'Nenhum veículo encontrado para essa busca.' : 'Nenhum veículo cadastrado.'}
            </p>
            {!searchParams.q && (
              <Link href="/painel/admin/veiculos/novo" className="mt-3 inline-flex text-sm text-emerald-400 transition-colors hover:text-emerald-300">
                Cadastrar primeiro veículo →
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs uppercase tracking-wider text-gray-500">
              <div className="col-span-3">Veículo</div>
              <div className="col-span-2">Proximidade</div>
              <div className="col-span-2">Cobertura</div>
              <div className="col-span-3">Tags</div>
              <div className="col-span-2 text-right">Ações</div>
            </div>

            {(veiculos as any[]).map((v) => {
              const tipo = TIPO_CONFIG[v.tipo_relacionamento as keyof typeof TIPO_CONFIG] ?? TIPO_CONFIG.a_conquistar

              return (
                <div key={v.id} className="grid grid-cols-12 items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-800/40">
                  <div className="col-span-3 min-w-0">
                    <Link
                      href={`/painel/admin/veiculos/${v.id}/view`}
                      className="block truncate text-sm font-medium text-white transition-colors hover:text-emerald-400"
                    >
                      {v.nome}
                    </Link>
                    {v.website && (
                      <a
                        href={v.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-xs text-gray-500 transition-colors hover:text-gray-300"
                      >
                        {v.website.replace('https://', '').replace('http://', '')}
                      </a>
                    )}
                  </div>

                  <div className="col-span-2">
                    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${tipo.color}`}>
                      {tipo.emoji} {tipo.label}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-sm text-gray-400">
                      {v.area_cobertura ? CATEGORIA_LABEL[v.area_cobertura] ?? v.area_cobertura : '—'}
                    </span>
                  </div>

                  <div className="col-span-3 min-w-0">
                    {v.tags && v.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {(v.tags as string[]).slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full border border-gray-700 bg-gray-800 px-1.5 py-0.5 text-xs font-medium text-gray-400"
                          >
                            {tag}
                          </span>
                        ))}
                        {v.tags.length > 3 && <span className="text-xs text-gray-600">+{v.tags.length - 3}</span>}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-700">—</span>
                    )}
                  </div>

                  <div className="col-span-2 flex justify-end">
                    <Link
                      href={`/painel/admin/veiculos/${v.id}`}
                      className="rounded-lg px-3 py-1.5 text-xs text-gray-500 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
