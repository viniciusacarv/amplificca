import { headers } from 'next/headers'

export default function SyncCalendarButton() {
  const host = headers().get('host') ?? 'localhost:3000'
  const webcalUrl = `webcal://${host}/api/aulas/calendario`

  return (
    <a
      href={webcalUrl}
      className="inline-flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/20 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
      Adicionar todas ao Google Agenda
    </a>
  )
}
