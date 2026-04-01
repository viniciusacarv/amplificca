-- Execute este SQL no Supabase: SQL Editor → New query → cole e clique em Run

-- Tabela de fellows
create table if not exists fellows (
  id bigint generated always as identity primary key,
  nome text not null,
  bio text,
  estado char(2),
  area text,
  instagram text,
  foto_url text,
  created_at timestamptz default now()
);

-- Tabela de artigos
create table if not exists artigos (
  id bigint generated always as identity primary key,
  titulo text not null,
  url text not null,
  fellow_id bigint references fellows(id),
  fellow_nome text,
  veiculo text,
  data_publicacao date,
  thumbnail_url text,
  tags text[],
  created_at timestamptz default now()
);

-- Liberar leitura pública (só leitura, sem autenticação)
alter table fellows enable row level security;
alter table artigos enable row level security;

create policy "leitura publica fellows" on fellows for select using (true);
create policy "leitura publica artigos" on artigos for select using (true);

-- Inserir fellows da 1ª turma
insert into fellows (nome, bio, estado, area, instagram) values
('Amanda Caixeta', 'Jornalista por formação, chefe geral de comunicação e imprensa do deputado federal Gustavo Gayer.', 'GO', 'Comunicação', 'amandacaixeeta'),
('Ana Carolina Beltrão Peixoto', 'Administradora, Assistente Social e Pedagoga. Doutora em Serviço Social e Mestre em Meio Ambiente. Gestora Pública e Professora Universitária.', 'MG', 'Educação', 'acarolprofessora'),
('Barbara Abras', 'Bacharel em Administração com experiência em gestão pública, gestão de pessoas e advocacy. Focada em políticas de desenvolvimento social.', 'MG', 'Gestão Pública', 'barbara.abras'),
('Bruno Sperancetta', 'Presidente do movimento estudantil JL (Juventude Livre). Estudante de Direito na PUCPR. Voluntário SFLB e Líder Livres.', 'PR', 'Direito', 'bruno_sperancetta'),
('Davi de Souza', 'Assessor Parlamentar na Câmara dos Deputados e Diretor de Relações Institucionais do Novo Jovem. Pesquisador em Ciência Política pela UnB.', 'DF', 'Política', 'davidesouzabh'),
('Eduardo Inojosa', 'Advogado e mestre em economia pelo Insper. Suplente de vereador no Recife. Defende políticas públicas baseadas em dados e evidências.', 'PE', 'Economia', 'eduardoinojosaa'),
('Gabriela Martins Nunes', 'Project Leader no Mercado Livre. Mestre em Pesquisa Operacional pelo ITA. Influenciadora no ramo de carreira e sociedade.', 'SP', 'Tecnologia', 'gabrielamartinsn'),
('Germano Laube', 'Especialista em Mercado Financeiro, Consultor de Investimentos e sócio cofundador da LDC Capital.', 'RS', 'Economia', 'germano_laube'),
('Ivanildo Francisco dos Santos Terceiro', 'Diretor Global de Marketing da Students For Liberty. Coordena campanhas que alcançam milhões de pessoas por semana.', 'BA', 'Comunicação', 'ivanildoiii'),
('Jeferson Scheibler', 'Acadêmico de Engenharia de Software, embaixador da ICSC e Local Lead do NASA Space Apps.', 'RS', 'Tecnologia', 'jeferson_scheibler'),
('Julia de Castro', 'Formada em História pela UFRJ. Vice-presidente da ala jovem do Partido Liberal.', 'RJ', 'Política', 'juliadecastrobr'),
('Letícia Barros', 'Advogada e empreendedora em comunicação política. Gerente de comunicação global do LOLA.', 'RJ', 'Comunicação', 'leticiabbarros'),
('Marcos Paulo Candeloro', 'Graduado em História (USP), pós-graduado em Ciências Políticas (Columbia University). Professor, jornalista e analista político.', 'SP', 'Política', 'mpcanderolo'),
('Nathalia Welker', 'Responsável pela comunicação do Partido NOVO no RS. Embaixadora do Students For Liberty Brasil.', 'RS', 'Comunicação', 'nathaliawelker'),
('Pedro Ferreira da Silva Neto', 'Engenheiro civil, gestor público e analista político. Atua nas redes com foco em segurança pública e liberdade econômica.', 'RJ', 'Política', 'pedronetorio'),
('Ronan Matos', 'Escritor, jornalista, editor-chefe do Diário do Acre e Embaixador Estadual do Students For Liberty Brasil.', 'AC', 'Comunicação', 'ronanmatosac'),
('Wesley Reis', 'Economista e diretor do IFL Rio de Janeiro. Colunista do Instituto Millenium sobre desburocratização e liderança.', 'RJ', 'Economia', 'wesley.areis'),
('William A. Clavijo Vitto', 'Cientista político venezuelano. Mestre e doutor em Políticas Públicas pela UFRJ. Presidente da Associação Venezuela Global.', 'RJ', 'Política', 'wclavijo90'),
('Yuri Quadros', 'Articulista e cofundador do Instituto Aliança dos Inconfidentes. Defende visão liberal-conservadora com foco em federalismo.', 'MG', 'Política', 'oyuriquadros'),
('Zizi Martins', 'Advogada pública, consultora e comentarista política. Pós-doutora em política, comportamento e mídia.', 'DF', 'Direito', 'zizimartinsoficial');
