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

  if (errFellows) return NextResponse.json({ error: errFellows.message }, { status: 500 })
  if (!fellows?.length) return NextResponse.json({ ok: true, mes, criadas: 0, motivo: 'sem fellows autofinanciados' })

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

  return NextResponse.json({ ok: true, mes, total_fellows: fellows.length, processadas: count ?? rows.length })
}
