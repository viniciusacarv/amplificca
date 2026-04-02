'use client'

import type { CSSProperties } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import { ArrowUpRight, Globe2, Handshake, Sparkles } from 'lucide-react'
import AnimatedBorder from '@/components/AnimatedBorder'
import Floating, { FloatingElement } from '@/components/ui/parallax-floating'

const EQUIPE = [
  {
    nome: 'Anne Dias',
    cargo: 'Presidente',
    desc: 'Advogada, mestranda em Ciencia Politica pela UFPR e comunicadora. Atua como comentarista politica na Gazeta do Povo. Selecionada como contributor da rede Young Voices 2026, experiencia que inspirou a criacao do Amplifica.',
    instagram: 'annediasoficial',
    foto: '/equipe/anne-dias.png',
  },
  {
    nome: 'Sara Ganime',
    cargo: 'Head de Comunicacao',
    desc: 'Jornalista e editora-chefe do Boletim da Liberdade. Protagonizou o placar do Boletim que ajudou a barrar o "PL da Censura" em 2023. Colunista do Pleno.News e presidente do IFL Rio de Janeiro.',
    instagram: 'saraganime',
    foto: '/equipe/sara-ganime.png',
  },
]

const CONSELHO = [
  { nome: 'Mariana Braga', cargo: 'Jornalista - Gazeta do Povo', foto: '/equipe/mariana-braga.png' },
  { nome: 'Leandro Narloch', cargo: 'Jornalista e Escritor', foto: '/equipe/leandro-narloch.png' },
  { nome: 'Carlo Cauti', cargo: 'Jornalista - Revista Oeste', foto: '/equipe/carlo-cauti.png' },
  { nome: 'Madeleine Lasko', cargo: 'Jornalista e Escritora - O Antagonista', foto: '/equipe/madeleine-lasko.png' },
]

const PARCEIROS = [
  {
    nome: 'LOLA',
    url: 'https://ladiesofliberty.org/',
    site: 'ladiesofliberty.org',
    categoria: 'Rede internacional',
    desc: 'Comunidade voltada ao fortalecimento de liderancas femininas comprometidas com liberdade, educacao e impacto civico.',
  },
  {
    nome: 'Instituto Liberal',
    url: 'https://www.institutoliberal.org.br/',
    site: 'institutoliberal.org.br',
    categoria: 'Think tank',
    desc: 'Instituicao historica do pensamento liberal brasileiro, com atuacao em formacao, publicacoes e debate publico.',
  },
  {
    nome: 'Instituto Sivis',
    url: 'https://www.sivis.org.br/',
    site: 'sivis.org.br',
    categoria: 'Impacto civico',
    desc: 'Organizacao focada em cidadania, cultura politica e fortalecimento de liderancas para transformar a esfera publica.',
  },
  {
    nome: 'Instituto Liberal de Sao Paulo',
    url: 'https://www.ilisp.org/',
    site: 'ilisp.org',
    categoria: 'Formacao e debate',
    desc: 'Centro de articulacao liberal em Sao Paulo, com conteudo, eventos e dialogo permanente com a sociedade civil.',
  },
  {
    nome: 'SFL Brasil',
    url: 'https://studentsforliberty.org/brazil/',
    site: 'studentsforliberty.org/brazil',
    categoria: 'Juventude',
    desc: 'Rede estudantil internacional que desenvolve jovens liderancas em defesa da liberdade por meio de programas e comunidades.',
  },
  {
    nome: 'Brasil Paralelo',
    url: 'https://www.brasilparalelo.com.br/',
    site: 'brasilparalelo.com.br',
    categoria: 'Midia e educacao',
    desc: 'Plataforma de conteudo e formacao cultural com grande alcance, dedicada a narrativas, cursos e analises aprofundadas.',
  },
]

const FLOATING_BADGES = [
  { label: 'COLABORACAO', className: 'top-[10%] left-[3%]', depth: 0.7 },
  { label: 'LIBERDADE', className: 'top-[14%] right-[8%]', depth: 1.2 },
  { label: 'IMPACTO', className: 'bottom-[26%] left-[10%]', depth: 1.5 },
  { label: 'REDE', className: 'bottom-[12%] right-[14%]', depth: 0.9 },
]

