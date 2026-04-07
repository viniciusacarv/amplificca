import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data: fellow } = await supabase
    .from('fellows')
    .select('nome, bio')
    .eq('slug', params.slug)
    .single()
  if (!fellow) return {}
  return {
    title: fellow.nome + ' | Instituto Amplifica',
    description: fellow.bio || 'Artigos e perfil de ' + fellow.nome,
  }
}

export default async function FellowPage({ params }: { params: { slug: string } }) {
  const { data: fellow } = await supabase
    .from('fellows')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!fellow) return notFound()

  const { data: artigos } = await supabase
    .from('artigos')
    .select('*')
    .eq('fellow_nome', fellow.nome)
    .order('data_publicacao', { ascending: false })

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40 }}>
        {fellow.foto_url && (
          <img src={fellow.foto_url} alt={fellow.nome} style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover' }} />
        )}
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>{fellow.nome}</h1>
          {fellow.area && <p style={{ margin: '4px 0 0', color: '#666', fontSize: 16 }}>{fellow.area}</p>}
          {fellow.bio && <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.6 }}>{fellow.bio}</p>}
          {fellow.instagram && (
            <a href={'https://instagram.com/' + fellow.instagram.replace('@', '')} target='_blank' rel='noopener noreferrer' style={{ display: 'inline-block', marginTop: 8, fontSize: 14, color: '#666' }}>
              {fellow.instagram}
            </a>
          )}
        </div>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Artigos publicados</h2>

      {artigos && artigos.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {artigos.map((artigo: any) => (
            <a key={artigo.id} href={artigo.url} target='_blank' rel='noopener noreferrer'
              style={{ display: 'block', padding: '16px 20px', border: '1px solid #e5e7eb', borderRadius: 10, textDecoration: 'none', color: 'inherit' }}>
              {artigo.thumbnail_url && (
                <img src={artigo.thumbnail_url} alt={artigo.titulo} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 6, marginBottom: 12 }} />
              )}
              <p style={{ margin: 0, fontWeight: 500, fontSize: 16 }}>{artigo.titulo}</p>
              {artigo.veiculo && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888' }}>{artigo.veiculo}</p>}
              {artigo.data_publicacao && (
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#aaa' }}>
                  {new Date(artigo.data_publicacao).toLocaleDateString('pt-BR')}
                </p>
              )}
            </a>
          ))}
        </div>
      ) : (
        <p style={{ color: '#aaa' }}>Nenhum artigo publicado ainda.</p>
      )}
    </main>
  )
}
