'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'Fellows', href: '#fellows' },
    { label: 'Artigos', href: '#artigos' },
    { label: 'Missão', href: '#missao' },
    { label: 'Sobre', href: '#sobre' },
  ]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      transition: 'all 0.3s ease',
      background: scrolled ? 'rgba(10,10,10,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(126,211,33,0.15)' : 'none',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 2rem',
        height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>

        <a href="#" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <Image src="/logo.svg" alt="Amplifica!" width={180} height={44} style={{ height: 44, width: 'auto' }} priority />
        </a>

        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {links.map(l => (
            <a key={l.label} href={l.href} style={{
              color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
              fontSize: 14, fontWeight: 400, letterSpacing: 0.5,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--verde)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            >{l.label}</a>
          ))}

          {/* Separador */}
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)' }} />

          {/* Torne-se financiador */}
          <a
            href="https://wa.me/5541999911224?text=Olá, conheci o Instituto Amplifica e gostaria de me tornar um investidor do projeto!"
            target="_blank" rel="noopener"
            style={{
              background: 'transparent',
              color: 'var(--verde)',
              padding: '8px 18px',
              borderRadius: 4,
              fontSize: 13,
              fontWeight: 500,
              textDecoration: 'none',
              border: '1.5px solid var(--verde)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(126,211,33,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            Torne-se financiador
          </a>

          {/* Inscreva-se */}
          <a
            href="#inscricao"
            style={{
              background: 'var(--verde)',
              color: '#000',
              padding: '8px 20px',
              borderRadius: 4,
              fontSize: 13,
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'opacity 0.2s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Inscreva-se
          </a>
        </div>
      </div>
    </nav>
  )
}
