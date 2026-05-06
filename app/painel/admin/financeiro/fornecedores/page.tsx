// CRUD de fornecedores.

import { createClient } from '@/lib/supabase-server'
import { criarFornecedor, editarFornecedor, excluirFornecedor } from '../actions'
import FormWithFeedback, { SubmitButton } from '../components/FormWithFeedback'
import ConfirmAction from '../components/ConfirmAction'
import EditableRow from '../components/EditableRow'
import { Phone, Mail, Building2 } from 'lucide-react'

const inputCls = 'rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-gray-200'

export default async function FornecedoresPage() {
  const supabase = createClient()
  const { data: fornecedores = [] } = await supabase.from('fornecedores').select('*').order('nome')

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">Fornecedores</h1>
        <p className="text-sm text-gray-400">Cadastro de fornecedores e parceiros.</p>
      </header>

      <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Novo fornecedor</h3>
        <FormWithFeedback action={criarFornecedor} resetOnSuccess>
          <div className="grid grid-cols-2 gap-2">
            <input name="nome" placeholder="Nome do fornecedor" required className={`col-span-2 sm:col-span-1 ${inputCls}`} />
            <select name="tipo" defaultValue="fornecedor" className={`col-span-2 sm:col-span-1 ${inputCls}`}>
              <option value="fornecedor">Fornecedor</option>
              <option value="parceiro">Parceiro</option>
              <option value="cliente">Cliente</option>
              <option value="outro">Outro</option>
            </select>
            <input name="contato_nome" placeholder="Pessoa de contato (opcional)" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
            <input name="contato_email" type="email" placeholder="E-mail (opcional)" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
            <input name="contato_whatsapp" placeholder="WhatsApp (opcional)" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
            <input name="observacao" placeholder="Observação" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
            <SubmitButton>Adicionar fornecedor</SubmitButton>
          </div>
        </FormWithFeedback>
      </section>

      <section className="rounded-2xl border border-gray-800 bg-gray-900/60">
        <div className="px-5 py-4 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-white">Cadastrados</h3>
          <p className="text-xs text-gray-500">{fornecedores?.length ?? 0} registro(s)</p>
        </div>
        <ul className="divide-y divide-gray-800 px-5">
          {(!fornecedores || fornecedores.length === 0) && <li className="py-10 text-center text-sm text-gray-500">Nenhum fornecedor cadastrado.</li>}
          {fornecedores?.map((f: any) => (
            <EditableRow
              key={f.id}
              summary={
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate inline-flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500" /> {f.nome}
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{f.tipo}</span>
                      {!f.ativo && <span className="text-xs px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400">inativo</span>}
                    </p>
                    <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-gray-500">
                      {f.contato_nome && <span>{f.contato_nome}</span>}
                      {f.contato_email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{f.contato_email}</span>}
                      {f.contato_whatsapp && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{f.contato_whatsapp}</span>}
                    </div>
                    {f.observacao && <p className="text-xs text-gray-400 mt-1">{f.observacao}</p>}
                  </div>
                </div>
              }
              editForm={
                <FormWithFeedback action={editarFornecedor}>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="hidden" name="id" value={f.id} />
                    <input name="nome" defaultValue={f.nome} required className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                    <select name="tipo" defaultValue={f.tipo} className={`col-span-2 sm:col-span-1 ${inputCls}`}>
                      <option value="fornecedor">Fornecedor</option>
                      <option value="parceiro">Parceiro</option>
                      <option value="cliente">Cliente</option>
                      <option value="outro">Outro</option>
                    </select>
                    <input name="contato_nome" defaultValue={f.contato_nome ?? ''} placeholder="Contato" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                    <input name="contato_email" defaultValue={f.contato_email ?? ''} placeholder="E-mail" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                    <input name="contato_whatsapp" defaultValue={f.contato_whatsapp ?? ''} placeholder="WhatsApp" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                    <input name="observacao" defaultValue={f.observacao ?? ''} placeholder="Observação" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
                    <label className="col-span-2 inline-flex items-center gap-2 text-xs text-gray-400">
                      <input type="checkbox" name="ativo" defaultChecked={f.ativo} className="accent-amber-500" /> Ativo
                    </label>
                    <SubmitButton>Salvar alterações</SubmitButton>
                  </div>
                </FormWithFeedback>
              }
              onDelete={
                <ConfirmAction action={excluirFornecedor} hidden={{ id: f.id }} label="🗑" message="Excluir?" className="p-1 text-gray-500 hover:text-rose-400" />
              }
            />
          ))}
        </ul>
      </section>
    </div>
  )
}
