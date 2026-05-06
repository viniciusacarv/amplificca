'use client'
// Linha de listagem com expansão para editar inline.
// editForm recebe um callback `close` para que o submit fechado por FormWithFeedback colapse a linha.

import { useState, ReactNode } from 'react'
import { Pencil, X } from 'lucide-react'

type EditFormRender = (helpers: { close: () => void }) => ReactNode

export default function EditableRow({
  summary,
  editForm,
  onDelete,
}: {
  summary: ReactNode
  editForm: EditFormRender | ReactNode
  onDelete?: ReactNode
}) {
  const [editing, setEditing] = useState(false)
  const close = () => setEditing(false)

  return (
    <li className="py-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">{summary}</div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setEditing(!editing)}
            className="p-1 text-gray-500 hover:text-amber-400"
            title={editing ? 'Cancelar' : 'Editar'}
          >
            {editing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          </button>
          {onDelete}
        </div>
      </div>
      {editing && (
        <div className="mt-2 pt-2 border-t border-gray-800">
          {typeof editForm === 'function' ? (editForm as EditFormRender)({ close }) : editForm}
        </div>
      )}
    </li>
  )
}
