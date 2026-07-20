-- supabase-fellows-arquivar-desistentes.sql
-- Arquiva (soft delete) os fellows desistentes: oculta do site e bloqueia o login,
-- MAS preserva o registro deles em fellows (reversível). Apaga os artigos publicados.
--
-- Desistentes:
--   Marcos Paulo Candeloro  - mprcandeloro@gmail.com
--   Pedro Neto              - ferreiranetoeng@gmail.com
--
-- (Aléxis Melo Nepomuceno foi descartado — nunca entrou na base.)
--
-- Rode no SQL Editor do Supabase. IMPORTANTE: rode este SQL ANTES de dar deploy do
-- código novo (o site passa a filtrar a coluna `arquivado`, que é criada aqui).

-- 1) Coluna de arquivamento (idempotente). Todos os fellows existentes viram false.
alter table fellows add column if not exists arquivado boolean not null default false;

-- 2) (Opcional) Confira o que está vinculado ANTES de apagar os artigos:
select
  f.id, f.nome, f.email,
  (select count(*) from artigos a
     where a.fellow_id = f.id or a.fellow_nome = f.nome) as artigos_a_apagar
from fellows f
where f.email in (
  'mprcandeloro@gmail.com',
  'ferreiranetoeng@gmail.com'
)
order by f.nome;

-- 3) Marca os 2 como arquivados e encerra o contrato (para sumir do financeiro também)
update fellows
set arquivado = true,
    contrato_ativo = false,
    contrato_encerrado_em = coalesce(contrato_encerrado_em, current_date)
where email in (
  'mprcandeloro@gmail.com',
  'ferreiranetoeng@gmail.com'
);

-- 4) Apaga os artigos publicados deles — tanto os vinculados por fellow_id quanto
--    os vinculados só pelo nome (publicações independentes).
delete from artigos
where fellow_id in (
        select id from fellows where email in (
          'mprcandeloro@gmail.com',
          'ferreiranetoeng@gmail.com'
        )
      )
   or fellow_nome in (
        select nome from fellows where email in (
          'mprcandeloro@gmail.com',
          'ferreiranetoeng@gmail.com'
        )
      );

-- 5) Bloqueia o login (reversível). banned_until no futuro = GoTrue recusa o login.
--    Para REATIVAR o acesso depois: set banned_until = null para o e-mail.
update auth.users
set banned_until = '2999-12-31 00:00:00+00'
where lower(email) in (
  'mprcandeloro@gmail.com',
  'ferreiranetoeng@gmail.com'
);

-- 6) Conferência final
select
  f.nome,
  f.arquivado,
  f.contrato_ativo,
  (select count(*) from artigos a
     where a.fellow_id = f.id or a.fellow_nome = f.nome) as artigos_restantes,
  (u.banned_until is not null and u.banned_until > now())  as login_bloqueado
from fellows f
left join auth.users u on lower(u.email) = lower(f.email)
where f.email in (
  'mprcandeloro@gmail.com',
  'ferreiranetoeng@gmail.com'
)
order by f.nome;
