-- supabase-financeiro-v3.sql
-- Fornecedores, Equipe, Produtos, vínculo Fellow×Produto.
-- Execute APÓS supabase-financeiro-v2.sql.

-- 1) Fornecedores
create table if not exists fornecedores (
  id bigint generated always as identity primary key,
  nome text not null,
  tipo text default 'fornecedor' check (tipo in ('fornecedor', 'parceiro', 'cliente', 'outro')),
  contato_nome text,
  contato_email text,
  contato_whatsapp text,
  observacao text,
  ativo boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_fornecedores_nome on fornecedores (nome);

-- 2) Equipe (time financeiro)
create table if not exists equipe_financeiro (
  id bigint generated always as identity primary key,
  nome text not null,
  funcao text,
  email text,
  whatsapp text,
  salario_mensal numeric(12,2) default 0,
  contratado_em date,
  ativo boolean default true,
  observacao text,
  created_at timestamptz default now()
);

create index if not exists idx_equipe_ativo on equipe_financeiro (ativo);

-- 3) Produtos
create table if not exists produtos (
  id bigint generated always as identity primary key,
  nome text not null,
  descricao text,
  modelo text not null default 'pacote' check (modelo in ('pacote', 'avulso')),
  valor numeric(12,2) not null default 0,
  recorrencia text default 'mensal' check (recorrencia in ('mensal', 'unica') or recorrencia is null),
  duracao_meses int,
  ativo boolean default true,
  cor text,
  created_at timestamptz default now()
);

insert into produtos (nome, descricao, modelo, valor, recorrencia, duracao_meses, cor)
values
  ('Programa Turma', 'Pacote completo do programa: assessoria de imprensa, conteúdo programático, oratória e debate.', 'pacote', 300, 'mensal', 6, '#f59e0b'),
  ('Assessoria de Imprensa avulsa', 'Pacote independente de assessoria de imprensa.', 'avulso', 0, 'unica', null, '#3b82f6'),
  ('Curso de Oratória', 'Curso de oratória avulso.', 'avulso', 0, 'unica', null, '#a855f7')
on conflict do nothing;

-- 4) Vínculo Fellow × Produto (N:N)
create table if not exists fellow_produtos (
  id bigint generated always as identity primary key,
  fellow_id bigint not null references fellows(id) on delete cascade,
  produto_id bigint not null references produtos(id) on delete cascade,
  data_inicio date not null,
  data_fim date,
  valor_negociado numeric(12,2),
  status text default 'ativo' check (status in ('ativo', 'encerrado', 'pausado')),
  observacao text,
  created_at timestamptz default now()
);

create index if not exists idx_fellow_produtos_fellow on fellow_produtos (fellow_id);
create index if not exists idx_fellow_produtos_produto on fellow_produtos (produto_id);

-- 5) Despesas: liga ao fornecedor (FK opcional)
alter table financeiro_despesas add column if not exists fornecedor_id bigint references fornecedores(id) on delete set null;
alter table financeiro_despesas add column if not exists equipe_id bigint references equipe_financeiro(id) on delete set null;

-- 6) Re-seed das 7 categorias de despesa (mantém as antigas, garante presença)
insert into financeiro_categorias (nome, tipo, cor) values
  ('Equipe',         'despesa', '#f43f5e'),
  ('Tecnologia',     'despesa', '#3b82f6'),
  ('Eventos',        'despesa', '#a855f7'),
  ('Marketing',      'despesa', '#f59e0b'),
  ('Operacional',    'despesa', '#64748b'),
  ('Conteúdo',       'despesa', '#10b981'),
  ('Imprensa',       'despesa', '#ec4899')
on conflict (nome, tipo) do nothing;

-- 7) RLS
alter table fornecedores       enable row level security;
alter table equipe_financeiro  enable row level security;
alter table produtos           enable row level security;
alter table fellow_produtos    enable row level security;

drop policy if exists "fornecedores_acesso"      on fornecedores;
drop policy if exists "equipe_acesso"            on equipe_financeiro;
drop policy if exists "produtos_leitura"         on produtos;
drop policy if exists "produtos_escrita"         on produtos;
drop policy if exists "fellow_produtos_leitura"  on fellow_produtos;
drop policy if exists "fellow_produtos_escrita"  on fellow_produtos;

create policy "fornecedores_acesso" on fornecedores for all
  using      (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'))
  with check (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'));

create policy "equipe_acesso" on equipe_financeiro for all
  using      (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'))
  with check (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'));

create policy "produtos_leitura" on produtos for select using (auth.role() = 'authenticated');
create policy "produtos_escrita" on produtos for all
  using      (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'))
  with check (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'));

create policy "fellow_produtos_leitura" on fellow_produtos for select using (auth.role() = 'authenticated');
create policy "fellow_produtos_escrita" on fellow_produtos for all
  using      (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'))
  with check (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'));
