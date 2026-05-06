// Visão mensal de patrocínios e doações — server component, recebe dados da page.

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

type Receita = {
  id: number
  tipo: string
  descricao: string
  valor: number
  data: string
  status_receita: string | null
  recorrencia: string | null
  parceiro_id: number | null
  projeto: string | null
  mes_referencia: string | null
  parceiros_financeiros?: { id: number; nome: string; tipo: string } | null
}

function getMes(r: Receita): number {
  const ref = r.mes_referencia ?? r.data
  return new Date(ref + 'T00:00:00').getMonth() // 0-based
}

export default function VisaoMensalPatrocinios({
  receitas,
  ano,
  mes,
}: {
  receitas: Receita[]
  ano: number
  mes: number
}) {
  const ativas = receitas.filter((r) => r.status_receita !== 'cancelado')

  // Agrupa por mês
  const porMes = Array.from({ length: 12 }, (_, i) => {
    const do_mes = ativas.filter((r) => getMes(r) === i)
    return {
      mes: i,
      total:     do_mes.reduce((s, r) => s + r.valor, 0),
      pagas:     do_mes.filter((r) => r.status_receita === 'pago').reduce((s, r) => s + r.valor, 0),
      pendentes: do_mes.filter((r) => r.status_receita === 'pendente').reduce((s, r) => s + r.valor, 0),
      recorrentes: do_mes.filter((r) => r.recorrencia !== 'unica').reduce((s, r) => s + r.valor, 0),
      qtd: do_mes.length,
    }
  })

  const mesSelecionado = mes - 1 // converte para 0-based
  const receitasMes = ativas.filter((r) => getMes(r) === mesSelecionado)
  const maxTotal = Math.max(...porMes.map((m) => m.total), 1)

  // Por parceiro no mês selecionado
  const porParceiro: Record<string, { nome: string; total: number }> = {}
  for (const r of receitasMes) {
    const nome = r.parceiros_financeiros?.nome ?? r.projeto ?? 'Sem parceiro'
    if (!porParceiro[nome]) porParceiro[nome] = { nome, total: 0 }
    porParceiro[nome].total += r.valor
  }
  const rankingParceiros = Object.values(porParceiro).sort((a, b) => b.total - a.total)

  // Por tipo no mês selecionado
  const porTipo: Record<string, number> = {}
  for (const r of receitasMes) {
    porTipo[r.tipo] = (porTipo[r.tipo] ?? 0) + r.valor
  }

  const TIPO_LABELS: Record<string, string> = {
    doacao: 'Doação', patrocinio: 'Patrocínio', parceria: 'Parceria', produto: 'Produto', outro: 'Outro',
  }

  return (
    <div className="space-y-6">
      {/* Gráfico de barras anual */}
      <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Receitas mensais — {ano}</h3>
        <div className="flex items-end gap-1.5 h-32">
          {porMes.map((m) => (
            <div key={m.mes} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col justify-end" style={{ height: '100px' }}>
                <div
                  className={`w-full rounded-t-sm transition-all ${m.mes === mesSelecionado ? 'bg-amber-500' : 'bg-emerald-600/60'}`}
                  style={{ height: `${Math.max(4, (m.total / maxTotal) * 100)}%` }}
                  title={fmt(m.total)}
                />
              </div>
              <span className="text-xs text-gray-500">{MESES[m.mes]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* KPIs do mês selecionado */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: `Total ${MESES[mesSelecionado]}`,  value: fmt(porMes[mesSelecionado].total),      cor: 'text-white' },
          { label: 'Recebido',                         value: fmt(porMes[mesSelecionado].pagas),      cor: 'text-emerald-400' },
          { label: 'Pendente',                         value: fmt(porMes[mesSelecionado].pendentes),  cor: 'text-amber-400' },
          { label: 'Recorrente',                       value: fmt(porMes[mesSelecionado].recorrentes), cor: 'text-blue-400' },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
            <p className="text-xs text-gray-500 mb-1">{k.label}</p>
            <p className={`text-xl font-semibold ${k.cor}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Por parceiro */}
        <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Por parceiro — {MESES[mesSelecionado]}</h3>
          {rankingParceiros.length === 0
            ? <p className="text-xs text-gray-500">Nenhum lançamento neste mês.</p>
            : (
              <ul className="space-y-2">
                {rankingParceiros.map((p) => (
                  <li key={p.nome} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300 truncate">{p.nome}</span>
                    <span className="text-white font-medium">{fmt(p.total)}</span>
                  </li>
                ))}
              </ul>
            )}
        </section>

        {/* Por tipo */}
        <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Por tipo — {MESES[mesSelecionado]}</h3>
          {Object.keys(porTipo).length === 0
            ? <p className="text-xs text-gray-500">Nenhum lançamento neste mês.</p>
            : (
              <ul className="space-y-2">
                {Object.entries(porTipo).sort((a, b) => b[1] - a[1]).map(([tipo, total]) => (
                  <li key={tipo} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{TIPO_LABELS[tipo] ?? tipo}</span>
                    <span className="text-white font-medium">{fmt(total)}</span>
                  </li>
                ))}
              </ul>
            )}
        </section>
      </div>

      {/* Lista de lançamentos do mês */}
      <section className="rounded-2xl border border-gray-800 bg-gray-900/60">
        <div className="px-5 py-4 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-white">
            Lançamentos de {MESES[mesSelecionado]}/{ano}
          </h3>
          <p className="text-xs text-gray-500">{receitasMes.length} registro(s)</p>
        </div>
        <ul className="divide-y divide-gray-800 px-5">
          {receitasMes.length === 0 && (
            <li className="py-8 text-center text-sm text-gray-500">Nenhum lançamento neste mês.</li>
          )}
          {receitasMes.map((r) => (
            <li key={r.id} className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-gray-200 truncate">{r.descricao}</p>
                <div className="flex gap-2 text-xs text-gray-500 mt-0.5">
                  <span>{new Date(r.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                  <span>{TIPO_LABELS[r.tipo] ?? r.tipo}</span>
                  {r.parceiros_financeiros && <span>📌 {r.parceiros_financeiros.nome}</span>}
                  {r.recorrencia !== 'unica' && <span className="text-blue-400">{r.recorrencia}</span>}
                </div>
              </div>
              <span className={`text-sm font-semibold ${r.status_receita === 'cancelado' ? 'text-gray-500 line-through' : 'text-white'}`}>
                {fmt(r.valor)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
