'use client'

import { useMemo, useState } from 'react'
import { registrarTentativa } from '../../tentativas/actions'

export type ContatoVeiculo = {
  nome: string
  funcao?: string
  email?: string
  whatsapp?: string
}

export type VeiculoOpcao = {
  id: string | number
  nome: string
  contatos: ContatoVeiculo[]
  matchCount?: number   // tags em comum com a submissão (para ranking de sugestão)
}

export function NovaTentativaForm({
  submissaoId,
  veiculos,
  today,
}: {
  submissaoId: string
  veiculos: VeiculoOpcao[]
  today: string
}) {
  const [veiculoId, setVeiculoId] = useState<string>('')
  const [contatoModo, setContatoModo] = useState<'existente' | 'novo'>('existente')
  const [contatoExistente, setContatoExistente] = useState<string>('')

  const contatos = useMemo<ContatoVeiculo[]>(() => {
    const v = veiculos.find((vv) => String(vv.id) === veiculoId)
    return Array.isArray(v?.contatos) ? v!.contatos : []
  }, [veiculoId, veiculos])

  // Ao trocar de veículo, reseta a seleção de contato
  function handleVeiculoChange(id: string) {
    setVeiculoId(id)
    setContatoExistente('')
    setContatoModo(id && (veiculos.find((v) => String(v.id) === id)?.contatos?.length ?? 0) > 0 ? 'existente' : 'novo')
  }

  return (
    <form action={registrarTentativa} className="space-y-3">
      <input type="hidden" name="submissao_id" value={submissaoId} />
      <input type="hidden" name="contato_modo" value={contatoModo} />
      <input type="hidden" name="contato_existente_nome" value={contatoExistente} />

      {/* Veículo */}
      <div>
        <label className="block text-xs text-gray-500 mb-1.5">
          Veículo <span className="text-red-400">*</span>
          {veiculos.some((v) => (v.matchCount ?? 0) > 0) && (
            <span className="ml-2 font-normal text-emerald-400">— ordenados por afinidade de tags</span>
          )}
        </label>
        <select
          name="veiculo_id"
          required
          value={veiculoId}
          onChange={(e) => handleVeiculoChange(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60 transition-colors"
        >
          <option value="">— Selecionar veículo —</option>
          {veiculos.map((v) => {
            const match = v.matchCount ?? 0
            const prefix = match > 0 ? `★ ${match} tag${match > 1 ? 's' : ''} em comum · ` : ''
            return (
              <option key={String(v.id)} value={String(v.id)}>
                {prefix}{v.nome}
              </option>
            )
          })}
        </select>
        {veiculoId && (() => {
          const sel = veiculos.find((v) => String(v.id) === veiculoId)
          const m = sel?.matchCount ?? 0
          return m > 0 ? (
            <p className="mt-1.5 text-[11px] text-emerald-400">
              ✓ {m} tag{m > 1 ? 's' : ''} em comum com esta submissão.
            </p>
          ) : null
        })()}
      </div>

      {/* Responsável: dropdown ou cadastro novo */}
      {veiculoId && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500">
              Responsável <span className="text-red-400">*</span>
              <span className="ml-1 font-normal text-gray-600">— contato do veículo</span>
            </label>
            <button
              type="button"
              onClick={() => setContatoModo(contatoModo === 'novo' ? 'existente' : 'novo')}
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              {contatoModo === 'novo' ? '← Usar contato cadastrado' : '+ Cadastrar novo contato'}
            </button>
          </div>

          {contatoModo === 'existente' ? (
            contatos.length > 0 ? (
              <select
                value={contatoExistente}
                onChange={(e) => setContatoExistente(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60 transition-colors"
              >
                <option value="">— Selecionar contato —</option>
                {contatos.map((c, idx) => (
                  <option key={`${c.nome}-${idx}`} value={c.nome}>
                    {c.nome}{c.funcao ? ` · ${c.funcao}` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-xs text-gray-500 italic bg-gray-800/40 border border-dashed border-gray-700 rounded-xl px-3 py-2.5">
                Este veículo ainda não tem contatos cadastrados.{' '}
                <button
                  type="button"
                  onClick={() => setContatoModo('novo')}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors not-italic font-medium"
                >
                  Cadastrar agora →
                </button>
              </div>
            )
          ) : (
            <div className="bg-gray-800/40 border border-emerald-500/20 rounded-xl p-3 space-y-2">
              <p className="text-[11px] text-emerald-400 font-medium">
                Será adicionado também à ficha do veículo
              </p>
              <input
                name="novo_contato_nome"
                type="text"
                required={contatoModo === 'novo'}
                placeholder="Nome *"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
              <input
                name="novo_contato_funcao"
                type="text"
                placeholder="Função no veículo (ex: Editor de opinião)"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="novo_contato_email"
                  type="email"
                  placeholder="E-mail"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
                />
                <input
                  name="novo_contato_whatsapp"
                  type="text"
                  placeholder="WhatsApp"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Doc para o assessor */}
      <div>
        <label className="block text-xs text-gray-500 mb-1.5">
          Doc para o assessor de imprensa
          <span className="ml-1 font-normal text-gray-600">— link individual deste placement</span>
        </label>
        <input
          name="doc_imprensa_url"
          type="url"
          placeholder="https://docs.google.com/..."
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 transition-colors"
        />
      </div>

      {/* Data */}
      <div>
        <label className="block text-xs text-gray-500 mb-1.5">Data de envio</label>
        <input
          name="enviado_em"
          type="date"
          defaultValue={today}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60 transition-colors"
        />
      </div>

      {/* Notas */}
      <div>
        <label className="block text-xs text-gray-500 mb-1.5">Observações</label>
        <textarea
          name="notas"
          rows={2}
          placeholder="Canal usado, detalhes do envio, contexto…"
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-emerald-500/60 transition-colors"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 text-sm font-semibold py-2.5 rounded-xl transition-colors"
      >
        📋 Registrar tentativa
      </button>
    </form>
  )
}
