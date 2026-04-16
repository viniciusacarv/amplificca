// app/painel/admin/veiculos/page.tsx
// CRM de veículos de imprensa

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const TIPO_CONFIG = {
  parceiro:      { label: 'Parceiro',    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', emoji: '🤝' },
  acessivel:     { label: 'Acessível',   color: 'bg-blue-500/15 text-blue-400 border-blue-500/20',           emoji: '📨' },
  a_conquistar:  { label: 'A conquistar',color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',     emoji: '🎯' },
} as const

export default async function AdminVeiculosPage({
  searchParams,
}: {
  searchParams: { tipo?: string; sucesso?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  const filtroTipo = searchParams.tipo || 'todos'

  let query = supabase
    .from('veiculos')
    .select('*')
    .eq('ativo', true)
    .order('nome')

  if (filtroTipo !== 'todos') {
    query = query.eq('tipo_relacionamento', filtroTipo)
  }

  const { data: veiculos } = await query

  // Contagens
  const { data: todos } = await supabase.from('veiculos').select('tipo_relacionamento').eq('ativo', true)
  const countMap: Record<string, number> = {}
  todos?.forEach((v: any) => {
    countMap[v.tipo_relacionamento] = (countMap[v.tipo_relacionamento] || 0) + 1
  })

  const filtros = [
    { key: 'todos',       label: 'Todos',         count: todos?.length || 0             },
    { key: 'parceiro',    label: 'Parceiros',      count: countMap['parceiro'] || 0       },
    { key: 'acessivel',   label: 'Acessíveis',     count: countMap['acessivel'] || 0      },
    { key: 'a_conquistar',label: 'A conquistar',   count: countMap['a_conquistar'] || 0   },
  ]

  return (
    <div className="space-y-8">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Link href="/painel/admin/imprensa" className="hover:text-gray-300 transition-colors">Assessoria de Imprensa</Link>
            <span>›</span>
            <span className="text-gray-400">CRM de Veículos</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Veículos de Imprensa</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Cadastro centralizado de veículos, contatos e estratégias de abordagem
          </p>
        </div>
        <Link
          href="/painel/admin/veiculos/novo"
          className="flex-shrink-0 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-semibold text-sm px-4 py-2.5 rounded-xl transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo veículo
        </Link>
      </div>

      {searchParams.sucesso && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-400 text-sm">
          ✅ Veículo salvo com sucesso.
        </div>
      )}

      {/* ── Cards de resumo ──────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: 'parceiro',    label: 'Parceiros',   count: countMap['parceiro'] || 0,      emoji: '🤝', color: 'from-emerald-600/10 to-teal-700/5 border-emerald-600/20' },
          { key: 'acessivel',   label: 'Acessíveis',  count: countMap['acessivel'] || 0,     emoji: '📨', color: 'from-blue-600/10 to-blue-700/5 border-blue-600/20'       },
          { key: 'a_conquistar',label: 'A conquistar',count: countMap['a_conquistar'] || 0,  emoji: '🎯', color: 'from-yellow-600/10 to-yellow-700/5 border-yellow-600/20'  },
        ].map((c) => (
          <div key={c.key} className={`bg-gradient-to-br ${c.color} border rounded-2xl p-5`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{c.label}</p>
                <span className="text-3xl font-bold text-white">{c.count}</span>
              </div>
              <span className="text-2xl">{c.emoji}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filtros ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {filtros.map((f) => (
          <Link
            key={f.key}
            href={`/painel/admin/veiculos?tipo=${f.key}`}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              filtroTipo === f.key
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-300 hover:border-gray-700'
            }`}
          >
            {f.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-md ${
              filtroTipo === f.key ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'
            }`}>
              {f.count}
            </span>
          </Link>
        ))}
      </div>

      {/* ── Tabela de veículos ────────────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {!veiculos || veiculos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📰</p>
            <p className="text-gray-400 text-sm font-medium">Nenhum veículo cadastrado.</p>
            <Link href="/painel/admin/veiculos/novo" className="mt-3 inline-flex text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
              Cadastrar primeiro veículo →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {/* Header da tabela */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">
              <div className="col-span-3">Veículo</div>
              <div className="col-span-2">Relacionamento</div>
              <div className="col-span-2">Cobertura</div>
              <div className="col-span-3">Contato</div>
              <div className="col-span-2 text-right">Ações</div>
            </div>

            {(veiculos as any[]).map((v) => {
              const tipo = TIPO_CONFIG[v.tipo_relacionamento as keyof typeof TIPO_CONFIG] ?? TIPO_CONFIG.a_conquistar
              return (
                <div key={v.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-800/40 transition-colors items-center">
                  {/* Nome + site */}
                  <div className="col-span-3 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{v.nome}</p>
                    {v.website && (
                      <a href={v.website} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-gray-300 transition-colors truncate block">
                        {v.website.replace('https://', '').replace('http://', '')}
                      </a>
                    )}
                  </div>

                  {/* Relacionamento */}
                  <div className="col-span-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${tipo.color}`}>
                      {tipo.emoji} {tipo.label}
                    </span>
                  </div>

                  {/* Cobertura */}
                  <div className="col-span-2">
                    <span className="text-sm text-gray-400">{v.area_cobertura || '—'}</span>
                  </div>

                  {/* Contato */}
                  <div className="col-span-3 min-w-0">
                    {v.contato_nome ? (
                      <div>
                        <p className="text-sm text-gray-300 truncate">{v.contato_nome}</p>
                        <p className="text-xs text-gray-600 truncate">{v.contato_email || v.contato_whatsapp || '—'}</p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-600">—</span>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="col-span-2 flex justify-end">
                    <Link
                      href={`/painel/admin/veiculos/${v.id}`}
                      className="text-xs text-gray-500 hover:text-emerald-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-500/10"
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
