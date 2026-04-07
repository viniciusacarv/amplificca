'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase, Fellow } from '@/lib/supabase'

const AREAS = ['Todos', 'Direito', 'Economia', 'Educação', 'Tecnologia', 'Política', 'Comunicação', 'Gestão Pública']

const ESTADOS: Record<string, string> = {
  'AC': 'Acre', 'AL': 'Alagoas', 'AM': 'Amazonas', 'BA': 'Bahia', 'CE': 'Ceará',
  'DF': 'Distrito Federal', 'ES': 'Espírito Santo', 'GO': 'Goiás', 'MA': 'Maranhão',
  'MG': 'Minas Gerais', 'MS': 'Mato Grosso do Sul', 'MT': 'Mato Grosso', 'PA': 'Pará',
  'PB': 'Paraíba', 'PE': 'Pernambuco', 'PI': 'Piauí', 'PR': 'Paraná', 'RJ': 'Rio de Janeiro',
  'RN': 'Rio Grande do Norte', 'RO': 'Rondônia', 'RR': 'Roraima', 'RS': 'Rio Grande do Sul',
  'SC': 'Santa Catarina', 'SE': 'Sergipe', 'SP': 'São Paulo', 'TO': 'Tocantins'
}

const FELLOWS_DEMO: Fellow[] = [
  { id: 1, nome: 'Amanda Caixeta', bio: 'Jornalista por formação, chefe geral de comunicação e imprensa do deputado federal Gustavo Gayer.', estado: 'GO', area: 'Comunicação', instagram: 'amandacaixeeta', foto_url: '/fellows/amanda-caixeta.png', created_at: '' },
  { id: 2, nome: 'Ana Carolina Beltrão Peixoto', bio: 'Administradora, Assistente Social e Pedagoga. Doutora em Serviço Social e Mestre em Meio Ambiente. Gestora Pública e Professora Universitária.', estado: 'MG', area: 'Educação', instagram: 'acarolprofessora', foto_url: '/fellows/ana-carolina.png', created_at: '' },
  { id: 3, nome: 'Barbara Abras', bio: 'Bacharel em Administração com experiência em gestão pública, gestão de pessoas e advocacy. Focada em políticas de desenvolvimento social.', estado: 'MG', area: 'Gestão Pública', instagram: 'barbara.abras', foto_url: '/fellows/barbara-abras.png', created_at: '' },
  { id: 4, nome: 'Bruno Sperancetta', bio: 'Presidente do movimento estudantil JL (Juventude Livre). Estudante de Direito na PUCPR. Voluntário SFLB e Líder Livres.', estado: 'PR', area: 'Direito', instagram: 'bruno_sperancetta', foto_url: '/fellows/bruno-sperancetta.png', created_at: '' },
  { id: 5, nome: 'Davi de Souza', bio: 'Assessor Parlamentar na Câmara dos Deputados. Pesquisador em Ciência Política pela UnB. Foco em transparência e combate à corrupção.', estado: 'DF', area: 'Política', instagram: 'davidesouzabh', foto_url: '/fellows/davi-souza.png', created_at: '' },
  { id: 6, nome: 'Eduardo Inojosa', bio: 'Advogado e mestre em economia pelo Insper. Suplente de vereador no Recife. Defende políticas públicas baseadas em dados e evidências.', estado: 'PE', area: 'Economia', instagram: 'eduardoinojosaa', foto_url: '/fellows/eduardo-inojosa.png', created_at: '' },
  { id: 7, nome: 'Gabriela Martins Nunes', bio: 'Project Leader no Mercado Livre. Mestre em Pesquisa Operacional pelo ITA. Influenciadora no ramo de carreira e sociedade.', estado: 'SP', area: 'Tecnologia', instagram: 'gabrielamartinsn', foto_url: '/fellows/gabriela-martins.png', created_at: '' },
  { id: 8, nome: 'Germano Laube', bio: 'Especialista em Mercado Financeiro, Consultor de Investimentos e sócio cofundador da LDC Capital.', estado: 'RS', area: 'Economia', instagram: 'germano_laube', foto_url: '/fellows/germano-laube.png', created_at: '' },
  { id: 9, nome: 'Ivanildo Francisco dos Santos Terceiro', bio: 'Diretor Global de Marketing da Students For Liberty. Coordena campanhas que alcançam milhões de pessoas por semana.', estado: 'BA', area: 'Comunicação', instagram: 'ivanildoiii', foto_url: '/fellows/ivanildo-terceiro.png', created_at: '' },
  { id: 10, nome: 'Jeferson Scheibler', bio: 'Acadêmico de Engenharia de Software, embaixador da ICSC e Local Lead do NASA Space Apps.', estado: 'RS', area: 'Tecnologia', instagram: 'jeferson_scheibler', foto_url: '/fellows/jeferson-scheibler.png', created_at: '' },
  { id: 11, nome: 'Julia de Castro', bio: 'Formada em História pela UFRJ. Vice-presidente da ala jovem do Partido Liberal.', estado: 'RJ', area: 'Política', instagram: 'juliadecastrobr', foto_url: '/fellows/julia-castro.png', created_at: '' },
  { id: 12, nome: 'Letícia Barros', bio: 'Advogada e empreendedora em comunicação política. Gerente de comunicação global do LOLA.', estado: 'RJ', area: 'Comunicação', instagram: 'leticiabbarros', foto_url: '/fellows/leticia-barros.png', created_at: '' },
  { id: 13, nome: 'Marcos Paulo Candeloro', bio: 'Graduado em História (USP), pós-graduado em Ciências Políticas (Columbia University). Professor, jornalista e analista político.', estado: 'SP', area: 'Política', instagram: 'mpcanderolo', foto_url: '/fellows/marcos-paulo.png', created_at: '' },
  { id: 14, nome: 'Nathalia Welker', bio: 'Responsável pela comunicação do Partido NOVO no RS. Embaixadora do Students For Liberty Brasil.', estado: 'RS', area: 'Comunicação', instagram: 'nathaliawelker', foto_url: '/fellows/nathalia-welker.png', created_at: '' },
  { id: 15, nome: 'Pedro Ferreira da Silva Neto', bio: 'Engenheiro civil, gestor público e analista político. Atua nas redes com foco em segurança pública e liberdade econômica.', estado: 'RJ', area: 'Política', instagram: 'pedronetorio', foto_url: '/fellows/pedro-neto.png', created_at: '' },
  { id: 16, nome: 'Ronan Matos', bio: 'Escritor, jornalista, editor-chefe do Diário do Acre e Embaixador Estadual do Students For Liberty Brasil.', estado: 'AC', area: 'Comunicação', instagram: 'ronanmatosac', foto_url: '/fellows/ronan-matos.png', created_at: '' },
  { id: 17, nome: 'Wesley Reis', bio: 'Economista e diretor do IFL Rio de Janeiro. Colunista do Instituto Millenium sobre desburocratização e liderança.', estado: 'RJ', area: 'Economia', instagram: 'wesley.areis', foto_url: '/fellows/wesley-reis.png', created_at: '' },
  { id: 18, nome: 'William A. Clavijo Vitto', bio: 'Cientista político venezuelano. Mestre e doutor em Políticas Públicas pela UFRJ. Presidente da Associação Venezuela Global.', estado: 'RJ', area: 'Política', instagram: 'wclavijo90', foto_url: '/fellows/william-clavijo.png', created_at: '' },
  { id: 19, nome: 'Yuri Quadros', bio: 'Articulista e cofundador do Instituto Aliança dos Inconfidentes. Defende visão liberal-conservadora com foco em federalismo.', estado: 'MG', area: 'Política', instagram: 'oyuriquadros', foto_url: '/fellows/yuri-quadros.png', created_at: '' },
  { id: 20, nome: 'Zizi Martins', bio: 'Advogada pública, consultora e comentarista política. Pós-doutora em política, comportamento e mídia.', estado: 'DF', area: 'Direito', instagram: 'zizimartinsoficial', foto_url: '/fellows/zizi-martins.png', created_at: '' },
]

