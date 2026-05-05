'use client'
// Botão "Exportar" com menu — gera PDF/XLSX no cliente (libs lazy-loaded).

import { useState } from 'react'
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react'

type CobrancaFlat = {
  fellow_nome: string
  fellow_email: string | null
  turma: string | null
  tipo: string
  mes_referencia: string
  valor: number
  status: string
  data_pagamento: string | null
}

type Lancamento = {
  data: string
  categoria: string
  descricao: string
  valor: number
}

export type ExportData = {
  mes: string
  receita: number
  despesa: number
  saldo: number
  inadimplencia: number
  receitasMes: Lancamento[]
  despesasMes: Lancamento[]
  cobrancasMes: CobrancaFlat[]
  cobrancasAno: CobrancaFlat[]
  receitasAno: Lancamento[]
  despesasAno: Lancamento[]
  turmas: { nome: string; fellows: { nome: string; tipo: string; status: string; valor: number }[] }[]
}

function brl(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function mesExtenso(m: string) {
  const [y, mm] = m.split('-')
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  return `${meses[Number(mm) - 1]} de ${y}`
}

export default function ExportarMenu({ data }: { data: ExportData }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  async function exportPdfMensal() {
    setBusy('pdf-mensal')
    const { jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text('Instituto Amplifica — Resumo Financeiro', 14, 18)
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Referência: ${mesExtenso(data.mes)}`, 14, 26)

    autoTable(doc, {
      startY: 34,
      head: [['Indicador', 'Valor']],
      body: [
        ['Receita do mês', brl(data.receita)],
        ['Despesas do mês', brl(data.despesa)],
        ['Saldo do mês', brl(data.saldo)],
        ['Inadimplência', brl(data.inadimplencia)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11] },
    })

    if (data.cobrancasMes.length) {
      autoTable(doc, {
        head: [['Fellow', 'Tipo', 'Status', 'Valor', 'Pagto']],
        body: data.cobrancasMes.map((c) => [c.fellow_nome, c.tipo, c.status, brl(c.valor), c.data_pagamento ?? '—']),
        headStyles: { fillColor: [16, 185, 129] },
        theme: 'striped',
      })
    }

    if (data.receitasMes.length) {
      doc.addPage()
      doc.setFontSize(14); doc.setTextColor(0)
      doc.text('Receitas avulsas', 14, 18)
      autoTable(doc, {
        startY: 24,
        head: [['Data', 'Categoria', 'Descrição', 'Valor']],
        body: data.receitasMes.map((r) => [r.data, r.categoria, r.descricao, brl(r.valor)]),
        headStyles: { fillColor: [16, 185, 129] },
      })
    }

    if (data.despesasMes.length) {
      doc.addPage()
      doc.setFontSize(14); doc.setTextColor(0)
      doc.text('Despesas', 14, 18)
      autoTable(doc, {
        startY: 24,
        head: [['Data', 'Categoria', 'Descrição', 'Valor']],
        body: data.despesasMes.map((d) => [d.data, d.categoria, d.descricao, brl(d.valor)]),
        headStyles: { fillColor: [244, 63, 94] },
      })
    }

    doc.save(`amplifica-financeiro-${data.mes}.pdf`)
    setBusy(null); setOpen(false)
  }

  async function exportXlsxCobrancas() {
    setBusy('xlsx-cobrancas')
    const XLSX = await import('xlsx')
    const rows = data.cobrancasMes.map((c) => ({
      Fellow: c.fellow_nome,
      Email: c.fellow_email ?? '',
      Turma: c.turma ?? '',
      Tipo: c.tipo,
      Mês: c.mes_referencia,
      Valor: Number(c.valor),
      Status: c.status,
      'Data Pagamento': c.data_pagamento ?? '',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Cobranças')
    XLSX.writeFile(wb, `amplifica-cobrancas-${data.mes}.xlsx`)
    setBusy(null); setOpen(false)
  }

  async function exportXlsxDre() {
    setBusy('xlsx-dre')
    const XLSX = await import('xlsx')

    // Agrupa por mês YYYY-MM
    const meses = new Set<string>()
    data.receitasAno.forEach((r) => meses.add(r.data.slice(0, 7)))
    data.despesasAno.forEach((d) => meses.add(d.data.slice(0, 7)))
    data.cobrancasAno.forEach((c) => meses.add(c.mes_referencia.slice(0, 7)))
    const mesesArr = Array.from(meses).sort()

    // Categorias
    const catReceita = new Map<string, Map<string, number>>()
    catReceita.set('Mensalidades', new Map())
    data.cobrancasAno.filter((c) => c.status === 'pago').forEach((c) => {
      const m = c.mes_referencia.slice(0, 7)
      const map = catReceita.get('Mensalidades')!
      map.set(m, (map.get(m) ?? 0) + Number(c.valor))
    })
    data.receitasAno.forEach((r) => {
      if (!catReceita.has(r.categoria)) catReceita.set(r.categoria, new Map())
      const map = catReceita.get(r.categoria)!
      const m = r.data.slice(0, 7)
      map.set(m, (map.get(m) ?? 0) + Number(r.valor))
    })

    const catDespesa = new Map<string, Map<string, number>>()
    data.despesasAno.forEach((d) => {
      if (!catDespesa.has(d.categoria)) catDespesa.set(d.categoria, new Map())
      const map = catDespesa.get(d.categoria)!
      const m = d.data.slice(0, 7)
      map.set(m, (map.get(m) ?? 0) + Number(d.valor))
    })

    const header = ['Categoria', ...mesesArr, 'Total']
    const aoa: (string | number)[][] = [header, ['RECEITAS']]
    catReceita.forEach((map, cat) => {
      const row: (string | number)[] = [cat]
      let total = 0
      mesesArr.forEach((m) => {
        const v = map.get(m) ?? 0
        total += v
        row.push(v)
      })
      row.push(total)
      aoa.push(row)
    })
    aoa.push([])
    aoa.push(['DESPESAS'])
    catDespesa.forEach((map, cat) => {
      const row: (string | number)[] = [cat]
      let total = 0
      mesesArr.forEach((m) => {
        const v = map.get(m) ?? 0
        total += v
        row.push(v)
      })
      row.push(total)
      aoa.push(row)
    })

    const ws = XLSX.utils.aoa_to_sheet(aoa)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'DRE')
    XLSX.writeFile(wb, `amplifica-dre-${new Date().getFullYear()}.xlsx`)
    setBusy(null); setOpen(false)
  }

  async function exportPdfTurmas() {
    setBusy('pdf-turmas')
    const { jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text('Instituto Amplifica — Relatório por Turma', 14, 18)
    doc.setFontSize(11); doc.setTextColor(100)
    doc.text(`Mês: ${mesExtenso(data.mes)}`, 14, 26)

    let y = 34
    data.turmas.forEach((t, idx) => {
      if (idx > 0) y = (doc as any).lastAutoTable.finalY + 12
      doc.setFontSize(13); doc.setTextColor(0)
      doc.text(t.nome, 14, y)
      autoTable(doc, {
        startY: y + 4,
        head: [['Fellow', 'Tipo', 'Status', 'Valor']],
        body: t.fellows.map((f) => [f.nome, f.tipo, f.status, f.valor ? brl(f.valor) : '—']),
        headStyles: { fillColor: [245, 158, 11] },
      })
    })

    doc.save(`amplifica-turmas-${data.mes}.pdf`)
    setBusy(null); setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-sm text-gray-200 hover:border-amber-500/40 hover:text-amber-400"
      >
        <Download className="h-4 w-4" /> Exportar
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 w-72 rounded-xl bg-gray-950 border border-gray-800 shadow-xl p-2">
            {[
              { id: 'pdf-mensal', label: 'Resumo mensal', sub: 'PDF', icon: <FileText className="h-4 w-4 text-rose-400" />, fn: exportPdfMensal },
              { id: 'xlsx-cobrancas', label: 'Cobranças do mês', sub: 'XLSX', icon: <FileSpreadsheet className="h-4 w-4 text-emerald-400" />, fn: exportXlsxCobrancas },
              { id: 'xlsx-dre', label: 'DRE anual', sub: 'XLSX', icon: <FileSpreadsheet className="h-4 w-4 text-emerald-400" />, fn: exportXlsxDre },
              { id: 'pdf-turmas', label: 'Relatório por turma', sub: 'PDF', icon: <FileText className="h-4 w-4 text-rose-400" />, fn: exportPdfTurmas },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={opt.fn}
                disabled={busy !== null}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-gray-200 hover:bg-gray-900 disabled:opacity-50"
              >
                <span className="inline-flex items-center gap-2">
                  {busy === opt.id ? <Loader2 className="h-4 w-4 animate-spin" /> : opt.icon}
                  {opt.label}
                </span>
                <span className="text-xs text-gray-500">{opt.sub}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
