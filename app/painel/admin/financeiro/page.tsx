// app/painel/admin/financeiro/page.tsx
// Dashboard financeiro do Instituto Amplifica.
// Visual inspirado em Horizon UI, em Tailwind, alinhado ao painel admin atual.

import { createClient } from '@/lib/supabase-server'
import SummaryCards from './components/SummaryCards'
import FluxoChart from './components/FluxoChart'
import BreakdownChart from './components/BreakdownChart'
import FellowsTable from './components/FellowsTable'
import LancamentosPanel from './components/LancamentosPanel'
import FiltrosBar from './components/FiltrosBar'
import { gerarCobrancasMes } from './actions'

const VALOR_MENSALIDADE = 300

type Fellow = {
  id: number
  nome: string
  email: string | null
  area: string | null
  estado: string | null
  tipo_financiamento: 'autofinanciado' | 'bolsista' | null
  bolsa_origem: string | null
  foto_url: string | null
}

type Cobranca = {
  id: number
  fellow_id: number
  mes_referencia: string
  valor: number
  status: 'pendente' | 'pago' | 'inadimplente'
  data_pagamento: string | null
}

type Receita = {
  id: number
  tipo: 'doacao' | 'patrocinio' | 'produto' | 'outro'
  descricao: string
  origem: string | null
  valor: number
  data: string
  projeto: string | null
}

type Despesa = {
  id: number
  categoria: string
  descricao: string
  fornecedor: string | null
  valor: number
  data: string
  projeto: string | null
}

function mesAtual() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function inicioFimMes(mes: string) {
  const [y, m] = mes.split('-').map(Number)
  const inicio = new Date(Date.UTC(y, m - 1, 1))
  const fim = new Date(Date.UTC(y, m, 0))
  return {
    inicio: inicio.toISOString().slice(0, 10),
    fim: fim.toISOString().slice(0, 10),
  }
}

