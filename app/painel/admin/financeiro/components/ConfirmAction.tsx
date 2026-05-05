'use client'
// Botão que mostra confirmação inline antes de submeter um form.

import { useRef, useState } from 'react'

export default function ConfirmAction({
  action,
  hidden,
  label,
  confirmLabel,
  message,
  className = '',
}: {
  action: (formData: FormData) => Promise<void> | void
  hidden: Record<string, string | number>
  label: string
  confirmLabel?: string
  message: string
  className?: string
}) {
  const [confirming, setConfirming] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} action={action} className="inline-block">
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className={className || 'text-xs px-2 py-1 rounded-md border border-gray-700 text-gray-400 hover:border-rose-500/50 hover:text-rose-400'}
        >
          {label}
        </button>
      ) : (
        <span className="inline-flex items-center gap-1 text-xs">
          <span className="text-gray-400">{message}</span>
          <button
            type="submit"
            className="px-2 py-1 rounded-md bg-rose-500 text-gray-950 font-medium hover:bg-rose-400"
          >
            {confirmLabel ?? 'Confirmar'}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="px-2 py-1 rounded-md border border-gray-700 text-gray-400 hover:text-gray-200"
          >
            Cancelar
          </button>
        </span>
      )}
    </form>
  )
}
