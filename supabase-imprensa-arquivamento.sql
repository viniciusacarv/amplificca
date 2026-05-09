-- supabase-imprensa-arquivamento.sql
-- Adiciona campo de justificativa para arquivamento administrativo de submissões
-- e amplia o CHECK constraint de status para incluir 'arquivado'.
-- Não altera dados existentes.

ALTER TABLE submissoes
  ADD COLUMN IF NOT EXISTS motivo_arquivamento text;

COMMENT ON COLUMN submissoes.motivo_arquivamento IS
  'Justificativa do admin ao arquivar a submissão (ex.: inadimplência do fellow). Preenchido apenas quando status = ''arquivado''.';

-- Recria o CHECK constraint de status incluindo 'arquivado'.
ALTER TABLE submissoes
  DROP CONSTRAINT IF EXISTS submissoes_status_check;

ALTER TABLE submissoes
  ADD CONSTRAINT submissoes_status_check CHECK (
    status IN (
      'recebido',
      'em_avaliacao',
      'ajustes_solicitados',
      'aprovado',
      'enviado_imprensa',
      'publicado',
      'rejeitado',
      'retirado_fellow',
      'arquivado'
    )
  );
