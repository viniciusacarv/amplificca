export default function Inscricao() {
  return (
    <section id="inscricao" style={{ padding: '100px 0', background: '#0a0a0a', borderTop: '1px solid rgba(126,211,33,0.1)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>

        <span style={{ color: 'var(--verde)', fontSize: 12, letterSpacing: 2, fontWeight: 500 }}>PRÓXIMA TURMA</span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 8vw, 96px)', color: '#fff', lineHeight: 0.9, marginTop: 12, marginBottom: 24 }}>
          SUA VOZ<br />MERECE<br /><span style={{ color: 'var(--verde)' }}>ESPAÇO</span>
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 48, maxWidth: 520, margin: '0 auto 48px' }}>
          O Amplifica seleciona jovens lideranças entre 18 e 35 anos comprometidas com as ideias de liberdade. As inscrições para a próxima turma serão abertas em breve.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSera5I4P3_oLBlHEbAu7H4b_EjINA2cDV8Ierov0gbavgH5sA/viewform" target="_blank" rel="noopener" style={{
            background: 'var(--verde)', color: '#000', padding: '16px 40px',
            borderRadius: 4, fontSize: 14, fontWeight: 500, textDecoration: 'none',
            letterSpacing: 0.5, display: 'inline-block',
          }}>
            Quero me inscrever →
          </a>
          <a href={`https://wa.me/5541999911224?text=Olá, conheci o Instituto Amplifica e gostaria de apoiar o projeto!`} target="_blank" rel="noopener" style={{
            background: 'transparent', color: '#fff', padding: '16px 40px',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4,
            fontSize: 14, fontWeight: 400, textDecoration: 'none', display: 'inline-block',
          }}>
            Quero financiar
          </a>
        </div>

      </div>
    </section>
  )
}