const rotatingBorderStyle: CSSProperties & Record<'--ab-speed', string> = {
  '--ab-speed': '4s',
}

const partnerBorderStyle: CSSProperties & Record<'--ab-speed', string> = {
  '--ab-speed': '5s',
}

function getPartnerInitials(name: string) {
  const parts = name.split(' ')

  if (parts.length === 1) {
    return name.slice(0, 3).toUpperCase()
  }

  return parts
    .slice(0, 3)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export default function Sobre() {
  return (
    <section id="sobre" style={{ padding: '100px 0', background: '#0d0d0d' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>
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
                <a
                  href={`https://instagram.com/${pessoa.instagram}`}
                  target="_blank"
                  rel="noopener"
                  style={{ display: 'inline-block', marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}
                >
                  @{pessoa.instagram} {'->'}
                </a>
              </div>
            </AnimatedBorder>
          ))}
        </div>

        <div>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, letterSpacing: 2 }}>CONSELHO ESTRATEGICO</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginTop: 20 }}>
            {CONSELHO.map((conselheiro) => (
              <AnimatedBorder key={conselheiro.nome} animationMode="rotate-on-hover" animationSpeed={4} style={rotatingBorderStyle} borderRadius={10} borderWidth={1.5}>
                <div style={{ background: '#0a0a0a', borderRadius: 10, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(126,211,33,0.2)' }}>
                    <Image src={conselheiro.foto} alt={conselheiro.nome} width={48} height={48} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{conselheiro.nome}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{conselheiro.cargo}</div>
                  </div>
                </div>
              </AnimatedBorder>
            ))}
          </div>
        </div>

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
              <p style={{ lineHeight: 1.6 }}>
                Organizacoes alinhadas a formacao, liberdade, cultura civica e impacto publico.
              </p>
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 20,
              padding: '28px 0 0',
              background: 'radial-gradient(circle at top left, rgba(126,211,33,0.14), transparent 32%), linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
              border: '1px solid rgba(126,211,33,0.12)',
            }}
          >
            <Floating sensitivity={-0.35} easingFactor={0.035} className="pointer-events-none hidden md:block overflow-hidden">
              {FLOATING_BADGES.map((badge) => (
                <FloatingElement key={badge.label} depth={badge.depth} className={badge.className}>
                  <div
                    style={{
                      padding: '8px 14px',
                      borderRadius: 999,
                      border: '1px solid rgba(126,211,33,0.18)',
                      background: 'rgba(10,10,10,0.55)',
                      color: 'rgba(255,255,255,0.28)',
                      fontSize: 11,
                      letterSpacing: 2,
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    {badge.label}
                  </div>
                </FloatingElement>
              ))}
            </Floating>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 16,
                position: 'relative',
                zIndex: 1,
                padding: '0 20px 20px',
              }}
            >
              {PARCEIROS.map((parceiro, index) => (
                <motion.div
                  key={parceiro.nome}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                >
                  <AnimatedBorder animationMode="rotate-on-hover" animationSpeed={5} style={partnerBorderStyle} borderRadius={16} borderWidth={1.5}>
                    <a
                      href={parceiro.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        minHeight: 260,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 18,
                        background: 'linear-gradient(180deg, rgba(13,13,13,0.98), rgba(10,10,10,0.96))',
                        borderRadius: 16,
                        padding: 24,
                        textDecoration: 'none',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
                          <div
                            style={{
                              width: 56,
                              height: 56,
                              borderRadius: 14,
                              background: 'linear-gradient(135deg, rgba(126,211,33,0.2), rgba(126,211,33,0.05))',
                              border: '1px solid rgba(126,211,33,0.22)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--verde)',
                              fontFamily: 'var(--font-display)',
                              fontSize: 24,
                              letterSpacing: 1,
                            }}
                          >
                            {getPartnerInitials(parceiro.nome)}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.36)', fontSize: 12 }}>
                            <Globe2 size={14} />
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

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          paddingTop: 16,
                          borderTop: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--verde)', fontSize: 12, letterSpacing: 1.3 }}>
                          <Sparkles size={14} />
                          <span>Visitar parceiro</span>
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.24)', fontSize: 12 }}>0{index + 1}</span>
                      </div>
                    </a>
                  </AnimatedBorder>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