function ultimosNMeses(n: number) {
  const out: string[] = []
  const d = new Date()
  d.setUTCDate(1)
  for (let i = n - 1; i >= 0; i--) {
    const dd = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1))
    out.push(`${dd.getUTCFullYear()}-${String(dd.getUTCMonth() + 1).padStart(2, '0')}`)
  }
  return out
}

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: { mes?: string; tipo?: string; status?: string; projeto?: string }
}) {
  const supabase = createClient()

  const mes = searchParams.mes && /^\d{4}-\d{2}$/.test(searchParams.mes) ? searchParams.mes : mesAtual()
  const { inicio, fim } = inicioFimMes(mes)

  const [fellowsRes, cobrancasMesRes, cobrancasAnoRes, receitasMesRes, receitasAnoRes, despesasMesRes, despesasAnoRes] =
    await Promise.all([
      supabase
        .from('fellows')
        .select('id, nome, email, area, estado, tipo_financiamento, bolsa_origem, foto_url')
        .order('nome'),
      supabase
        .from('financeiro_cobrancas')
        .select('id, fellow_id, mes_referencia, valor, status, data_pagamento')
        .eq('mes_referencia', `${mes}-01`),
      supabase
        .from('financeiro_cobrancas')
        .select('id, fellow_id, mes_referencia, valor, status, data_pagamento')
        .gte('mes_referencia', `${ultimosNMeses(12)[0]}-01`),
      supabase
        .from('financeiro_receitas_avulsas')
        .select('id, tipo, descricao, origem, valor, data, projeto')
        .gte('data', inicio).lte('data', fim).order('data', { ascending: false }),
      supabase
        .from('financeiro_receitas_avulsas')
        .select('valor, data, tipo')
        .gte('data', `${ultimosNMeses(12)[0]}-01`),
      supabase
        .from('financeiro_despesas')
        .select('id, categoria, descricao, fornecedor, valor, data, projeto')
        .gte('data', inicio).lte('data', fim).order('data', { ascending: false }),
      supabase
        .from('financeiro_despesas')
        .select('valor, data, categoria')
        .gte('data', `${ultimosNMeses(12)[0]}-01`),
    ])

  const fellows = (fellowsRes.data ?? []) as Fellow[]
  const cobrancasMes = (cobrancasMesRes.data ?? []) as Cobranca[]
  const cobrancasAno = (cobrancasAnoRes.data ?? []) as Cobranca[]
  const receitasMes = (receitasMesRes.data ?? []) as Receita[]
  const receitasAno = (receitasAnoRes.data ?? []) as { valor: number; data: string; tipo: string }[]
  const despesasMes = (despesasMesRes.data ?? []) as Despesa[]
  const despesasAno = (despesasAnoRes.data ?? []) as { valor: number; data: string; categoria: string }[]

  // Aggregados do mês
  const recMensalidades = cobrancasMes.filter((c) => c.status === 'pago').reduce((s, c) => s + Number(c.valor), 0)
  const recAvulsas = receitasMes.reduce((s, r) => s + Number(r.valor), 0)
  const totalReceitaMes = recMensalidades + recAvulsas
  const totalDespesaMes = despesasMes.reduce((s, d) => s + Number(d.valor), 0)
  const saldoMes = totalReceitaMes - totalDespesaMes
  const cobrancasInad = cobrancasMes.filter((c) => c.status === 'inadimplente')
  const cobrancasPend = cobrancasMes.filter((c) => c.status === 'pendente')
  const valorInadimplente = cobrancasInad.reduce((s, c) => s + Number(c.valor), 0)

  // Série dos últimos 12 meses
  const meses12 = ultimosNMeses(12)
  const serieReceita = meses12.map((m) => {
    const cobr = cobrancasAno
      .filter((c) => c.mes_referencia.startsWith(m) && c.status === 'pago')
      .reduce((s, c) => s + Number(c.valor), 0)
    const av = receitasAno
      .filter((r) => r.data.startsWith(m))
      .reduce((s, r) => s + Number(r.valor), 0)
    return { mes: m, valor: cobr + av }
  })
  const serieDespesa = meses12.map((m) => ({
    mes: m,
    valor: despesasAno.filter((d) => d.data.startsWith(m)).reduce((s, d) => s + Number(d.valor), 0),
  }))

  // Breakdown de receita do mês por fonte
  const breakdown = [
    { label: 'Mensalidades', valor: recMensalidades, color: '#f59e0b' },
    {
      label: 'Doações',
      valor: receitasMes.filter((r) => r.tipo === 'doacao').reduce((s, r) => s + Number(r.valor), 0),
      color: '#10b981',
    },
    {
      label: 'Patrocínios',
      valor: receitasMes.filter((r) => r.tipo === 'patrocinio').reduce((s, r) => s + Number(r.valor), 0),
      color: '#3b82f6',
    },
    {
      label: 'Produtos',
      valor: receitasMes.filter((r) => r.tipo === 'produto').reduce((s, r) => s + Number(r.valor), 0),
      color: '#a855f7',
    },
    {
      label: 'Outros',
      valor: receitasMes.filter((r) => r.tipo === 'outro').reduce((s, r) => s + Number(r.valor), 0),
      color: '#64748b',
    },
  ].filter((b) => b.valor > 0)

  // Tabela de fellows com cobrança do mês
  const cobrancaPorFellow = new Map<number, Cobranca>()
  cobrancasMes.forEach((c) => cobrancaPorFellow.set(c.fellow_id, c))

  const tipoFiltro = searchParams.tipo ?? ''
  const statusFiltro = searchParams.status ?? ''

  const fellowsFiltrados = fellows.filter((f) => {
    if (tipoFiltro === 'autofinanciado' && f.tipo_financiamento !== 'autofinanciado') return false
    if (tipoFiltro === 'bolsista' && f.tipo_financiamento !== 'bolsista') return false
    if (statusFiltro) {
      const c = cobrancaPorFellow.get(f.id)
      if (statusFiltro === 'sem_cobranca' ? c : c?.status !== statusFiltro) return false
    }
    return true
  })

  const totalAutofinanciados = fellows.filter((f) => f.tipo_financiamento === 'autofinanciado').length
  const cobrancasGeradasNoMes = cobrancasMes.length

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Financeiro</h1>
          <p className="text-sm text-gray-400">
            Receitas, cobranças, inadimplência e despesas do Instituto Amplifica.
          </p>
        </div>
        <FiltrosBar mes={mes} tipo={tipoFiltro} status={statusFiltro} />
      </header>

      <SummaryCards
        receita={totalReceitaMes}
        despesa={totalDespesaMes}
        saldo={saldoMes}
        inadimplencia={valorInadimplente}
        qtdInadimplentes={cobrancasInad.length}
        qtdPendentes={cobrancasPend.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <FluxoChart serieReceita={serieReceita} serieDespesa={serieDespesa} />
        </div>
        <BreakdownChart items={breakdown} total={totalReceitaMes} />
      </div>

      {cobrancasGeradasNoMes < totalAutofinanciados && (
        <form
          action={gerarCobrancasMes}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4"
        >
          <div className="text-sm text-amber-200">
            <strong>Cobranças do mês ainda não geradas</strong> — {cobrancasGeradasNoMes} de{' '}
            {totalAutofinanciados} fellows autofinanciados. Clique para gerar (R$ {VALOR_MENSALIDADE} por fellow).
          </div>
          <input type="hidden" name="mes" value={mes} />
          <button
            type="submit"
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-amber-400"
          >
            Gerar cobranças de {mes}
          </button>
        </form>
      )}

      <FellowsTable
        fellows={fellowsFiltrados}
        cobrancaPorFellow={Object.fromEntries(cobrancaPorFellow.entries())}
        mes={mes}
      />

      <LancamentosPanel receitas={receitasMes} despesas={despesasMes} mes={mes} />
    </div>
  )
}
