// app/painel/admin/veiculos/[id]/page.tsx
// Ficha completa do veículo — edição

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { salvarVeiculo } from '../actions'
import { DeleteVeiculoButton } from './DeleteVeiculoButton'
import { ContatosEditor } from './ContatosEditor'
import type { ContatoItem, AdminOpcao } from './ContatosEditor'
import { TagsSelector, type TagOption } from '@/components/imprensa/TagsSelector'

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

  // Busca lista de admins para o seletor de responsável
  const { data: equipe } = await supabase
    .from('equipe')
    .select('id, nome, foto_url, email')
    .order('nome')

  const admins: AdminOpcao[] = (equipe ?? []).map((a: any) => ({
    id: a.id,
    nome: a.nome ?? a.email ?? 'Admin',
    foto_url: a.foto_url ?? null,
    email: a.email ?? '',
  }))

  // Carrega tags ativas (lista mestre) e tags atualmente associadas ao veículo
  const { data: tagsAtivasRaw } = await supabase
    .from('tags')
    .select('id, nome, slug, grupo')
    .eq('ativo', true)
    .order('grupo', { nullsFirst: true })
    .order('nome')
  const tagsAtivas: TagOption[] = tagsAtivasRaw ?? []

  const { data: tagsAssociadasRaw } = await supabase
    .from('veiculo_tags')
    .select('tag_id, tags(id, nome, slug, grupo)')
    .eq('veiculo_id', veiculo.id)

  const tagsAssociadasIds = (tagsAssociadasRaw ?? []).map((r: any) => r.tag_id)
  const tagsAssociadas: TagOption[] = (tagsAssociadasRaw ?? [])
    .map((r: any) => r.tags)
    .filter(Boolean)

  const tipo = TIPO_CONFIG[veiculo.tipo_relacionamento] ?? TIPO_CONFIG.inexistente
  const contatosIniciais: ContatoItem[] = Array.isArray(veiculo.contatos) ? veiculo.contatos : []

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

      {/* ── Header — resumo visual ────────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
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
                  {CATEGORIA_LABEL[veiculo.area_cobertura] ?? veiculo.area_cobertura}
                </span>
              )}
              {veiculo.website && (
                <a href={veiculo.website} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-emerald-400 transition-colors">
                  {veiculo.website.replace(/^https?:\/\//, '')} ↗
                </a>
              )}
            </div>
          </div>
        </div>
        {tagsAssociadas.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-gray-800">
            {tagsAssociadas.map((tag) => (
              <span key={String(tag.id)} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                {tag.nome}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Formulário de edição ─────────────────────────────────── */}
      <form action={salvarVeiculo} className="space-y-6">
        <input type="hidden" name="id" value={veiculo.id} />

        {/* ══ CONTATOS — destaque principal ══════════════════════════ */}
        <div className="bg-gray-900 border-2 border-emerald-500/25 rounded-2xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-base">
              📇
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Contatos</h2>
              <p className="text-xs text-gray-500 mt-0.5">Pessoas-chave para placement neste veículo</p>
            </div>
          </div>
          <ContatosEditor inicial={contatosIniciais} admins={admins} />
        </div>

        {/* ══ Ficha do veículo ═══════════════════════════════════════ */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Ficha do veículo</h2>

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

          {/* Website + Categoria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              placeholder="ex: Abordar via Mano Ferreira. Mandar pitch personalizado para o editor de opinião..."
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
            <TagsSelector
              name="tag_ids"
              tags={tagsAtivas}
              defaultSelected={tagsAssociadasIds}
              ajuda="Tags de tema impulsionam a sugestão deste veículo no placement de artigos com tags equivalentes."
            />
          </div>
        </div>

        {/* Botões de salvar */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-semibold text-sm px-6 py-3 rounded-xl transition-all"
          >
            Salvar alterações
          </button>
          <Link
            href="/painel/admin/veiculos"
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors px-4 py-3"
          >
            Cancelar
          </Link>
        </div>
      </form>

      {/* ── Zona de perigo ───────────────────────────────────────── */}
      <div className="border border-red-500/20 rounded-2xl p-6 bg-red-500/5">
        <h3 className="text-sm font-semibold text-red-400 mb-1">Zona de perigo</h3>
        <p className="text-xs text-gray-500 mb-4">
          Excluir este veículo o remove permanentemente do CRM. Esta ação não pode ser desfeita.
        </p>
        <DeleteVeiculoButton veiculoId={veiculo.id} veiculoNome={veiculo.nome} />
      </div>
    </div>
  )
}
