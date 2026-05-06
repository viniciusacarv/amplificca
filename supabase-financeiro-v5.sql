-- supabase-financeiro-v5.sql
-- Storage de arquivos (contratos, comprovantes, NFs) + sync pagamento↔despesa.
-- Execute APÓS supabase-financeiro-v4.sql.

-- 1) Colunas de URL de arquivos
alter table equipe_financeiro  add column if not exists contrato_url text;
alter table pagamentos_equipe  add column if not exists comprovante_url text;
alter table pagamentos_equipe  add column if not exists nota_fiscal_url text;

-- 2) Link pagamento → despesa (sync com /custos e /dashboard)
alter table pagamentos_equipe
  add column if not exists despesa_id bigint references financeiro_despesas(id) on delete set null;

create index if not exists idx_pagamentos_equipe_despesa on pagamentos_equipe (despesa_id);

-- 3) Bucket privado para arquivos do financeiro
-- IMPORTANTE: rodar UMA VEZ. Se já existir, ignora.
insert into storage.buckets (id, name, public)
values ('financeiro', 'financeiro', false)
on conflict (id) do nothing;

-- 4) RLS no bucket — só whitelist Anne/Vinicius
drop policy if exists "financeiro_storage_select" on storage.objects;
drop policy if exists "financeiro_storage_insert" on storage.objects;
drop policy if exists "financeiro_storage_update" on storage.objects;
drop policy if exists "financeiro_storage_delete" on storage.objects;

create policy "financeiro_storage_select" on storage.objects for select
  using (
    bucket_id = 'financeiro'
    and lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com')
  );

create policy "financeiro_storage_insert" on storage.objects for insert
  with check (
    bucket_id = 'financeiro'
    and lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com')
  );

create policy "financeiro_storage_update" on storage.objects for update
  using (
    bucket_id = 'financeiro'
    and lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com')
  );

create policy "financeiro_storage_delete" on storage.objects for delete
  using (
    bucket_id = 'financeiro'
    and lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com')
  );
