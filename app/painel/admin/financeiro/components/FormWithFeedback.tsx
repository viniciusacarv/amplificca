'use client'
// Wrapper de form com feedback de sucesso/erro via useFormState.

import { useFormState, useFormStatus } from 'react-dom'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { Loader2, Check, AlertCircle } from 'lucide-react'

type ActionResult = { ok: boolean; message?: string }
type Action = (state: ActionResult | undefined, fd: FormData) => Promise<ActionResult>

function SubmitButton({ children, className }: { children: ReactNode; className?: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 disabled:cursor-wait ${className ?? 'bg-amber-500 text-gray-950 hover:bg-amber-400'}`}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
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
  children: (helpers: { SubmitButton: typeof SubmitButton; status: ActionResult | null }) => ReactNode
  className?: string
  resetOnSuccess?: boolean
}) {
  const [state, formAction] = useFormState(action, undefined as ActionResult | undefined)
  const [visible, setVisible] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state) {
      setVisible(true)
      const t = setTimeout(() => setVisible(false), 3500)
      if (state.ok) {
        if (resetOnSuccess) formRef.current?.reset()
        onSuccess?.()
      }
      return () => clearTimeout(t)
    }
  }, [state, onSuccess, resetOnSuccess])

  return (
    <form ref={formRef} action={formAction} className={className}>
      {children({ SubmitButton, status: state ?? null })}
      {visible && state && (
        <div className={`mt-2 inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md ${state.ok ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
          {state.ok ? <Check className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
          {state.message ?? (state.ok ? 'Salvo.' : 'Erro.')}
        </div>
      )}
    </form>
  )
}

export { SubmitButton }
