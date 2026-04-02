'use client'
import { useEffect, useState } from 'react'
import { supabase, Artigo } from '@/lib/supabase'

const ARTIGOS_REAIS: Artigo[] = [
  // Wesley Reis
  { id: 1,  titulo: 'Os 250 anos de "A Riqueza das Nações" e o lugar do Brasil na história', url: 'https://exame.com/colunistas/instituto-millenium/os-250-anos-de-a-riqueza-das-nacoes-e-o-lugar-do-brasil-na-historia/', fellow_id: 17, fellow_nome: 'Wesley Reis', veiculo: 'Exame', data_publicacao: '2026-03-20', thumbnail_url: '', tags: ['Economia'], created_at: '' },
  { id: 2,  titulo: 'O ano de 2026 e a conta inevitável que se aproxima', url: 'https://exame.com/colunistas/instituto-millenium/o-ano-de-2026-e-a-conta-inevitavel-que-se-aproxima/', fellow_id: 17, fellow_nome: 'Wesley Reis', veiculo: 'Exame', data_publicacao: '2026-01-07', thumbnail_url: '', tags: ['Economia'], created_at: '' },
  { id: 3,  titulo: 'A corrosão da institucionalidade de um poder sem pudor', url: 'https://exame.com/colunistas/instituto-millenium/a-corrosao-da-institucionalidade-de-um-poder-sem-pudor/', fellow_id: 17, fellow_nome: 'Wesley Reis', veiculo: 'Exame', data_publicacao: '2026-02-18', thumbnail_url: '', tags: ['Economia'], created_at: '' },
  { id: 4,  titulo: 'Mauá: por que o sucesso é visto como pecado no Brasil?', url: 'https://www.gazetadopovo.com.br/opiniao/artigos/maua-por-que-sucesso-visto-como-pecado-no-brasil/', fellow_id: 17, fellow_nome: 'Wesley Reis', veiculo: 'Gazeta do Povo', data_publicacao: '2026-01-18', thumbnail_url: '', tags: ['Economia'], created_at: '' },
  // Yuri Quadros
  { id: 5,  titulo: 'O custo de deixar o poder sem freios', url: 'https://exame.com/colunistas/instituto-millenium/o-custo-de-deixar-o-poder-sem-freios/', fellow_id: 19, fellow_nome: 'Yuri Quadros', veiculo: 'Exame', data_publicacao: '2026-03-26', thumbnail_url: '', tags: ['Política'], created_at: '' },
  { id: 6,  titulo: 'A federação de papel: o Brasil opera como um império burocrático e a conta é sua', url: 'https://exame.com/colunistas/instituto-millenium/a-federacao-de-papel-o-brasil-opera-como-um-imperio-burocratico-e-a-conta-e-sua/', fellow_id: 19, fellow_nome: 'Yuri Quadros', veiculo: 'Exame', data_publicacao: '2026-03-18', thumbnail_url: '', tags: ['Política'], created_at: '' },
  // William A. Clavijo Vitto
  { id: 7,  titulo: 'Venezuela: uma transição frágil sem a diáspora', url: 'https://latinoamerica21.com/pt-br/venezuela-uma-transicao-fragil-sem-a-diaspora/', fellow_id: 18, fellow_nome: 'William A. Clavijo Vitto', veiculo: 'Latinoamérica21', data_publicacao: '2026-03-28', thumbnail_url: '', tags: ['Política'], created_at: '' },
  // Davi de Souza
  { id: 8,  titulo: 'A arquitetura da escassez: o custo invisível das decisões políticas no Brasil', url: 'https://mises.org.br/artigos/18670/a-arquitetura-da-escassez-o-custo-invisivel-das-decisoes-politicas-no-brasil/', fellow_id: 5, fellow_nome: 'Davi de Souza', veiculo: 'Instituto Mises', data_publicacao: '2026-03-28', thumbnail_url: '', tags: ['Política'], created_at: '' },
  { id: 9,  titulo: 'A quebra de patentes como atestado de insegurança jurídica', url: 'https://www.congressoemfoco.com.br/artigo/117649/a-quebra-de-patentes-como-atestado-de-inseguranca-juridica', fellow_id: 5, fellow_nome: 'Davi de Souza', veiculo: 'Congresso em Foco', data_publicacao: '2026-03-27', thumbnail_url: '', tags: ['Política'], created_at: '' },
  { id: 10, titulo: 'O tarifaço digital e o projeto de atraso do governo', url: 'https://www.congressoemfoco.com.br/artigo/116760/o-tarifaco-digital-e-o-projeto-de-atraso-do-governo', fellow_id: 5, fellow_nome: 'Davi de Souza', veiculo: 'Congresso em Foco', data_publicacao: '2026-02-26', thumbnail_url: '', tags: ['Política'], created_at: '' },
  { id: 11, titulo: 'O preço abusivo de deixar o Estado decidir o que você come', url: 'https://www.congressoemfoco.com.br/artigo/116650/o-preco-abusivo-de-deixar-o-estado-decidir-o-que-voce-come', fellow_id: 5, fellow_nome: 'Davi de Souza', veiculo: 'Congresso em Foco', data_publicacao: '2026-02-24', thumbnail_url: '', tags: ['Política'], created_at: '' },
  { id: 12, titulo: 'Carnaval milionário de Lula põe a credibilidade do TSE em jogo', url: 'https://www.congressoemfoco.com.br/artigo/116613/carnaval-milionario-de-lula-poe-a-credibilidade-do-tse-em-jogo', fellow_id: 5, fellow_nome: 'Davi de Souza', veiculo: 'Congresso em Foco', data_publicacao: '2026-02-23', thumbnail_url: '', tags: ['Política'], created_at: '' },
  { id: 13, titulo: 'De dia é governo, de noite é oposição', url: 'https://www.congressoemfoco.com.br/artigo/116432/de-dia-e-governo-de-noite-e-oposicao', fellow_id: 5, fellow_nome: 'Davi de Souza', veiculo: 'Congresso em Foco', data_publicacao: '2026-02-13', thumbnail_url: '', tags: ['Política'], created_at: '' },
  { id: 14, titulo: 'A epidemia dos vereadores federais', url: 'https://www.congressoemfoco.com.br/artigo/116260/a-epidemia-dos-vereadores-federais', fellow_id: 5, fellow_nome: 'Davi de Souza', veiculo: 'Congresso em Foco', data_publicacao: '2026-02-13', thumbnail_url: '', tags: ['Política'], created_at: '' },
  { id: 15, titulo: 'A casta do Congresso Nacional e a destruição da moralidade fiscal', url: 'https://www.congressoemfoco.com.br/artigo/116131/a-casta-do-congresso-nacional-e-a-destruicao-da-moralidade-fiscal', fellow_id: 5, fellow_nome: 'Davi de Souza', veiculo: 'Congresso em Foco', data_publicacao: '2026-02-04', thumbnail_url: '', tags: ['Política'], created_at: '' },
  { id: 16, titulo: 'Não deixem o PL 2.338 se tornar a certidão de óbito da inovação', url: 'https://www.congressoemfoco.com.br/artigo/116007/nao-deixem-o-pl-2-338-se-tornar-a-certidao-de-obito-da-inovacao', fellow_id: 5, fellow_nome: 'Davi de Souza', veiculo: 'Congresso em Foco', data_publicacao: '2026-01-30', thumbnail_url: '', tags: ['Política'], created_at: '' },
  { id: 17, titulo: 'Estados mais violentos têm algo em comum: governos de esquerda', url: 'https://www.congressoemfoco.com.br/artigo/115945/estados-mais-violentos-tem-algo-em-comum-governos-de-esquerda', fellow_id: 5, fellow_nome: 'Davi de Souza', veiculo: 'Congresso em Foco', data_publicacao: '2026-01-29', thumbnail_url: '', tags: ['Política'], created_at: '' },
  { id: 18, titulo: 'Escala 6x1: o perigo da pressa e da demagogia', url: 'https://www.congressoemfoco.com.br/artigo/115793/escala-6x1-o-perigo-da-pressa-e-da-demagogia', fellow_id: 5, fellow_nome: 'Davi de Souza', veiculo: 'Congresso em Foco', data_publicacao: '2026-01-23', thumbnail_url: '', tags: ['Política'], created_at: '' },
  // Anne Dias
  { id: 19, titulo: 'Quem vai defender as mulheres?', url: 'https://crusoe.com.br/diario/quem-vai-defender-as-mulheres/', fellow_id: 0, fellow_nome: 'Anne Dias', veiculo: 'Crusoé', data_publicacao: '2026-03-13', thumbnail_url: '', tags: ['Política'], created_at: '' },
  { id: 20, titulo: "From Brazil to Cuba: the limits of Trump's democracy agenda", url: 'https://www.realclearworld.com/articles/2026/02/14/from_brazil_to_cuba_the_limits_of_trumps_democracy_agenda_1164883.html', fellow_id: 0, fellow_nome: 'Anne Dias', veiculo: 'Real Clear World', data_publicacao: '2026-02-23', thumbnail_url: '', tags: ['Política'], created_at: '' },
  { id: 21, titulo: 'Você acredita na imprensa brasileira?', url: 'https://claudiodantas.com.br/voce-acredita-na-imprensa-brasileira/', fellow_id: 0, fellow_nome: 'Anne Dias', veiculo: 'Claudio Dantas', data_publicacao: '2026-03-05', thumbnail_url: '', tags: ['Comunicação'], created_at: '' },
  // Letícia Barros
  { id: 22, titulo: 'A indústria das ações trabalhistas e seus incentivos perversos', url: 'https://crusoe.com.br/noticias/a-industria-das-acoes-trabalhistas-e-seus-incentivos-perversos/', fellow_id: 12, fellow_nome: 'Letícia Barros', veiculo: 'Crusoé', data_publicacao: '2026-03-27', thumbnail_url: '', tags: ['Direito'], created_at: '' },
  { id: 23, titulo: 'O crime de estupro e o colapso moral de uma sociedade', url: 'https://crusoe.com.br/noticias/o-crime-de-estupro-e-o-colapso-moral-de-uma-sociedade/', fellow_id: 12, fellow_nome: 'Letícia Barros', veiculo: 'Crusoé', data_publicacao: '2026-03-13', thumbnail_url: '', tags: ['Direito'], created_at: '' },
  { id: 24, titulo: 'A raiz psicológica das ideologias políticas', url: 'https://crusoe.com.br/noticias/a-raiz-psicologica-das-ideologias-politicas/', fellow_id: 12, fellow_nome: 'Letícia Barros', veiculo: 'Crusoé', data_publicacao: '2026-02-27', thumbnail_url: '', tags: ['Política'], created_at: '' },
  { id: 25, titulo: 'Trump, Maduro e os limites da soberania', url: 'https://crusoe.com.br/noticias/trump-maduro-e-os-limites-da-soberania/', fellow_id: 12, fellow_nome: 'Letícia Barros', veiculo: 'Crusoé', data_publicacao: '2026-02-13', thumbnail_url: '', tags: ['Política'], created_at: '' },
  { id: 26, titulo: 'Airbnb na mira da reforma tributária', url: 'https://crusoe.com.br/noticias/airbnb-na-mira-da-reforma-tributaria/', fellow_id: 12, fellow_nome: 'Letícia Barros', veiculo: 'Crusoé', data_publicacao: '2026-01-30', thumbnail_url: '', tags: ['Economia'], created_at: '' },
  { id: 27, titulo: 'O preço pago pelas mulheres na teocracia socialista do Irã', url: 'https://crusoe.com.br/noticias/o-preco-pago-pelas-mulheres-na-teocracia-socialista-do-ira/', fellow_id: 12, fellow_nome: 'Letícia Barros', veiculo: 'Crusoé', data_publicacao: '2026-01-16', thumbnail_url: '', tags: ['Política'], created_at: '' },
  { id: 28, titulo: 'Um país cansado, incerto e malgovernado', url: 'https://crusoe.com.br/noticias/um-pais-cansado-incerto-e-malgovernado/', fellow_id: 12, fellow_nome: 'Letícia Barros', veiculo: 'Crusoé', data_publicacao: '2026-01-02', thumbnail_url: '', tags: ['Política'], created_at: '' },
  // Zizi Martins
  { id: 29, titulo: 'Voto de cabresto: Bolsa Família — como o PT reinventou o coronelismo no Nordeste', url: 'https://www.gazetadopovo.com.br/opiniao/artigos/voto-cabresto-bolsa-familia-pt-reinventou-coronelismo-no-nordeste/', fellow_id: 20, fellow_nome: 'Zizi Martins', veiculo: 'Gazeta do Povo', data_publicacao: '2026-02-01', thumbnail_url: '', tags: ['Política'], created_at: '' },
  { id: 30, titulo: 'A Venezuela sob os EUA e a pretensa superioridade moral da esquerda', url: 'https://www.gazetadopovo.com.br/opiniao/artigos/a-venezuela-sob-os-eua-e-a-pretensa-superioridade-moral-da-esquerda-na-defesa-de-suas-ditaduras/', fellow_id: 20, fellow_nome: 'Zizi Martins', veiculo: 'Gazeta do Povo', data_publicacao: '2026-01-10', thumbnail_url: '', tags: ['Política'], created_at: '' },
  // Germano Laube
  { id: 31, titulo: 'Entre a previsão e a adaptação: por que a IA repete a história dos computadores nos anos 80', url: 'https://www.melhordosul.com.br/entre-a-previsao-e-a-adaptacao-por-que-a-ia-repete-a-historia-dos-computadores-nos-anos-80/', fellow_id: 8, fellow_nome: 'Germano Laube', veiculo: 'Melhor do Sul', data_publicacao: '2026-03-30', thumbnail_url: '', tags: ['Economia'], created_at: '' },
  { id: 32, titulo: 'O Oscar de melhor investimento vai para...', url: 'https://www.melhordosul.com.br/o-oscar-de-melhor-investimento-vai-para/', fellow_id: 8, fellow_nome: 'Germano Laube', veiculo: 'Melhor do Sul', data_publicacao: '2026-03-26', thumbnail_url: '', tags: ['Economia'], created_at: '' },
  { id: 33, titulo: 'O fim do mundo', url: 'https://www.melhordosul.com.br/o-fim-do-mundo/', fellow_id: 8, fellow_nome: 'Germano Laube', veiculo: 'Melhor do Sul', data_publicacao: '2026-03-19', thumbnail_url: '', tags: ['Economia'], created_at: '' },
  { id: 34, titulo: 'Você é bem-sucedido?', url: 'https://www.melhordosul.com.br/voce-e-bem-sucedido/', fellow_id: 8, fellow_nome: 'Germano Laube', veiculo: 'Melhor do Sul', data_publicacao: '2026-03-12', thumbnail_url: '', tags: ['Economia'], created_at: '' },
  { id: 35, titulo: 'Investir em tempos de guerra', url: 'https://www.melhordosul.com.br/investir-em-tempos-de-guerra/', fellow_id: 8, fellow_nome: 'Germano Laube', veiculo: 'Melhor do Sul', data_publicacao: '2026-03-03', thumbnail_url: '', tags: ['Economia'], created_at: '' },
  { id: 36, titulo: 'Vale a pena investir em imóveis?', url: 'https://www.melhordosul.com.br/vale-a-pena-investir-em-imoveis/', fellow_id: 8, fellow_nome: 'Germano Laube', veiculo: 'Melhor do Sul', data_publicacao: '2026-02-26', thumbnail_url: '', tags: ['Economia'], created_at: '' },
  { id: 37, titulo: 'Tudo está mais caro — será?', url: 'https://www.melhordosul.com.br/tudo-esta-mais-caro-sera/', fellow_id: 8, fellow_nome: 'Germano Laube', veiculo: 'Melhor do Sul', data_publicacao: '2026-02-12', thumbnail_url: '', tags: ['Economia'], created_at: '' },
  { id: 38, titulo: 'Como ganhar muito dinheiro com a renda fixa', url: 'https://www.melhordosul.com.br/como-ganhar-muito-dinheiro-com-a-renda-fixa/', fellow_id: 8, fellow_nome: 'Germano Laube', veiculo: 'Melhor do Sul', data_publicacao: '2026-02-05', thumbnail_url: '', tags: ['Economia'], created_at: '' },
  { id: 39, titulo: 'O seu dinheiro está seguro?', url: 'https://www.melhordosul.com.br/o-seu-dinheiro-esta-seguro/', fellow_id: 8, fellow_nome: 'Germano Laube', veiculo: 'Melhor do Sul', data_publicacao: '2026-01-29', thumbnail_url: '', tags: ['Economia'], created_at: '' },
  { id: 40, titulo: 'Cisne Negro: lidando com o imprevisível', url: 'https://www.melhordosul.com.br/cisne-negro-lidando-com-o-imprevisivel/', fellow_id: 8, fellow_nome: 'Germano Laube', veiculo: 'Melhor do Sul', data_publicacao: '2026-01-15', thumbnail_url: '', tags: ['Economia'], created_at: '' },
  { id: 41, titulo: '4 passos para organizar seu patrimônio e suas metas para 2026', url: 'https://www.melhordosul.com.br/4-passos-para-organizar-seu-patrimonio-e-suas-metas-para-2026/', fellow_id: 8, fellow_nome: 'Germano Laube', veiculo: 'Melhor do Sul', data_publicacao: '2026-01-09', thumbnail_url: '', tags: ['Economia'], created_at: '' },
]

