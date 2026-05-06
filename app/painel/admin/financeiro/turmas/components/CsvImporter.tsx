'use client'
// Import de fellows via CSV: download de template + upload de arquivo + preview.

import { useState } from 'react'
import { importarFellowsCsv } from '../../actions'
import FormWithFeedback, { SubmitButton } from '../../components/FormWithFeedback'
import { Upload, Download, FileText } from 'lucide-react'

const CSV_TEMPLATE = `nome,email,whatsapp,tipo_financiamento,bolsa_origem,turma_nome,bio,area,estado,instagram
João Exemplo Silva,joao@exemplo.com,5511987654321,autofinanciado,,Turma 2026.2,Jornalista...,Comunicação,SP,joaoexemplo
Maria Bolsista,maria@exemplo.com,5511912345678,bolsista,Bolsa SFL,Turma 2026.2,Estudante...,Direito,MG,mariabolsista`

export default function CsvImporter() {
  const [open, setOpen] = useState(false)
  const [csvText, setCsvText] = useState('')

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'amplifica-fellows-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleFile(file: File) {
    const text = await file.text()
    setCsvText(text)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-sm text-gray-200 hover:border-amber-500/40 hover:text-amber-400"
      >
        <Upload className="h-4 w-4" /> Importar CSV
      </button>
    )
  }

  const linhas = csvText.split(/\r?\n/).filter(Boolean)
  const preview = linhas.slice(0, 6)

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gray-900/60 p-5 space-y-4">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white">Importar fellows via CSV</h3>
          <p className="text-xs text-gray-500">Cria/atualiza fellows. Match feito por e-mail. Cria turma se não existir.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-700 text-xs text-gray-300 hover:border-amber-500/40 hover:text-amber-400"
          >
            <Download className="h-3.5 w-3.5" /> Baixar template
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); setCsvText('') }}
            className="text-xs text-gray-500 hover:text-gray-300"
          >Cancelar</button>
        </div>
      </header>

      <div className="rounded-lg border border-dashed border-gray-700 p-4">
        <p className="text-xs text-gray-400 mb-2">Cole o CSV abaixo ou selecione um arquivo:</p>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="text-xs text-gray-400 file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-amber-500 file:text-gray-950 file:text-xs file:font-semibold"
        />
      </div>

      <FormWithFeedback action={importarFellowsCsv}>
          <div className="space-y-2">
            <textarea
              name="csv"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={8}
              required
              placeholder="nome,email,whatsapp,tipo_financiamento,..."
              className="w-full rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-xs font-mono text-gray-200"
            />
            {preview.length > 1 && (
              <div className="rounded-lg border border-gray-800 bg-gray-950/60 p-2">
                <p className="text-xs text-gray-500 mb-1 inline-flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Preview ({linhas.length - 1} linha(s) de dados)
                </p>
                <div className="overflow-x-auto">
                  <table className="text-xs text-gray-300">
                    <thead className="text-gray-500">
                      <tr>{preview[0].split(/[,;]/).map((h, i) => <th key={i} className="text-left px-2 py-1">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {preview.slice(1).map((l, i) => (
                        <tr key={i}>{l.split(/[,;]/).map((c, j) => <td key={j} className="px-2 py-1 truncate max-w-[150px]">{c}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <SubmitButton>Importar fellows</SubmitButton>
          </div>
      </FormWithFeedback>
    </div>
  )
}
