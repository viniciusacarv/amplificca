'use client'
import { useEffect, useState } from 'react'
import { supabase, Artigo } from '@/lib/supabase'

const ARTIGOS_DEMO: Artigo[] = [
  { id: 1, titulo: 'A liberdade de expressão no Brasil pós-2019', url: '#', fellow_id: 1, fellow_nome: 'Amanda Caixeta', veiculo: 'Gazeta do Povo', data_publicacao: '2026-03-15', thumbnail_url: '', tags: ['Liberdade de Expressão'], created_at: '' },
  { id: 2, titulo: 'Gestão pública eficiente: o que o Brasil precisa aprender', url: '#', fellow_id: 2, fellow_nome: 'Ana Carolina Beltrão', veiculo: 'Estadão', data_publicacao: '2026-03-10', thumbnail_url: '', tags: ['Gestão Pública'], created_at: '' },
  { id: 3, titulo: 'Livre mercado e prosperidade: lições para o Brasil', url: '#', fellow_id: 8, fellow_nome: 'Germano Laube', veiculo: 'Valor Econômico', data_publicacao: '2026-03-05', thumbnail_url: '', tags: ['Economia'], created_at: '' },
  { id: 4, titulo: 'Tecnologia e democracia: o papel da inovação no debate público', url: '#', fellow_id: 7, fellow_nome: 'Gabriela Martins Nunes', veiculo: 'Folha de S.Paulo', data_publicacao: '2026-02-28', thumbnail_url: '', tags: ['Tecnologia'], created_at: '' },
  { id: 5, titulo: 'Transparência e combate à corrupção: avanços e desafios', url: '#', fellow_id: 5, fellow_nome: 'Davi de Souza', veiculo: 'Revista Oeste', data_publicacao: '2026-02-20', thumbnail_url: '', tags: ['Política'], created_at: '' },
  { id: 6, titulo: 'Educação e empreendedorismo: formando líderes para o futuro', url: '#', fellow_id: 2, fellow_nome: 'Ana Carolina Beltrão', veiculo: 'Jovem Pan', data_publicacao: '2026-02-15', thumbnail_url: '', tags: ['Educação'], created_at: '' },
]

const VEICULOS_FILTRO = ['Todos', 'Folha de S.Paulo', 'Estadão', 'Gazeta do Povo', 'Valor Econômico', 'Revista Oeste', 'Jovem Pan']

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function Artigos() {
  const [artigos, setArtigos] = useState<Artigo[]>(ARTIGOS_DEMO)
  const [filtro, setFiltro] = useState('Todos')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('artigos').select('*').order('data_publicacao', { ascending: false })
      if (data && data.length > 0) setArtigos(data)
    }
    load()
  }, [])

  const filtrados = artigos
    .filter(a => filtro === 'Todos' || a.veiculo === filtro)
    .filter(a => busca === '' || a.titulo.toLowerCase().includes(busca.toLowerCase()) || a.fellow_nome.toLowerCase().includes(busca.toLowerCase()))

  return (
    <section id="artigos" style={{ padding: '100px 0', background: '#0a0a0a' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 60, flexWrap: 'wrap', gap: 24 }}>
          <div>
            <span style={{ color: 'var(--verde)', fontSize: 12, letterSpacing: 2, fontWeight: 500 }}>PUBLICAÇÕES</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 7vw, 80px)', color: '#fff', lineHeight: 0.95, marginTop: 12 }}>
              NA IMPRENSA
            </h2>
          </div>
          <input
            value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar artigo ou fellow..."
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 4, padding: '10px 16px', color: '#fff', fontSize: 13,
              outline: 'none', width: 240,
            }}
          />
        </div>

        {/* Filtro veículos */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
          {VEICULOS_FILTRO.map(v => (
            <button key={v} onClick={() => setFiltro(v)} style={{
              padding: '6px 14px', borderRadius: 100, fontSize: 11, cursor: 'pointer', transition: 'all 0.2s',
              background: filtro === v ? 'var(--verde)' : 'rgba(255,255,255,0.04)',
              color: filtro === v ? '#000' : 'rgba(255,255,255,0.45)',
              border: filtro === v ? 'none' : '1px solid rgba(255,255,255,0.08)',
              fontWeight: filtro === v ? 500 : 400,
            }}>{v}</button>
          ))}
        </div>

        {/* Lista artigos */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filtrados.map((a, i) => (
            <a key={a.id} href={a.url} target="_blank" rel="noopener" style={{
              display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center',
              padding: '24px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
              textDecoration: 'none', transition: 'all 0.2s',
              borderLeft: '2px solid transparent',
              paddingLeft: 16,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderLeftColor = 'var(--verde)'
              e.currentTarget.style.paddingLeft = '24px'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderLeftColor = 'transparent'
              e.currentTarget.style.paddingLeft = '16px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--verde)', fontWeight: 500, background: 'rgba(126,211,33,0.1)', padding: '2px 8px', borderRadius: 100 }}>{a.veiculo}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{formatDate(a.data_publicacao)}</span>
                </div>
                <h3 style={{ fontSize: 16, color: '#fff', fontWeight: 400, lineHeight: 1.4, marginBottom: 6 }}>{a.titulo}</h3>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>por {a.fellow_nome}</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 20, flexShrink: 0 }}>↗</span>
            </a>
          ))}
        </div>

        {filtrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
            Nenhum artigo encontrado.
          </div>
        )}
      </div>
    </section>
  )
}
