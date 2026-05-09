// app/painel/admin/imprensa/relatorios/export/route.ts
// Exporta relatório de Assessoria de Imprensa em XLSX ou PDF.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import {
  getRelatorioImprensa,
  resolverPeriodo,
  STATUS_LABEL,
  type StatusSubmissao,
} from '@/lib/services/imprensa-relatorio'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export const dynamic = 'force-dynamic'

function formatPctNum(v: number) {
  return Number((v * 100).toFixed(2))
}
function formatPctStr(v: number) {
  return `${(v * 100).toFixed(1).replace('.', ',')}%`
}
function formatDateBR(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const sp = req.nextUrl.searchParams
  const format = (sp.get('format') ?? 'xlsx').toLowerCase()
  const periodo = resolverPeriodo({
    preset: sp.get('preset') ?? undefined,
    from: sp.get('from') ?? undefined,
    to: sp.get('to') ?? undefined,
  })

  const relatorio = await getRelatorioImprensa({
    from: periodo.from,
    to: periodo.to,
  })
  const k = relatorio.indicadores

  const periodoLabel = `${periodo.from ? formatDateBR(periodo.from) : 'Início'} a ${
    periodo.to ? formatDateBR(periodo.to) : 'Hoje'
  }`
  const stamp = new Date().toISOString().slice(0, 10)

  if (format === 'pdf') {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()

    // Capa / cabeçalho
    doc.setFillColor(16, 185, 129)
    doc.rect(0, 0, pageWidth, 6, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(20, 20, 20)
    doc.text('Relatório — Assessoria de Imprensa', 40, 50)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(80, 80, 80)
    doc.text('Instituto Amplifica', 40, 68)
    doc.setFontSize(10)
    doc.text(`Período: ${periodoLabel}`, 40, 84)
    doc.text(`Gerado em: ${formatDateBR(new Date().toISOString())}`, 40, 98)

    // Indicadores
    autoTable(doc, {
      startY: 120,
      head: [['Indicador', 'Valor']],
      body: [
        ['Fellows únicos com submissão', String(k.fellowsUnicos)],
        ['Fellows com publicação', String(k.fellowsPublicados)],
        ['Artigos submetidos', String(k.totalSubmetidos)],
        ['Pendentes', String(k.pendentes)],
        ['Na imprensa', String(k.naImprensa)],
        ['Publicados', String(k.publicados)],
        ['Recusados', String(k.recusados)],
        ['Retirados', String(k.retirados)],
        ['Arquivados', String(k.arquivados)],
        ['Taxa de envio à imprensa', formatPctStr(k.taxaEnvio)],
        ['Taxa de publicação (sobre enviados)', formatPctStr(k.taxaPublicacaoSobreEnviados)],
        ['Taxa de publicação (sobre total)', formatPctStr(k.taxaPublicacaoSobreTotal)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 6 },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
    })

    // Veículos
    if (relatorio.veiculos.length > 0) {
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 24,
        head: [['Veículo', 'Publicações', 'Fellows distintos']],
        body: relatorio.veiculos.map((v) => [v.nome, v.publicacoes, v.fellows_distintos]),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 6 },
        columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
      })
    }

    // Rodapé
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(
        `Instituto Amplifica · página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 20,
        { align: 'center' },
      )
    }

    const buf = Buffer.from(doc.output('arraybuffer'))
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio-imprensa-amplifica-${stamp}.pdf"`,
      },
    })
  }

  // XLSX
  const wb = XLSX.utils.book_new()

  const resumo: (string | number)[][] = [
    ['Relatório — Assessoria de Imprensa'],
    ['Instituto Amplifica'],
    [`Período: ${periodoLabel}`],
    [`Gerado em: ${formatDateBR(new Date().toISOString())}`],
    [],
    ['Indicador', 'Valor'],
    ['Fellows únicos com submissão', k.fellowsUnicos],
    ['Fellows com publicação', k.fellowsPublicados],
    ['Artigos submetidos', k.totalSubmetidos],
    ['Pendentes', k.pendentes],
    ['Na imprensa', k.naImprensa],
    ['Publicados', k.publicados],
    ['Recusados', k.recusados],
    ['Retirados', k.retirados],
    ['Arquivados', k.arquivados],
    [],
    ['Taxa', 'Valor (%)'],
    ['Envio à imprensa', formatPctNum(k.taxaEnvio)],
    ['Publicação sobre enviados', formatPctNum(k.taxaPublicacaoSobreEnviados)],
    ['Publicação sobre total', formatPctNum(k.taxaPublicacaoSobreTotal)],
  ]
  const wsResumo = XLSX.utils.aoa_to_sheet(resumo)
  wsResumo['!cols'] = [{ wch: 42 }, { wch: 18 }]
  XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo')

  // Aba Artigos (analítica, sem dados sensíveis: sem email)
  const artigosHeader = [
    'Título',
    'Tipo',
    'Status',
    'Fellow',
    'Área',
    'Estado',
    'Veículo principal',
    'Data submissão',
    'Última atualização',
    'Motivo do arquivamento',
    'Link do artigo',
  ]
  const artigosRows = relatorio.submissoes.map((s) => [
    s.titulo,
    s.tipo ?? '',
    STATUS_LABEL[s.status as StatusSubmissao] ?? s.status,
    s.fellows?.nome ?? '',
    s.fellows?.area ?? '',
    s.fellows?.estado ?? '',
    s.veiculos?.nome ?? '',
    formatDateBR(s.created_at),
    formatDateBR(s.updated_at),
    s.motivo_arquivamento ?? '',
    s.artigo_url ?? '',
  ])
  const wsArtigos = XLSX.utils.aoa_to_sheet([artigosHeader, ...artigosRows])
  wsArtigos['!cols'] = [
    { wch: 50 },
    { wch: 10 },
    { wch: 22 },
    { wch: 28 },
    { wch: 18 },
    { wch: 8 },
    { wch: 28 },
    { wch: 14 },
    { wch: 14 },
    { wch: 40 },
    { wch: 50 },
  ]
  XLSX.utils.book_append_sheet(wb, wsArtigos, 'Artigos')

  // Aba Veículos
  const veiculosHeader = ['Veículo', 'Publicações', 'Fellows distintos']
  const veiculosRows = relatorio.veiculos.map((v) => [v.nome, v.publicacoes, v.fellows_distintos])
  const wsVeic = XLSX.utils.aoa_to_sheet([veiculosHeader, ...veiculosRows])
  wsVeic['!cols'] = [{ wch: 32 }, { wch: 14 }, { wch: 18 }]
  XLSX.utils.book_append_sheet(wb, wsVeic, 'Veículos')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
  return new NextResponse(buf, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="relatorio-imprensa-amplifica-${stamp}.xlsx"`,
    },
  })
}
