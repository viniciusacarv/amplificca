import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data: pessoa } = await supabase
    .from('equipe')
    .select('nome, bio')
    .eq('slug', params.slug)
    .single()
  if (!pessoa) return {}
  return {
    title: pessoa.nome + ' | Instituto Amplifica',
    description: pessoa.bio || 'Perfil de ' + pessoa.nome,
  }
}

function Navbar() {
  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(126,211,33,0.15)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href='/' style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Image src='/LOGO-ICON.svg' alt='Amplifica' width={36} height={36} style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: '#fff', letterSpacing: 1, lineHeight: 1 }}>
            Amplifica<span style={{ color: 'var(--verde)' }}>!</span>
          </span>
        </Link>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Link href='/#fellows' style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14 }}>Fellows</Link>
          <Link href='/#artigos' style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14 }}>Artigos</Link>
          <Link href='/#sobre' style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14 }}>Equipe</Link>
          <Link href='/' style={{ background: 'var(--verde)', color: '#000', padding: '7px 18px', borderRadius: 4, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
            Voltar ao site
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default async function EquipePage({ params }: { params: { slug: string } }) {
  const { data: pessoa } = await supabase
    .from('equipe')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!pessoa) return notFound()

  const { data: artigos } = await supabase
    .from('artigos')
    .select('*')
    .eq('fellow_nome', pessoa.nome)
    .order('data_publicacao', { ascending: false })

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '96px 24px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40 }}>
          {pessoa.foto_url && (
            <img src={pessoa.foto_url} alt={pessoa.nome} style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover' }} />
          )}
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>{pessoa.nome}</h1>
            {pessoa.cargo && <p style={{ margin: '4px 0 0', color: '#666', fontSize: 16 }}>{pessoa.cargo}</p>}
            {pessoa.bio && <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.6 }}>{pessoa.bio}</p>}
            {pessoa.instagram && (
              <a href={'https://instagram.com/' + pessoa.instagram.replace('@', '')} target='_blank' rel='noopener noreferrer' style={{ display: 'inline-block', marginTop: 8, fontSize: 14, color: '#666' }}>
                @{pessoa.instagram}
              </a>
            )}
          </div>
        </div>

        {artigos && artigos.length > 0 && (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Artigos publicados</h2>
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
          </>
        )}
      </main>
    </>
  )
}
