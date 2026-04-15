'use client'
// app/painel/admin/page.tsx
// Painel do administrador: registrar pontos + gerenciar aulas
// Client Component — usa browser Supabase client para inserções

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'

// Tipos válidos de pontos com seus valores padrão
const TIPOS_PONTOS = [
  { value: 'artigo_nacional',     label: 'Artigo — Veículo Nacional',     default: 30 },
  { value: 'artigo_regional',     label: 'Artigo — Veículo Regional/Blog', default: 15 },
  { value: 'debate_participacao', label: 'Debate — Participação',          default: 10 },
  { value: 'debate_oitavas',      label: 'Debate — Vitória nas Oitavas',   default: 10 },
  { value: 'debate_quartas',      label: 'Debate — Vitória nas Quartas',   default: 15 },
  { value: 'debate_semi',         label: 'Debate — Vitória na Semifinal',  default: 25 },
  { value: 'debate_final',        label: 'Debate — Vice-campeão',          default: 35 },
  { value: 'debate_campeonato',   label: 'Debate — Campeão',               default: 50 },
  { value: 'aula_presenca',       label: 'Aula — Presença',                default: 5 },
]

type Fellow = { id: number; nome: string }
type Aula   = { id: number; titulo: string; data_hora: string; link_acesso: string | null }
type Ponto  = { id: number; fellow_nome: string; tipo: string; descricao: string; valor: number; created_at: string }

type Aba = 'pontos' | 'aulas'

