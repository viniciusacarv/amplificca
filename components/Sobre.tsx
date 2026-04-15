'use client'

import { useState, type CSSProperties } from 'react'
import Image from 'next/image'
import { ArrowUpRight, Globe2, Handshake, Sparkles } from 'lucide-react'
import AnimatedBorder from '@/components/AnimatedBorder'

const EQUIPE = [
  {
    nome: 'Anne Dias',
    cargo: 'Presidente',
    desc: 'Advogada, mestranda em Ciência Política pela UFPR e comunicadora. Atua como comentarista política na Gazeta do Povo. Selecionada como contributor da rede Young Voices 2026, experiência que inspirou a criação do Amplifica.',
    instagram: 'sigaannedias',
    foto: '/equipe/anne-dias.png',
  },
  {
    nome: 'Vinícius Antunes',
    cargo: 'COO',
    desc: 'Advogado, ex-Gerente de tributos em Big4 e especialista em estratégia tributária e transparência fiscal. Atuou como Chefe de Gabinete na Câmara Municipal de Curitiba e hoje é empreendedor, desenvolvendo projetos nas áreas jurídica, política e de negócios.',
    instagram: 'viniciusacarv',
    foto: '/equipe/vinicius-antunes.png',
  },
  {
    nome: 'Sara Ganime',
    cargo: 'Head de Comunicação',
    desc: 'Jornalista e editora-chefe do Boletim da Liberdade. Protagonizou o placar do Boletim que ajudou a barrar o "PL da Censura" em 2023. Colunista do Pleno.News e presidente do IFL Rio de Janeiro.',
    instagram: 'saraganime',
    foto: '/equipe/sara-ganime.png',
  },
  {
    nome: 'Sara Almeida',
    cargo: 'Social Media',
    desc: 'Uma das vozes ativas da comunicação no movimento liberal brasileiro. Com atuação na Juventude Livre, LOLA Brasil, no Partido NOVO e para outras organizações e figuras políticas, constrói estratégias de conteúdo que traduzem ideias de liberdade em narrativas acessíveis e de alto alcance.',
    instagram: 'saraeduardaalmeida',
    foto: '/equipe/SARA-ALMEIDA.png',
  },
]

const CONSELHO = [
  {
    nome: 'Mariana Braga',
    cargo: 'Jornalista - Gazeta do Povo',
    bio: 'Jornalista, atriz e psicanalista; criadora de conteúdo focada em comportamento, maternidade e reflexões pessoais.',
    instagram: 'ma.rianabraga',
    foto: '/equipe/mariana-braga.png',
  },
  {
    nome: 'Leandro Narloch',
    cargo: 'Jornalista e Escritor',
    bio: 'Jornalista e escritor brasileiro, conhecido por obras revisionistas e opiniões polêmicas sobre história e política.',
    instagram: 'lnarloch',
    foto: '/equipe/leandro-narloch.png',
  },
  {
    nome: 'Carlo Cauti',
    cargo: 'Jornalista - Revista Oeste',
    bio: 'Jornalista e comentarista político, com atuação em análise internacional, economia e temas geopolíticos.',
    instagram: 'carlo_cauti',
    foto: '/equipe/carlo-cauti.png',
  },
  {
    nome: 'Madeleine Lasko',
    cargo: 'Jornalista e Escritora - O Antagonista',
    bio: 'Jornalista, escritora e comentarista política; atua em mídia digital, com foco em política, comunicação e comportamento.',
    instagram: 'madeleinelacsko',
    foto: '/equipe/madeleine-lasko.png',
  },
]

