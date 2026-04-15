'use client'
// app/painel/login/page.tsx — Redesign moderno com anéis orbitais animados

import { useState } from 'react'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [senha, setSenha]       = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [erro, setErro]         = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    })

    if (error) {
      setErro('Email ou senha incorretos. Tente novamente.')
      setLoading(false)
    } else {
      router.push('/painel/dashboard')
      router.refresh()
    }
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── Keyframes ──────────────────────────────────────────────── */}
      <style>{`
        @keyframes spin-cw  { from { transform: translate(-50%,-50%) rotate(0deg);   } to { transform: translate(-50%,-50%) rotate(360deg);  } }
        @keyframes spin-ccw { from { transform: translate(-50%,-50%) rotate(0deg);   } to { transform: translate(-50%,-50%) rotate(-360deg); } }
        @keyframes pulse-glow {
          0%,100% { opacity: 0.6; transform: translate(-50%,-50%) scale(1);   }
          50%      { opacity: 1;   transform: translate(-50%,-50%) scale(1.08); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .ring-cw  { position:absolute; top:50%; left:50%; border-radius:50%; border:1px solid rgba(126,211,33,0.12); }
        .ring-ccw { position:absolute; top:50%; left:50%; border-radius:50%; border:1px solid rgba(126,211,33,0.08); }
        .spin-60cw  { animation: spin-cw  60s  linear infinite; }
        .spin-90ccw { animation: spin-ccw 90s  linear infinite; }
        .spin-45cw  { animation: spin-cw  45s  linear infinite; }
        .spin-120ccw{ animation: spin-ccw 120s linear infinite; }
        .dot { position:absolute; width:6px; height:6px; border-radius:50%; top:-3px; left:50%; margin-left:-3px; background:rgba(126,211,33,0.7); box-shadow:0 0 8px 2px rgba(126,211,33,0.5); }
        .dot-sm { width:4px; height:4px; top:-2px; margin-left:-2px; }
        .login-card { animation: fadeUp 0.6s ease forwards; }
      `}</style>

      {/* ── Anéis orbitais decorativos ─────────────────────────────── */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:1 }}>

        {/* Glow central */}
        <div style={{
          position:'absolute', top:'50%', left:'50%',
          width:500, height:500, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(126,211,33,0.07) 0%, transparent 70%)',
          transform:'translate(-50%,-50%)',
          animation:'pulse-glow 6s ease-in-out infinite',
        }}/>

        {/* Anel 1 — menor, mais rápido */}
        <div className="ring-cw spin-45cw" style={{ width:320, height:320 }}>
          <span className="dot dot-sm" style={{ background:'rgba(126,211,33,0.9)' }}/>
          <span className="dot dot-sm" style={{ top:'auto', bottom:-2, left:'50%', margin:'0 0 0 -2px' }}/>
        </div>

        {/* Anel 2 */}
        <div className="ring-ccw spin-90ccw" style={{ width:520, height:520 }}>
          <span className="dot" style={{ left:'30%' }}/>
        </div>

        {/* Anel 3 */}
        <div className="ring-cw spin-60cw" style={{ width:740, height:740 }}>
          <span className="dot" />
          <span className="dot dot-sm" style={{ top:'auto', bottom:-2, left:'70%', margin:0 }}/>
        </div>

        {/* Anel 4 — maior, lento */}
        <div className="ring-ccw spin-120ccw" style={{ width:980, height:980, borderColor:'rgba(126,211,33,0.05)' }}>
          <span className="dot dot-sm" style={{ left:'80%', background:'rgba(126,211,33,0.5)' }}/>
        </div>

        {/* Anel 5 — enorme, muito sutil */}
        <div className="ring-cw spin-120ccw" style={{ width:1240, height:1240, borderColor:'rgba(126,211,33,0.03)' }}/>
      </div>

      {/* ── Gradiente de escurecimento sobre os anéis ──────────────── */}
      <div style={{
        position:'absolute', inset:0, zIndex:2, pointerEvents:'none',
        background:'radial-gradient(ellipse at center, transparent 20%, rgba(10,10,10,0.7) 70%, rgba(10,10,10,0.95) 100%)',
      }}/>

      {/* ── Conteúdo principal ─────────────────────────────────────── */}
      <div className="login-card" style={{ position:'relative', zIndex:10, width:'100%', maxWidth:400, padding:'0 24px', display:'flex', flexDirection:'column', alignItems:'center', gap:32 }}>

        {/* Logo — idêntico ao Navbar */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Image
              src="/LOGO-ICON.svg"
              alt="Amplifica"
              width={36}
              height={36}
              style={{ width:36, height:36, objectFit:'contain' }}
              priority
            />
            <span style={{ fontFamily:'var(--font-display)', fontSize:26, color:'#fff', letterSpacing:1, lineHeight:1 }}>
              Amplifica<span style={{ color:'var(--verde)' }}>!</span>
            </span>
          </div>
          <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
            Painel do Aluno
          </span>
        </div>

        {/* Card glassmorphism */}
        <div style={{
          width:'100%',
          background:'rgba(255,255,255,0.04)',
          backdropFilter:'blur(24px)',
          WebkitBackdropFilter:'blur(24px)',
          border:'1px solid rgba(255,255,255,0.08)',
          borderRadius:16,
          padding:'32px 28px',
        }}>
          <h2 style={{ color:'#fff', fontSize:18, fontWeight:600, margin:'0 0 24px' }}>
            Entrar na sua conta
          </h2>

          {/* Erro */}
          {erro && (
            <div style={{
              background:'rgba(239,68,68,0.08)',
              border:'1px solid rgba(239,68,68,0.2)',
              borderRadius:10, padding:'11px 14px',
              color:'#f87171', fontSize:13, marginBottom:18,
              display:'flex', alignItems:'center', gap:8,
            }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
              </svg>
              {erro}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Email */}
            <div>
              <label style={{ display:'block', fontSize:12, color:'rgba(255,255,255,0.45)', marginBottom:6, letterSpacing:'0.04em' }}>
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="seu@email.com"
                style={{
                  width:'100%', boxSizing:'border-box',
                  background:'rgba(255,255,255,0.05)',
                  border:'1px solid rgba(255,255,255,0.09)',
                  borderRadius:10, padding:'12px 16px',
                  color:'#fff', fontSize:14,
                  outline:'none', transition:'border-color 0.2s',
                }}
                onFocus={e  => { e.currentTarget.style.borderColor = 'rgba(126,211,33,0.5)' }}
                onBlur={e   => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)' }}
              />
            </div>

            {/* Senha */}
            <div>
              <label style={{ display:'block', fontSize:12, color:'rgba(255,255,255,0.45)', marginBottom:6, letterSpacing:'0.04em' }}>
                SENHA
              </label>
              <div style={{ position:'relative' }}>
                <input
                  type={showSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  style={{
                    width:'100%', boxSizing:'border-box',
                    background:'rgba(255,255,255,0.05)',
                    border:'1px solid rgba(255,255,255,0.09)',
                    borderRadius:10, padding:'12px 44px 12px 16px',
                    color:'#fff', fontSize:14,
                    outline:'none', transition:'border-color 0.2s',
                  }}
                  onFocus={e  => { e.currentTarget.style.borderColor = 'rgba(126,211,33,0.5)' }}
                  onBlur={e   => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  style={{
                    position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', cursor:'pointer',
                    color:'rgba(255,255,255,0.3)', padding:4, display:'flex', alignItems:'center',
                    transition:'color 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
                >
                  {showSenha ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width:'100%',
                background: loading ? 'rgba(126,211,33,0.5)' : '#7ed321',
                color:'#000',
                fontWeight:600, fontSize:14,
                padding:'13px', marginTop:4,
                borderRadius:10, border:'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition:'all 0.2s',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#8ee830' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#7ed321' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <circle opacity=".25" cx="12" cy="12" r="10" stroke="#000" strokeWidth="4"/>
                    <path opacity=".75" fill="#000" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Entrando...
                </>
              ) : 'Entrar'}
            </button>
          </form>
        </div>

        {/* Rodapé */}
        <p style={{ fontSize:12, color:'rgba(255,255,255,0.2)', textAlign:'center' }}>
          Problemas para entrar? Fale com a equipe Amplifica.
        </p>
      </div>
    </div>
  )
}
