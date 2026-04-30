'use client'

import { useState } from 'react'
import { resetFellowPassword } from './actions'

export function ResetPasswordButton({ email, nome }: { email: string; nome: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleClick() {
    if (!window.confirm(`Enviar e-mail de reset de senha para ${nome} (${email})?`)) return
    setStatus('loading')
    try {
      await resetFellowPassword(email)
      setStatus('sent')
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Erro desconhecido')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <span className="flex-shrink-0 text-xs text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 rounded-lg">
        ✓ E-mail enviado
      </span>
    )
  }

  if (status === 'error') {
    return (
      <button
        onClick={() => setStatus('idle')}
        className="flex-shrink-0 text-xs text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
        title={errorMsg}
      >
        ✗ Erro — tentar de novo
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={status === 'loading'}
      className="flex-shrink-0 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-700/50 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {status === 'loading' ? 'Enviando...' : 'Resetar senha'}
    </button>
  )
}
