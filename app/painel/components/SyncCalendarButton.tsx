'use client'

interface Aula {
  id: number | string
  titulo: string
  data_hora: string
  duracao_min?: number | null
  descricao?: string | null
  link_acesso?: string | null
}

function toICSDate(isoString: string): string {
  return new Date(isoString).toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'
}

function gerarICS(aulas: Aula[]): string {
  const eventos = aulas.map((aula) => {
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

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Instituto Amplifica//Aulas//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...eventos,
    'END:VCALENDAR',
  ].join('\r\n')
}

export default function SyncCalendarButton({ aulas }: { aulas: Aula[] }) {
  if (!aulas || aulas.length === 0) return null

  function handleClick() {
    const blob = new Blob([gerarICS(aulas)], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'aulas-amplifica.ics'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/20 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
      Adicionar todas ao Google Agenda
    </button>
  )
}
