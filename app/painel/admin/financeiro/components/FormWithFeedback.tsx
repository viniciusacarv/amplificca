'use client'
// Form com feedback de save (sem render prop, para funcionar a partir de Server Components).
// SubmitButton é um componente separado que pode ser usado dentro do form.

import { useFormState, useFormStatus } from 'react-dom'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { Loader2, Check, AlertCircle } from 'lucide-react'

type ActionResult = { ok: boolean; message?: string }
type Action = (state: ActionResult | undefined, fd: FormData) => Promise<ActionResult>

export function SubmitButton({ children, className }: { children?: ReactNode; className?: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 disabled:cursor-wait ${className ?? 'bg-amber-500 text-gray-950 hover:bg-amber-400'}`}
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {children ?? 'Salvar'}
    </button>
  )
}

function StatusFlash({ state }: { state: ActionResult | undefined }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (state) {
      setVisible(true)
      const t = setTimeout(() => setVisible(false), 3500)
      return () => clearTimeout(t)
    }
  }, [state])

  if (!visible || !state) return null
  return (
    <div className={`mt-2 inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md ${state.ok ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
      {state.ok ? <Check className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
      {state.message ?? (state.ok ? 'Salvo.' : 'Erro.')}
    </div>
  )
}

export default function FormWithFeedback({
  action,
  onSuccess,
  children,
  className = '',
  resetOnSuccess = false,
}: {
  action: Action
  onSuccess?: () => void
  children: ReactNode
  className?: string
  resetOnSuccess?: boolean
}) {
  const [state, formAction] = useFormState(action, undefined as ActionResult | undefined)
  const formRef = useRef<HTMLFormElement>(null)
  const lastStateRef = useRef<ActionResult | undefined>(undefined)

  useEffect(() => {
    if (state && state !== lastStateRef.current) {
      lastStateRef.current = state
      if (state.ok) {
        if (resetOnSuccess) formRef.current?.reset()
        onSuccess?.()
      }
    }
  }, [state, onSuccess, resetOnSuccess])

  return (
    <form ref={formRef} action={formAction} className={className}>
      {children}
      <StatusFlash state={state} />
    </form>
  )
}