const VEICULOS_FILTRO = ['Todos', ...Array.from(new Set(ARTIGOS_REAIS.map(a => a.veiculo))).sort()]
const ITEMS_POR_PAGINA = 10

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function Artigos() {
  const [artigos, setArtigos] = useState<Artigo[]>(ARTIGOS_REAIS)
  const [filtro, setFiltro] = useState('Todos')
  const [busca, setBusca] = useState('')
  const [fellowFiltro, setFellowFiltro] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(ITEMS_POR_PAGINA)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('artigos').select('*').order('data_publicacao', { ascending: false })
      if (data && data.length > 0) setArtigos(data)
    }
    load()
  }, [])

  // Escutar evento disparado pelo EncontreUmFellow ao clicar "Ver artigos" de um fellow
  useEffect(() => {
    const handler = (e: Event) => {
      const nome = (e as CustomEvent<string>).detail
      setFellowFiltro(nome)
      setFiltro('Todos')
      setBusca('')
      setVisibleCount(ITEMS_POR_PAGINA)
      setTimeout(() => {
        document.getElementById('artigos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
    window.addEventListener('amplifica:filtrar-fellow', handler)
    return () => window.removeEventListener('amplifica:filtrar-fellow', handler)
  }, [])

  // Resetar paginação ao mudar filtros
  useEffect(() => { setVisibleCount(ITEMS_POR_PAGINA) }, [filtro, busca, fellowFiltro])

  const artigosOrdenados = [...artigos].sort(
    (a, b) => new Date(b.data_publicacao).getTime() - new Date(a.data_publicacao).getTime()
  )

  const filtrados = artigosOrdenados
    .filter(a => filtro === 'Todos' || a.veiculo === filtro)
    .filter(a => !fellowFiltro || a.fellow_nome === fellowFiltro)
    .filter(a =>
      busca === '' ||
      a.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      a.fellow_nome.toLowerCase().includes(busca.toLowerCase()) ||
      a.veiculo.toLowerCase().includes(busca.toLowerCase())
    )

  const visiveis = filtrados.slice(0, visibleCount)
  const temMais = visibleCount < filtrados.length

  return (
    <section id="artigos" style={{ padding: '100px 0', background: '#0a0a0a' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 60, flexWrap: 'wrap', gap: 24 }}>
          <div>
            <span style={{ color: 'var(--verde)', fontSize: 12, letterSpacing: 2, fontWeight: 500 }}>PUBLICAÇÕES</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 7vw, 80px)', color: '#fff', lineHeight: 0.95, marginTop: 12 }}>
              NA IMPRENSA
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 12 }}>
              {ARTIGOS_REAIS.length} artigos publicados em {VEICULOS_FILTRO.length - 1} veículos
            </p>
          </div>
          <input
            value={busca}
            onChange={e => { setBusca(e.target.value); setFellowFiltro(null) }}
            placeholder="Buscar artigo, fellow ou veículo..."
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 4, padding: '10px 16px', color: '#fff', fontSize: 13,
              outline: 'none', width: 260,
            }}
          />
        </div>

        {/* Banner de filtro ativo por fellow */}
        {fellowFiltro && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
            background: 'rgba(126,211,33,0.08)', border: '1px solid rgba(126,211,33,0.25)',
            borderRadius: 8, padding: '10px 16px',
          }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
              Artigos de <strong style={{ color: 'var(--verde)' }}>{fellowFiltro}</strong>
            </span>
            <button
              onClick={() => setFellowFiltro(null)}
              style={{
                marginLeft: 'auto', background: 'none',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 100, color: 'rgba(255,255,255,0.45)', cursor: 'pointer',
                fontSize: 11, padding: '3px 12px', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--verde)'; e.currentTarget.style.color = 'var(--verde)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}
            >
              Limpar filtro ×
            </button>
          </div>
        )}

        {/* Filtro veículos */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
          {VEICULOS_FILTRO.map(v => (
            <button key={v} onClick={() => { setFiltro(v); setFellowFiltro(null) }} style={{
              padding: '6px 14px', borderRadius: 100, fontSize: 11, cursor: 'pointer', transition: 'all 0.2s',
              background: filtro === v && !fellowFiltro ? 'var(--verde)' : 'rgba(255,255,255,0.04)',
              color: filtro === v && !fellowFiltro ? '#000' : 'rgba(255,255,255,0.45)',
              border: filtro === v && !fellowFiltro ? 'none' : '1px solid rgba(255,255,255,0.08)',
              fontWeight: filtro === v && !fellowFiltro ? 500 : 400,
            }}>{v}</button>
          ))}
        </div>

        {/* Lista artigos */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {visiveis.map((a) => (
            <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" style={{
              display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center',
              padding: '22px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
              textDecoration: 'none', transition: 'padding 0.2s, border-color 0.2s, background 0.2s',
              borderLeft: '2px solid transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderLeftColor = 'var(--verde)'
              e.currentTarget.style.paddingLeft = '24px'
              e.currentTarget.style.background = 'rgba(126,211,33,0.02)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderLeftColor = 'transparent'
              e.currentTarget.style.paddingLeft = '16px'
              e.currentTarget.style.background = 'transparent'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'var(--verde)', fontWeight: 500, background: 'rgba(126,211,33,0.1)', padding: '2px 8px', borderRadius: 100 }}>{a.veiculo}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{formatDate(a.data_publicacao)}</span>
                </div>
                <h3 style={{ fontSize: 15, color: '#fff', fontWeight: 400, lineHeight: 1.45, marginBottom: 6 }}>{a.titulo}</h3>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>por {a.fellow_nome}</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 20, flexShrink: 0 }}>↗</span>
            </a>
          ))}
        </div>

        {/* Botão Ver mais */}
        {temMais && (
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button
              onClick={() => setVisibleCount(v => v + ITEMS_POR_PAGINA)}
              style={{
                background: 'transparent', border: '1.5px solid var(--verde)',
                color: 'var(--verde)', borderRadius: 6, padding: '12px 40px',
                fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(126,211,33,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              Ver mais {Math.min(ITEMS_POR_PAGINA, filtrados.length - visibleCount)} artigos →
            </button>
          </div>
        )}

        {filtrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
            Nenhum artigo encontrado para este fellow.
            <br />
            <button
              onClick={() => setFellowFiltro(null)}
              style={{ marginTop: 16, background: 'none', border: 'none', color: 'var(--verde)', cursor: 'pointer', fontSize: 13 }}
            >
              Ver todos os artigos
            </button>
          </div>
        )}

      </div>
    </section>
  )
}
