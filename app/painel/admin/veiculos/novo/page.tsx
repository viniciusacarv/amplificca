// app/painel/admin/veiculos/novo/page.tsx
// Formulário para cadastrar ou editar um veículo de imprensa

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { salvarVeiculo } from '../actions'

export default async function NovoVeiculoPage({
  searchParams,
}: {
  searchParams: { editar?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  // Se vier com ?editar=id, carrega o veículo para edição
  const editarId = searchParams.editar
  const { data: veiculo } = editarId
    ? await supabase.from('veiculos').select('*').eq('id', editarId).maybeSingle()
    : { data: null }

  const isEdicao = !!veiculo

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div>
        <Link
          href="/painel/admin/veiculos"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          CRM de Veículos
        </Link>
        <h1 className="text-2xl font-bold text-white">
          {isEdicao ? 'Editar veículo' : 'Novo veículo'}
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          {isEdicao ? 'Atualize as informações do veículo.' : 'Cadastre um novo veículo no CRM de imprensa.'}
        </p>
      </div>

      {/* ── Formulário ───────────────────────────────────────────── */}
      <form action={salvarVeiculo} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
        {isEdicao && <input type="hidden" name="id" value={veiculo.id} />}

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
            defaultValue={veiculo?.nome || ''}
            placeholder="ex: O Globo, Gazeta do Povo, O Catalisador"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
          />
        </div>

        {/* Tipo de relacionamento */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Nível de proximidade <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { value: 'parceiro',     label: 'Parceiro',     desc: 'Relação próxima e ativa',        emoji: '🤝' },
              { value: 'acessivel',    label: 'Acessível',    desc: 'Já houve contato ou placement',  emoji: '📨' },
              { value: 'a_conquistar', label: 'A conquistar', desc: 'Contato esporádico ou via terceiros', emoji: '🎯' },
              { value: 'inexistente',  label: 'Inexistente',  desc: 'Sem nenhum contato prévio',      emoji: '🧭' },
            ].map((opt) => (
              <label key={opt.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="tipo_relacionamento"
                  value={opt.value}
                  defaultChecked={(veiculo?.tipo_relacionamento || 'inexistente') === opt.value}
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
            defaultValue={veiculo?.website || ''}
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
            defaultValue={veiculo?.area_cobertura || ''}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/60 transition-colors appearance-none"
          >
            <option value="">Selecione uma categoria…</option>
            <optgroup label="Mídias de Orientação Liberal">
              <option value="midia_pro_liberdade">Mídia Pró-Liberdade</option>
              <option value="mainstream_pro_liberdade">Mainstream Pró-Liberdade</option>
              <option value="midia_de_ideias">Mídia de Ideias (Think Tanks)</option>
              <option value="documentarios_plataformas">Documentários / Plataformas</option>
            </optgroup>
            <optgroup label="Grande Mídia Nacional">
              <option value="grandes_jornais">Grandes Jornais</option>
              <option value="politica_bastidores">Política e Bastidores</option>
              <option value="opiniao_analise">Opinião e Análise</option>
              <option value="economia_negocios">Economia e Negócios</option>
              <option value="judiciario_direito">Judiciário e Direito</option>
            </optgroup>
            <optgroup label="Audiovisual">
              <option value="radio">Rádio</option>
              <option value="tv_canais_noticia">TV e Canais de Notícia</option>
            </optgroup>
            <optgroup label="Cobertura Regional">
              <option value="regional">Regional</option>
            </optgroup>
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
                defaultValue={veiculo?.contato_nome || ''}
                placeholder="Nome do editor/responsável"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="contato_email" className="block text-xs text-gray-500 mb-1.5">E-mail</label>
              <input
                id="contato_email"
                name="contato_email"
                type="email"
                defaultValue={veiculo?.contato_email || ''}
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
                defaultValue={veiculo?.contato_whatsapp || ''}
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
            <span className="ml-2 text-xs font-normal text-gray-500">como fazer contato, estilo de comunicação, histórico</span>
          </label>
          <textarea
            id="notas_abordagem"
            name="notas_abordagem"
            rows={3}
            defaultValue={veiculo?.notas_abordagem || ''}
            placeholder="ex: Preferem pitches curtos por e-mail. Melhor dia: segunda de manhã..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-emerald-500/60 transition-colors"
          />
        </div>

        {/* Estratégia de aproximação */}
        <div>
          <label htmlFor="estrategia_aproximacao" className="block text-sm font-medium text-gray-300 mb-2">
            Estratégia de aproximação
            <span className="ml-2 text-xs font-normal text-gray-500">como entrar no radar desse veículo, quem pode intermediar</span>
          </label>
          <textarea
            id="estrategia_aproximacao"
            name="estrategia_aproximacao"
            rows={3}
            defaultValue={veiculo?.estrategia_aproximacao || ''}
            placeholder="ex: Abordar via Mano Ferreira (Jovem Pan). Mandar pitch personalizado para o editor de opinião. Usar publicação anterior como referência..."
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
            defaultValue={veiculo?.proximos_passos || ''}
            placeholder="ex: → Sara envia e-mail até 30/04&#10;→ Follow-up 7 dias depois se sem retorno&#10;→ Anne apresenta o Amplifica ao editor na próxima visita a SP"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-emerald-500/60 transition-colors"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Tags
            <span className="ml-2 text-xs font-normal text-gray-500">classifique por tema, porte e perfil editorial</span>
          </label>
          <div className="space-y-4">
            {[
              {
                grupo: 'Tema',
                tags: [
                  { value: 'economia',   label: 'Economia'   },
                  { value: 'politica',   label: 'Política'   },
                  { value: 'cultura',    label: 'Cultura'    },
                  { value: 'direito',    label: 'Direito'    },
                  { value: 'tecnologia', label: 'Tecnologia' },
                  { value: 'educacao',   label: 'Educação'   },
                  { value: 'saude',      label: 'Saúde'      },
                  { value: 'seguranca',  label: 'Segurança'  },
                ],
              },
              {
                grupo: 'Porte',
                tags: [
                  { value: 'grande',  label: 'Grande'  },
                  { value: 'medio',   label: 'Médio'   },
                  { value: 'pequeno', label: 'Pequeno' },
                  { value: 'nicho',   label: 'Nicho'   },
                ],
              },
              {
                grupo: 'Perfil editorial',
                tags: [
                  { value: 'liberal',       label: 'Liberal'       },
                  { value: 'conservador',   label: 'Conservador'   },
                  { value: 'mainstream',    label: 'Mainstream'    },
                  { value: 'independente',  label: 'Independente'  },
                ],
              },
            ].map(({ grupo, tags }) => {
              const currentTags: string[] = veiculo?.tags ?? []
              return (
                <div key={grupo}>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{grupo}</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <label key={tag.value} className="cursor-pointer">
                        <input
                          type="checkbox"
                          name="tags"
                          value={tag.value}
                          defaultChecked={currentTags.includes(tag.value)}
                          className="sr-only peer"
                        />
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-gray-700 bg-gray-800 text-gray-400 peer-checked:bg-emerald-500/15 peer-checked:border-emerald-500/40 peer-checked:text-emerald-400 transition-all cursor-pointer hover:border-gray-600">
                          {tag.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Botões */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-semibold text-sm px-6 py-2.5 rounded-xl transition-all"
          >
            {isEdicao ? 'Salvar alterações' : 'Cadastrar veículo'}
          </button>
          <Link
            href="/painel/admin/veiculos"
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors px-4 py-2.5"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
