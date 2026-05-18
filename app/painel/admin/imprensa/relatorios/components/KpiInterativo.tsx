'use client'
// app/painel/admin/imprensa/relatorios/components/KpiInterativo.tsx
// Card de KPI com hover (preview top 5) + click (modal lista completa filtrável).

import { useEffect, useMemo, useRef, useState } from 'react'

export type KpiItem = {
  key: string
  primary: string
  secondary?: string
  tertiary?: string
}

const TONES = {
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
} as const

export function KpiInterativo({
  label,
  value,
  hint,
  tone,
  iconEmoji,
  items,
  modalTitle,
  emptyMessage,
}: {
  label: string
  value: number | string
  hint?: string
  tone: keyof typeof TONES
  iconEmoji: string
  items: KpiItem[]
  modalTitle: string
  emptyMessage?: string
}) {
  const [open, setOpen] = useState(false)
  const [busca, setBusca] = useState('')
  const [hovering, setHovering] = useState(false)
  const cardRef = useRef<HTMLButtonElement>(null)

  // Fecha modal com ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Lock scroll quando modal aberto
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  const itensFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) =>
      i.primary.toLowerCase().includes(q) ||
      (i.secondary ?? '').toLowerCase().includes(q) ||
      (i.tertiary ?? '').toLowerCase().includes(q)
    )
  }, [busca, items])

  return (
    <>
      <button
        ref={cardRef}
        type="button"
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className="relative text-left bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors cursor-pointer w-full"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
          <span className={`px-2 py-1 rounded-lg border text-sm ${TONES[tone]}`}>{iconEmoji}</span>
        </div>
        <p className="text-3xl font-bold text-white mt-3">{value}</p>
        {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
        <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-wider">
          {items.length > 0 ? 'Ver detalhes →' : '—'}
        </p>

        {/* Hover preview */}
        {hovering && items.length > 0 && (
          <div
            className="absolute z-30 left-0 right-0 top-full mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-3 text-left pointer-events-none"
            role="tooltip"
          >
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
              Top {Math.min(5, items.length)} de {items.length}
            </p>
            <ul className="space-y-1.5">
              {items.slice(0, 5).map((i) => (
                <li key={i.key} className="text-xs text-gray-300 flex items-center justify-between gap-2">
                  <span className="truncate">{i.primary}</span>
                  {i.secondary && (
                    <span className="text-gray-500 flex-shrink-0">{i.secondary}</span>
                  )}
                </li>
              ))}
            </ul>
            {items.length > 5 && (
              <p className="text-[11px] text-emerald-400 mt-2">Clique para ver os {items.length}…</p>
            )}
          </div>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <div>
                <h3 className="text-lg font-bold text-white">{modalTitle}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{items.length} {items.length === 1 ? 'item' : 'itens'}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white transition-colors text-xl"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="p-5 border-b border-gray-800">
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar…"
                autoFocus
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-8">
                  {emptyMessage ?? 'Sem dados neste período.'}
                </p>
              ) : itensFiltrados.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-8">
                  Nenhum item corresponde à busca.
                </p>
              ) : (
                <ul className="divide-y divide-gray-800">
                  {itensFiltrados.map((i) => (
                    <li key={i.key} className="py-2.5 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white truncate">{i.primary}</p>
                        {i.tertiary && (
                          <p className="text-xs text-gray-500 mt-0.5">{i.tertiary}</p>
                        )}
                      </div>
                      {i.secondary && (
                        <span className="text-xs text-gray-400 flex-shrink-0">{i.secondary}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
