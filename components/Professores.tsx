'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, ArrowUpRight, GraduationCap, Instagram, Link2 } from 'lucide-react'
import AnimatedBorder from '@/components/AnimatedBorder'

type Professor = {
  nome: string
  cargo: string
  bio: string
  link?: string
  foto?: string
  canal?: 'instagram' | 'site'
}

const PROFESSORES: Professor[] = [
  {
    nome: 'Carlo Cauti',
    cargo: 'Jornalista e professor do IBMEC',
    bio: 'Carlo Cauti é jornalista ítalo-brasileiro e professor do IBMEC. Comenta economia e política na Revista Oeste e na BM&C News.',
    link: 'https://www.instagram.com/carlo_cauti/',
    foto: '/equipe/carlo-cauti.png',
    canal: 'instagram',
  },
  {
    nome: 'Duda Teixeira',
    cargo: 'Jornalista, escritor e editor da Revista Crusoé',
    bio: 'Autor de livros como O Livro Vermelho de Lula e STF: Como Chegamos até Aqui, escreve sobre política nacional com foco em instituições e nos bastidores do poder.',
    link: 'https://www.instagram.com/duda_teixeira_du/',
    foto: '/DUDA_TEIXEIRA.png',
    canal: 'instagram',
  },
  {
    nome: 'Felipe d’Avila',
    cargo: 'Cientista político, escritor e comentarista',
    bio: 'Presidente do CLP - Centro de Liderança Pública, participa de análises em veículos como CNN Brasil e GloboNews.',
    link: 'https://www.instagram.com/felipedavilaoficial/',
    foto: '/FELIPE-DAVILA.png',
    canal: 'instagram',
  },
  {
    nome: 'Fernando David',
    cargo: 'Jornalista e Head de Audiovisual do Lance!',
    bio: 'Jornalista com mais de 18 anos de experiência em TV aberta e produção audiovisual, com passagens pela TV Globo e Band. Atualmente, é Head de Audiovisual do Lance!.',
    link: 'https://www.instagram.com/fernandodavid/',
    foto: '/FERNANDO-DAVID.png',
    canal: 'instagram',
  },
  {
    nome: 'Guilherme Cunha Pereira',
    cargo: 'Jornalista, empresário e presidente da Gazeta do Povo',
    bio: 'Atua na defesa da liberdade de expressão e do jornalismo independente.',
    foto: '/GUILHERME-CPEREIRA.png',
  },
  {
    nome: 'Guilherme Waltenberg',
    cargo: 'Jornalista e editor sênior no Poder360',
    bio: 'Tem experiência em política e economia. Atuou como repórter no Correio Braziliense e na Agência Estado, e como editor de Política no Metrópoles.',
    link: 'https://www.poder360.com.br/author/guilherme-waltenberg/?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnTCiUDWikdKzEetFNJvFaUiZMn_DtkegBRU-1uufHH0hn5FMq7NwhyfmoQdI_aem_gFtmBQ3oxEwWM_FJNrJwPQ',
    foto: '/Guilherme-Waltenberg.png',
    canal: 'site',
  },
  {
    nome: 'Lucas Studart',
    cargo: 'Professor de oratória, retórica e comunicação',
    bio: 'Com formação pela University of Minnesota, atua no ensino de speech e linguagem aplicada à comunicação pública.',
    link: 'https://www.instagram.com/lucasstudartoficial/',
    foto: '/LUCAS-STUDART.png',
    canal: 'instagram',
  },
  {
    nome: 'Sara Ganime',
    cargo: 'Jornalista e editora-chefe do Boletim da Liberdade',
    bio: 'É colunista do Pleno.News, presidente do IFL Rio de Janeiro e Head de Comunicação do Amplifica.',
    link: 'https://www.instagram.com/saraganime/',
    foto: '/equipe/sara-ganime.png',
    canal: 'instagram',
  },
]

function getInitials(nome: string) {
  return nome
    .split(' ')
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()
}

function ProfessorAvatar({ nome, foto }: { nome: string; foto?: string }) {
  const [imageFailed, setImageFailed] = useState(false)

  if (!foto || imageFailed) {
    return (
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          border: '1px solid rgba(126,211,33,0.22)',
          background: 'linear-gradient(135deg, rgba(126,211,33,0.24), rgba(126,211,33,0.06))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--verde)',
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          letterSpacing: 1,
          flexShrink: 0,
        }}
      >
        {getInitials(nome)}
      </div>
    )
  }

  return (
    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        overflow: 'hidden',
        border: '1px solid rgba(126,211,33,0.22)',
        flexShrink: 0,
      }}
    >
      <Image
        src={foto}
        alt={nome}
        width={72}
        height={72}
        onError={() => setImageFailed(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  )
}

