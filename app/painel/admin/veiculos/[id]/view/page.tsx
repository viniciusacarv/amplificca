// app/painel/admin/veiculos/[id]/view/page.tsx
// Ficha de visualização do veículo — somente leitura

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const CATEGORIAS_LABEL: Record<string, string> = {
  midia_pro_liberdade:       'Mídia Pró-Liberdade',
  mainstream_pro_liberdade:  'Mainstream Pró-Liberdade',
  midia_de_ideias:           'Mídia de Ideias (Think Tanks)',
  documentarios_plataformas: 'Documentários / Plataformas',
  grandes_jornais:           'Grandes Jornais',
  politica_bastidores:       'Política e Bastidores',
  opiniao_analise:           'Opinião e Análise',
  economia_negocios:         'Economia e Negócios',
  judiciario_direito:        'Judiciário e Direito',
  radio:                     'Rádio',
  tv_canais_noticia:         'TV e Canais de Notícia',
  municipal:                 'Municipal',
  estadual:                  'Estadual',
  regional:                  'Regional',
  nacional:                  'Nacional',
  internacional:             'Internacional',
}

const TIPO_CONFIG: Record<string, { label: string; emoji: string; color: string; border: string }> = {
  parceiro:     { label: 'Parceiro',     emoji: '🤝', color: 'bg-emerald-500/15 text-emerald-400', border: 'border-emerald-500/30' },
  acessivel:    { label: 'Acessível',    emoji: '📨', color: 'bg-blue-500/15 text-blue-400',       border: 'border-blue-500/30'    },
  a_conquistar: { label: 'A conquistar', emoji: '🎯', color: 'bg-yellow-500/15 text-yellow-400',   border: 'border-yellow-500/30'  },
  inexistente:  { label: 'Inexistente',  emoji: '🧭', color: 'bg-gray-500/15 text-gray-400',       border: 'border-gray-500/30'    },
}

const TAG_GRUPOS = [
  { grupo: 'Tema', tags: [
    { value: 'economia',   label: 'Economia'   },
    { value: 'politica',   label: 'Política'   },
    { value: 'cultura',    label: 'Cultura'    },
    { value: 'direito',    label: 'Direito'    },
    { value: 'tecnologia', label: 'Tecnologia' },
    { value: 'educacao',   label: 'Educação'   },
    { value: 'saude',      label: 'Saúde'      },
    { value: 'seguranca',  label: 'Segurança'  },
  ]},
  { grupo: 'Porte', tags: [
    { value: 'grande',  label: 'Grande'  },
    { value: 'medio',   label: 'Médio'   },
    { value: 'pequeno', label: 'Pequeno' },
    { value: 'nicho',   label: 'Nicho'   },
  ]},
  { grupo: 'Perfil editorial', tags: [
    { value: 'liberal',      label: 'Liberal'      },
    { value: 'conservador',  label: 'Conservador'  },
    { value: 'mainstream',   label: 'Mainstream'   },
    { value: 'independente', label: 'Independente' },
  ]},
]

const TAG_LABEL: Record<string, string> = Object.fromEntries(
  TAG_GRUPOS.flatMap((g) => g.tags.map((t) => [t.value, t.label]))
)

function Campo({ label, valor, link }: { label: string; valor?: string | null; link?: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      {valor ? (
        link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors break-all">
            {valor} ↗
          </a>
        ) : (
          <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">{valor}</p>
        )
      ) : (
        <p className="text-sm text-gray-600 italic">Não informado</p>
      )}
    </div>
  )
}

