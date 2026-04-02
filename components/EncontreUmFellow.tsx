'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase, Fellow } from '@/lib/supabase'
import AnimatedBorder from '@/components/AnimatedBorder'

const ESTADOS_LISTA = [
  'Todos os estados',
  'AC — Acre','AL — Alagoas','AM — Amazonas','AP — Amapá','BA — Bahia',
  'CE — Ceará','DF — Distrito Federal','ES — Espírito Santo','GO — Goiás',
  'MA — Maranhão','MG — Minas Gerais','MS — Mato Grosso do Sul','MT — Mato Grosso',
  'PA — Pará','PB — Paraíba','PE — Pernambuco','PI — Piauí','PR — Paraná',
  'RJ — Rio de Janeiro','RN — Rio Grande do Norte','RO — Rondônia','RR — Roraima',
  'RS — Rio Grande do Sul','SC — Santa Catarina','SE — Sergipe','SP — São Paulo','TO — Tocantins'
]

const ESPECIALIDADES = [
  'Todas as especialidades','Direito','Economia','Educação',
  'Tecnologia','Política','Comunicação','Gestão Pública'
]

const AREA_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Direito':        { bg: 'rgba(59,130,246,0.1)',  text: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
  'Economia':       { bg: 'rgba(245,158,11,0.1)',  text: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
  'Educação':       { bg: 'rgba(139,92,246,0.1)',  text: '#a78bfa', border: 'rgba(139,92,246,0.25)' },
  'Tecnologia':     { bg: 'rgba(6,182,212,0.1)',   text: '#22d3ee', border: 'rgba(6,182,212,0.25)'  },
  'Política':       { bg: 'rgba(239,68,68,0.1)',   text: '#f87171', border: 'rgba(239,68,68,0.25)'  },
  'Comunicação':    { bg: 'rgba(126,211,33,0.1)',  text: '#7ED321', border: 'rgba(126,211,33,0.25)' },
  'Gestão Pública': { bg: 'rgba(249,115,22,0.1)',  text: '#fb923c', border: 'rgba(249,115,22,0.25)' },
}

const ESTADOS_NOME: Record<string,string> = {
  'AC':'Acre','AL':'Alagoas','AM':'Amazonas','AP':'Amapá','BA':'Bahia','CE':'Ceará',
  'DF':'Distrito Federal','ES':'Espírito Santo','GO':'Goiás','MA':'Maranhão',
  'MG':'Minas Gerais','MS':'Mato Grosso do Sul','MT':'Mato Grosso','PA':'Pará',
  'PB':'Paraíba','PE':'Pernambuco','PI':'Piauí','PR':'Paraná','RJ':'Rio de Janeiro',
  'RN':'Rio Grande do Norte','RO':'Rondônia','RR':'Roraima','RS':'Rio Grande do Sul',
  'SC':'Santa Catarina','SE':'Sergipe','SP':'São Paulo','TO':'Tocantins'
}

