'use client'

type Props = {
  action: (formData: FormData) => void | Promise<void>
  titulo: string
}

export default function DeleteButtonClient({ action, titulo }: Props) {
  return (
    <button
      type="submit"
      formAction={action}
      formNoValidate
      onClick={(e) => {
        if (!window.confirm(`Excluir a aula "${titulo}"? Essa ação não pode ser desfeita.`)) {
          e.preventDefault()
        }
      }}
      className="text-xs text-red-400/70 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
      title={`Excluir "${titulo}"`}
    >
      Excluir aula
    </button>
  )
}
