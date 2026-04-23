// app/painel/admin/veiculos/[id]/page.tsx
// Ficha completa do veículo — visualização + edição inline

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { salvarVeiculo } from '../actions'
import { DeleteVeiculoButton } from './DeleteVeiculoButton'

const CATEGORIAS = [
  { group: 'Mídias de Orientação Liberal', options: [
    { value: 'midia_pro_liberdade',      label: 'Mídia Pró-Liberdade' },
    { value: 'mainstream_pro_liberdade', label: 'Mainstream Pró-Liberdade' },
    { value: 'midia_de_ideias',          label: 'Mídia de Ideias (Think Tanks)' },
    { value: 'documentarios_plataformas',label: 'Documentários / Plataformas' },
  ]},
  { group: 'Grande Mídia Nacional', options: [
    { value: 'grandes_jornais',    label: 'Grandes Jornais' },
    { value: 'politica_bastidores',label: 'Política e Bastidores' },
    { value: 'opiniao_analise',    label: 'Opinião e Análise' },
    { value: 'economia_negocios',  label: 'Economia e Negócios' },
    { value: 'judiciario_direito', label: 'Judiciário e Direito' },
  ]},
  { group: 'Audiovisual', options: [
    { value: 'radio',            label: 'Rádio' },
    { value: 'tv_canais_noticia',label: 'TV e Canais de Notícia' },
  ]},
  { group: 'Abrangência Geográfica', options: [
    { value: 'municipal',     label: 'Municipal'     },
    { value: 'estadual',      label: 'Estadual'      },
    { value: 'regional',      label: 'Regional'      },
    { value: 'nacional',      label: 'Nacional'      },
    { value: 'internacional', label: 'Internacional' },
  ]},
]

const CATEGORIA_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORIAS.flatMap((g) => g.options.map((o) => [o.value, o.label]))
)

const TIPO_CONFIG: Record<string, { label: string; emoji: string; color: string; border: string }> = {
  parceiro:     { label: 'Parceiro',     emoji: '🤝', color: 'bg-emerald-500/15 text-emerald-400', border: 'border-emerald-500/30' },
  acessivel:    { label: 'Acessível',    emoji: '📨', color: 'bg-blue-500/15 text-blue-400',       border: 'border-blue-500/30'    },
  a_conquistar: { label: 'A conquistar', emoji: '🎯', color: 'bg-yellow-500/15 text-yellow-400',   border: 'border-yellow-500/30'  },
  inexistente:  { label: 'Inexistente',  emoji: '🧭', color: 'bg-gray-500/15 text-gray-400',       border: 'border-gray-500/30'    },
}

const TODAS_TAGS = [
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
  TODAS_TAGS.flatMap((g) => g.tags.map((t) => [t.value, t.label]))
)