const AREA_COLORS: Record<string, string> = {
  'Direito': '#3B82F6', 'Economia': '#F59E0B', 'Educação': '#8B5CF6',
  'Tecnologia': '#06B6D4', 'Política': '#EF4444', 'Comunicação': '#7ED321', 'Gestão Pública': '#F97316',
}

function getInitials(nome: string) {
  return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function toSlug(nome: string) {
  return nome.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

export default function Fellows() {
  const [fellows, setFellows] = useState<Fellow[]>(FELLOWS_DEMO)
  const [filtro, setFiltro] = useState('Todos')
  const [selected, setSelected] = useState<Fellow | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('fellows').select('*').order('nome')
      if (data && data.length > 0) setFellows(data)
    }
    load()
  }, [])

  const filtrados = filtro === 'Todos' ? fellows : fellows.filter(f => f.area === filtro)

  return (
    <section id="fellows" style={{ padding: '100px 0', background: '#0d0d0d' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ marginBottom: 60 }}>
          <span style={{ color: 'var(--verde)', fontSize: 12, letterSpacing: 2, fontWeight: 500 }}>1ª TURMA</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 7vw, 80px)', color: '#fff', lineHeight: 0.95, marginTop: 12 }}>OS FELLOWS</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, marginTop: 16, maxWidth: 480, lineHeight: 1.6 }}>
            Jovens lideranças de todo o Brasil, treinadas para influenciar o debate público com ética e clareza.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 48 }}>
          {AREAS.map(a => (
            <button key={a} onClick={() => setFiltro(a)} style={{ padding: '6px 16px', borderRadius: 100, fontSize: 12, fontWeight: 400, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 0.5, background: filtro === a ? 'var(--verde)' : 'rgba(255,255,255,0.05)', color: filtro === a ? '#000' : 'rgba(255,255,255,0.5)', border: filtro === a ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>{a}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 2 }}>
          {filtrados.map(f => (
            <div key={f.id} onClick={() => setSelected(f)} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '28px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(126,211,33,0.05)'; e.currentTarget.style.borderColor = 'rgba(126,211,33,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                {f.foto_url ? (
                  <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(126,211,33,0.3)' }}>
                    <Image src={f.foto_url} alt={f.nome} width={52} height={52} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(126,211,33,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 500, color: 'var(--verde)', flexShrink: 0 }}>
                    {getInitials(f.nome)}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#fff', lineHeight: 1.3 }}>{f.nome}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{ESTADOS[f.estado] || f.estado}</div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 16 }}>
                {f.bio.length > 100 ? f.bio.slice(0, 100) + '...' : f.bio}
              </p>
              <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 100, background: `${AREA_COLORS[f.area] || '#7ED321'}18`, color: AREA_COLORS[f.area] || '#7ED321', border: `1px solid ${AREA_COLORS[f.area] || '#7ED321'}30` }}>{f.area}</span>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(8px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111', border: '1px solid rgba(126,211,33,0.2)', borderRadius: 12, maxWidth: 540, width: '100%', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'relative', width: '100%', height: 240 }}>
              {selected.foto_url ? (
                <Image src={selected.foto_url} alt={selected.nome} fill style={{ objectFit: 'cover', objectPosition: 'center top' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'rgba(126,211,33,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: 'var(--verde)', fontWeight: 500 }}>
                  {getInitials(selected.nome)}
                </div>
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 25%, rgba(17,17,17,0.92) 100%)' }} />
              <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', fontSize: 18, lineHeight: 1, width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>×</button>
              <div style={{ position: 'absolute', bottom: 20, left: 24 }}>
                <h3 style={{ fontSize: 22, fontWeight: 600, color: '#fff', margin: 0, lineHeight: 1.2 }}>{selected.nome}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--verde)' }}>{ESTADOS[selected.estado] || selected.estado}</span>
                  <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 100, background: `${AREA_COLORS[selected.area] || '#7ED321'}25`, color: AREA_COLORS[selected.area] || '#7ED321', border: `1px solid ${AREA_COLORS[selected.area] || '#7ED321'}50` }}>{selected.area}</span>
                </div>
              </div>
            </div>
            <div style={{ padding: '20px 24px 28px' }}>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, margin: 0 }}>{selected.bio}</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
                  {selected.instagram && (
                    <a href={`https://instagram.com/${selected.instagram}`} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--verde)', color: '#000', padding: '10px 20px', borderRadius: 6, fontSize: 13, fontWeight: 500, textDecoration: 'none', cursor: 'pointer' }}>
                      Contatar via Instagram ↗
                    </a>
                  )}
                  <a href={`/${selected.slug || toSlug(selected.nome)}`}
                    onClick={e => e.stopPropagation()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 20px', borderRadius: 6, fontSize: 13, fontWeight: 500, textDecoration: 'none', cursor: 'pointer' }}>
                    Ver perfil completo →
                  </a>
                </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
