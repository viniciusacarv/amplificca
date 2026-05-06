'use client'
// Exportação de relatórios de patrocínios e doações em XLSX.

import { useState } from 'react'
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react'

type Receita = {
  id: number
  tipo: string
  descricao: string
  origem: string | null
  valor: number
  data: string
  projeto: string | null
  observacao: string | null
  status_receita: string | null
  recorrencia: string | null
  metodo_pagamento: string | null
  mes_referencia: string | null
  parceiro_id: number | null
  parceiros_financeiros?: { id: number; nome: string; tipo: string } | null
}

type Parceiro = {
  id: number
  nome: string
  tipo: string
  status: string
  email: string | null
  telefone: string | null
  documento: string | null
  projeto: string | null
  tags: string | null
}

const TIPO_LABELS: Record<string, string> = {
  doacao: 'Doação', patrocinio: 'Patrocínio', parceria: 'Parceria', produto: 'Produto', outro: 'Outro',
}
const RECORRENCIA_LABELS: Record<string, string> = {
  unica: 'Única', mensal: 'Mensal', trimestral: 'Trimestral', anual: 'Anual',
}

function brl(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function ExportarPatrocinios({
  receitas,
  parceiros,
  ano,
}: {
  receitas: Receita[]
  parceiros: Parceiro[]
  ano: number
}) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  async function exportLancamentos() {
    setBusy('lancamentos')
    const XLSX = await import('xlsx')
    const rows = receitas.map((r) => ({
      'Data':            r.data,
      'Mês Referência':  r.mes_referencia ? r.mes_referencia.slice(0, 7) : '',
      'Tipo':            TIPO_LABELS[r.tipo] ?? r.tipo,
      'Descrição':       r.descricao,
      'Parceiro':        r.parceiros_financeiros?.nome ?? r.origem ?? '',
      'Valor':           Number(r.valor),
      'Recorrência':     RECORRENCIA_LABELS[r.recorrencia ?? 'unica'] ?? r.recorrencia ?? '',
      'Status':          r.status_receita ?? '',
      'Método':          r.metodo_pagamento ?? '',
      'Projeto':         r.projeto ?? '',
      'Observação':      r.observacao ?? '',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = [
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 40 }, { wch: 30 },
      { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 20 }, { wch: 30 },
    ]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Lançamentos')
    XLSX.writeFile(wb, `amplifica-patrocinios-${ano}.xlsx`)
    setBusy(null); setOpen(false)
  }

  async function exportParceiros() {
    setBusy('parceiros')
    const XLSX = await import('xlsx')
    const rows = parceiros.map((p) => ({
      'Nome':      p.nome,
      'Tipo':      p.tipo,
      'Status':    p.status,
      'E-mail':    p.email ?? '',
      'Telefone':  p.telefone ?? '',
      'Documento': p.documento ?? '',
      'Projeto':   p.projeto ?? '',
      'Tags':      p.tags ?? '',
      'Total Recebido': brl(
        receitas
          .filter((r) => r.parceiro_id === p.id && r.status_receita !== 'cancelado')
          .reduce((s, r) => s + r.valor, 0)
      ),
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = [
      { wch: 30 }, { wch: 14 }, { wch: 12 }, { wch: 28 }, { wch: 16 },
      { wch: 18 }, { wch: 20 }, { wch: 20 }, { wch: 16 },
    ]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Parceiros')
    XLSX.writeFile(wb, `amplifica-parceiros-${ano}.xlsx`)
    setBusy(null); setOpen(false)
  }

  async function exportRelatorioCompleto() {
    setBusy('completo')
    const XLSX = await import('xlsx')
    const wb = XLSX.utils.book_new()

    // Aba 1: Lançamentos
    const rowsLanc = receitas.map((r) => ({
      'Data':           r.data,
      'Mês Ref.':       r.mes_referencia ? r.mes_referencia.slice(0, 7) : '',
      'Tipo':           TIPO_LABELS[r.tipo] ?? r.tipo,
      'Descrição':      r.descricao,
      'Parceiro':       r.parceiros_financeiros?.nome ?? r.origem ?? '',
      'Valor':          Number(r.valor),
      'Recorrência':    RECORRENCIA_LABELS[r.recorrencia ?? 'unica'] ?? '',
      'Status':         r.status_receita ?? '',
      'Método':         r.metodo_pagamento ?? '',
      'Projeto':        r.projeto ?? '',
    }))
    const wsLanc = XLSX.utils.json_to_sheet(rowsLanc)
    XLSX.utils.book_append_sheet(wb, wsLanc, 'Lançamentos')

    // Aba 2: Parceiros
    const rowsParc = parceiros.map((p) => ({
      'Nome':      p.nome,
      'Tipo':      p.tipo,
      'Status':    p.status,
      'E-mail':    p.email ?? '',
      'Telefone':  p.telefone ?? '',
      'Projeto':   p.projeto ?? '',
      'Total':     receitas
        .filter((r) => r.parceiro_id === p.id && r.status_receita !== 'cancelado')
        .reduce((s, r) => s + r.valor, 0),
    }))
    const wsParc = XLSX.utils.json_to_sheet(rowsParc)
    XLSX.utils.book_append_sheet(wb, wsParc, 'Parceiros')

    // Aba 3: Resumo mensal
    const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
    const resumoMensal = MESES.map((label, i) => {
      const doMes = receitas.filter((r) => {
        const ref = r.mes_referencia ?? r.data
        return new Date(ref + 'T00:00:00').getMonth() === i && r.status_receita !== 'cancelado'
      })
      return {
        'Mês':         `${label}/${ano}`,
        'Total':       doMes.reduce((s, r) => s + r.valor, 0),
        'Recebido':    doMes.filter((r) => r.status_receita === 'pago').reduce((s, r) => s + r.valor, 0),
        'Pendente':    doMes.filter((r) => r.status_receita === 'pendente').reduce((s, r) => s + r.valor, 0),
        'Recorrente':  doMes.filter((r) => r.recorrencia !== 'unica').reduce((s, r) => s + r.valor, 0),
        'Lançamentos': doMes.length,
      }
    })
    const wsResumo = XLSX.utils.json_to_sheet(resumoMensal)
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo Mensal')

    XLSX.writeFile(wb, `amplifica-patrocinios-completo-${ano}.xlsx`)
    setBusy(null); setOpen(false)
  }

  const opcoes = [
    { id: 'lancamentos', label: 'Lançamentos do ano', fn: exportLancamentos },
    { id: 'parceiros',   label: 'Cadastro de parceiros', fn: exportParceiros },
    { id: 'completo',    label: 'Relatório completo', fn: exportRelatorioCompleto },
  ]

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
          <div className="absolute right-0 top-full mt-2 z-20 w-64 rounded-xl bg-gray-950 border border-gray-800 shadow-xl p-2">
            {opcoes.map((opt) => (
              <button
                key={opt.id}
                onClick={opt.fn}
                disabled={busy !== null}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-gray-200 hover:bg-gray-900 disabled:opacity-50"
              >
                <span className="inline-flex items-center gap-2">
                  {busy === opt.id
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <FileSpreadsheet className="h-4 w-4 text-emerald-400" />}
                  {opt.label}
                </span>
                <span className="text-xs text-gray-500">XLSX</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
