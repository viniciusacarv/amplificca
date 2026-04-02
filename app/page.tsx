'use client'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Video from '@/components/Video'
import EncontreUmFellow from '@/components/EncontreUmFellow'
import Artigos from '@/components/Artigos'
import MapaBrasil from '@/components/MapaBrasil'
import Missao from '@/components/Missao'
import Sobre from '@/components/Sobre'
import Professores from '@/components/Professores'
import Inscricao from '@/components/Inscricao'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Video />
      <Professores />
      <EncontreUmFellow />
      <Artigos />
      <MapaBrasil />
      <Missao />
      <Sobre />
      <Inscricao />
      <Footer />
    </main>
  )
}