const PARCEIROS = [
  {
    nome: 'LOLA',
    logo: '/LOLA-LOGO.png',
    url: 'https://ladiesofliberty.org/',
    site: 'ladiesofliberty.org',
    categoria: 'Rede internacional',
    desc: 'Comunidade voltada ao fortalecimento de lideranças femininas comprometidas com liberdade, educação e impacto cívico.',
  },
  {
    nome: 'Instituto Liberal',
    logo: '/IL-LOGO.png',
    url: 'https://www.institutoliberal.org.br/',
    site: 'institutoliberal.org.br',
    categoria: 'Think tank',
    desc: 'Instituição histórica do pensamento liberal brasileiro, com atuação em formação, publicações e debate público.',
  },
  {
    nome: 'Instituto Sivis',
    logo: '/SIVIS-LOGO.png',
    url: 'https://www.sivis.org.br/',
    site: 'sivis.org.br',
    categoria: 'Impacto cívico',
    desc: 'Organização focada em cidadania, cultura política e fortalecimento de lideranças para transformar a esfera pública.',
  },
  {
    nome: 'Instituto Liberal de São Paulo',
    logo: '/ILISP-LOGO.png',
    url: 'https://www.ilisp.org/',
    site: 'ilisp.org',
    categoria: 'Formação e debate',
    desc: 'Centro de articulação liberal em São Paulo, com conteúdo, eventos e diálogo permanente com a sociedade civil.',
  },
  {
    nome: 'SFL Brasil',
    logo: '/SFL-LOGO.png',
    url: 'https://studentsforliberty.org/brazil/',
    site: 'studentsforliberty.org/brazil',
    categoria: 'Juventude',
    desc: 'Rede estudantil internacional que desenvolve jovens lideranças em defesa da liberdade por meio de programas e comunidades.',
  },
  {
    nome: 'Boletim da Liberdade',
    logo: '/BOLETIM-LIBERDADE-LOGO.png',
    url: 'https://www.boletimdaliberdade.com.br/home-2/',
    site: 'boletimdaliberdade.com.br',
    categoria: 'Mídia e jornalismo',
    desc: 'Portal jornalístico dedicado à cobertura política, econômica e de liberdades civis, com foco em análises e notícias do ecossistema liberal.',
  },
  {
    nome: 'Brasil Paralelo',
    logo: '/BRASILPARALELO-LOGO.png',
    url: 'https://www.brasilparalelo.com.br/',
    site: 'brasilparalelo.com.br',
    categoria: 'Mídia e educação',
    desc: 'Plataforma de conteúdo e formação cultural com grande alcance, dedicada a narrativas, cursos e análises aprofundadas.',
  },
]

const rotatingBorderStyle: CSSProperties & Record<'--ab-speed', string> = {
  '--ab-speed': '4s',
}

const partnerBorderStyle: CSSProperties & Record<'--ab-speed', string> = {
  '--ab-speed': '5s',
}

function toSlug(nome: string) {
  return nome.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

function getPartnerInitials(name: string) {
  const parts = name.split(' ')
  if (parts.length === 1) return name.slice(0, 3).toUpperCase()
  return parts.slice(0, 3).map((part) => part[0]).join('').toUpperCase()
}

function PartnerLogo({ nome, logo }: { nome: string; logo?: string }) {
  const [imageFailed, setImageFailed] = useState(false)

  if (!logo || imageFailed) {
    return (
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: 'linear-gradient(135deg, rgba(126,211,33,0.2), rgba(126,211,33,0.05))',
        border: '1px solid rgba(126,211,33,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--verde)', fontFamily: 'var(--font-display)', fontSize: 24,
        letterSpacing: 1, flexShrink: 0,
      }}>
        {getPartnerInitials(nome)}
      </div>
    )
  }

  return (
    <div style={{
      width: 144, height: 64, borderRadius: 14,
      background: 'linear-gradient(135deg, rgba(126,211,33,0.12), rgba(126,211,33,0.03))',
      border: '1px solid rgba(126,211,33,0.18)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '10px 14px', flexShrink: 0,
    }}>
      <Image src={logo} alt={nome} width={140} height={52}
        onError={() => setImageFailed(true)}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  )
}

