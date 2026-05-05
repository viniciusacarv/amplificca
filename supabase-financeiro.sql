-- Painel Financeiro do Instituto Amplifica
-- Execute no SQL Editor do Supabase após o supabase-setup.sql.

-- 1) Adiciona colunas em fellows (idempotente)
alter table fellows add column if not exists email text;
alter table fellows add column if not exists tipo_financiamento text
  check (tipo_financiamento in ('autofinanciado', 'bolsista'));
alter table fellows add column if not exists bolsa_origem text;

-- 2) Atualiza fellows com base na planilha de contratos (match por nome aproximado)
update fellows set tipo_financiamento = 'autofinanciado', email = coalesce(email, 'anacarolinabeltraopeixoto@gmail.com') where nome ilike 'Ana Carolina Beltr%';
update fellows set tipo_financiamento = 'autofinanciado', email = coalesce(email, 'barbara.abras@outlook.com.br')      where nome ilike 'Barbara%Abras%';
update fellows set tipo_financiamento = 'autofinanciado', email = coalesce(email, 'davisouzapbh@gmail.com')             where nome ilike 'Davi%Souza%';
update fellows set tipo_financiamento = 'autofinanciado', email = coalesce(email, 'eduardoinojosaadv@outlook.com')      where nome ilike 'Eduardo%Inojosa%';
update fellows set tipo_financiamento = 'autofinanciado', email = coalesce(email, 'gabrielamprod@gmail.com')            where nome ilike 'Gabriela%Martins%';
update fellows set tipo_financiamento = 'autofinanciado', email = coalesce(email, 'iterceiro@studentsforliberty.org')   where nome ilike 'Ivanildo%';
update fellows set tipo_financiamento = 'autofinanciado', email = coalesce(email, 'jeferson.scheibler@universo.univates.br') where nome ilike 'Jeferson%';
update fellows set tipo_financiamento = 'autofinanciado', email = coalesce(email, 'ferreiranetoeng@gmail.com')          where nome ilike 'Pedro%Ferreira%';
update fellows set tipo_financiamento = 'autofinanciado', email = coalesce(email, 'mprcandeloro@gmail.com')             where nome ilike 'Marcos%Candeloro%';
update fellows set tipo_financiamento = 'autofinanciado', email = coalesce(email, 'zizibritto@yahoo.com')               where nome ilike 'Zizi%' or nome ilike 'Alzemeri%';

update fellows set tipo_financiamento = 'bolsista', bolsa_origem = 'Bolsa Geral', email = coalesce(email, 'amandacaixeta@outlook.com')    where nome ilike 'Amanda%Caixeta%';
update fellows set tipo_financiamento = 'bolsista', bolsa_origem = 'Bolsa SFL',   email = coalesce(email, 'bruno.sperancetta@gmail.com')  where nome ilike 'Bruno%Sperancetta%';
update fellows set tipo_financiamento = 'bolsista', bolsa_origem = 'Bolsa IFL',   email = coalesce(email, 'germano_laube@hotmail.com')    where nome ilike 'Germano%Laube%';
update fellows set tipo_financiamento = 'bolsista', bolsa_origem = 'Bolsa Geral', email = coalesce(email, 'juliadecastroplacido@gmail.com') where nome ilike 'Julia%Castro%';
update fellows set tipo_financiamento = 'bolsista', bolsa_origem = 'Bolsa SFL',   email = coalesce(email, 'nathalia.welker@gmail.com')    where nome ilike 'Nathalia%Welker%';
update fellows set tipo_financiamento = 'bolsista', bolsa_origem = 'Bolsa IFL',   email = coalesce(email, 'wesley.areis@outlook.com')     where nome ilike 'Wesley%Reis%';
update fellows set tipo_financiamento = 'bolsista', bolsa_origem = 'Bolsa Geral', email = coalesce(email, 'william.clavijo1990@gmail.com') where nome ilike 'William%Clavijo%';
update fellows set tipo_financiamento = 'bolsista', bolsa_origem = 'Bolsa IFL',   email = coalesce(email, 'oyuriquadros@gmail.com')        where nome ilike 'Yuri%Quadros%';
update fellows set tipo_financiamento = 'bolsista', bolsa_origem = 'Bolsa LOLA',  email = coalesce(email, 'lecruzbarros@gmail.com')        where nome ilike 'Let%cia%Barros%';
update fellows set tipo_financiamento = 'bolsista', bolsa_origem = 'Bolsa Geral', email = coalesce(email, 'ronanmatosoficial@gmail.com')  where nome ilike 'Ronan%Matos%';

-- 3) Cobranças mensais dos fellows
create table if not exists financeiro_cobrancas (
  id bigint generated always as identity primary key,
  fellow_id bigint not null references fellows(id) on delete cascade,
  mes_referencia date not null, -- sempre dia 1 do mês (yyyy-mm-01)
  valor numeric(10,2) not null default 300.00,
  status text not null default 'pendente' check (status in ('pendente', 'pago', 'inadimplente')),
  data_pagamento date,
  observacao text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (fellow_id, mes_referencia)
);

create index if not exists idx_financeiro_cobrancas_mes on financeiro_cobrancas (mes_referencia);
create index if not exists idx_financeiro_cobrancas_status on financeiro_cobrancas (status);

-- 4) Receitas avulsas (doações, patrocínios, outras)
create table if not exists financeiro_receitas_avulsas (
  id bigint generated always as identity primary key,
  tipo text not null check (tipo in ('doacao', 'patrocinio', 'produto', 'outro')),
  descricao text not null,
  origem text,
  valor numeric(12,2) not null,
  data date not null,
  projeto text,
  observacao text,
  created_at timestamptz default now()
);

create index if not exists idx_receitas_avulsas_data on financeiro_receitas_avulsas (data);
create index if not exists idx_receitas_avulsas_tipo on financeiro_receitas_avulsas (tipo);

-- 5) Despesas
create table if not exists financeiro_despesas (
  id bigint generated always as identity primary key,
  categoria text not null,
  descricao text not null,
  fornecedor text,
  valor numeric(12,2) not null,
  data date not null,
  projeto text,
  observacao text,
  created_at timestamptz default now()
);

create index if not exists idx_despesas_data on financeiro_despesas (data);
create index if not exists idx_despesas_categoria on financeiro_despesas (categoria);

-- 6) RLS — apenas Anne e Vinicius
alter table financeiro_cobrancas         enable row level security;
alter table financeiro_receitas_avulsas  enable row level security;
alter table financeiro_despesas          enable row level security;

drop policy if exists "financeiro_cobrancas_acesso"        on financeiro_cobrancas;
drop policy if exists "financeiro_receitas_avulsas_acesso" on financeiro_receitas_avulsas;
drop policy if exists "financeiro_despesas_acesso"         on financeiro_despesas;

create policy "financeiro_cobrancas_acesso" on financeiro_cobrancas
  for all
  using      (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'))
  with check (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'));

create policy "financeiro_receitas_avulsas_acesso" on financeiro_receitas_avulsas
  for all
  using      (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'))
  with check (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'));

create policy "financeiro_despesas_acesso" on financeiro_despesas
  for all
  using      (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'))
  with check (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'));
