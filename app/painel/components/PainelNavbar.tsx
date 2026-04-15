'use client'
// app/painel/components/PainelNavbar.tsx
// Header moderno do painel — inspirado no header-1.tsx
// Scroll-aware · Logo idêntica ao Navbar · Hamburger animado · Menu mobile por portal

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LogoutButton from './LogoutButton'

const NAV_LINKS = [
  { href: '/painel/dashboard', label: 'Dashboard' },
  { href: '/painel/ranking',   label: 'Ranking'   },
  { href: '/painel/aulas',     label: 'Aulas'     },
]

type Props = {
  nome:    string
  fotoUrl: string | null
  iniciais: string
  isAdmin: boolean
}

export default function PainelNavbar({ nome, fotoUrl, iniciais, isAdmin }: Props) {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [mounted,   setMounted]   = useState(false)
  const pathname = usePathname()

  // Scroll detection
  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Bloqueia scroll do body quando menu aberto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Fecha ao trocar de rota
  useEffect(() => { setMenuOpen(false) }, [pathname])

  const allLinks = [
    ...NAV_LINKS,
    ...(isAdmin ? [{ href: '/painel/admin', label: 'Admin' }] : []),
  ]

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          width: '100%',
          transition: 'background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease',
          background: scrolled || menuOpen ? 'rgba(10,10,10,0.97)' : 'transparent',
          backdropFilter: scrolled || menuOpen ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: scrolled || menuOpen ? 'blur(12px)' : 'none',
          borderBottom: scrolled || menuOpen
            ? '1px solid rgba(126,211,33,0.12)'
            : '1px solid transparent',
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
          {/* Logo — idêntica ao Navbar principal */}
          <Link
            href="/painel/dashboard"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <Image
              src="/LOGO-ICON.svg"
              alt="Amplifica"
              width={36}
              height={36}
              style={{ width: 36, height: 36, objectFit: 'contain' }}
              priority
            />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: '#fff', letterSpacing: 1, lineHeight: 1 }}>
              Amplifica<span style={{ color: 'var(--verde)' }}>!</span>
            </span>
          </Link>

          {/* ── Desktop nav ──────────────────────────────────────── */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 4 }}>
            {allLinks.map((link) => {
              const isActive    = pathname === link.href
              const isAdminLink = link.href === '/painel/admin'
              const baseColor   = isAdminLink
                ? 'rgba(251,191,36,0.85)'
                : isActive ? 'var(--verde)' : 'rgba(255,255,255,0.7)'
              const hoverColor  = isAdminLink ? '#fbbf24' : 'var(--verde)'
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    position: 'relative',
                    color: baseColor,
                    textDecoration: 'none',
                    fontSize: 14,
                    padding: '7px 14px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = hoverColor }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = baseColor  }}
                >
                  {link.label}
                  {/* Sublinha ativa */}
                  {isActive && (
                    <span style={{
                      position: 'absolute', bottom: 0, left: '50%',
                      transform: 'translateX(-50%)',
                      width: '60%', height: 2,
                      background: 'var(--verde)', borderRadius: 1,
                    }} />
                  )}
                </Link>
              )
            })}

            {/* Separador */}
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)', margin: '0 10px' }} />

            {/* Avatar + primeiro nome */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {fotoUrl ? (
                <img src={fotoUrl} alt={nome}
                  style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(126,211,33,0.35)' }}
                />
              ) : (
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--verde)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#000', fontSize: 11, fontWeight: 700 }}>{iniciais}</span>
                </div>
              )}
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
                {nome.split(' ')[0]}
              </span>
            </div>

            <LogoutButton />
          </div>

          {/* ── Mobile: avatar + hamburger ───────────────────────── */}
          <div className="md:hidden" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {fotoUrl ? (
              <img src={fotoUrl} alt={nome}
                style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(126,211,33,0.35)' }}
              />
            ) : (
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--verde)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#000', fontSize: 10, fontWeight: 700 }}>{iniciais}</span>
              </div>
            )}

            {/* Hamburger animado */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Abrir menu"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center', justifyContent: 'center' }}
            >
              <motion.span
                animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'block', width: 24, height: 2, background: menuOpen ? 'var(--verde)' : '#fff', transformOrigin: 'center', borderRadius: 2 }}
              />
              <motion.span
                animate={{ opacity: menuOpen ? 0 : 1, scaleX: menuOpen ? 0 : 1 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'block', width: 24, height: 2, background: '#fff', borderRadius: 2 }}
              />
              <motion.span
                animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'block', width: 24, height: 2, background: menuOpen ? 'var(--verde)' : '#fff', transformOrigin: 'center', borderRadius: 2 }}
              />
            </button>
          </div>
        </div>
      </header>

      {/* ── Menu mobile (portal) ───────────────────────────────────── */}
      {mounted && createPortal(
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              style={{
                position: 'fixed',
                top: 64,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 40,
                background: 'rgba(10,10,10,0.98)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                display: 'flex',
                flexDirection: 'column',
                padding: '36px 24px 40px',
                borderTop: '1px solid rgba(126,211,33,0.1)',
              }}
            >
              {/* Links em Bebas Neue grande */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
                {allLinks.map((link, i) => {
                  const isActive    = pathname === link.href
                  const isAdminLink = link.href === '/painel/admin'
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.3, ease: 'easeOut' }}
                    >
                      <Link
                        href={link.href}
                        style={{
                          display: 'block',
                          fontFamily: 'var(--font-display)',
                          fontSize: 52,
                          letterSpacing: 2,
                          lineHeight: 1.15,
                          color: isActive
                            ? 'var(--verde)'
                            : isAdminLink ? '#fbbf24' : 'rgba(255,255,255,0.85)',
                          textDecoration: 'none',
                          padding: '10px 0',
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = isAdminLink ? '#fbbf24' : 'var(--verde)' }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = isActive
                            ? 'var(--verde)' : isAdminLink ? '#fbbf24' : 'rgba(255,255,255,0.85)'
                        }}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  )
                })}
              </div>

              {/* Rodapé: avatar + nome + logout */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 24,
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {fotoUrl ? (
                    <img src={fotoUrl} alt={nome}
                      style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(126,211,33,0.4)' }}
                    />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--verde)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#000', fontSize: 14, fontWeight: 700 }}>{iniciais}</span>
                    </div>
                  )}
                  <div>
                    <p style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{nome}</p>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>Amplifica</p>
                  </div>
                </div>
                <LogoutButton />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