export default function Professores() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isPausedRef = useRef(false)
  const professoresLoop = [...PROFESSORES, ...PROFESSORES]

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    let frameId = 0

    const animate = () => {
      const halfWidth = container.scrollWidth / 2

      if (!isPausedRef.current) {
        container.scrollLeft += 0.45
      }

      if (container.scrollLeft >= halfWidth) {
        container.scrollLeft -= halfWidth
      }

      frameId = window.requestAnimationFrame(animate)
    }

    frameId = window.requestAnimationFrame(animate)

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [])

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current
    if (!container) return

    container.scrollBy({
      left: direction === 'left' ? -340 : 340,
      behavior: 'smooth',
    })
  }

  return (
    <section id="professores" style={{ padding: '100px 0', background: '#0a0a0a' }}>
      <style>{`
        .professores-track::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
          <div style={{ maxWidth: 720 }}>
            <span style={{ color: 'var(--verde)', fontSize: 12, letterSpacing: 2, fontWeight: 500 }}>PRIMEIRA TURMA</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 7vw, 80px)', color: '#fff', lineHeight: 0.95, marginTop: 12 }}>
              PROFESSORES
            </h2>
            <p style={{ marginTop: 18, fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.52)', maxWidth: 640 }}>
              Jornalistas, professores, escritores e comentaristas que ajudaram a construir a formação da primeira turma do Amplifica.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.55)', fontSize: 13, maxWidth: 320 }}>
            <GraduationCap size={18} color="var(--verde)" />
            <p style={{ lineHeight: 1.6 }}>
              Uma curadoria de nomes com experiência prática em comunicação, política, mídia e debate público.
            </p>
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            borderRadius: 20,
            padding: '22px 0 0',
            background: 'radial-gradient(circle at top left, rgba(126,211,33,0.12), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
            border: '1px solid rgba(126,211,33,0.12)',
          }}
        >
          <div
            ref={scrollRef}
            className="professores-track"
            onMouseEnter={() => {
              isPausedRef.current = true
            }}
            onMouseLeave={() => {
              isPausedRef.current = false
            }}
            onTouchStart={() => {
              isPausedRef.current = true
            }}
            onTouchEnd={() => {
              isPausedRef.current = false
            }}
            style={{
              display: 'flex',
              gap: 16,
              overflowX: 'auto',
              scrollSnapType: 'x proximity',
              padding: '0 20px 20px',
              scrollbarWidth: 'none',
            }}
          >
            {professoresLoop.map((professor, index) => {
              const Icon = professor.canal === 'site' ? Link2 : Instagram

              return (
                <div key={`${professor.nome}-${index}`} style={{ minWidth: 320, maxWidth: 320, scrollSnapAlign: 'start', flex: '0 0 320px' }}>
                  <AnimatedBorder animationMode="rotate-on-hover" animationSpeed={5} style={{ '--ab-speed': '5s' } as CSSProperties} borderRadius={16} borderWidth={1.5}>
                    <div
                      style={{
                        minHeight: 370,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 18,
                        background: 'linear-gradient(180deg, rgba(13,13,13,0.98), rgba(10,10,10,0.96))',
                        borderRadius: 16,
                        padding: 24,
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <ProfessorAvatar nome={professor.nome} foto={professor.foto} />
                            <div>
                              <div style={{ color: '#fff', fontSize: 22, fontWeight: 500, lineHeight: 1.1, maxWidth: 160 }}>
                                {professor.nome}
                              </div>
                            </div>
                          </div>

                          {professor.link ? <ArrowUpRight size={18} color="var(--verde)" /> : null}
                        </div>

                        <div style={{ color: 'var(--verde)', fontSize: 12, letterSpacing: 1.2, marginBottom: 14 }}>
                          {professor.cargo}
                        </div>

                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.56)', lineHeight: 1.75 }}>
                          {professor.bio}
                        </p>
                      </div>

                      <div style={{ paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        {professor.link ? (
                          <a
                            href={professor.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--verde)', fontSize: 12, letterSpacing: 1.1, textDecoration: 'none' }}
                          >
                            <Icon size={14} />
                            <span>{professor.canal === 'site' ? 'Abrir perfil' : 'Ver perfil'}</span>
                          </a>
                        ) : (
                          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, letterSpacing: 1.1 }}>
                            Perfil externo não informado
                          </div>
                        )}
                      </div>
                    </div>
                  </AnimatedBorder>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '0 20px 20px' }}>
            <button
              type="button"
              onClick={() => handleScroll('left')}
              style={{
                width: 42,
                height: 42,
                borderRadius: '999px',
                border: '1px solid rgba(126,211,33,0.2)',
                background: 'rgba(126,211,33,0.08)',
                color: 'var(--verde)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => handleScroll('right')}
              style={{
                width: 42,
                height: 42,
                borderRadius: '999px',
                border: '1px solid rgba(126,211,33,0.2)',
                background: 'rgba(126,211,33,0.08)',
                color: 'var(--verde)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
