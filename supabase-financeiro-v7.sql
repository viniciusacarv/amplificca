-- supabase-financeiro-v7.sql
-- Módulo de Patrocínios e Doações: cadastro de parceiros financeiros (CRM)
-- e extensão de financeiro_receitas_avulsas com campos de recorrência, parceiro e pagamento.
-- Execute APÓS supabase-financeiro-v6.sql.

-- 1) Parceiros financeiros (doadores, patrocinadores, apoiadores, etc.)
create table if not exists parceiros_financeiros (
  id bigint generated always as identity primary key,
  nome text not null,
  tipo text not null default 'doador'
    check (tipo in ('pessoa_fisica', 'empresa', 'instituto', 'patrocinador', 'doador', 'parceiro', 'outro')),
  documento text,                         -- CPF ou CNPJ (opcional)
  email text,
  telefone text,
  contato_nome text,                      -- pessoa de contato (para empresas/institutos)
  status text not null default 'ativo'
    check (status in ('ativo', 'inativo', 'prospect', 'pausado')),
  tags text,                              -- texto livre separado por vírgula
  projeto text,                           -- projeto vinculado (opcional)
  observacao text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_parceiros_nome   on parceiros_financeiros (nome);
create index if not exists idx_parceiros_tipo   on parceiros_financeiros (tipo);
create index if not exists idx_parceiros_status on parceiros_financeiros (status);

-- 2) Atualiza o CHECK de `tipo` em financeiro_receitas_avulsas para incluir 'parceria'
alter table financeiro_receitas_avulsas
  drop constraint if exists financeiro_receitas_avulsas_tipo_check;

alter table financeiro_receitas_avulsas
  add constraint financeiro_receitas_avulsas_tipo_check
  check (tipo in ('doacao', 'patrocinio', 'parceria', 'produto', 'outro'));

-- 3) Extensão de financeiro_receitas_avulsas com campos do módulo de patrocínios
alter table financeiro_receitas_avulsas
  add column if not exists parceiro_id   bigint references parceiros_financeiros(id) on delete set null,
  add column if not exists recorrencia   text default 'unica'
    check (recorrencia in ('unica', 'mensal', 'trimestral', 'anual') or recorrencia is null),
  add column if not exists metodo_pagamento text
    check (metodo_pagamento in ('pix', 'transferencia', 'boleto', 'cartao', 'dinheiro', 'outro') or metodo_pagamento is null),
  add column if not exists status_receita text default 'pago'
    check (status_receita in ('pago', 'pendente', 'cancelado') or status_receita is null),
  add column if not exists mes_referencia date;  -- sempre dia 1 do mês (yyyy-mm-01)

create index if not exists idx_receitas_parceiro      on financeiro_receitas_avulsas (parceiro_id);
create index if not exists idx_receitas_recorrencia   on financeiro_receitas_avulsas (recorrencia);
create index if not exists idx_receitas_mes_referencia on financeiro_receitas_avulsas (mes_referencia);
create index if not exists idx_receitas_status_receita on financeiro_receitas_avulsas (status_receita);

-- 3) RLS — mesma whitelist das demais tabelas financeiras
alter table parceiros_financeiros enable row level security;

drop policy if exists "parceiros_financeiros_acesso" on parceiros_financeiros;

create policy "parceiros_financeiros_acesso" on parceiros_financeiros
  for all
  using      (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'))
  with check (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'));

-- 4) Seed de categorias de receita para patrocínios/doações (idempotente)
insert into financeiro_categorias (nome, tipo, cor) values
  ('Patrocínio Institucional', 'receita', '#3b82f6'),
  ('Doação Recorrente',        'receita', '#10b981'),
  ('Doação Pontual',           'receita', '#06b6d4'),
  ('Parceria de Projeto',      'receita', '#a855f7')
on conflict (nome, tipo) do nothing;
