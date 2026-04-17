// app/painel/admin/aulas/page.tsx
// Admin — gestão de aulas: link do Google Meet, material, data/hora, descrição
// Listagem com formulários inline (um por aula) + formulário de criação no topo

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { salvarAula, excluirAula, criarAula } from './actions'

const TZ_BR = 'America/Sao_Paulo'

// Quebra uma data_hora ISO em { data: YYYY-MM-DD, hora: HH:MM } já no fuso BR
function partesBR(iso: string) {
  const d = new Date(iso)
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ_BR,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  // Espera-se algo como: "28/04/2026, 19:30"
  const partes = fmt.formatToParts(d)
  const get = (type: string) => partes.find((p) => p.type === type)?.value ?? ''
  const yyyy = get('year')
  const mm   = get('month')
  const dd   = get('day')
  const hh   = get('hour')
  const mi   = get('minute')
  return {
    data: `${yyyy}-${mm}-${dd}`,
    hora: `${hh}:${mi}`,
  }
}

function dataExtenso(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: TZ_BR,
  })
}

function horarioBR(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TZ_BR,
  })
}

function isPassada(iso: string) {
  return new Date(iso) < new Date()
}

export default async function AdminAulasPage({
  searchParams,
}: {
  searchParams: { sucesso?: string; criada?: string; excluida?: string; erro?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  const { data: aulas } = await supabase
    .from('aulas')
    .select('*')
    .order('data_hora')

  const aulasFuturas = (aulas || []).filter((a: any) => !isPassada(a.data_hora))
  const aulasPassadas = (aulas || []).filter((a: any) => isPassada(a.data_hora))

  return (
    <div className="space-y-8">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Link href="/painel/admin/imprensa" className="hover:text-gray-300 transition-colors">Admin</Link>
            <span>›</span>
            <span className="text-gray-400">Aulas</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Gestão de Aulas</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Edite o link do Google Meet, material e horário de cada aula. As mudanças aparecem em <code className="text-emerald-400">/painel/aulas</code> e no dashboard dos alunos.
          </p>
        </div>
      </div>

      {/* ── Flash messages ───────────────────────────────────────── */}
      {searchParams.sucesso && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-400 text-sm">
          ✅ Aula atualizada com sucesso.
        </div>
      )}
      {searchParams.criada && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-400 text-sm">
          ✅ Aula criada com sucesso.
        </div>
      )}
      {searchParams.excluida && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-400 text-sm">
          🗑️ Aula excluída.
        </div>
      )}
      {searchParams.erro && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          ❌ {decodeURIComponent(searchParams.erro)}
        </div>
      )}

      {/* ── Formulário de criação (collapsed em <details>) ───────── */}
      <details className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <summary className="list-none cursor-pointer px-6 py-4 flex items-center justify-between hover:bg-gray-800/40 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Adicionar nova aula</p>
              <p className="text-xs text-gray-500">Caso precise criar uma aula avulsa fora do cronograma</p>
            </div>
          </div>
          <span className="text-xs text-gray-500">Clique para expandir</span>
        </summary>

        <form action={criarAula} className="px-6 pb-6 pt-2 space-y-4 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Título *</label>
              <input
                name="titulo" required type="text"
                placeholder="Ex.: Media training"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Duração (min)</label>
              <input
                name="duracao_min" type="number" min={0} step={5} defaultValue={120}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Data *</label>
              <input
                name="data" required type="date"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Hora (BRT) *</label>
              <input
                name="hora" required type="time" defaultValue="19:30"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500/40 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Descrição</label>
            <textarea
              name="descricao" rows={2}
              placeholder="Ex.: Módulo 3 — Como falar com a imprensa. Com Lucas Studart."
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500/40 focus:outline-none resize-y"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Link do Google Meet</label>
              <input
                name="link_acesso" type="url"
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Material (URL)</label>
              <input
                name="material_url" type="url"
                placeholder="https://..."
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500/40 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-semibold text-sm px-4 py-2.5 rounded-xl transition-all"
            >
              Criar aula
            </button>
          </div>
        </form>
      </details>

      {/* ── Aulas futuras ────────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Próximas aulas ({aulasFuturas.length})
        </h2>

        {aulasFuturas.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
            <p className="text-gray-500 text-sm">Nenhuma aula futura cadastrada.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {aulasFuturas.map((aula: any) => (
              <AulaForm key={aula.id} aula={aula} />
            ))}
          </div>
        )}
      </section>

      {/* ── Aulas passadas ───────────────────────────────────────── */}
      {aulasPassadas.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
            Aulas anteriores ({aulasPassadas.length})
          </h2>
          <div className="space-y-4">
            {aulasPassadas.map((aula: any) => (
              <AulaForm key={aula.id} aula={aula} passada />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// ── Formulário de uma aula (inline) ─────────────────────────────
function AulaForm({ aula, passada = false }: { aula: any; passada?: boolean }) {
  const { data, hora } = partesBR(aula.data_hora)

  return (
    <details className={`bg-gray-900 border rounded-2xl overflow-hidden ${passada ? 'border-gray-800/60 opacity-80' : 'border-gray-800'}`}>
      <summary className="list-none cursor-pointer px-5 py-4 flex items-center justify-between hover:bg-gray-800/40 transition-colors gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {/* Data block */}
          <div className={`flex-shrink-0 rounded-xl px-3 py-2 text-center min-w-[64px] border ${
            passada ? 'bg-gray-800/40 border-gray-700/40' : 'bg-emerald-500/10 border-emerald-500/20'
          }`}>
            <p className={`text-[10px] font-medium uppercase ${passada ? 'text-gray-500' : 'text-emerald-400'}`}>
              {new Date(aula.data_hora).toLocaleDateString('pt-BR', { month: 'short', timeZone: TZ_BR })}
            </p>
            <p className="text-xl font-bold text-white leading-none mt-0.5">
              {Number(new Date(aula.data_hora).toLocaleDateString('en-US', { day: 'numeric', timeZone: TZ_BR }))}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{aula.titulo}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {dataExtenso(aula.data_hora)} · {horarioBR(aula.data_hora)}
              {aula.duracao_min ? ` · ${aula.duracao_min} min` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Indicador de link preenchido */}
          {aula.link_acesso ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Meet ✓
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              Meet pendente
            </span>
          )}
          {aula.material_url && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Material ✓
            </span>
          )}
          <span className="text-xs text-gray-500 ml-2">Editar</span>
        </div>
      </summary>

      <form action={salvarAula} className="px-5 pb-5 pt-3 space-y-4 border-t border-gray-800">
        <input type="hidden" name="id" value={aula.id} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Título *</label>
            <input
              name="titulo" required type="text" defaultValue={aula.titulo}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Data *</label>
            <input
              name="data" required type="date" defaultValue={data}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500/40 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Hora (BRT) *</label>
            <input
              name="hora" required type="time" defaultValue={hora}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Duração (min)</label>
            <input
              name="duracao_min" type="number" min={0} step={5} defaultValue={aula.duracao_min ?? ''}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500/40 focus:outline-none"
            />
          </div>
          <div className="md:col-span-1">
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Link do Google Meet</label>
            <input
              name="link_acesso" type="url" defaultValue={aula.link_acesso ?? ''}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500/40 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Material (URL)</label>
            <input
              name="material_url" type="url" defaultValue={aula.material_url ?? ''}
              placeholder="https://... (PDF, slides, link de apoio)"
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500/40 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Descrição</label>
            <textarea
              name="descricao" rows={2} defaultValue={aula.descricao ?? ''}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500/40 focus:outline-none resize-y"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <DeleteButton id={aula.id} titulo={aula.titulo} />

          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-semibold text-sm px-4 py-2.5 rounded-xl transition-all"
          >
            Salvar alterações
          </button>
        </div>
      </form>
    </details>
  )
}

// Botão de excluir com form separado (server action)
function DeleteButton({ id, titulo }: { id: string | number; titulo: string }) {
  return (
    <form action={excluirAula}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs text-red-400/70 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
        title={`Excluir "${titulo}"`}
      >
        Excluir aula
      </button>
    </form>
  )
}
