'use client'

import { useState } from 'react'

export type ContatoItem = {
  _key: string
  nome: string
  funcao: string
  email: string
  whatsapp: string
  admin_id: string
  admin_nome: string
  admin_foto: string | null
}

export type AdminOpcao = {
  id: string
  nome: string
  foto_url: string | null
  email: string
}

function gerarKey() {
  return Math.random().toString(36).slice(2)
}

function contatoVazio(): ContatoItem {
  return { _key: gerarKey(), nome: '', funcao: '', email: '', whatsapp: '', admin_id: '', admin_nome: '', admin_foto: null }
}

export function ContatosEditor({
  inicial,
  admins,
}: {
  inicial: ContatoItem[]
  admins: AdminOpcao[]
}) {
  const [contatos, setContatos] = useState<ContatoItem[]>(
    inicial.length > 0 ? inicial.map((c) => ({ ...c, _key: c._key || gerarKey() })) : []
  )

  function atualizar(key: string, campo: keyof ContatoItem, valor: string) {
    setContatos((prev) =>
      prev.map((c) => {
        if (c._key !== key) return c
        if (campo === 'admin_id') {
          const admin = admins.find((a) => a.id === valor)
          return { ...c, admin_id: valor, admin_nome: admin?.nome ?? '', admin_foto: admin?.foto_url ?? null }
        }
        return { ...c, [campo]: valor }
      })
    )
  }

  function adicionar() {
    setContatos((prev) => [...prev, contatoVazio()])
  }

  function remover(key: string) {
    setContatos((prev) => prev.filter((c) => c._key !== key))
  }

  // Serializa para envio como campo hidden no form
  const json = JSON.stringify(contatos.map(({ _key, ...rest }) => rest))

  return (
    <div className="space-y-4">
      <input type="hidden" name="contatos" value={json} />

      {contatos.length === 0 && (
        <div className="text-center py-8 border border-dashed border-gray-700 rounded-xl">
          <p className="text-sm text-gray-500">Nenhum contato cadastrado ainda.</p>
          <p className="text-xs text-gray-600 mt-1">Adicione pelo menos um contato para facilitar o placement.</p>
        </div>
      )}

      {contatos.map((c, idx) => (
        <div key={c._key} className="relative bg-gray-800/60 border border-gray-700 rounded-2xl p-5 space-y-4">
          {/* Número + remover */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Contato {idx + 1}
            </span>
            <button
              type="button"
              onClick={() => remover(c._key)}
              className="text-xs text-gray-600 hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Remover
            </button>
          </div>

          {/* Nome + Função */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Nome <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={c.nome}
                onChange={(e) => atualizar(c._key, 'nome', e.target.value)}
                placeholder="ex: João da Silva"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Função no veículo</label>
              <input
                type="text"
                value={c.funcao}
                onChange={(e) => atualizar(c._key, 'funcao', e.target.value)}
                placeholder="ex: Editor de opinião, Repórter de política"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
            </div>
          </div>

          {/* Email + WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">E-mail</label>
              <input
                type="email"
                value={c.email}
                onChange={(e) => atualizar(c._key, 'email', e.target.value)}
                placeholder="email@veiculo.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">WhatsApp</label>
              <input
                type="text"
                value={c.whatsapp}
                onChange={(e) => atualizar(c._key, 'whatsapp', e.target.value)}
                placeholder="+55 11 9 0000-0000"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
            </div>
          </div>

          {/* Admin responsável */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">
              Admin responsável <span className="text-red-400">*</span>
              <span className="ml-1 font-normal text-gray-600">— quem faz a ponte com este contato</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {admins.map((admin) => (
                <label key={admin.id} className="cursor-pointer">
                  <input
                    type="radio"
                    name={`admin_responsavel_${c._key}`}
                    value={admin.id}
                    checked={c.admin_id === admin.id}
                    onChange={() => atualizar(c._key, 'admin_id', admin.id)}
                    className="sr-only peer"
                  />
                  <div className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-700 bg-gray-800/50 peer-checked:bg-emerald-500/10 peer-checked:border-emerald-500/40 transition-all">
                    {admin.foto_url ? (
                      <img src={admin.foto_url} alt={admin.nome} className="w-7 h-7 rounded-full object-cover border border-gray-600 flex-shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-400 text-xs font-bold">{admin.nome.charAt(0)}</span>
                      </div>
                    )}
                    <span className="text-xs font-medium text-gray-300 leading-tight">{admin.nome.split(' ')[0]}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Botão adicionar */}
      <button
        type="button"
        onClick={adicionar}
        className="w-full flex items-center justify-center gap-2 border border-dashed border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 text-sm font-medium py-3 rounded-2xl transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Adicionar contato
      </button>
    </div>
  )
}
