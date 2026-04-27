import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function toICSDate(isoString: string): string {
  return new Date(isoString).toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: aulas } = await supabase
    .from('aulas')
    .select('id, titulo, descricao, data_hora, duracao_min, link_acesso')
    .gte('data_hora', new Date().toISOString())
    .order('data_hora')

  const eventos = (aulas ?? []).map((aula) => {
    const duracao = aula.duracao_min ?? 60
    const inicio = new Date(aula.data_hora)
    const fim = new Date(inicio.getTime() + duracao * 60000)

    return [
      'BEGIN:VEVENT',
      `DTSTART:${toICSDate(inicio.toISOString())}`,
      `DTEND:${toICSDate(fim.toISOString())}`,
      `SUMMARY:${aula.titulo}`,
      aula.descricao ? `DESCRIPTION:${aula.descricao.replace(/\r?\n/g, '\\n')}` : null,
      aula.link_acesso ? `LOCATION:${aula.link_acesso}` : null,
      `UID:aula-${aula.id}@amplifica`,
      'END:VEVENT',
    ].filter(Boolean).join('\r\n')
  })

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Instituto Amplifica//Aulas//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Aulas Amplifica',
    'X-WR-CALDESC:Próximas aulas de oratória do Instituto Amplifica',
    'REFRESH-INTERVAL;VALUE=DURATION:P1D',
    'X-PUBLISHED-TTL:P1D',
    ...eventos,
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="aulas-amplifica.ics"',
    },
  })
}