export default async function FichaVeiculoPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { sucesso?: string }
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
    <div className="space-y-8">

      {/* ── Breadcrumb ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/painel/admin/veiculos" className="hover:text-gray-300 transition-colors">
          CRM de Veículos
        </Link>
        <span>›</span>
        <span className="text-gray-400 truncate max-w-xs">{veiculo.nome}</span>
      </div>

      {/* ── Sucesso ──────────────────────────────────────────────── */}
      {searchParams.sucesso && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-400 text-sm">
          ✅ Veículo atualizado com sucesso.
        </div>
      )}

      {/* ── Header — Ficha visual ─────────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {/* Ícone do veículo */}
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
                    {CATEGORIA_LABEL[veiculo.area_cobertura] ?? veiculo.area_cobertura}
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

        {/* Info rápida: contato */}
        {(veiculo.contato_nome || veiculo.contato_email || veiculo.contato_whatsapp) && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Contato principal</p>
            <div className="flex items-center gap-3 flex-wrap">
              {veiculo.contato_nome && (
                <span className="text-sm text-gray-300 font-medium">{veiculo.contato_nome}</span>
              )}
              {veiculo.contato_email && (
                <a href={`mailto:${veiculo.contato_email}`} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                  {veiculo.contato_email}
                </a>
              )}
              {veiculo.contato_whatsapp && (
                <a
                  href={`https://wa.me/${veiculo.contato_whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-emerald-400 transition-colors"
                >
                  📱 {veiculo.contato_whatsapp}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Estratégia e próximos passos (read-only, visível rapidamente) */}
        {(veiculo.estrategia_aproximacao || veiculo.proximos_passos) && (
          <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {veiculo.estrategia_aproximacao && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Estratégia</p>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{veiculo.estrategia_aproximacao}</p>
              </div>
            )}
            {veiculo.proximos_passos && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Próximos passos</p>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{veiculo.proximos_passos}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Formulário de edição ─────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Editar ficha</h2>

        <form action={salvarVeiculo} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
          <input type="hidden" name="id" value={veiculo.id} />

          {/* Nome */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-300 mb-2">
              Nome do veículo <span className="text-red-400">*</span>
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              required
              defaultValue={veiculo.nome}
              placeholder="ex: O Globo, Gazeta do Povo"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>

          {/* Nível de proximidade */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Nível de proximidade <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { value: 'parceiro',     label: 'Parceiro',     desc: 'Relação próxima e ativa',             emoji: '🤝' },
                { value: 'acessivel',    label: 'Acessível',    desc: 'Já houve contato ou placement',       emoji: '📨' },
                { value: 'a_conquistar', label: 'A conquistar', desc: 'Contato esporádico ou via terceiros', emoji: '🎯' },
                { value: 'inexistente',  label: 'Inexistente',  desc: 'Sem nenhum contato prévio',           emoji: '🧭' },
              ].map((opt) => (
                <label key={opt.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="tipo_relacionamento"
                    value={opt.value}
                    defaultChecked={veiculo.tipo_relacionamento === opt.value}
                    className="sr-only peer"
                  />
                  <div className="flex flex-col items-start p-3.5 rounded-xl border border-gray-700 bg-gray-800/50 peer-checked:bg-emerald-500/10 peer-checked:border-emerald-500/40 transition-all">
                    <span className="text-xl mb-1.5">{opt.emoji}</span>
                    <span className="text-xs font-semibold text-white">{opt.label}</span>
                    <span className="text-xs text-gray-500 mt-0.5 leading-snug">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-2">Website</label>
            <input
              id="website"
              name="website"
              type="url"
              defaultValue={veiculo.website || ''}
              placeholder="https://..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>

          {/* Categoria editorial */}
          <div>
            <label htmlFor="area_cobertura" className="block text-sm font-medium text-gray-300 mb-2">
              Categoria editorial
            </label>
            <select
              id="area_cobertura"
              name="area_cobertura"
              defaultValue={veiculo.area_cobertura || ''}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/60 transition-colors appearance-none"
            >
              <option value="">Selecione uma categoria…</option>
              {CATEGORIAS.map((grupo) => (
                <optgroup key={grupo.group} label={grupo.group}>
                  {grupo.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Contato */}
          <div>
            <p className="text-sm font-medium text-gray-300 mb-3">Informações de contato</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="contato_nome" className="block text-xs text-gray-500 mb-1.5">Nome</label>
                <input
                  id="contato_nome"
                  name="contato_nome"
                  type="text"
                  defaultValue={veiculo.contato_nome || ''}
                  placeholder="Editor / responsável"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="contato_email" className="block text-xs text-gray-500 mb-1.5">E-mail</label>
                <input
                  id="contato_email"
                  name="contato_email"
                  type="email"
                  defaultValue={veiculo.contato_email || ''}
                  placeholder="email@veiculo.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="contato_whatsapp" className="block text-xs text-gray-500 mb-1.5">WhatsApp</label>
                <input
                  id="contato_whatsapp"
                  name="contato_whatsapp"
                  type="text"
                  defaultValue={veiculo.contato_whatsapp || ''}
                  placeholder="+55 11 9 0000-0000"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Notas de abordagem */}
          <div>
            <label htmlFor="notas_abordagem" className="block text-sm font-medium text-gray-300 mb-2">
              Notas de abordagem
              <span className="ml-2 text-xs font-normal text-gray-500">histórico, estilo de comunicação preferido</span>
            </label>
            <textarea
              id="notas_abordagem"
              name="notas_abordagem"
              rows={3}
              defaultValue={veiculo.notas_abordagem || ''}
              placeholder="ex: Preferem pitches curtos por e-mail. Melhor dia: segunda de manhã..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>

          {/* Estratégia de aproximação */}
          <div>
            <label htmlFor="estrategia_aproximacao" className="block text-sm font-medium text-gray-300 mb-2">
              Estratégia de aproximação
              <span className="ml-2 text-xs font-normal text-gray-500">como entrar no radar, quem pode intermediar</span>
            </label>
            <textarea
              id="estrategia_aproximacao"
              name="estrategia_aproximacao"
              rows={3}
              defaultValue={veiculo.estrategia_aproximacao || ''}
              placeholder="ex: Abordar via Mano Ferreira. Mandar pitch personalizado para o editor de opinião. Usar publicação anterior como referência..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>

          {/* Próximos passos */}
          <div>
            <label htmlFor="proximos_passos" className="block text-sm font-medium text-gray-300 mb-2">
              Próximos passos
              <span className="ml-2 text-xs font-normal text-gray-500">ações concretas com responsável e prazo</span>
            </label>
            <textarea
              id="proximos_passos"
              name="proximos_passos"
              rows={3}
              defaultValue={veiculo.proximos_passos || ''}
              placeholder="ex: → Sara envia e-mail até 30/04&#10;→ Follow-up 7 dias depois se sem retorno"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Tags
              <span className="ml-2 text-xs font-normal text-gray-500">tema, porte e perfil editorial</span>
            </label>
            <div className="space-y-4">
              {TODAS_TAGS.map(({ grupo, tags: opcoes }) => (
                <div key={grupo}>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{grupo}</p>
                  <div className="flex flex-wrap gap-2">
                    {opcoes.map((tag) => (
                      <label key={tag.value} className="cursor-pointer">
                        <input
                          type="checkbox"
                          name="tags"
                          value={tag.value}
                          defaultChecked={tags.includes(tag.value)}
                          className="sr-only peer"
                        />
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-gray-700 bg-gray-800 text-gray-400 peer-checked:bg-emerald-500/15 peer-checked:border-emerald-500/40 peer-checked:text-emerald-400 transition-all cursor-pointer hover:border-gray-600">
                          {tag.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-semibold text-sm px-6 py-2.5 rounded-xl transition-all"
            >
              Salvar alterações
            </button>
            <Link
              href="/painel/admin/veiculos"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors px-4 py-2.5"
            >
              Cancelar
            </Link>
          </div>
        </form>

        {/* ── Zona de perigo: excluir veículo ──────────────────────── */}
        <div className="mt-8 border border-red-500/20 rounded-2xl p-6 bg-red-500/5">
          <h3 className="text-sm font-semibold text-red-400 mb-1">Zona de perigo</h3>
          <p className="text-xs text-gray-500 mb-4">
            Excluir este veículo o remove permanentemente do CRM. Esta ação não pode ser desfeita.
          </p>
          <DeleteVeiculoButton veiculoId={veiculo.id} veiculoNome={veiculo.nome} />
        </div>
      </div>
    </div>
  )
}