export default function Sobre() {
  return (
    <section id="sobre" style={{ padding: '100px 0', background: '#0d0d0d' }}>
      <style>{`
        .partners-card:hover {
          transform: translateY(-4px);
          transition: transform 0.25s ease;
        }
        .partner-top {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 22px;
        }
        .partner-category {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255,255,255,0.36);
          font-size: 12px;
          line-height: 1.4;
          max-width: 100%;
          text-align: left;
          flex-wrap: wrap;
        }
        .conselho-card {
          transition: all 0.2s ease;
        }
        .conselho-card:hover {
          transform: translateY(-2px);
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>

        {/* EQUIPE */}
        <span style={{ color: 'var(--verde)', fontSize: 12, letterSpacing: 2, fontWeight: 500 }}>QUEM SOMOS</span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 7vw, 80px)', color: '#fff', lineHeight: 0.95, marginTop: 12, marginBottom: 60 }}>
          A EQUIPE
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16, marginBottom: 80 }}>
          {EQUIPE.map((pessoa) => (
            <AnimatedBorder key={pessoa.nome} animationMode="rotate-on-hover" animationSpeed={4} style={rotatingBorderStyle} borderRadius={12} borderWidth={1.5}>
              <div style={{ background: '#0a0a0a', borderRadius: 12, padding: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(126,211,33,0.3)' }}>
                    <Image src={pessoa.foto} alt={pessoa.nome} width={64} height={64} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 500, color: '#fff' }}>{pessoa.nome}</div>
                    <div style={{ fontSize: 12, color: 'var(--verde)', marginTop: 2 }}>{pessoa.cargo}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{pessoa.desc}</p>
                <a href={`https://instagram.com/${pessoa.instagram}`} target="_blank" rel="noopener"
                  style={{ display: 'inline-block', marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
                  @{pessoa.instagram} {'->'}
                </a>
                <a href={`/equipe/${toSlug(pessoa.nome)}`} style={{ display: 'inline-block', marginTop: 8, fontSize: 12, color: 'var(--verde)', textDecoration: 'none' }}>
                  Ver perfil completo →
                </a>
              </div>
            </AnimatedBorder>
          ))}
        </div>

        {/* CONSELHO ESTRATÉGICO */}
        <div>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, letterSpacing: 2 }}>CONSELHO ESTRATÉGICO</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginTop: 20 }}>
            {CONSELHO.map((conselheiro) => (
              <AnimatedBorder key={conselheiro.nome} animationMode="rotate-on-hover" animationSpeed={4} style={rotatingBorderStyle} borderRadius={12} borderWidth={1.5}>
                <a
                  href={`https://instagram.com/${conselheiro.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="conselho-card"
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <div style={{ background: '#0a0a0a', borderRadius: 12, padding: '28px 24px' }}>

                    {/* Foto + nome + cargo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                      <div style={{ width: 60, height: 60, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(126,211,33,0.25)' }}>
                        <Image src={conselheiro.foto} alt={conselheiro.nome} width={60} height={60}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 500, color: '#fff', lineHeight: 1.3 }}>{conselheiro.nome}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{conselheiro.cargo}</div>
                      </div>
                      <ArrowUpRight size={15} color="rgba(126,211,33,0.5)" style={{ flexShrink: 0 }} />
                    </div>

                    {/* Bio */}
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, margin: 0 }}>
                      {conselheiro.bio}
                    </p>

                    {/* Instagram handle */}
                    <div style={{ marginTop: 14, fontSize: 11, color: 'var(--verde)', opacity: 0.7 }}>
                      @{conselheiro.instagram}
                    </div>

                  </div>
                </a>
              </AnimatedBorder>
            ))}
          </div>
        </div>

        {/* PARCEIROS */}
        <div id="parceiros" style={{ marginTop: 88 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 28 }}>
            <div style={{ maxWidth: 680 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, letterSpacing: 2 }}>PARCEIROS</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(38px, 5vw, 64px)', color: '#fff', lineHeight: 0.96, marginTop: 12 }}>
                Ecossistema que amplia a nossa voz
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.55)', fontSize: 13, maxWidth: 360 }}>
              <Handshake size={18} color="var(--verde)" />
              <p style={{ lineHeight: 1.6 }}>Organizações alinhadas à formação, liberdade, cultura cívica e impacto público.</p>
            </div>
          </div>

          <div style={{
            position: 'relative', borderRadius: 20, padding: '20px',
            background: 'radial-gradient(circle at top left, rgba(126,211,33,0.14), transparent 32%), linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
            border: '1px solid rgba(126,211,33,0.12)',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {PARCEIROS.map((parceiro) => (
                <div key={parceiro.nome} className="partners-card" style={{ position: 'relative' }}>
                  <AnimatedBorder animationMode="rotate-on-hover" animationSpeed={5} style={partnerBorderStyle} borderRadius={16} borderWidth={1.5}>
                    <a href={parceiro.url} target="_blank" rel="noopener noreferrer" style={{
                      minHeight: 260, display: 'flex', flexDirection: 'column',
                      justifyContent: 'space-between', gap: 18,
                      background: 'linear-gradient(180deg, rgba(13,13,13,0.98), rgba(10,10,10,0.96))',
                      borderRadius: 16, padding: 24, textDecoration: 'none',
                    }}>
                      <div>
                        <div className="partner-top">
                          <PartnerLogo nome={parceiro.nome} logo={parceiro.logo} />
                          <div className="partner-category">
                            <Globe2 size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                            <span>{parceiro.categoria}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
                          <div>
                            <div style={{ fontSize: 21, fontWeight: 500, color: '#fff', lineHeight: 1.15 }}>{parceiro.nome}</div>
                            <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.34)', fontSize: 12, letterSpacing: 1.4 }}>
                              {parceiro.site.toUpperCase()}
                            </div>
                          </div>
                          <ArrowUpRight size={18} color="var(--verde)" />
                        </div>
                        <p style={{ marginTop: 18, fontSize: 13, color: 'rgba(255,255,255,0.56)', lineHeight: 1.7 }}>{parceiro.desc}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--verde)', fontSize: 12, letterSpacing: 1.3 }}>
                          <Sparkles size={14} />
                          <span>Visitar parceiro</span>
                        </div>
                      </div>
                    </a>
                  </AnimatedBorder>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
