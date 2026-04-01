export default function Footer() {
  return (
    <footer style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
        <div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: '#fff', letterSpacing: 1 }}>
            Amplifica<span style={{ color: 'var(--verde)' }}>!</span>
          </span>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 6 }}>
            Conectando vozes que defendem liberdade com a imprensa
          </p>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="https://www.instagram.com/amplifica.brasil/" target="_blank" rel="noopener" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textDecoration: 'none' }}>Instagram</a>
          <a href="https://www.linkedin.com/company/instituto-amplifica/" target="_blank" rel="noopener" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textDecoration: 'none' }}>LinkedIn</a>
          <a href="mailto:anne@institutoamplifica.com" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textDecoration: 'none' }}>Contato</a>
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', width: '100%' }}>
          © {new Date().getFullYear()} Instituto Amplifica. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
