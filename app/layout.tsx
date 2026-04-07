import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Amplifica! — Conectando vozes que defendem liberdade com a imprensa',
  description: 'O Amplifica seleciona lideranças, desenvolve comunicação estratégica e conecta vozes à imprensa brasileira.',
  openGraph: {
    title: 'Amplifica!',
    description: 'Conectando vozes que defendem liberdade com a imprensa',
    url: 'https://institutoamplifica.com',
    siteName: 'Instituto Amplifica',
    locale: 'pt_BR',
    type: 'website',
  },
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
