'use client'
// app/painel/imprensa/nova/page.tsx
// Formulário de envio de texto/pitch — fellow

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { criarSubmissao } from '../actions'

export default function NovaSubmissaoPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [tipo, setTipo] = useState<'artigo' | 'pitch'>('artigo')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('tipo', tipo)

    startTransition(async () => {
      const result = await criarSubmissao(formData)
      if (result?.error) {
        setError(result.error)
      }
      // Se não houver erro, criarSubmissao já fez redirect
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div>
        <Link
          href="/painel/imprensa"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Voltar
        </Link>
        <h1 className="text-2xl font-bold text-white">Enviar texto para avaliação</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Preencha as informações abaixo. A Sara retornará em até 2 dias úteis.
        </p>
      </div>

      {/* ── Formulário ───────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">

        {/* Tipo: Artigo ou Pitch */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Tipo de envio <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                value: 'artigo',
                label: 'Artigo',
                desc: 'Texto já escrito, pronto para avaliação',
                emoji: '📝',
              },
              {
                value: 'pitch',
                label: 'Pitch',
                desc: 'Ideia ou proposta de pauta para ser desenvolvida',
                emoji: '💡',
              },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTipo(opt.value as 'artigo' | 'pitch')}
                className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                  tipo === opt.value
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                    : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
                }`}
              >
                <span className="text-2xl mb-2">{opt.emoji}</span>
                <span className={`text-sm font-semibold ${tipo === opt.value ? 'text-emerald-400' : 'text-white'}`}>
                  {opt.label}
                </span>
                <span className="text-xs text-gray-500 mt-0.5 leading-snug">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Título */}
        <div>
          <label htmlFor="titulo" className="block text-sm font-medium text-gray-300 mb-2">
            Título <span className="text-red-400">*</span>
          </label>
          <input
            id="titulo"
            name="titulo"
            type="text"
            required
            placeholder={tipo === 'artigo' ? 'ex: Por que o livre mercado reduz a desigualdade' : 'ex: Proposta de artigo sobre educação e liberdade'}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
          />
        </div>

        {/* Link do Google Doc */}
        <div>
          <label htmlFor="google_doc_url" className="block text-sm font-medium text-gray-300 mb-2">
            Link do Google Doc
            <span className="ml-2 text-xs font-normal text-gray-500">(recomendado)</span>
          </label>
          <input
            id="google_doc_url"
            name="google_doc_url"
            type="url"
            placeholder="https://docs.google.com/document/d/..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
          />
          <p className="mt-1.5 text-xs text-gray-600">
            Certifique-se de que o documento está com acesso aberto para leitura (link compartilhável).
          </p>
        </div>

        {/* Aviso de processo */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-xs text-blue-300 leading-relaxed">
            <span className="font-semibold">Como funciona:</span> A Sara receberá uma notificação assim que você enviar. Em até <strong>1 dia útil</strong> você receberá a confirmação de recebimento, e em até <strong>2 dias úteis</strong> terá o retorno com aprovação, pedido de ajustes ou recusa fundamentada.
          </p>
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Botões */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 text-black font-semibold text-sm px-6 py-2.5 rounded-xl transition-all"
          >
            {isPending ? (
              <>
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Enviando...
              </>
            ) : (
              <>Enviar para avaliação</>
            )}
          </button>
          <Link
            href="/painel/imprensa"
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors px-4 py-2.5"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