export default function AdminPage() {
  const [aba, setAba] = useState<Aba>('pontos')
  const supabase = createClient()

  // ── Estado: Pontos ──────────────────────────────────────────────
  const [fellows, setFellows]           = useState<Fellow[]>([])
  const [fellowSel, setFellowSel]       = useState('')
  const [tipoPonto, setTipoPonto]       = useState(TIPOS_PONTOS[0].value)
  const [valorPonto, setValorPonto]     = useState(TIPOS_PONTOS[0].default)
  const [descPonto, setDescPonto]       = useState('')
  const [pontosRecentes, setPontosRecentes] = useState<Ponto[]>([])
  const [loadingPonto, setLoadingPonto] = useState(false)
  const [msgPonto, setMsgPonto]         = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)

  // ── Estado: Aulas ───────────────────────────────────────────────
  const [tituloAula, setTituloAula]   = useState('')
  const [descAula, setDescAula]       = useState('')
  const [dataAula, setDataAula]       = useState('')
  const [horaAula, setHoraAula]       = useState('19:00')
  const [duracaoAula, setDuracaoAula] = useState(90)
  const [linkAula, setLinkAula]       = useState('')
  const [materialAula, setMaterialAula] = useState('')
  const [aulasLista, setAulasLista]   = useState<Aula[]>([])
  const [loadingAula, setLoadingAula] = useState(false)
  const [msgAula, setMsgAula]         = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)

  // ── Carregamento inicial ────────────────────────────────────────
  useEffect(() => {
    carregarFellows()
    carregarPontosRecentes()
    carregarAulas()
  }, [])

  async function carregarFellows() {
    const { data } = await supabase
      .from('fellows')
      .select('id, nome')
      .order('nome')
    setFellows(data ?? [])
  }

  async function carregarPontosRecentes() {
    const { data } = await supabase
      .from('pontos')
      .select('id, fellow_nome, tipo, descricao, valor, created_at')
      .order('created_at', { ascending: false })
      .limit(15)
    setPontosRecentes(data ?? [])
  }

  async function carregarAulas() {
    const { data } = await supabase
      .from('aulas')
      .select('id, titulo, data_hora, link_acesso')
      .order('data_hora', { ascending: false })
      .limit(20)
    setAulasLista(data ?? [])
  }

  // ── Handlers: Pontos ────────────────────────────────────────────
  function handleTipoPontoChange(tipo: string) {
    setTipoPonto(tipo)
    const encontrado = TIPOS_PONTOS.find((t) => t.value === tipo)
    if (encontrado) setValorPonto(encontrado.default)
  }

  async function handleAdicionarPonto(e: React.FormEvent) {
    e.preventDefault()
    if (!fellowSel) return
    setLoadingPonto(true)
    setMsgPonto(null)

    const fellow = fellows.find((f) => String(f.id) === fellowSel)
    if (!fellow) { setLoadingPonto(false); return }

    const { error } = await supabase.from('pontos').insert({
      fellow_id:   fellow.id,
      fellow_nome: fellow.nome,
      tipo:        tipoPonto,
      descricao:   descPonto || TIPOS_PONTOS.find((t) => t.value === tipoPonto)?.label,
      valor:       valorPonto,
    })

    if (error) {
      setMsgPonto({ tipo: 'erro', texto: 'Erro ao registrar pontos: ' + error.message })
    } else {
      setMsgPonto({ tipo: 'ok', texto: `✓ +${valorPonto} pts registrados para ${fellow.nome}` })
      setDescPonto('')
      carregarPontosRecentes()
    }
    setLoadingPonto(false)
  }

  async function handleDeletarPonto(id: number) {
    if (!confirm('Remover este registro de pontos?')) return
    await supabase.from('pontos').delete().eq('id', id)
    carregarPontosRecentes()
  }

  // ── Handlers: Aulas ─────────────────────────────────────────────
  async function handleAdicionarAula(e: React.FormEvent) {
    e.preventDefault()
    if (!tituloAula || !dataAula) return
    setLoadingAula(true)
    setMsgAula(null)

    // Monta timestamp com timezone Brasil (-03:00)
    const dataHoraISO = `${dataAula}T${horaAula}:00-03:00`

    const { error } = await supabase.from('aulas').insert({
      titulo:       tituloAula,
      descricao:    descAula || null,
      data_hora:    dataHoraISO,
      duracao_min:  duracaoAula,
      link_acesso:  linkAula || null,
      material_url: materialAula || null,
    })

    if (error) {
      setMsgAula({ tipo: 'erro', texto: 'Erro ao criar aula: ' + error.message })
    } else {
      setMsgAula({ tipo: 'ok', texto: '✓ Aula criada com sucesso' })
      setTituloAula('')
      setDescAula('')
      setDataAula('')
      setHoraAula('19:00')
      setLinkAula('')
      setMaterialAula('')
      carregarAulas()
    }
    setLoadingAula(false)
  }

  async function handleDeletarAula(id: number) {
    if (!confirm('Remover esta aula?')) return
    await supabase.from('aulas').delete().eq('id', id)
    carregarAulas()
  }

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
        <p className="text-gray-400 text-sm mt-1">Registre pontos manualmente e gerencie as aulas de oratória.</p>
      </div>

      {/* Abas */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {(['pontos', 'aulas'] as Aba[]).map((a) => (
          <button
            key={a}
            onClick={() => setAba(a)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              aba === a
                ? 'bg-gray-800 text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {a === 'pontos' ? '⭐ Pontos' : '📅 Aulas'}
          </button>
        ))}
      </div>

      {/* ── ABA PONTOS ──────────────────────────────────────────── */}
      {aba === 'pontos' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Formulário */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-5">Registrar Pontos</h2>

            {msgPonto && (
              <div className={`rounded-xl p-3 mb-4 text-sm ${
                msgPonto.tipo === 'ok'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
                {msgPonto.texto}
              </div>
            )}

            <form onSubmit={handleAdicionarPonto} className="space-y-4">
              {/* Fellow */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Fellow *</label>
                <select
                  value={fellowSel}
                  onChange={(e) => setFellowSel(e.target.value)}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                >
                  <option value="">Selecionar fellow...</option>
                  {fellows.map((f) => (
                    <option key={f.id} value={f.id}>{f.nome}</option>
                  ))}
                </select>
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Tipo *</label>
                <select
                  value={tipoPonto}
                  onChange={(e) => handleTipoPontoChange(e.target.value)}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                >
                  {TIPOS_PONTOS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} ({t.default} pts)
                    </option>
                  ))}
                </select>
              </div>

              {/* Valor */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Valor em pontos *</label>
                <input
                  type="number"
                  value={valorPonto}
                  onChange={(e) => setValorPonto(Number(e.target.value))}
                  required
                  min={1}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Descrição (opcional)</label>
                <input
                  type="text"
                  value={descPonto}
                  onChange={(e) => setDescPonto(e.target.value)}
                  placeholder="Ex: Campeonato regional de debates 2026"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loadingPonto}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-2.5 rounded-xl transition text-sm"
              >
                {loadingPonto ? 'Registrando...' : `Registrar +${valorPonto} pontos`}
              </button>
            </form>
          </div>

          {/* Pontos recentes */}
          <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-5">Últimos Registros</h2>
            {pontosRecentes.length > 0 ? (
              <div className="space-y-2">
                {pontosRecentes.map((p) => (
                  <div key={p.id} className="flex items-start gap-3 py-2 border-b border-gray-800/50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium">{p.fellow_nome}</p>
                      <p className="text-xs text-gray-500 truncate">{p.descricao || p.tipo}</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {new Date(p.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className="text-emerald-400 font-bold text-sm flex-shrink-0">+{p.valor}</span>
                    <button
                      onClick={() => handleDeletarPonto(p.id)}
                      className="text-gray-700 hover:text-red-400 transition-colors flex-shrink-0"
                      title="Remover"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">Nenhum registro encontrado.</p>
            )}
          </div>
        </div>
      )}

      {/* ── ABA AULAS ───────────────────────────────────────────── */}
      {aba === 'aulas' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Formulário nova aula */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-5">Nova Aula</h2>

            {msgAula && (
              <div className={`rounded-xl p-3 mb-4 text-sm ${
                msgAula.tipo === 'ok'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
                {msgAula.texto}
              </div>
            )}

            <form onSubmit={handleAdicionarAula} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Título *</label>
                <input
                  type="text"
                  value={tituloAula}
                  onChange={(e) => setTituloAula(e.target.value)}
                  required
                  placeholder="Ex: Oratória para Mídia"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Descrição (opcional)</label>
                <textarea
                  value={descAula}
                  onChange={(e) => setDescAula(e.target.value)}
                  rows={2}
                  placeholder="Sobre o que será a aula..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Data *</label>
                  <input
                    type="date"
                    value={dataAula}
                    onChange={(e) => setDataAula(e.target.value)}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Horário *</label>
                  <input
                    type="time"
                    value={horaAula}
                    onChange={(e) => setHoraAula(e.target.value)}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Duração (min)</label>
                <input
                  type="number"
                  value={duracaoAula}
                  onChange={(e) => setDuracaoAula(Number(e.target.value))}
                  min={15}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Link de acesso (Zoom/Meet)</label>
                <input
                  type="url"
                  value={linkAula}
                  onChange={(e) => setLinkAula(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Material (URL)</label>
                <input
                  type="url"
                  value={materialAula}
                  onChange={(e) => setMaterialAula(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loadingAula}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-2.5 rounded-xl transition text-sm"
              >
                {loadingAula ? 'Criando...' : 'Criar Aula'}
              </button>
            </form>
          </div>

          {/* Lista de aulas */}
          <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-5">Aulas Cadastradas</h2>
            {aulasLista.length > 0 ? (
              <div className="space-y-3">
                {aulasLista.map((a) => {
                  const passada = new Date(a.data_hora) < new Date()
                  return (
                    <div
                      key={a.id}
                      className={`flex items-start gap-3 py-2 border-b border-gray-800/50 last:border-0 ${passada ? 'opacity-50' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">{a.titulo}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(a.data_hora).toLocaleDateString('pt-BR', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {passada && <span className="ml-2 text-gray-600">(passada)</span>}
                        </p>
                        {a.link_acesso && (
                          <a href={a.link_acesso} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:text-emerald-400 transition-colors">
                            Link de acesso
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeletarAula(a.id)}
                        className="text-gray-700 hover:text-red-400 transition-colors flex-shrink-0"
                        title="Remover"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">Nenhuma aula cadastrada.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
