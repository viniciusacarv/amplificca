// Visão anual: receita/despesa/saldo do ano corrente, ranking de meses.

type Serie = { mes: string; valor: number }

function brl(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export default function VisaoAnual({ serieReceita, serieDespesa }: { serieReceita: Serie[]; serieDespesa: Serie[] }) {
  const ano = new Date().getFullYear()
  const filtroAno = (s: Serie) => s.mes.startsWith(String(ano))
  const recAno = serieReceita.filter(filtroAno)
  const despAno = serieDespesa.filter(filtroAno)

  const totalRec = recAno.reduce((s, r) => s + r.valor, 0)
  const totalDesp = despAno.reduce((s, r) => s + r.valor, 0)
  const saldo = totalRec - totalDesp

  const dadosMes = recAno.map((r, i) => ({
    mes: r.mes,
    receita: r.valor,
    despesa: despAno[i]?.valor ?? 0,
    saldo: r.valor - (despAno[i]?.valor ?? 0),
  }))

  const ranking = [...dadosMes].sort((a, b) => b.receita - a.receita)

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
      <header className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Visão anual {ano}</h3>
          <p className="text-xs text-gray-500">Acumulado do ano corrente</p>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl bg-gray-950 border border-gray-800 px-4 py-3">
          <p className="text-xs text-gray-500 uppercase">Receita {ano}</p>
          <p className="text-lg font-semibold text-emerald-400 tabular-nums">{brl(totalRec)}</p>
        </div>
        <div className="rounded-xl bg-gray-950 border border-gray-800 px-4 py-3">
          <p className="text-xs text-gray-500 uppercase">Despesa {ano}</p>
          <p className="text-lg font-semibold text-rose-400 tabular-nums">{brl(totalDesp)}</p>
        </div>
        <div className="rounded-xl bg-gray-950 border border-gray-800 px-4 py-3">
          <p className="text-xs text-gray-500 uppercase">Saldo {ano}</p>
          <p className={`text-lg font-semibold tabular-nums ${saldo >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>{brl(saldo)}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-gray-500 uppercase">
            <tr>
              <th className="text-left py-2 px-2">Mês</th>
              <th className="text-right py-2 px-2">Receita</th>
              <th className="text-right py-2 px-2">Despesa</th>
              <th className="text-right py-2 px-2">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {dadosMes.map((d) => {
              const [, mm] = d.mes.split('-')
              return (
                <tr key={d.mes}>
                  <td className="py-2 px-2 text-gray-300">{MESES[Number(mm) - 1]}</td>
                  <td className="py-2 px-2 text-right text-emerald-400 tabular-nums">{brl(d.receita)}</td>
                  <td className="py-2 px-2 text-right text-rose-400 tabular-nums">{brl(d.despesa)}</td>
                  <td className={`py-2 px-2 text-right tabular-nums font-medium ${d.saldo >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {brl(d.saldo)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalRec > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-1">Top meses por receita</p>
          <div className="flex flex-wrap gap-1.5">
            {ranking.slice(0, 3).filter((r) => r.receita > 0).map((r, i) => {
              const [, mm] = r.mes.split('-')
              return (
                <span key={r.mes} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  #{i + 1} {MESES[Number(mm) - 1]} · {brl(r.receita)}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
