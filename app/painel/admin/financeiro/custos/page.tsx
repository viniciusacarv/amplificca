// app/painel/admin/financeiro/custos/page.tsx
// Aba dedicada de Custos: Visão Simples (lista) + Visão Mensal (matriz cat × mês).

import { createClient } from '@/lib/supabase-server'
import VisaoSimples from './components/VisaoSimples'
import VisaoMensal from './components/VisaoMensal'
import Link from 'next/link'

export default async function CustosPage({
  searchParams,
}: {
  searchParams: { view?: string; ano?: string; categoria?: string; projeto?: string }
}) {
  const supabase = createClient()
  const view = searchParams.view === 'mensal' ? 'mensal' : 'simples'
  const ano = searchParams.ano && /^\d{4}$/.test(searchParams.ano) ? Number(searchParams.ano) : new Date().getFullYear()

  const inicioAno = `${ano}-01-01`
  const fimAno = `${ano}-12-31`

  const [despesasRes, categoriasRes] = await Promise.all([
    supabase.from('financeiro_despesas')
      .select('id, categoria, descricao, fornecedor, valor, data, projeto, categoria_id')
      .gte('data', inicioAno).lte('data', fimAno)
      .order('data', { ascending: false }),
    supabase.from('financeiro_categorias').select('id, nome, tipo').eq('tipo', 'despesa').order('nome'),
  ])

  const despesas: any[] = despesasRes.data ?? []
  const categorias: any[] = categoriasRes.data ?? []

  const filtroCat = searchParams.categoria ?? ''
  const filtroProj = searchParams.projeto ?? ''
  const despesasFiltradas = despesas.filter((d) => {
    if (filtroCat && d.categoria !== filtroCat) return false
    if (filtroProj && d.projeto !== filtroProj) return false
    return true
  })

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Custos</h1>
          <p className="text-sm text-gray-400">Despesas do Instituto no ano de {ano}.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/painel/admin/financeiro/custos?view=simples&ano=${ano}`}
            className={`px-3 py-1.5 rounded-lg text-sm border ${view === 'simples' ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200'}`}
          >
            Visão Simples
          </Link>
          <Link
            href={`/painel/admin/financeiro/custos?view=mensal&ano=${ano}`}
            className={`px-3 py-1.5 rounded-lg text-sm border ${view === 'mensal' ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200'}`}
          >
            Visão Mensal
          </Link>
          <form>
            <input type="hidden" name="view" value={view} />
            <select name="ano" defaultValue={ano} className="rounded-lg bg-gray-900 border border-gray-800 px-3 py-1.5 text-sm text-gray-200">
              {[ano - 1, ano, ano + 1].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </form>
        </div>
      </header>

      {view === 'simples' ? (
        <VisaoSimples despesas={despesasFiltradas} categorias={categorias} ano={ano} filtroCat={filtroCat} filtroProj={filtroProj} />
      ) : (
        <VisaoMensal despesas={despesas} ano={ano} />
      )}
    </div>
  )
}
