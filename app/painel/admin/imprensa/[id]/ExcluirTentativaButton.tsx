'use client'

import { excluirTentativa } from '../../tentativas/actions'

export function ExcluirTentativaButton({ tentativaId }: { tentativaId: string }) {
  return (
    <form
      action={excluirTentativa}
      onSubmit={(e) => {
        if (!confirm('Excluir esta tentativa de placement?')) e.preventDefault()
      }}
      className="pt-2 flex justify-end"
    >
      <input type="hidden" name="tentativa_id" value={tentativaId} />
      <button
        type="submit"
        className="text-[11px] text-red-500/60 hover:text-red-400 transition-colors"
      >
        🗑️ Excluir tentativa
      </button>
    </form>
  )
}
