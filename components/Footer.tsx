'use client'

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

          {/* Instagram */}
          <a
            href="https://www.instagram.com/amplifica.brasil/"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram"
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              color: 'rgba(255,255,255,0.35)', textDecoration: 'none',
              fontSize: 13, transition: 'color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
            </svg>
            Instagram
          </a>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/company/instituto-amplifica/"
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn"
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              color: 'rgba(255,255,255,0.35)', textDecoration: 'none',
              fontSize: 13, transition: 'color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="3" ry="3" />
              <line x1="8" y1="11" x2="8" y2="16" />
              <line x1="8" y1="8" x2="8" y2="8.5" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M12 11v5M12 13.5c0-1.38 1.12-2.5 2.5-2.5S17 12.12 17 13.5V16" />
            </svg>
            LinkedIn
          </a>

          {/* Contato */}
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
          © {new Date().getFullYear()} Instituto Amplifica. Todos os direitos reservados.
        </p>

      </div>
    </footer>
  )
}
