'use client'
import { useEffect, useState } from 'react'
import { supabase, Artigo } from '@/lib/supabase'

const ITEMS_POR_PAGINA = 10

function formatDate(d: string) {
  const [year, month, day] = d.split('-')
  return new Date(+year, +month - 1, +day).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function Artigos() {
  const [artigos, setArtigos] = useState<Artigo[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('Todos')
  const [busca, setBusca] = useState('')
  const [fellowFiltro, setFellowFiltro] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(ITEMS_POR_PAGINA)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('artigos').select('*').order('data_publicacao', { ascending: false })
      if (data) setArtigos(data)
      setLoading(false)
    }
    load()
  }, [])

  // Escutar evento disparado pelo EncontreUmFellow ao clicar "Ver artigos" de um fellow
  useEffect(() => {
    const handler = (e: Event) => {
      const nome = (e as CustomEvent<string>).detail
      setFellowFiltro(nome)
      setFiltro('Todos')
      setBusca('')
      setVisibleCount(ITEMS_POR_PAGINA)
      setTimeout(() => {
        document.getElementById('artigos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
    window.addEventListener('amplifica:filtrar-fellow', handler)
    return () => window.removeEventListener('amplifica:filtrar-fellow', handler)
  }, [])

  // Resetar paginação ao mudar filtros
  useEffect(() => { setVisibleCount(ITEMS_POR_PAGINA) }, [filtro, busca, fellowFiltro])

  const veiculos = ['Todos', ...Array.from(new Set(artigos.map(a => a.veiculo))).sort()]

  const filtrados = artigos
    .filter(a => filtro === 'Todos' || a.veiculo === filtro)
    .filter(a => !fellowFiltro || a.fellow_nome === fellowFiltro)
    .filter(a =>
      busca === '' ||
      a.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      a.fellow_nome.toLowerCase().includes(busca.toLowerCase()) ||
      a.veiculo.toLowerCase().includes(busca.toLowerCase())
    )

  const visiveis = filtrados.slice(0, visibleCount)
  const temMais = visibleCount < filtrados.length

  return (
    <section id="artigos" style={{ padding: '100px 0', background: '#0a0a0a' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 60, flexWrap: 'wrap', gap: 24 }}>
          <div>
            <span style={{ color: 'var(--verde)', fontSize: 12, letterSpacing: 2, fontWeight: 500 }}>PUBLICAÇÕES</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 7vw, 80px)', color: '#fff', lineHeight: 0.95, marginTop: 12 }}>
              NA IMPRENSA
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 12 }}>
              {loading ? '...' : `${artigos.length} artigos publicados em ${veiculos.length - 1} veículos`}
            </p>
          </div>
          <input
            value={busca}
            onChange={e => { setBusca(e.target.value); setFellowFiltro(null) }}
            placeholder="Buscar artigo, fellow ou veículo..."
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 4, padding: '10px 16px', color: '#fff', fontSize: 13,
              outline: 'none', width: 260,
            }}
          />
        </div>

        {/* Banner de filtro ativo por fellow */}
        {fellowFiltro && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
            background: 'rgba(126,211,33,0.08)', border: '1px solid rgba(126,211,33,0.25)',
            borderRadius: 8, padding: '10px 16px',
          }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
              Artigos de <strong style={{ color: 'var(--verde)' }}>{fellowFiltro}</strong>
            </span>
            <button
              onClick={() => setFellowFiltro(null)}
              style={{
                marginLeft: 'auto', background: 'none',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 100, color: 'rgba(255,255,255,0.45)', cursor: 'pointer',
                fontSize: 11, padding: '3px 12px', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--verde)'; e.currentTarget.style.color = 'var(--verde)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}
            >
              Limpar filtro ×
            </button>
          </div>
        )}

        {/* Filtro veículos */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
          {veiculos.map(v => (
            <button key={v} onClick={() => { setFiltro(v); setFellowFiltro(null) }} style={{
              padding: '6px 14px', borderRadius: 100, fontSize: 11, cursor: 'pointer', transition: 'all 0.2s',
              background: filtro === v && !fellowFiltro ? 'var(--verde)' : 'rgba(255,255,255,0.04)',
              color: filtro === v && !fellowFiltro ? '#000' : 'rgba(255,255,255,0.45)',
              border: filtro === v && !fellowFiltro ? 'none' : '1px solid rgba(255,255,255,0.08)',
              fontWeight: filtro === v && !fellowFiltro ? 500 : 400,
            }}>{v}</button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
            Carregando artigos...
          </div>
        )}

        {/* Lista artigos */}
        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {visiveis.map((a) => (
              <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" style={{
                display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center',
                padding: '22px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                textDecoration: 'none', transition: 'padding 0.2s, border-color 0.2s, background 0.2s',
                borderLeft: '2px solid transparent',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderLeftColor = 'var(--verde)'
                e.currentTarget.style.paddingLeft = '24px'
                e.currentTarget.style.background = 'rgba(126,211,33,0.02)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderLeftColor = 'transparent'
                e.currentTarget.style.paddingLeft = '16px'
                e.currentTarget.style.background = 'transparent'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--verde)', fontWeight: 500, background: 'rgba(126,211,33,0.1)', padding: '2px 8px', borderRadius: 100 }}>{a.veiculo}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{formatDate(a.data_publicacao)}</span>
                  </div>
                  <h3 style={{ fontSize: 15, color: '#fff', fontWeight: 400, lineHeight: 1.45, marginBottom: 6 }}>{a.titulo}</h3>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>por {a.fellow_nome}</span>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 20, flexShrink: 0 }}>↗</span>
              </a>
            ))}
          </div>
        )}

        {/* Botão Ver mais */}
        {!loading && temMais && (
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button
              onClick={() => setVisibleCount(v => v + ITEMS_POR_PAGINA)}
              style={{
                background: 'transparent', border: '1.5px solid var(--verde)',
                color: 'var(--verde)', borderRadius: 6, padding: '12px 40px',
                fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(126,211,33,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              Ver mais {Math.min(ITEMS_POR_PAGINA, filtrados.length - visibleCount)} artigos →
            </button>
          </div>
        )}

        {!loading && filtrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
            Nenhum artigo encontrado.
            <br />
            <button
              onClick={() => { setFellowFiltro(null); setBusca(''); setFiltro('Todos') }}
              style={{ marginTop: 16, background: 'none', border: 'none', color: 'var(--verde)', cursor: 'pointer', fontSize: 13 }}
            >
              Ver todos os artigos
            </button>
          </div>
        )}

      </div>
    </section>
  )
}
