// Matriz categoria × mês para o ano selecionado, estilo "Breakdown por Projeto" do ERPVAC.

type Despesa = {
  id: number
  categoria: string
  valor: number
  data: string
}

function brl(n: number) {
  if (n === 0) return '—'
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export default function VisaoMensal({ despesas, ano }: { despesas: Despesa[]; ano: number }) {
  const mesAtualIdx = new Date().getMonth()

  const matriz = new Map<string, number[]>()
  despesas.forEach((d) => {
    const [yyyy, mm] = d.data.split('-')
    if (Number(yyyy) !== ano) return
    const idx = Number(mm) - 1
    if (!matriz.has(d.categoria)) matriz.set(d.categoria, Array(12).fill(0))
    matriz.get(d.categoria)![idx] += Number(d.valor)
  })

  const totaisMes = Array(12).fill(0)
  matriz.forEach((arr) => arr.forEach((v, i) => (totaisMes[i] += v)))
  const totalAno = totaisMes.reduce((s, v) => s + v, 0)

  const linhas = Array.from(matriz.entries()).sort((a, b) => {
    const ta = a[1].reduce((s, v) => s + v, 0)
    const tb = b[1].reduce((s, v) => s + v, 0)
    return tb - ta
  })

  return (
    <section className="rounded-2xl border border-gray-800 bg-gray-900/60 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-white">Despesas por categoria — {ano}</h3>
        <p className="text-xs text-gray-500">Matriz mensal de custos. Use a Visão Simples para editar lançamentos individuais.</p>
      </div>

      {linhas.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-gray-500">Nenhuma despesa registrada em {ano}.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-900/40 text-gray-500 uppercase">
              <tr>
                <th className="text-left px-4 py-2 font-medium sticky left-0 bg-gray-900/40">Categoria</th>
                {MESES.map((m, i) => (
                  <th key={m} className={`text-right px-3 py-2 font-medium ${i === mesAtualIdx ? 'text-amber-400' : ''}`}>{m}</th>
                ))}
                <th className="text-right px-4 py-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {linhas.map(([cat, arr]) => {
                const total = arr.reduce((s, v) => s + v, 0)
                return (
                  <tr key={cat} className="hover:bg-gray-900/40">
                    <td className="px-4 py-2 text-gray-200 sticky left-0 bg-gray-900/60">{cat}</td>
                    {arr.map((v, i) => (
                      <td key={i} className={`text-right px-3 py-2 tabular-nums ${v ? 'text-rose-400' : 'text-gray-700'} ${i === mesAtualIdx ? 'bg-amber-500/5' : ''}`}>
                        {brl(v)}
                      </td>
                    ))}
                    <td className="text-right px-4 py-2 tabular-nums font-semibold text-rose-300">{brl(total)}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="bg-gray-900/40 font-semibold">
              <tr>
                <td className="px-4 py-2 text-gray-300 sticky left-0 bg-gray-900/40">TOTAL</td>
                {totaisMes.map((v, i) => (
                  <td key={i} className={`text-right px-3 py-2 tabular-nums text-rose-300 ${i === mesAtualIdx ? 'bg-amber-500/5' : ''}`}>{brl(v)}</td>
                ))}
                <td className="text-right px-4 py-2 tabular-nums text-rose-200">{brl(totalAno)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  )
}
