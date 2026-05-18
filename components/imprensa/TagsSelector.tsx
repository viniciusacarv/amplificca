'use client'
// components/imprensa/TagsSelector.tsx
// Seletor multi de tags agrupadas. Reutilizado em submissão (fellow/admin) e veículo.

import { useState } from 'react'

export type TagOption = {
  id: string | number
  nome: string
  slug: string
  grupo: string | null
}

const GRUPO_LABEL: Record<string, string> = {
  tema: 'Tema',
  porte: 'Porte',
  perfil_editorial: 'Perfil editorial',
}

const GRUPO_ORDEM = ['tema', 'porte', 'perfil_editorial'] as const

export function TagsSelector({
  name = 'tag_ids',
  tags,
  defaultSelected = [],
  max,
  gruposVisiveis,
  ajuda,
}: {
  name?: string
  tags: TagOption[]
  defaultSelected?: (string | number)[]
  max?: number
  gruposVisiveis?: string[]   // ex.: ['tema']  — limita aos grupos exibidos
  ajuda?: string
}) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(defaultSelected.map(String))
  )

  const tagsFiltradas = gruposVisiveis
    ? tags.filter((t) => t.grupo && gruposVisiveis.includes(t.grupo))
    : tags

  const grupos: Record<string, TagOption[]> = {}
  for (const t of tagsFiltradas) {
    const g = t.grupo ?? 'outro'
    if (!grupos[g]) grupos[g] = []
    grupos[g].push(t)
  }

  const ordemGrupos = Object.keys(grupos).sort((a, b) => {
    const ia = GRUPO_ORDEM.indexOf(a as any)
    const ib = GRUPO_ORDEM.indexOf(b as any)
    if (ia === -1 && ib === -1) return a.localeCompare(b)
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (max && next.size >= max) return prev
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="space-y-3">
      {/* Hidden inputs com os IDs selecionados (para Server Action ler) */}
      {Array.from(selected).map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}

      {ajuda && (
        <p className="text-xs text-gray-500">
          {ajuda}
          {max ? ` Máximo ${max}.` : ''}
        </p>
      )}

      {tagsFiltradas.length === 0 ? (
        <p className="text-xs text-gray-500 italic">Nenhuma tag disponível ainda.</p>
      ) : (
        <div className="space-y-3">
          {ordemGrupos.map((grupo) => (
            <div key={grupo}>
              {(!gruposVisiveis || gruposVisiveis.length > 1) && (
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                  {GRUPO_LABEL[grupo] ?? grupo}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {grupos[grupo].map((t) => {
                  const id = String(t.id)
                  const checked = selected.has(id)
                  const disabled = !checked && !!max && selected.size >= max
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggle(id)}
                      disabled={disabled}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        checked
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                          : disabled
                            ? 'bg-gray-800/40 border-gray-800 text-gray-600 cursor-not-allowed'
                            : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      {t.nome}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {max && (
        <p className="text-[11px] text-gray-600">
          {selected.size}/{max} selecionadas
        </p>
      )}
    </div>
  )
}
