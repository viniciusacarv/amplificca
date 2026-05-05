// app/painel/admin/financeiro/page.tsx
// Dashboard financeiro do Instituto Amplifica.

import { createClient } from '@/lib/supabase-server'
import SummaryCards from './components/SummaryCards'
import FluxoChart from './components/FluxoChart'
import BreakdownChart from './components/BreakdownChart'
import FellowsTable from './components/FellowsTable'
import LancamentosPanel from './components/LancamentosPanel'
import FiltrosBar from './components/FiltrosBar'
import VisaoAnual from './components/VisaoAnual'
import ExportarMenu from './components/ExportarMenu'
import { gerarCobrancasMes } from './actions'

const VALOR_MENSALIDADE = 300

function mesAtual() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function inicioFimMes(mes: string) {
  const [y, m] = mes.split('-').map(Number)
  return {
    inicio: new Date(Date.UTC(y, m - 1, 1)).toISOString().slice(0, 10),
    fim: new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10),
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
  searchParams: { mes?: string; tipo?: string; status?: string }
}) {
  const supabase = createClient()

  const mes = searchParams.mes && /^\d{4}-\d{2}$/.test(searchParams.mes) ? searchParams.mes : mesAtual()
  const { inicio, fim } = inicioFimMes(mes)
  const meses12 = ultimosNMeses(12)
  const inicio12 = `${meses12[0]}-01`
  const inicioAno = `${new Date().getFullYear()}-01-01`

  const [fellowsRes, turmasRes, configRes, categoriasRes,
    cobrancasMesRes, cobrancasAnoRes,
    receitasMesRes, receitasAnoRes,
    despesasMesRes, despesasAnoRes] = await Promise.all([
    supabase.from('fellows').select('id, nome, email, whatsapp, area, estado, tipo_financiamento, bolsa_origem, foto_url, turma_id, contrato_ativo, contrato_encerrado_em').order('nome'),
    supabase.from('turmas').select('id, nome').order('data_inicio'),
    supabase.from('financeiro_config').select('*').eq('id', 1).maybeSingle(),
    supabase.from('financeiro_categorias').select('id, nome, tipo').order('nome'),
    supabase.from('financeiro_cobrancas').select('id, fellow_id, mes_referencia, valor, status, data_pagamento').eq('mes_referencia', `${mes}-01`),
    supabase.from('financeiro_cobrancas').select('id, fellow_id, mes_referencia, valor, status, data_pagamento').gte('mes_referencia', inicio12),
    supabase.from('financeiro_receitas_avulsas').select('id, tipo, descricao, origem, valor, data, projeto, categoria_id').gte('data', inicio).lte('data', fim).order('data', { ascending: false }),
    supabase.from('financeiro_receitas_avulsas').select('valor, data, tipo').gte('data', inicio12),
    supabase.from('financeiro_despesas').select('id, categoria, descricao, fornecedor, valor, data, projeto, categoria_id').gte('data', inicio).lte('data', fim).order('data', { ascending: false }),
    supabase.from('financeiro_despesas').select('valor, data, categoria').gte('data', inicio12),
  ])

  const fellows: any[] = fellowsRes.data ?? []
  const turmas: any[] = turmasRes.data ?? []
  const config: any = configRes.data ?? null
  const categorias: any[] = categoriasRes.data ?? []
  const cobrancasMes: any[] = cobrancasMesRes.data ?? []
  const cobrancasAno: any[] = cobrancasAnoRes.data ?? []
  const receitasMes: any[] = receitasMesRes.data ?? []
  const receitasAno: any[] = receitasAnoRes.data ?? []
  const despesasMes: any[] = despesasMesRes.data ?? []
  const despesasAno: any[] = despesasAnoRes.data ?? []

  const recMensalidades = cobrancasMes.filter((c) => c.status === 'pago').reduce((s, c) => s + Number(c.valor), 0)
  const recAvulsas = receitasMes.reduce((s, r) => s + Number(r.valor), 0)
  const totalReceitaMes = recMensalidades + recAvulsas
  const totalDespesaMes = despesasMes.reduce((s, d) => s + Number(d.valor), 0)
  const saldoMes = totalReceitaMes - totalDespesaMes
  const cobrancasInad = cobrancasMes.filter((c) => c.status === 'inadimplente')
  const cobrancasPend = cobrancasMes.filter((c) => c.status === 'pendente')
  const valorInadimplente = cobrancasInad.reduce((s, c) => s + Number(c.valor), 0)

  const serieReceita = meses12.map((m) => {
    const cobr = cobrancasAno.filter((c) => c.mes_referencia.startsWith(m) && c.status === 'pago').reduce((s, c) => s + Number(c.valor), 0)
    const av = receitasAno.filter((r) => r.data.startsWith(m)).reduce((s, r) => s + Number(r.valor), 0)
    return { mes: m, valor: cobr + av }
  })
  const serieDespesa = meses12.map((m) => ({
    mes: m,
    valor: despesasAno.filter((d) => d.data.startsWith(m)).reduce((s, d) => s + Number(d.valor), 0),
  }))

  const breakdown = [
    { label: 'Mensalidades', valor: recMensalidades, color: '#f59e0b' },
    { label: 'Doações', valor: receitasMes.filter((r) => r.tipo === 'doacao').reduce((s, r) => s + Number(r.valor), 0), color: '#10b981' },
    { label: 'Patrocínios', valor: receitasMes.filter((r) => r.tipo === 'patrocinio').reduce((s, r) => s + Number(r.valor), 0), color: '#3b82f6' },
    { label: 'Produtos', valor: receitasMes.filter((r) => r.tipo === 'produto').reduce((s, r) => s + Number(r.valor), 0), color: '#a855f7' },
    { label: 'Outros', valor: receitasMes.filter((r) => r.tipo === 'outro').reduce((s, r) => s + Number(r.valor), 0), color: '#64748b' },
  ].filter((b) => b.valor > 0)

  const cobrancaPorFellow: Record<number, any> = {}
  cobrancasMes.forEach((c) => { cobrancaPorFellow[c.fellow_id] = c })

  const tipoFiltro = searchParams.tipo ?? ''
  const statusFiltro = searchParams.status ?? ''

  const fellowsFiltrados = fellows.filter((f) => {
    if (tipoFiltro === 'autofinanciado' && f.tipo_financiamento !== 'autofinanciado') return false
    if (tipoFiltro === 'bolsista' && f.tipo_financiamento !== 'bolsista') return false
    if (tipoFiltro === 'encerrado' && f.contrato_ativo) return false
    if (statusFiltro) {
      const c = cobrancaPorFellow[f.id]
      if (statusFiltro === 'sem_cobranca' ? c : c?.status !== statusFiltro) return false
    }
    return true
  })

  const totalAutofinanciadosAtivos = fellows.filter((f) => f.tipo_financiamento === 'autofinanciado' && f.contrato_ativo).length
  const cobrancasGeradasNoMes = cobrancasMes.length

  // Dados para export
  const fellowMap = new Map(fellows.map((f) => [f.id, f]))
  const cobrancasFlat = cobrancasMes.map((c) => {
    const f = fellowMap.get(c.fellow_id)
    return {
      fellow_nome: f?.nome ?? '?',
      fellow_email: f?.email ?? null,
      turma: turmas.find((t: any) => t.id === f?.turma_id)?.nome ?? null,
      tipo: f?.tipo_financiamento ?? 'autofinanciado',
      mes_referencia: c.mes_referencia,
      valor: Number(c.valor),
      status: c.status,
      data_pagamento: c.data_pagamento,
    }
  })
  const cobrancasAnoFlat = cobrancasAno.map((c) => {
    const f = fellowMap.get(c.fellow_id)
    return {
      fellow_nome: f?.nome ?? '?',
      fellow_email: f?.email ?? null,
      turma: turmas.find((t: any) => t.id === f?.turma_id)?.nome ?? null,
      tipo: f?.tipo_financiamento ?? 'autofinanciado',
      mes_referencia: c.mes_referencia,
      valor: Number(c.valor),
      status: c.status,
      data_pagamento: c.data_pagamento,
    }
  })
  const turmasParaRel = turmas.map((t: any) => {
    const fs = fellows.filter((f: any) => f.turma_id === t.id).map((f: any) => {
      const c = cobrancaPorFellow[f.id]
      return {
        nome: f.nome,
        tipo: f.tipo_financiamento === 'bolsista' ? 'Bolsista' : 'Autofinanciado',
        status: f.tipo_financiamento === 'bolsista' ? 'Bolsista' : c?.status ?? 'sem cobrança',
        valor: f.tipo_financiamento === 'bolsista' ? 0 : Number(c?.valor ?? 0),
      }
    })
    return { nome: t.nome, fellows: fs }
  })

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Financeiro</h1>
          <p className="text-sm text-gray-400">Receitas, cobranças, inadimplência e despesas do Instituto Amplifica.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FiltrosBar mes={mes} tipo={tipoFiltro} status={statusFiltro} />
          <ExportarMenu data={{
            mes,
            receita: totalReceitaMes,
            despesa: totalDespesaMes,
            saldo: saldoMes,
            inadimplencia: valorInadimplente,
            receitasMes: receitasMes.map((r) => ({ data: r.data, categoria: r.tipo, descricao: r.descricao, valor: Number(r.valor) })),
            despesasMes: despesasMes.map((d) => ({ data: d.data, categoria: d.categoria, descricao: d.descricao, valor: Number(d.valor) })),
            cobrancasMes: cobrancasFlat,
            cobrancasAno: cobrancasAnoFlat,
            receitasAno: receitasAno.map((r) => ({ data: r.data, categoria: r.tipo, descricao: '', valor: Number(r.valor) })),
            despesasAno: despesasAno.map((d) => ({ data: d.data, categoria: d.categoria, descricao: '', valor: Number(d.valor) })),
            turmas: turmasParaRel,
          }} />
        </div>
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
        <div className="lg:col-span-2"><FluxoChart serieReceita={serieReceita} serieDespesa={serieDespesa} /></div>
        <BreakdownChart items={breakdown} total={totalReceitaMes} />
      </div>

      <VisaoAnual serieReceita={serieReceita} serieDespesa={serieDespesa} />

      {cobrancasGeradasNoMes < totalAutofinanciadosAtivos && (
        <form action={gerarCobrancasMes} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="text-sm text-amber-200">
            <strong>Cobranças do mês ainda não geradas</strong> — {cobrancasGeradasNoMes} de {totalAutofinanciadosAtivos} fellows autofinanciados ativos. Clique para gerar (R$ {VALOR_MENSALIDADE} por fellow).
          </div>
          <input type="hidden" name="mes" value={mes} />
          <button type="submit" className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-amber-400">
            Gerar cobranças de {mes}
          </button>
        </form>
      )}

      <FellowsTable
        fellows={fellowsFiltrados}
        cobrancaPorFellow={cobrancaPorFellow}
        turmas={turmas}
        config={config}
        mes={mes}
      />

      <LancamentosPanel receitas={receitasMes} despesas={despesasMes} mes={mes} categorias={categorias} />
    </div>
  )
}
