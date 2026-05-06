-- supabase-financeiro-v6.sql
-- Adiciona policy de escrita em `fellows` para a whitelist do financeiro.
-- A tabela já tem policy de SELECT pública (supabase-setup.sql), mas faltava
-- INSERT/UPDATE/DELETE. Por isso edições de WhatsApp e outros campos falhavam
-- silenciosamente: RLS negava o UPDATE e o Supabase retornava error=null.
--
-- Execute APÓS supabase-financeiro-v5.sql.

drop policy if exists "fellows_escrita_financeiro" on fellows;

create policy "fellows_escrita_financeiro" on fellows for all
  using      (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'))
  with check (lower(auth.jwt() ->> 'email') in ('anne@institutoamplifica.com', 'vinicius_acarvalho@outlook.com'));
