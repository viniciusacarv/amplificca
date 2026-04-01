import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Fellow = {
  id: number
  nome: string
  bio: string
  estado: string
  area: string
  instagram: string
  foto_url: string
  created_at: string
}

export type Artigo = {
  id: number
  titulo: string
  url: string
  fellow_id: number
  fellow_nome: string
  veiculo: string
  data_publicacao: string
  thumbnail_url: string
  tags: string[]
  created_at: string
}