const FELLOWS_DEMO: Fellow[] = [
  { id:1,  nome:'Amanda Caixeta',                    bio:'Jornalista por formação, chefe geral de comunicação e imprensa do deputado federal Gustavo Gayer.',                                          estado:'GO',area:'Comunicação',   instagram:'amandacaixeeta',    foto_url:'/fellows/amanda-caixeta.png',    created_at:'' },
  { id:2,  nome:'Ana Carolina Beltrão Peixoto',      bio:'Administradora, Assistente Social e Pedagoga. Doutora em Serviço Social e Mestre em Meio Ambiente.',                                        estado:'MG',area:'Educação',      instagram:'acarolprofessora',  foto_url:'/fellows/ana-carolina.png',      created_at:'' },
  { id:3,  nome:'Barbara Abras',                     bio:'Bacharel em Administração com experiência em gestão pública, gestão de pessoas e advocacy.',                                                 estado:'MG',area:'Gestão Pública',instagram:'barbara.abras',     foto_url:'/fellows/barbara-abras.png',     created_at:'' },
  { id:4,  nome:'Bruno Sperancetta',                 bio:'Presidente do movimento estudantil JL (Juventude Livre). Estudante de Direito na PUCPR.',                                                    estado:'PR',area:'Direito',       instagram:'bruno_sperancetta', foto_url:'/fellows/bruno-sperancetta.png', created_at:'' },
  { id:5,  nome:'Davi de Souza',                     bio:'Assessor Parlamentar na Câmara dos Deputados. Pesquisador em Ciência Política pela UnB.',                                                    estado:'DF',area:'Política',      instagram:'davidesouzabh',     foto_url:'/fellows/davi-souza.png',        created_at:'' },
  { id:6,  nome:'Eduardo Inojosa',                   bio:'Advogado e mestre em economia pelo Insper. Defende políticas públicas baseadas em dados e evidências.',                                      estado:'PE',area:'Economia',      instagram:'eduardoinojosaa',   foto_url:'/fellows/eduardo-inojosa.png',   created_at:'' },
  { id:7,  nome:'Gabriela Martins Nunes',            bio:'Project Leader no Mercado Livre. Mestre em Pesquisa Operacional pelo ITA.',                                                                  estado:'SP',area:'Tecnologia',    instagram:'gabrielamartinsn',  foto_url:'/fellows/gabriela-martins.png',  created_at:'' },
  { id:8,  nome:'Germano Laube',                     bio:'Especialista em Mercado Financeiro, Consultor de Investimentos e sócio cofundador da LDC Capital.',                                         estado:'RS',area:'Economia',      instagram:'germano_laube',     foto_url:'/fellows/germano-laube.png',     created_at:'' },
  { id:9,  nome:'Ivanildo Francisco dos Santos Terceiro', bio:'Diretor Global de Marketing da Students For Liberty. Coordena campanhas que alcançam milhões de pessoas.',                              estado:'BA',area:'Comunicação',   instagram:'ivanildoiii',       foto_url:'/fellows/ivanildo-terceiro.png', created_at:'' },
  { id:10, nome:'Jeferson Scheibler',                bio:'Acadêmico de Engenharia de Software, embaixador da ICSC e Local Lead do NASA Space Apps.',                                                  estado:'RS',area:'Tecnologia',    instagram:'jeferson_scheibler',foto_url:'/fellows/jeferson-scheibler.png',created_at:'' },
  { id:11, nome:'Julia de Castro',                   bio:'Formada em História pela UFRJ. Vice-presidente da ala jovem do Partido Liberal.',                                                           estado:'RJ',area:'Política',      instagram:'juliadecastrobr',   foto_url:'/fellows/julia-castro.png',      created_at:'' },
  { id:12, nome:'Letícia Barros',                    bio:'Advogada e empreendedora em comunicação política. Gerente de comunicação global do LOLA.',                                                   estado:'RJ',area:'Comunicação',   instagram:'leticiabbarros',    foto_url:'/fellows/leticia-barros.png',    created_at:'' },
  { id:13, nome:'Marcos Paulo Candeloro',            bio:'Graduado em História (USP), pós-graduado em Ciências Políticas (Columbia University). Professor e analista político.',                      estado:'SP',area:'Política',      instagram:'mpcanderolo',       foto_url:'/fellows/marcos-paulo.png',      created_at:'' },
  { id:14, nome:'Nathalia Welker',                   bio:'Responsável pela comunicação do Partido NOVO no RS. Embaixadora do Students For Liberty Brasil.',                                            estado:'RS',area:'Comunicação',   instagram:'nathaliawelker',    foto_url:'/fellows/nathalia-welker.png',   created_at:'' },
  { id:15, nome:'Pedro Ferreira da Silva Neto',      bio:'Engenheiro civil, gestor público e analista político. Foco em segurança pública e liberdade econômica.',                                    estado:'RJ',area:'Política',      instagram:'pedronetorio',      foto_url:'/fellows/pedro-neto.png',        created_at:'' },
  { id:16, nome:'Ronan Matos',                       bio:'Escritor, jornalista, editor-chefe do Diário do Acre e Embaixador do Students For Liberty Brasil.',                                         estado:'AC',area:'Comunicação',   instagram:'ronanmatosac',      foto_url:'/fellows/ronan-matos.png',       created_at:'' },
  { id:17, nome:'Wesley Reis',                       bio:'Economista e diretor do IFL Rio de Janeiro. Colunista do Instituto Millenium.',                                                              estado:'RJ',area:'Economia',      instagram:'wesley.areis',      foto_url:'/fellows/wesley-reis.png',       created_at:'' },
  { id:18, nome:'William A. Clavijo Vitto',          bio:'Cientista político venezuelano. Doutor em Políticas Públicas pela UFRJ. Presidente da Associação Venezuela Global.',                        estado:'RJ',area:'Política',      instagram:'wclavijo90',        foto_url:'/fellows/william-clavijo.png',   created_at:'' },
  { id:19, nome:'Yuri Quadros',                      bio:'Articulista e cofundador do Instituto Aliança dos Inconfidentes. Defende visão liberal-conservadora.',                                       estado:'MG',area:'Política',      instagram:'oyuriquadros',      foto_url:'/fellows/yuri-quadros.png',      created_at:'' },
  { id:20, nome:'Zizi Martins',                      bio:'Advogada pública, consultora e comentarista política. Pós-doutora em política, comportamento e mídia.',                                     estado:'DF',area:'Direito',       instagram:'zizimartinsoficial',foto_url:'/fellows/zizi-martins.png',      created_at:'' },
]

