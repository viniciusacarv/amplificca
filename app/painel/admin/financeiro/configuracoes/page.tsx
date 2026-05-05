// app/painel/admin/financeiro/configuracoes/page.tsx
// PIX, beneficiário, banco, prazo, instruções e mensagem-modelo de WhatsApp.

import { createClient } from '@/lib/supabase-server'
import { salvarConfig, criarCategoria, excluirCategoria } from '../actions'
import ConfirmAction from '../components/ConfirmAction'

const inputCls = 'rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-gray-200 w-full'

const TEMPLATE_PADRAO = `Oi {nome}! 👋

Lembrete amigável da mensalidade do Amplifica referente a {mes_extenso}, no valor de R$ {valor}.

📌 Pague via PIX para a chave: {pix_chave}
👤 Em nome de: {beneficiario}
📅 Prazo: até dia {prazo_dia} de {mes_extenso}.

Quando pagar, manda o comprovante por aqui pra gente baixar a cobrança. Qualquer dúvida estou à disposição.

Obrigada! 💚`

export default async function ConfiguracoesPage() {
  const supabase = createClient()

  const [configRes, categoriasRes] = await Promise.all([
    supabase.from('financeiro_config').select('*').eq('id', 1).maybeSingle(),
    supabase.from('financeiro_categorias').select('*').order('tipo').order('nome'),
  ])

  const config: any = configRes.data ?? {}
  const categorias: any[] = categoriasRes.data ?? []

  return (
    <div className="space-y-6 max-w-4xl">
      <header>
        <h1 className="text-2xl font-semibold text-white">Configurações</h1>
        <p className="text-sm text-gray-400">Dados de pagamento e mensagens-modelo usadas nas cobranças.</p>
      </header>

      <form action={salvarConfig} className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Dados de cobrança</h3>

        <div className="grid grid-cols-2 gap-3">
          <label className="col-span-2 sm:col-span-1">
            <span className="text-xs text-gray-400">Beneficiário (nome)</span>
            <input name="beneficiario" defaultValue={config.beneficiario ?? ''} className={inputCls} placeholder="Instituto Amplifica" />
          </label>
          <label className="col-span-2 sm:col-span-1">
            <span className="text-xs text-gray-400">Banco / instituição</span>
            <input name="banco" defaultValue={config.banco ?? ''} className={inputCls} placeholder="Ex: Banco do Brasil, Nubank, ..." />
          </label>
          <label className="col-span-2 sm:col-span-1">
            <span className="text-xs text-gray-400">Tipo da chave PIX</span>
            <select name="pix_tipo" defaultValue={config.pix_tipo ?? ''} className={inputCls}>
              <option value="">—</option>
              <option value="cpf">CPF</option>
              <option value="cnpj">CNPJ</option>
              <option value="email">E-mail</option>
              <option value="telefone">Telefone</option>
              <option value="aleatoria">Aleatória</option>
            </select>
          </label>
          <label className="col-span-2 sm:col-span-1">
            <span className="text-xs text-gray-400">Chave PIX</span>
            <input name="pix_chave" defaultValue={config.pix_chave ?? ''} className={inputCls} placeholder="Ex: 12.345.678/0001-90" />
          </label>
          <label className="col-span-2 sm:col-span-1">
            <span className="text-xs text-gray-400">Prazo de pagamento (dia do mês)</span>
            <input name="prazo_dia" type="number" min="1" max="28" defaultValue={config.prazo_dia ?? 10} className={inputCls} />
          </label>
        </div>

        <label className="block">
          <span className="text-xs text-gray-400">Instruções extras (opcional)</span>
          <textarea name="instrucoes" defaultValue={config.instrucoes ?? ''} rows={2} className={inputCls} placeholder="Ex: Após pagar, envie o comprovante para o e-mail X." />
        </label>

        <div>
          <span className="text-xs text-gray-400 block mb-1">
            Mensagem-modelo de cobrança (WhatsApp). Use os marcadores <code className="text-amber-400 text-xs">{'{nome}'}</code>, <code className="text-amber-400 text-xs">{'{valor}'}</code>, <code className="text-amber-400 text-xs">{'{mes_extenso}'}</code>, <code className="text-amber-400 text-xs">{'{pix_chave}'}</code>, <code className="text-amber-400 text-xs">{'{beneficiario}'}</code>, <code className="text-amber-400 text-xs">{'{prazo_dia}'}</code>.
          </span>
          <textarea name="whatsapp_template" defaultValue={config.whatsapp_template ?? TEMPLATE_PADRAO} rows={10} className={`${inputCls} font-mono text-xs`} />
        </div>

        <button type="submit" className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-amber-400">
          Salvar configurações
        </button>
      </form>

      <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Categorias</h3>
        <p className="text-xs text-gray-500 mb-4">Catálogo de categorias para receitas e despesas. Excluir não remove lançamentos antigos.</p>

        <form action={criarCategoria} className="grid grid-cols-3 gap-2 mb-4">
          <input name="nome" placeholder="Nome da categoria" required className={`col-span-3 sm:col-span-1 ${inputCls}`} />
          <select name="tipo" required className={`col-span-3 sm:col-span-1 ${inputCls}`}>
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </select>
          <input name="cor" type="color" defaultValue="#64748b" className="col-span-1 h-10 rounded-lg bg-gray-950 border border-gray-800" />
          <button type="submit" className="col-span-3 sm:col-span-3 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-gray-950">
            Adicionar categoria
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(['receita', 'despesa'] as const).map((tipo) => (
            <div key={tipo}>
              <h4 className="text-xs uppercase text-gray-500 mb-2">{tipo === 'receita' ? 'Receitas' : 'Despesas'}</h4>
              <ul className="space-y-1.5">
                {categorias.filter((c) => c.tipo === tipo).map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2 text-sm text-gray-300 px-3 py-1.5 rounded-lg bg-gray-950 border border-gray-800">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ background: c.cor ?? '#64748b' }} />
                      {c.nome}
                    </span>
                    <ConfirmAction
                      action={excluirCategoria}
                      hidden={{ id: c.id }}
                      label="🗑"
                      message="Excluir?"
                      className="text-xs text-gray-500 hover:text-rose-400"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
