'use client'
// Linha de listagem com toggle entre visualização (summary) e edição (editForm).

import { useState, ReactNode } from 'react'
import { Pencil, X } from 'lucide-react'

export default function EditableRow({
  summary,
  editForm,
  onDelete,
}: {
  summary: ReactNode
  editForm: ReactNode
  onDelete?: ReactNode
}) {
  const [editing, setEditing] = useState(false)

  return (
    <li className="py-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">{summary}</div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setEditing(!editing)}
            className="p-1 text-gray-500 hover:text-amber-400"
            title={editing ? 'Fechar edição' : 'Editar'}
          >
            {editing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          </button>
          {onDelete}
        </div>
      </div>
      {editing && <div className="mt-2 pt-2 border-t border-gray-800">{editForm}</div>}
    </li>
  )
}
