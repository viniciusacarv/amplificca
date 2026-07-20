-- supabase-fellows-segunda-leva.sql
-- Cadastra a Segunda Leva de fellows do Amplifica (Turma 2026.2).
-- Execute no SQL Editor do Supabase APÓS supabase-financeiro-v2.sql
-- (que criou a tabela `turmas` e as colunas turma_id/contrato_ativo em fellows).
-- Idempotente: pode rodar de novo sem duplicar (guarda por email).

-- 1) Cria a turma da Segunda Leva (não sobrescreve se já existir)
insert into turmas (nome, data_inicio, data_fim, descricao)
values (
  'Turma 2026.2 - Segunda Leva',
  '2026-07-01',
  '2026-12-31',
  'Segunda leva de fellows do programa Amplifica (2026).'
)
on conflict (nome) do nothing;

-- 2) Insere os 6 fellows da Segunda Leva vinculados à turma acima
with turma_segunda as (
  select id from turmas where nome = 'Turma 2026.2 - Segunda Leva'
),
-- Áreas sugeridas com base nas bios (valores válidos vindos de components/Fellows.tsx:6):
-- 'Direito', 'Economia', 'Educação', 'Tecnologia', 'Política', 'Comunicação', 'Gestão Pública'
novos(nome, bio, estado, area, instagram, foto_url, email, tipo_financiamento, bolsa_origem) as (
  values
  (
    'Antônio Zappa',
    'UFPR, local em que pude experienciar a (in)tolerância à diversidade de ideias pela esquerda, que domina amplamente o setor de comunicação da Universidade. Desde antes da fase adulta, sou abertamente libertário e de direita, o que não me rendeu muita simpatia na faculdade, mas trouxe ensinamentos valiosos. Tenho interesse particular em política; história do Brasil, particularmente no resgate de heróis nacionais; história em geral; estudo da guerra, em especial da Guerra da Ucrânia; economia; sociedade e cultura.',
    'PR',
    'Comunicação',
    'zappa.antonio84',
    '/fellows/antonio-zappa.JPG',
    'zappaantonio66@gmail.com',
    'autofinanciado',
    null::text
  ),
  (
    'Ana Clara Moraes Andrade',
    'Ana Andrade é jornalista pela Universidade Federal do Espírito Santo (UFES), pesquisadora e empreendedora. Atua nas áreas de comunicação, política internacional, inovação e educação, desenvolvendo projetos voltados à democratização da informação e ao fortalecimento do pensamento crítico. Seus principais temas de interesse incluem geopolítica, conflitos internacionais, mídia, diplomacia e o impacto das novas tecnologias na sociedade.',
    'ES',
    'Comunicação',
    'anacandradde',
    '/fellows/ana-clara-andrade.jpeg',
    'clara89025@gmail.com',
    'bolsista',
    null::text
  ),
  (
    'Gabriel Russo',
    'Sou estudante de direito, ativista conservador, entusiasta das pautas estudantis, economia liberal, e liberdades no geral. Anti-esquerdista por essência, anti-Lula por necessidade.',
    'SC',
    'Direito',
    'gabrielrusso.sc',
    '/fellows/gabriel-russo.jpeg',
    'gabrielpcanalle@gmail.com',
    'autofinanciado',
    null::text
  ),
  (
    'Suzanna Assayag',
    'Sou servidora pública, palestrante, mentora e pesquisadora, com atuação nas áreas de comportamento humano, educação financeira, liderança e desenvolvimento humano. Minha trajetória reúne experiência no setor privado, financeiro e na gestão pública, aliada à produção de conteúdos, pesquisas e palestras voltadas ao fortalecimento da autonomia, da inteligência emocional e da tomada de decisão consciente.',
    'PA',
    'Educação',
    'suzannaassayag_',
    '/fellows/suzanna-assayag.jpeg',
    'assayagsuzanna@icloud.com',
    'autofinanciado',
    null::text
  ),
  (
    'Karla Ribeiro',
    'Sou Karla Ribeiro, atuo nas áreas de gestão de pessoas e consultoria em criação e desenvolvimento de projetos, com foco em resultados, inovação e sustentabilidade. Auxilio empreendedores e profissionais a transformar ideias em ações estratégicas por meio de planejamento, organização e visão de negócios. Sou Scrum Master em Projetos Ágeis, especialista em Estatística, estudei Business na University of Delaware (Estados Unidos), possuo MBA em Gestão de Negócios e Empreendedorismo pela FGV/RJ e formação em Intérprete de Conferência pela PUC-Rio. Com experiência nos setores corporativo e governamental, dedico-me ao desenvolvimento de pessoas, ao empreendedorismo, à inovação, à análise de dados, à gestão de projetos e à melhoria de processos, integrando estratégia, tecnologia e soluções orientadas para resultados.',
    'RJ',
    'Gestão Pública',
    'karlaribeiroprojetos',
    '/fellows/karla-ribeiro.jpg',
    'karlainglesnave@gmail.com',
    'autofinanciado',
    null::text
  ),
  (
    'Mauricio Conti',
    'Rondoniense de coração desde os 9 meses de idade, é produtor rural, microempreendedor e acredita no trabalho como instrumento de transformação. Defensor da inovação, do empreendedorismo e da livre iniciativa, é pré-candidato a deputado federal com o propósito de construir uma Rondônia com mais oportunidades, menos burocracia e mais respeito a quem produz, investe e gera empregos.',
    'RO',
    'Política',
    'soumauricioconti',
    '/fellows/mauricio-conti.jpeg',
    'eng.conti@gmail.com',
    'autofinanciado',
    null::text
  )
)
insert into fellows (
  nome, bio, estado, area, instagram, foto_url,
  email, tipo_financiamento, bolsa_origem,
  turma_id, contrato_ativo
)
select
  n.nome, n.bio, n.estado, n.area, n.instagram, n.foto_url,
  n.email, n.tipo_financiamento, n.bolsa_origem,
  t.id, true
from novos n
cross join turma_segunda t
where not exists (
  select 1 from fellows f where lower(f.email) = lower(n.email)
);

-- Se você já tinha rodado a versão anterior do script (sem area), rode também
-- estes UPDATEs pra preencher o campo dos fellows já inseridos:
update fellows set area = 'Comunicação'   where email = 'zappaantonio66@gmail.com'   and area is null;
update fellows set area = 'Comunicação'   where email = 'clara89025@gmail.com'       and area is null;
update fellows set area = 'Direito'       where email = 'gabrielpcanalle@gmail.com'  and area is null;
update fellows set area = 'Educação'      where email = 'assayagsuzanna@icloud.com'  and area is null;
update fellows set area = 'Gestão Pública' where email = 'karlainglesnave@gmail.com' and area is null;
update fellows set area = 'Política'      where email = 'eng.conti@gmail.com'        and area is null;

-- 3) Conferência rápida
select id, nome, estado, area, tipo_financiamento, foto_url, turma_id
from fellows
where email in (
  'zappaantonio66@gmail.com',
  'clara89025@gmail.com',
  'gabrielpcanalle@gmail.com',
  'assayagsuzanna@icloud.com',
  'karlainglesnave@gmail.com',
  'eng.conti@gmail.com'
)
order by nome;
