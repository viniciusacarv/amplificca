'use client'

const IconInstagram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const IconLinkedIn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

export default function Footer() {
  return (
    <footer style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 0' }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 24,
      }}>

        {/* Logo + tagline */}
        <div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: '#fff', letterSpacing: 1 }}>
            Amplifica<span style={{ color: 'var(--verde)' }}>!</span>
          </span>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 6 }}>
            Conectando vozes que defendem liberdade com a imprensa
          </p>
        </div>

        {/* Links sociais com ícones */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>

          <a
            href="https://www.instagram.com/amplifica.brasil/"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              color: 'rgba(255,255,255,0.35)', textDecoration: 'none',
              fontSize: 13, transition: 'color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
          >
            <IconInstagram />
            Instagram
          </a>

          <a
            href="https://www.linkedin.com/company/instituto-amplifica/"
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              color: 'rgba(255,255,255,0.35)', textDecoration: 'none',
              fontSize: 13, transition: 'color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
          >
            <IconLinkedIn />
            LinkedIn
          </a>

          <a
            href="mailto:anne@institutoamplifica.com"
            style={{
              color: 'rgba(255,255,255,0.35)', fontSize: 13,
              textDecoration: 'none', transition: 'color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
          >
            Contato
          </a>
        </div>

        {/* Copyright */}
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', width: '100%' }}>
          © {new Date().getFullYear()} Instituto Amplifica. Todos os direitos reservados. Designed by VAC.
        </p>

      </div>
    </footer>
  )
}
