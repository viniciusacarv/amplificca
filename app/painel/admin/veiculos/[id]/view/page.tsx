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

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">{value}</p>
    </div>
  )
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

  const tipo = TIPO_CONFIG[veiculo.tipo_relacionamento] ?? TIPO_CONFIG.inexistente
  const tags: string[] = veiculo.tags ?? []

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

      {/* ── Header com nome e badge ───────────────────────────────── */}
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
                {veiculo.area_cobertura && (
                  <span className="text-xs text-gray-500 bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-lg">
                    {CATEGORIAS_LABEL[veiculo.area_cobertura] ?? veiculo.area_cobertura}
                  </span>
                )}
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

          {/* Botão editar */}
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
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-gray-800">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              >
                {TAG_LABEL[tag] ?? tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Grid de informações ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Contato */}
        {(veiculo.contato_nome || veiculo.contato_email || veiculo.contato_whatsapp) && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-xs text-gray-500 uppercase tracking-wider">Contato principal</h2>
            <div className="space-y-3">
              <InfoRow label="Nome" value={veiculo.contato_nome} />
              {veiculo.contato_email && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">E-mail</p>
                  <a href={`mailto:${veiculo.contato_email}`} className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                    {veiculo.contato_email}
                  </a>
                </div>
              )}
              {veiculo.contato_whatsapp && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">WhatsApp</p>
                  <a
                    href={`https://wa.me/${veiculo.contato_whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    📱 {veiculo.contato_whatsapp}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notas de abordagem */}
        {veiculo.notas_abordagem && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-xs text-gray-500 uppercase tracking-wider">Notas de abordagem</h2>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{veiculo.notas_abordagem}</p>
          </div>
        )}

        {/* Estratégia de aproximação */}
        {veiculo.estrategia_aproximacao && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-xs text-gray-500 uppercase tracking-wider">Estratégia de aproximação</h2>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{veiculo.estrategia_aproximacao}</p>
          </div>
        )}

        {/* Próximos passos */}
        {veiculo.proximos_passos && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-xs text-gray-500 uppercase tracking-wider">Próximos passos</h2>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{veiculo.proximos_passos}</p>
          </div>
        )}
      </div>

    </div>
  )
}
