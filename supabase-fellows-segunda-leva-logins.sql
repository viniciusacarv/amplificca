-- supabase-fellows-segunda-leva-logins.sql
-- Cria as contas de LOGIN (auth.users + auth.identities) dos fellows da Segunda Leva
-- que ainda faltam, SEM enviar e-mail (contorna o rate limit do convite do Supabase).
--
-- NÃO inclui zappaantonio66@gmail.com nem clara89025@gmail.com — esses já foram
-- convidados por e-mail e não devem ser recriados aqui.
--
-- Cada fellow entra com a MESMA senha temporária e deve trocá-la no primeiro login.
-- Rode no SQL Editor do Supabase. É idempotente: pula quem já existe em auth.users.
--
-- ⚠️ SEGURANÇA: antes de rodar, substitua o placeholder DEFINA_SENHA_TEMPORARIA_AQUI
-- (na chamada crypt() abaixo) por uma senha temporária real. NUNCA versione a senha
-- real neste arquivo — o repositório guarda apenas o placeholder.

-- pgcrypto já vem habilitado no Supabase (fornece crypt() e gen_salt()).
create extension if not exists pgcrypto;

with dados (email) as (
  values
    ('gabrielpcanalle@gmail.com'),   -- Gabriel Russo
    ('assayagsuzanna@icloud.com'),   -- Suzanna Assayag
    ('karlainglesnave@gmail.com'),   -- Karla Ribeiro
    ('eng.conti@gmail.com')          -- Mauricio Conti
),
-- Só cria quem ainda não tem conta de autenticação
a_criar as (
  select d.email
  from dados d
  where not exists (
    select 1 from auth.users u where lower(u.email) = lower(d.email)
  )
),
novos_usuarios as (
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  )
  select
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    ac.email,
    crypt('DEFINA_SENHA_TEMPORARIA_AQUI', gen_salt('bf')),   -- << troque antes de rodar (não versione a senha real)
    now(),                                       -- e-mail já confirmado -> pode logar
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    '',   -- tokens vazios ('' e não NULL) para não quebrar o login
    '',
    '',
    ''
  from a_criar ac
  returning id, email
)
insert into auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  nu.id::text,
  nu.id,
  jsonb_build_object('sub', nu.id::text, 'email', nu.email),
  'email',
  now(),
  now(),
  now()
from novos_usuarios nu;

-- Conferência: mostra as contas criadas e se batem com a tabela fellows
select
  u.email,
  u.email_confirmed_at is not null as email_confirmado,
  (i.id is not null)               as tem_identity,
  f.nome                           as fellow_vinculado
from auth.users u
left join auth.identities i on i.user_id = u.id and i.provider = 'email'
left join fellows f         on lower(f.email) = lower(u.email)
where u.email in (
  'gabrielpcanalle@gmail.com',
  'assayagsuzanna@icloud.com',
  'karlainglesnave@gmail.com',
  'eng.conti@gmail.com'
)
order by u.email;
