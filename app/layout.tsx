import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Instituto Amplifica',
  description: 'Formando lideranças orientadas para a liberdade',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
