// app/api/financeiro/gerar-cobrancas/route.ts
// Cron mensal (Vercel Cron) — gera cobranças de R$ 300 para todos os fellows autofinanciados.
// Idempotente via unique (fellow_id, mes_referencia). Protegido por CRON_SECRET.

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const VALOR_MENSALIDADE = 300

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  const url = new URL(request.url)
  const mesParam = url.searchParams.get('mes') // 'yyyy-mm', opcional
  const now = new Date()
  const mes = mesParam && /^\d{4}-\d{2}$/.test(mesParam)
    ? mesParam
    : `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
  const mesRef = `${mes}-01`

  const { data: fellows, error: errFellows } = await supabase
    .from('fellows')
    .select('id')
    .eq('tipo_financiamento', 'autofinanciado')
    .eq('contrato_ativo', true)

  if (errFellows) return NextResponse.json({ error: errFellows.message }, { status: 500 })

  const cobrancasResult = { processadas: 0 }
  if (fellows?.length) {
    const rows = fellows.map((f) => ({
      fellow_id: f.id,
      mes_referencia: mesRef,
      valor: VALOR_MENSALIDADE,
      status: 'pendente',
    }))
    const { error, count } = await supabase
      .from('financeiro_cobrancas')
      .upsert(rows, { onConflict: 'fellow_id,mes_referencia', ignoreDuplicates: true, count: 'exact' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    cobrancasResult.processadas = count ?? rows.length
  }

  // Despesas recorrentes do time ativo
  const { data: equipe, error: errEq } = await supabase
    .from('equipe_financeiro')
    .select('id, nome, salario_mensal')
    .eq('ativo', true)
    .gt('salario_mensal', 0)

  const despesasResult = { criadas: 0 }
  if (!errEq && equipe?.length) {
    const dataMes = `${mes}-05` // 5o dia do mês
    // Verifica quais já existem
    const { data: existentes } = await supabase
      .from('financeiro_despesas')
      .select('equipe_id')
      .gte('data', `${mes}-01`).lte('data', `${mes}-31`)
      .not('equipe_id', 'is', null)

    const idsExistentes = new Set((existentes ?? []).map((e: any) => e.equipe_id))
    const novas = equipe
      .filter((m) => !idsExistentes.has(m.id))
      .map((m) => ({
        categoria: 'Equipe',
        descricao: `Salário mensal — ${m.nome}`,
        valor: Number(m.salario_mensal),
        data: dataMes,
        equipe_id: m.id,
      }))

    if (novas.length) {
      const { error: errIns, count } = await supabase
        .from('financeiro_despesas')
        .insert(novas, { count: 'exact' })
      if (!errIns) despesasResult.criadas = count ?? novas.length
    }
  }

  return NextResponse.json({
    ok: true,
    mes,
    cobrancas: { total_fellows: fellows?.length ?? 0, processadas: cobrancasResult.processadas },
    despesas_equipe: { total_membros: equipe?.length ?? 0, criadas: despesasResult.criadas },
  })
}
