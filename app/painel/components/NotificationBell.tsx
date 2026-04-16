'use client'
// app/painel/components/NotificationBell.tsx
// Sino de notificações — Client Component, busca o count e faz polling leve

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Props = {
  isAdmin: boolean
  initialCount?: number
}

export default function NotificationBell({ isAdmin, initialCount = 0 }: Props) {
  const [count, setCount] = useState(initialCount)

  // Polling a cada 60 segundos para atualizar o badge sem precisar de realtime
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/notificacoes/count', { credentials: 'same-origin' })
        if (res.ok) {
          const data = await res.json()
          setCount(data.count ?? 0)
        }
      } catch {
        // silencia erros de rede
      }
    }

    fetchCount() // busca imediata ao montar
    const interval = setInterval(fetchCount, 60_000)
    return () => clearInterval(interval)
  }, [])

  const href = isAdmin ? '/painel/admin/notificacoes' : '/painel/notificacoes'

  return (
    <Link
      href={href}
      aria-label={`Notificações${count > 0 ? ` (${count} não lidas)` : ''}`}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 34,
        height: 34,
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.08)',
        background: count > 0 ? 'rgba(126,211,33,0.08)' : 'transparent',
        transition: 'background 0.2s, border-color 0.2s',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = count > 0 ? 'rgba(126,211,33,0.08)' : 'transparent'
      }}
    >
      {/* Ícone de sino */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        style={{
          width: 18,
          height: 18,
          color: count > 0 ? 'var(--verde)' : 'rgba(255,255,255,0.5)',
          transition: 'color 0.2s',
        }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
        />
      </svg>

      {/* Badge de contagem */}
      {count > 0 && (
        <span
          style={{
            position: 'absolute',
            top: -3,
            right: -3,
            minWidth: 16,
            height: 16,
            background: 'var(--verde)',
            borderRadius: '999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 9,
            fontWeight: 700,
            color: '#000',
            border: '1.5px solid rgba(10,10,10,0.9)',
            lineHeight: 1,
            padding: '0 3px',
          }}
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}