const CSS = `
  .ef-filter { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 16px; align-items: end; padding: 28px 32px; background: rgba(10,10,10,0.95); border-radius: 12px; }
  .ef-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
  @media (max-width: 768px) {
    .ef-filter { grid-template-columns: 1fr; padding: 20px; }
    .ef-grid { grid-template-columns: 1fr; }
  }
  @media (min-width: 500px) and (max-width: 768px) {
    .ef-grid { grid-template-columns: 1fr 1fr; }
  }
`

export default function EncontreUmFellow() {
  const [fellows, setFellows] = useState<Fellow[]>(FELLOWS_DEMO)
  const [busca, setBusca] = useState('')
  const [estado, setEstado] = useState('Todos os estados')
  const [especialidade, setEspecialidade] = useState('Todas as especialidades')
  const [selected, setSelected] = useState<Fellow | null>(null)
  const [visibleCount, setVisibleCount] = useState(6)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('fellows').select('*').order('nome')
      if (data && data.length > 0) setFellows(data)
    }
    load()
  }, [])

  useEffect(() => { setVisibleCount(6) }, [busca, estado, especialidade])

  const filtrados = fellows.filter(f => {
    const uf = estado.split(' — ')[0]
    const matchEstado = estado === 'Todos os estados' || f.estado === uf
    const matchEspec = especialidade === 'Todas as especialidades' || f.area === especialidade
    const matchBusca = busca === '' || f.nome.toLowerCase().includes(busca.toLowerCase()) || f.bio.toLowerCase().includes(busca.toLowerCase())
    return matchEstado && matchEspec && matchBusca
  })

  const cor = (area: string) => AREA_COLORS[area] || AREA_COLORS['Comunicação']

  const selectStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, color: '#fff', fontSize: 14, padding: '12px 16px',
    outline: 'none', cursor: 'pointer', appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237ED321' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 40, width: '100%',
  }

  return (
    <section id="fellows" style={{ padding: '80px 0', background: '#0a0a0a' }}>
      <style>{CSS}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>

        <div style={{ marginBottom: 48 }}>
          <span style={{ color: 'var(--verde)', fontSize: 12, letterSpacing: 2, fontWeight: 500 }}>PARA A IMPRENSA</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 7vw, 80px)', color: '#fff', lineHeight: 0.95, marginTop: 12 }}>
            ENCONTRE UM<br />FELLOW
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, marginTop: 16, maxWidth: 560, lineHeight: 1.6 }}>
            Conecte veículos de comunicação com especialistas preparados para o debate público.
          </p>
        </div>

        <AnimatedBorder animationMode="auto-rotate" animationSpeed={6} borderRadius={12} borderWidth={1.5} style={{ '--ab-speed': '6s', marginBottom: 40 } as React.CSSProperties}>
          <div className="ef-filter">
            <div>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, display: 'block', marginBottom: 8 }}>ESPECIALIDADE</label>
              <select value={especialidade} onChange={e => setEspecialidade(e.target.value)} style={selectStyle}>
                {ESPECIALIDADES.map(e => <option key={e} value={e} style={{ background: '#111' }}>{e}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, display: 'block', marginBottom: 8 }}>ESTADO</label>
              <select value={estado} onChange={e => setEstado(e.target.value)} style={selectStyle}>
                {ESTADOS_LISTA.map(e => <option key={e} value={e} style={{ background: '#111' }}>{e}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, display: 'block', marginBottom: 8 }}>BUSCA LIVRE</label>
              <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Nome ou palavra-chave..."
                style={{ ...selectStyle, backgroundImage: 'none', paddingRight: 16 }} />
            </div>
            <button onClick={() => { setBusca(''); setEstado('Todos os estados'); setEspecialidade('Todas as especialidades') }}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(255,255,255,0.4)', fontSize: 13, padding: '12px 20px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', width: '100%' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--verde)'; e.currentTarget.style.color = 'var(--verde)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}>
              Limpar filtros
            </button>
          </div>
        </AnimatedBorder>

        <div style={{ marginBottom: 24 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
            {filtrados.length} fellow{filtrados.length !== 1 ? 's' : ''} encontrado{filtrados.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="ef-grid">
          {filtrados.slice(0, visibleCount).map(f => (
            <AnimatedBorder key={f.id} animationMode="rotate-on-hover" animationSpeed={3} borderRadius={12} borderWidth={1.5} style={{ '--ab-speed': '3s' } as React.CSSProperties}>
              <div style={{ background: '#0d0d0d', borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setSelected(f)}>
                <div style={{ position: 'relative', height: 200, background: 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
                  {f.foto_url
                    ? <Image src={f.foto_url} alt={f.nome} fill style={{ objectFit: 'cover', objectPosition: 'center top' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: 'var(--verde)', fontFamily: 'var(--font-display)' }}>{f.nome.split(' ').slice(0,2).map(n=>n[0]).join('')}</div>
                  }
                  <div style={{ position: 'absolute', bottom: 12, left: 12, background: cor(f.area).bg, border: `1px solid ${cor(f.area).border}`, backdropFilter: 'blur(8px)', borderRadius: 100, padding: '4px 12px', fontSize: 11, color: cor(f.area).text, fontWeight: 500 }}>{f.area}</div>
                </div>
                <div style={{ padding: '20px 20px 16px' }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: '#fff', marginBottom: 4, lineHeight: 1.3 }}>{f.nome}</div>
                  <div style={{ fontSize: 12, color: 'var(--verde)', marginBottom: 12 }}>{ESTADOS_NOME[f.estado] || f.estado}</div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 16 }}>{f.bio.length > 110 ? f.bio.slice(0,110)+'...' : f.bio}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={`https://instagram.com/${f.instagram}`} target="_blank" rel="noopener" onClick={e => e.stopPropagation()}
                      style={{ flex: 1, textAlign: 'center', padding: '8px', background: 'var(--verde)', color: '#000', borderRadius: 6, fontSize: 12, fontWeight: 500, textDecoration: 'none' }}>Contatar</a>
                    <button onClick={e => { e.stopPropagation(); setSelected(f) }}
                      style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, fontSize: 12, color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>Ver perfil</button>
                  </div>
                </div>
              </div>
            </AnimatedBorder>
          ))}
        </div>

        {visibleCount < filtrados.length && (
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button onClick={() => setVisibleCount(v => v + 6)}
              style={{ background: 'transparent', border: '1.5px solid var(--verde)', color: 'var(--verde)', borderRadius: 6, padding: '12px 40px', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(126,211,33,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
              Ver mais {Math.min(6, filtrados.length - visibleCount)} fellows →
            </button>
          </div>
        )}

        {filtrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.25)', fontSize: 15 }}>
            Nenhum fellow encontrado.
            <br />
            <button onClick={() => { setBusca(''); setEstado('Todos os estados'); setEspecialidade('Todas as especialidades') }}
              style={{ marginTop: 16, background: 'none', border: 'none', color: 'var(--verde)', cursor: 'pointer', fontSize: 13 }}>
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', backdropFilter: 'blur(12px)' }}>
          <AnimatedBorder animationMode="auto-rotate" animationSpeed={4} borderRadius={16} borderWidth={1.5} style={{ '--ab-speed': '4s', maxWidth: 580, width: '100%' } as React.CSSProperties}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#111', borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: 200, position: 'relative', background: '#0a0a0a' }}>
                {selected.foto_url && <Image src={selected.foto_url} alt={selected.nome} fill style={{ objectFit: 'cover', objectPosition: 'center top', opacity: 0.8 }} />}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, #111 100%)' }} />
                <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', color: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
              <div style={{ padding: '0 28px 28px' }}>
                <h3 style={{ fontSize: 20, fontWeight: 500, color: '#fff', marginBottom: 4 }}>{selected.nome}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: 'var(--verde)' }}>{ESTADOS_NOME[selected.estado] || selected.estado}</span>
                  <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 100, background: cor(selected.area).bg, color: cor(selected.area).text, border: `1px solid ${cor(selected.area).border}` }}>{selected.area}</span>
                </div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: 24 }}>{selected.bio}</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <a href={`https://instagram.com/${selected.instagram}`} target="_blank" rel="noopener"
                    style={{ flex: 1, minWidth: 140, textAlign: 'center', padding: '11px', background: 'var(--verde)', color: '#000', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>Contatar via Instagram ↗</a>
                  <a href={`mailto:anne@institutoamplifica.com?subject=Interesse em entrevistar ${selected.nome}`}
                    style={{ flex: 1, minWidth: 140, textAlign: 'center', padding: '11px', background: 'transparent', color: '#fff', borderRadius: 8, fontSize: 13, border: '1px solid rgba(255,255,255,0.15)', textDecoration: 'none' }}>Solicitar via Amplifica</a>
                </div>
              </div>
            </div>
          </AnimatedBorder>
        </div>
      )}
    </section>
  )
}