const TENTATIVA_STATUS: Record<string, { label: string; emoji: string; color: string }> = {
  aguardando:  { label: 'Aguardando',  emoji: '⏳', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'  },
  sem_retorno: { label: 'Sem retorno', emoji: '🔇', color: 'bg-orange-500/15 text-orange-400 border-orange-500/20'  },
  negativo:    { label: 'Negativo',    emoji: '❌', color: 'bg-red-500/15 text-red-400 border-red-500/20'            },
  publicado:   { label: 'Publicado',   emoji: '🎉', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'},
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default async function VisualizarVeiculoPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  const { data: veiculo } = await supabase
    .from('veiculos')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!veiculo) redirect('/painel/admin/veiculos')

  // Histórico de tentativas neste veículo (CRM interno do Amplifica)
  const { data: tentativasRaw } = await supabase
    .from('tentativas_placement')
    .select('*')
    .eq('veiculo_id', params.id)
    .order('enviado_em', { ascending: false })

  const submissaoIds = [...new Set(tentativasRaw?.map(t => t.submissao_id).filter(Boolean))]
  const { data: subsData } = await supabase
    .from('submissoes')
    .select('id, titulo')
    .in('id', submissaoIds.length ? submissaoIds : [''])

  const fellowIds = [...new Set(tentativasRaw?.map(t => t.fellow_id).filter(Boolean))]
  const { data: fellowsData } = await supabase
    .from('fellows')
    .select('id, nome, foto_url')
    .in('id', fellowIds.length ? fellowIds : [0])

  const tentativas = tentativasRaw?.map(t => ({
    ...t,
    submissoes: subsData?.find(s => String(s.id) === String(t.submissao_id)),
    fellows: fellowsData?.find(f => String(f.id) === String(t.fellow_id))
  })) || []

  // Artigos já publicados neste veículo — match por nome (tabela artigos usa texto livre)
  const { data: artigos } = await supabase
    .from('artigos')
    .select('id, titulo, url, fellow_nome, fellow_id, data_publicacao')
    .eq('veiculo', veiculo.nome)
    .order('data_publicacao', { ascending: false })

  const tipo = TIPO_CONFIG[veiculo.tipo_relacionamento] ?? TIPO_CONFIG.inexistente
  const tags: string[] = veiculo.tags ?? []
  const contatos: any[] = Array.isArray(veiculo.contatos) ? veiculo.contatos : []

  return (
    <div className="space-y-6">

      {/* ── Breadcrumb ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/painel/admin/veiculos" className="hover:text-gray-300 transition-colors">
          CRM de Veículos
        </Link>
        <span>›</span>
        <span className="text-gray-400 truncate max-w-xs">{veiculo.nome}</span>
      </div>

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center text-2xl flex-shrink-0">
              📰
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{veiculo.nome}</h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${tipo.color} ${tipo.border}`}>
                  {tipo.emoji} {tipo.label}
                </span>
                <span className="text-xs text-gray-500 bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-lg">
                  {veiculo.area_cobertura ? (CATEGORIAS_LABEL[veiculo.area_cobertura] ?? veiculo.area_cobertura) : 'Sem categoria'}
                </span>
                {veiculo.website && (
                  <a
                    href={veiculo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 hover:text-emerald-400 transition-colors"
                  >
                    {veiculo.website.replace(/^https?:\/\//, '')} ↗
                  </a>
                )}
              </div>
            </div>
          </div>

          <Link
            href={`/painel/admin/veiculos/${veiculo.id}`}
            className="flex-shrink-0 inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
            </svg>
            Editar
          </Link>
        </div>

        {/* Tags */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Tags</p>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                >
                  {TAG_LABEL[tag] ?? tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 italic">Nenhuma tag cadastrada</p>
          )}
        </div>
      </div>

      {/* ── Contatos ─────────────────────────────────────────────── */}
      <div className="bg-gray-900 border-2 border-emerald-500/20 rounded-2xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.04)]">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-base flex-shrink-0">
            📇
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-white">Contatos</h2>
            <p className="text-xs text-gray-500 mt-0.5">Pessoas-chave para placement neste veículo</p>
          </div>
          <Link
            href={`/painel/admin/veiculos/${veiculo.id}`}
            className="text-xs text-gray-600 hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
            Editar contatos
          </Link>
        </div>

        {contatos.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-gray-700 rounded-xl">
            <p className="text-sm text-gray-500">Nenhum contato cadastrado.</p>
            <Link href={`/painel/admin/veiculos/${veiculo.id}`} className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors mt-1 inline-block">
              Adicionar contato →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {contatos.map((c: any, idx: number) => (
              <div key={idx} className="bg-gray-800/50 border border-gray-700/60 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white">{c.nome || '—'}</p>
                      {c.funcao && (
                        <span className="text-xs bg-gray-700/60 border border-gray-600/60 text-gray-400 px-2 py-0.5 rounded-md">
                          {c.funcao}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                          ✉ {c.email}
                        </a>
                      )}
                      {c.whatsapp && (
                        <a
                          href={`https://wa.me/${c.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          📱 {c.whatsapp}
                        </a>
                      )}
                      {!c.email && !c.whatsapp && (
                        <span className="text-xs text-gray-600 italic">Sem dados de contato</span>
                      )}
                    </div>
                  </div>

                  {/* Admin responsável */}
                  {c.admin_nome && (
                    <div className="flex items-center gap-2 flex-shrink-0 bg-gray-700/40 border border-gray-600/40 rounded-lg px-3 py-1.5">
                      {c.admin_foto ? (
                        <img src={c.admin_foto} alt={c.admin_nome} className="w-5 h-5 rounded-full object-cover border border-gray-600" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-400 text-xs font-bold">{c.admin_nome.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500 leading-none">Responsável</p>
                        <p className="text-xs font-medium text-gray-300 mt-0.5">{c.admin_nome}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Abordagem ─────────────────────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
        <h2 className="text-sm font-semibold text-white">Abordagem</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Campo label="Notas de abordagem" valor={veiculo.notas_abordagem} />
          <Campo label="Estratégia de aproximação" valor={veiculo.estrategia_aproximacao} />
        </div>
        <div className="pt-2 border-t border-gray-800">
          <Campo label="Próximos passos" valor={veiculo.proximos_passos} />
        </div>
      </div>

      {/* ── Artigos publicados (fonte: tabela artigos) ───────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-white">Artigos publicados aqui</h2>
            <p className="text-xs text-gray-600 mt-0.5">Fellows que já publicaram neste veículo</p>
          </div>
          <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">
            {artigos?.length ?? 0}
          </span>
        </div>

        {!artigos || artigos.length === 0 ? (
          <p className="text-sm text-gray-600 italic">
            Nenhum artigo registrado para este veículo.
            {' '}
            <span className="text-gray-700">
              (O nome no cadastro de artigos precisa ser idêntico ao nome "{veiculo.nome}" cadastrado aqui.)
            </span>
          </p>
        ) : (
          <div className="divide-y divide-gray-800">
            {(artigos as any[]).map((a) => (
              <a
                key={a.id}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 py-3 hover:bg-gray-800/30 -mx-2 px-2 rounded-xl transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white group-hover:text-emerald-400 transition-colors truncate">
                    {a.titulo}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500 font-medium">{a.fellow_nome}</span>
                    <span className="text-xs text-gray-700">·</span>
                    <span className="text-xs text-gray-600">
                      {new Date(a.data_publicacao + 'T12:00:00').toLocaleDateString('pt-BR', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 flex-shrink-0 transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* ── Histórico de tentativas (CRM interno) ───────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-white">Tentativas de placement (Amplifica)</h2>
            <p className="text-xs text-gray-600 mt-0.5">Envios registrados pela equipe de assessoria</p>
          </div>
          <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">
            {tentativas?.length ?? 0}
          </span>
        </div>

        {!tentativas || tentativas.length === 0 ? (
          <p className="text-sm text-gray-600 italic">Nenhuma tentativa registrada neste veículo ainda.</p>
        ) : (
          <div className="divide-y divide-gray-800">
            {(tentativas as any[]).map((t) => {
              const st = TENTATIVA_STATUS[t.status] ?? TENTATIVA_STATUS.aguardando
              const fellow = t.fellows as any
              const submissao = t.submissoes as any
              return (
                <div key={t.id} className="py-4 flex items-start gap-4">
                  {/* Avatar do fellow */}
                  <div className="flex-shrink-0">
                    {fellow?.foto_url ? (
                      <img src={fellow.foto_url} alt={fellow.nome} className="w-8 h-8 rounded-full object-cover border border-gray-700" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <span className="text-emerald-400 text-xs font-bold">{fellow?.nome?.charAt(0) ?? '?'}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/painel/admin/fellows/${fellow?.id}`}
                        className="text-sm font-medium text-white hover:text-emerald-400 transition-colors"
                      >
                        {fellow?.nome ?? '—'}
                      </Link>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${st.color}`}>
                        {st.emoji} {st.label}
                      </span>
                    </div>

                    {submissao?.titulo && (
                      <Link
                        href={`/painel/admin/imprensa/${submissao.id}`}
                        className="block text-xs text-gray-500 hover:text-gray-300 transition-colors mt-0.5 truncate"
                      >
                        {submissao.titulo} →
                      </Link>
                    )}

                    {t.motivo && (
                      <p className="text-xs text-orange-400 mt-1">{t.motivo}</p>
                    )}
                    {t.notas && (
                      <p className="text-xs text-gray-500 mt-1">{t.notas}</p>
                    )}
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-gray-600">{formatDate(t.enviado_em)}</p>
                    {t.responsavel_nome && (
                      <p className="text-xs text-gray-700 mt-0.5">por {t.responsavel_nome}</p>
                    )}
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
