-- supabase-financeiro-v2.sql
-- Extensões do painel financeiro: turmas, categorias, configurações, contrato.
-- Execute APÓS supabase-financeiro.sql.

-- 1) Turmas
create table if not exists turmas (
  id bigint generated always as identity primary key,
  nome text not null unique,
  data_inicio date not null,
  data_fim date not null,
  descricao text,
  created_at timestamptz default now()
);

insert into turmas (nome, data_inicio, data_fim, descricao)
values ('Turma 2026.1', '2026-03-01', '2026-08-31', 'Primeira turma do programa Amplifica.')
on conflict (nome) do nothing;

-- 2) Fellows: turma, contrato e whatsapp
alter table fellows add column if not exists turma_id bigint references turmas(id) on delete set null;
alter table fellows add column if not exists contrato_ativo boolean default true;
alter table fellows add column if not exists contrato_encerrado_em date;
alter table fellows add column if not exists whatsapp text;

-- Atribui turma 1 a todos os 20 fellows da planilha
update fellows
set turma_id = (select id from turmas where nome = 'Turma 2026.1')
where tipo_financiamento in ('autofinanciado', 'bolsista')
  and turma_id is null;

-- 3) Categorias de receita/despesa (catálogo)
create table if not exists financeiro_categorias (
  id bigint generated always as identity primary key,
  nome text not null,
  tipo text not null check (tipo in ('receita', 'despesa')),
  cor text,
  created_at timestamptz default now(),
  unique (nome, tipo)
);

insert into financeiro_categorias (nome, tipo, cor) values
  ('Equipe',          'despesa', '#f43f5e'),
  ('Tecnologia',      'despesa', '#3b82f6'),
  ('Eventos',         'despesa', '#a855f7'),
  ('Operacional',     'despesa', '#64748b'),
  ('Marketing',       'despesa', '#f59e0b'),
  ('Mensalidades',    'receita', '#f59e0b'),
  ('Doações',         'receita', '#10b981'),
  ('Patrocínios',     'receita', '#3b82f6'),
  ('Produtos',        'receita', '#a855f7'),
  ('Outras Receitas', 'receita', '#64748b')
on conflict (nome, tipo) do nothing;

-- 4) Configurações do financeiro (singleton)
create table if not exists financeiro_config (
  id int primary key default 1 check (id = 1),
  pix_chave text,
  pix_tipo text check (pix_tipo in ('cpf', 'cnpj', 'email', 'telefone', 'aleatoria') or pix_tipo is null),
  beneficiario text,
  banco text,
  prazo_dia int default 10 check (prazo_dia between 1 and 28),
  instrucoes text,
  whatsapp_template text default 'Oi {nome}! 👋

Lembrete amigável da mensalidade do Amplifica referente a {mes_extenso}, no valor de R$ {valor}.

📌 Pague via PIX para a chave: {pix_chave}
👤 Em nome de: {beneficiario}
📅 Prazo: até dia {prazo_dia} de {mes_extenso}.

Quando pagar, manda o comprovante por aqui pra gente baixar a cobrança. Qualquer dúvida estou à disposição.

Obrigada! 💚'
);

insert into financeiro_config (id) values (1) on conflict (id) do nothing;

-- 5) RLS turmas, categorias, config — leitura para qualquer autenticado, escrita só whitelist
alter table turmas                enable row level security;
alter table financeiro_categorias enable row level security;
alter table financeiro_config     enable row level security;

drop policy if exists "turmas_leitura"               on turmas;
drop policy if exists "turmas_escrita"               on turmas;
drop policy if exists "categorias_leitura"           on financeiro_categorias;
drop policy if exists "categorias_escrita"           on financeiro_categorias;
drop policy if exists "config_leitura"               on financeiro_config;
drop policy if exists "config_escrita"               on financeiro_config;

create policy "turmas_leitura" on turmas for select using (auth.role() = 'authenticated');
create policy "turmas_escrita" on turmas for all
  using      (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'))
  with check (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'));

create policy "categorias_leitura" on financeiro_categorias for select using (auth.role() = 'authenticated');
create policy "categorias_escrita" on financeiro_categorias for all
  using      (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'))
  with check (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'));

create policy "config_leitura" on financeiro_config for select
  using (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'));
create policy "config_escrita" on financeiro_config for all
  using      (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'))
  with check (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'));

-- 6) Adicionar categoria_id em receitas e despesas (opcional, retrocompat)
alter table financeiro_receitas_avulsas add column if not exists categoria_id bigint references financeiro_categorias(id) on delete set null;
alter table financeiro_despesas         add column if not exists categoria_id bigint references financeiro_categorias(id) on delete set null;
