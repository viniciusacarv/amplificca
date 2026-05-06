// Módulo de Patrocínios e Doações — CRM financeiro do Instituto Amplifica.

import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import ParceirosTab from './components/ParceirosTab'
import ReceitasTab from './components/ReceitasTab'
import VisaoMensalPatrocinios from './components/VisaoMensalPatrocinios'
import ExportarPatrocinios from './components/ExportarPatrocinios'

const TABS = [
  { key: 'parceiros', label: 'Parceiros e Doadores' },
  { key: 'receitas',  label: 'Lançamentos' },
  { key: 'mensal',    label: 'Visão Mensal' },
]

export default async function PatrociniosPage({
  searchParams,
}: {
  searchParams: { tab?: string; mes?: string; ano?: string }
}) {
  const supabase = createClient()
  const tab = TABS.some((t) => t.key === searchParams.tab) ? searchParams.tab! : 'parceiros'
  const ano = searchParams.ano && /^\d{4}$/.test(searchParams.ano) ? Number(searchParams.ano) : new Date().getFullYear()
  const mesAtual = new Date().getMonth() + 1
  const mes = searchParams.mes && /^\d{1,2}$/.test(searchParams.mes) ? Number(searchParams.mes) : mesAtual

  const inicioAno = `${ano}-01-01`
  const fimAno    = `${ano}-12-31`

  const [parceirosRes, receitasRes, categoriasRes] = await Promise.all([
    supabase.from('parceiros_financeiros').select('*').order('nome'),
    supabase
      .from('financeiro_receitas_avulsas')
      .select('*, parceiros_financeiros(id, nome, tipo)')
      .in('tipo', ['doacao', 'patrocinio', 'parceria'])
      .gte('data', inicioAno)
      .lte('data', fimAno)
      .order('data', { ascending: false }),
    supabase.from('financeiro_categorias').select('id, nome, cor').eq('tipo', 'receita').order('nome'),
  ])

  const parceiros: any[] = parceirosRes.data ?? []
  const receitas:  any[] = receitasRes.data ?? []
  const categorias: any[] = categoriasRes.data ?? []

  const totalAno   = receitas.filter((r) => r.status_receita !== 'cancelado').reduce((s, r) => s + r.valor, 0)
  const totalPago  = receitas.filter((r) => r.status_receita === 'pago').reduce((s, r) => s + r.valor, 0)
  const totalPend  = receitas.filter((r) => r.status_receita === 'pendente').reduce((s, r) => s + r.valor, 0)
  const totalRecorr = receitas.filter((r) => r.recorrencia !== 'unica' && r.status_receita !== 'cancelado').reduce((s, r) => s + r.valor, 0)

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Patrocínios e Doações</h1>
          <p className="text-sm text-gray-400">CRM financeiro — {ano}</p>
        </div>
        <form className="flex items-center gap-2">
          <input type="hidden" name="tab" value={tab} />
          <select name="ano" defaultValue={ano} className="rounded-lg bg-gray-900 border border-gray-800 px-3 py-1.5 text-sm text-gray-200">
            {[ano - 1, ano, ano + 1].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button type="submit" className="px-3 py-1.5 rounded-lg bg-gray-800 text-sm text-gray-300 hover:bg-gray-700">
            Filtrar
          </button>
        </form>
        <ExportarPatrocinios receitas={receitas} parceiros={parceiros} ano={ano} />
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total no Ano',     value: fmt(totalAno),    cor: 'text-white' },
          { label: 'Recebido',         value: fmt(totalPago),   cor: 'text-emerald-400' },
          { label: 'Pendente',         value: fmt(totalPend),   cor: 'text-amber-400' },
          { label: 'Recorrente',       value: fmt(totalRecorr), cor: 'text-blue-400' },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
            <p className="text-xs text-gray-500 mb-1">{k.label}</p>
            <p className={`text-xl font-semibold ${k.cor}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/painel/admin/financeiro/patrocinios?tab=${t.key}&ano=${ano}`}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === 'parceiros' && <ParceirosTab parceiros={parceiros} receitas={receitas} />}
      {tab === 'receitas'  && <ReceitasTab  receitas={receitas} parceiros={parceiros} categorias={categorias} ano={ano} />}
      {tab === 'mensal'    && <VisaoMensalPatrocinios receitas={receitas} ano={ano} mes={mes} />}
    </div>
  )
}
