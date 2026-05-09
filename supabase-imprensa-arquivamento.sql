-- supabase-imprensa-arquivamento.sql
-- Adiciona campo de justificativa para arquivamento administrativo de submissões.
-- O status 'arquivado' é gravado em submissoes.status (já é text livre, não é enum).
-- Não altera dados existentes.

ALTER TABLE submissoes
  ADD COLUMN IF NOT EXISTS motivo_arquivamento text;

COMMENT ON COLUMN submissoes.motivo_arquivamento IS
  'Justificativa do admin ao arquivar a submissão (ex.: inadimplência do fellow). Preenchido apenas quando status = ''arquivado''.';
