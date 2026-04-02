'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

const links = [
  { label: 'Professores', href: '#professores' },
  { label: 'Fellows', href: '#fellows' },
  { label: 'Artigos', href: '#artigos' },
  { label: 'Missao', href: '#missao' },
  { label: 'Equipe', href: '#sobre' },
  { label: 'Parceiros', href: '#parceiros' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)

    window.addEventListener('scroll', onScroll)

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-desktop { display: flex !important; }
          .nav-hamburger { display: none !important; }
          .nav-mobile-menu { display: none !important; }
        }
      `}</style>

      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          transition: 'all 0.3s ease',
          background: scrolled || menuOpen ? 'rgba(10,10,10,0.97)' : 'transparent',
          backdropFilter: scrolled || menuOpen ? 'blur(12px)' : 'none',
          borderBottom: scrolled || menuOpen ? '1px solid rgba(126,211,33,0.15)' : 'none',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 1.5rem',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <a href="#" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image
              src="/logo-icon.png"
              alt="Amplifica"
              width={36}
              height={36}
              style={{ width: 36, height: 36, objectFit: 'contain' }}
              priority
            />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: '#fff', letterSpacing: 1, lineHeight: 1 }}>
              Amplifica<span style={{ color: 'var(--verde)' }}>!</span>
            </span>
          </a>

          <div className="nav-desktop" style={{ gap: 28, alignItems: 'center' }}>
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.color = 'var(--verde)'
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.color = 'rgba(255,255,255,0.7)'
                }}
              >
                {link.label}
              </a>
            ))}

            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)' }} />

            <a
              href="https://wa.me/5541999911224?text=Ola, conheci o Instituto Amplifica e gostaria de me tornar um investidor do projeto!"
              target="_blank"
              rel="noopener"
              style={{
                background: 'transparent',
                color: 'var(--verde)',
                padding: '7px 16px',
                borderRadius: 4,
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
                border: '1.5px solid var(--verde)',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = 'rgba(126,211,33,0.1)'
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = 'transparent'
              }}
            >
              Torne-se financiador
            </a>

            <a
              href="#inscricao"
              style={{ background: 'var(--verde)', color: '#000', padding: '7px 18px', borderRadius: 4, fontSize: 13, fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              Inscreva-se
            </a>
          </div>

          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center', justifyContent: 'center' }}
          >
            <span style={{ display: 'block', width: 24, height: 2, background: menuOpen ? 'var(--verde)' : '#fff', transition: 'all 0.3s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <span style={{ display: 'block', width: 24, height: 2, background: menuOpen ? 'var(--verde)' : '#fff', transition: 'all 0.3s', opacity: menuOpen ? 0 : 1 }} />
            <span style={{ display: 'block', width: 24, height: 2, background: menuOpen ? 'var(--verde)' : '#fff', transition: 'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
          </button>
        </div>

        <div
          className="nav-mobile-menu"
          style={{
            display: menuOpen ? 'flex' : 'none',
            flexDirection: 'column',
            padding: '16px 24px 24px',
            borderTop: '1px solid rgba(126,211,33,0.1)',
            gap: 4,
          }}
        >
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 18, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontFamily: 'var(--font-display)', letterSpacing: 1 }}
            >
              {link.label}
            </a>
          ))}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            <a
              href="https://wa.me/5541999911224?text=Ola, conheci o Instituto Amplifica e gostaria de me tornar um investidor do projeto!"
              target="_blank"
              rel="noopener"
              style={{ textAlign: 'center', padding: '12px', background: 'transparent', color: 'var(--verde)', borderRadius: 6, fontSize: 14, fontWeight: 500, textDecoration: 'none', border: '1.5px solid var(--verde)' }}
            >
              Torne-se financiador
            </a>
            <a
              href="#inscricao"
              onClick={() => setMenuOpen(false)}
              style={{ textAlign: 'center', padding: '12px', background: 'var(--verde)', color: '#000', borderRadius: 6, fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
            >
              Inscreva-se
            </a>
          </div>
        </div>
      </nav>
    </>
  )
}
