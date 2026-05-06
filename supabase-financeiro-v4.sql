-- supabase-financeiro-v4.sql
-- Pagamentos individuais por membro do time (histórico mensal de salários pagos).
-- Execute APÓS supabase-financeiro-v3.sql.

-- 1) Tabela de pagamentos do time
create table if not exists pagamentos_equipe (
  id bigint generated always as identity primary key,
  equipe_id bigint not null references equipe_financeiro(id) on delete cascade,
  mes_referencia date not null, -- sempre dia 01 do mês de referência
  valor_pago numeric(12,2) not null default 0,
  data_pagamento date,
  observacao text,
  created_at timestamptz default now()
);

-- Garante apenas um pagamento por membro/mês (idempotência)
create unique index if not exists uq_pagamentos_equipe_membro_mes
  on pagamentos_equipe (equipe_id, mes_referencia);

create index if not exists idx_pagamentos_equipe_mes on pagamentos_equipe (mes_referencia);

-- 2) RLS
alter table pagamentos_equipe enable row level security;

drop policy if exists "pagamentos_equipe_acesso" on pagamentos_equipe;

create policy "pagamentos_equipe_acesso" on pagamentos_equipe for all
  using      (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'))
  with check (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'));
