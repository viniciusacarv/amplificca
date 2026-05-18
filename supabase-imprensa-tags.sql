-- supabase-imprensa-tags.sql
-- Tags relacionais para submissões e veículos + permissão para admin submeter texto.
-- Execute no SQL Editor do Supabase após supabase-setup.sql e supabase-imprensa-arquivamento.sql.
-- Idempotente: pode ser reexecutado sem efeitos colaterais.

-- ─────────────────────────────────────────────────────────────────
-- 1) Tabela de tags (lista mestre gerenciada pelo admin)
-- ─────────────────────────────────────────────────────────────────
create table if not exists tags (
  id bigint generated always as identity primary key,
  nome text not null unique,
  slug text not null unique,
  descricao text,
  grupo text,                       -- ex.: 'tema', 'porte', 'perfil_editorial' (livre)
  ativo boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_tags_ativo on tags (ativo);
create index if not exists idx_tags_grupo on tags (grupo);

comment on table tags is
  'Lista mestre de tags usadas para categorizar submissões e veículos. Gerenciada pelo admin.';

-- ─────────────────────────────────────────────────────────────────
-- 2) Seed inicial de tags (idempotente, não sobrescreve existentes)
-- ─────────────────────────────────────────────────────────────────
insert into tags (nome, slug, grupo) values
  ('Política',     'politica',     'tema'),
  ('Economia',     'economia',     'tema'),
  ('Tributos',     'tributos',     'tema'),
  ('Inovação',     'inovacao',     'tema'),
  ('História',     'historia',     'tema'),
  ('Filosofia',    'filosofia',    'tema'),
  ('Direito',      'direito',      'tema'),
  ('Educação',     'educacao',     'tema'),
  ('Saúde',        'saude',        'tema'),
  ('Internacional','internacional','tema'),
  ('Cultura',      'cultura',      'tema'),
  ('Ciência',      'ciencia',      'tema'),
  ('Tecnologia',   'tecnologia',   'tema'),
  ('Segurança',    'seguranca',    'tema'),
  ('Grande',       'grande',       'porte'),
  ('Médio',        'medio',        'porte'),
  ('Pequeno',      'pequeno',      'porte'),
  ('Nicho',        'nicho',        'porte'),
  ('Liberal',      'liberal',      'perfil_editorial'),
  ('Conservador',  'conservador',  'perfil_editorial'),
  ('Mainstream',   'mainstream',   'perfil_editorial'),
  ('Independente', 'independente', 'perfil_editorial')
on conflict (slug) do nothing;

-- ─────────────────────────────────────────────────────────────────
-- 3) Junção submissoes ↔ tags
--    submissoes.id é o tipo nativo da tabela; FK usa o mesmo tipo
--    via referência simbólica (Postgres faz casting automático).
-- ─────────────────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from information_schema.tables where table_name = 'submissao_tags') then
    execute format($f$
      create table submissao_tags (
        submissao_id %s not null,
        tag_id bigint not null references tags(id) on delete cascade,
        created_at timestamptz default now(),
        primary key (submissao_id, tag_id)
      )
    $f$, (select data_type from information_schema.columns where table_name = 'submissoes' and column_name = 'id'));

    execute 'alter table submissao_tags add constraint submissao_tags_submissao_fk '
            'foreign key (submissao_id) references submissoes(id) on delete cascade';
  end if;
end$$;

create index if not exists idx_submissao_tags_submissao on submissao_tags (submissao_id);
create index if not exists idx_submissao_tags_tag on submissao_tags (tag_id);

comment on table submissao_tags is
  'Tags atribuídas a uma submissão na hora do envio. Usadas para recomendar veículos no placement e para inteligência nos relatórios.';

-- ─────────────────────────────────────────────────────────────────
-- 4) Junção veiculos ↔ tags (substitui veiculos.tags[] no médio prazo)
-- ─────────────────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from information_schema.tables where table_name = 'veiculo_tags') then
    execute format($f$
      create table veiculo_tags (
        veiculo_id %s not null,
        tag_id bigint not null references tags(id) on delete cascade,
        created_at timestamptz default now(),
        primary key (veiculo_id, tag_id)
      )
    $f$, (select data_type from information_schema.columns where table_name = 'veiculos' and column_name = 'id'));

    execute 'alter table veiculo_tags add constraint veiculo_tags_veiculo_fk '
            'foreign key (veiculo_id) references veiculos(id) on delete cascade';
  end if;
end$$;

create index if not exists idx_veiculo_tags_veiculo on veiculo_tags (veiculo_id);
create index if not exists idx_veiculo_tags_tag on veiculo_tags (tag_id);

comment on table veiculo_tags is
  'Tags de afinidade temática/editorial de cada veículo. Usadas para ranquear veículos por match com as tags da submissão.';

-- ─────────────────────────────────────────────────────────────────
-- 5) Backfill: migra veiculos.tags[] (text[] legado) para veiculo_tags
-- ─────────────────────────────────────────────────────────────────
insert into veiculo_tags (veiculo_id, tag_id)
select v.id, t.id
from veiculos v
cross join lateral unnest(coalesce(v.tags, array[]::text[])) as legacy_slug
join tags t on t.slug = legacy_slug
on conflict do nothing;

-- ─────────────────────────────────────────────────────────────────
-- 6) Admin como autor de submissão
--    Adiciona autor_admin_id; mantém fellow_id, mas torna opcional.
--    XOR: exatamente um dos dois deve estar preenchido.
-- ─────────────────────────────────────────────────────────────────
do $$
declare
  admins_id_type text;
begin
  -- Só roda se existir tabela admins (ambientes com fallback por env var podem não ter)
  if exists (select 1 from information_schema.tables where table_name = 'admins') then
    select data_type into admins_id_type
    from information_schema.columns
    where table_name = 'admins' and column_name = 'id';

    if not exists (
      select 1 from information_schema.columns
      where table_name = 'submissoes' and column_name = 'autor_admin_id'
    ) then
      execute format('alter table submissoes add column autor_admin_id %s', admins_id_type);
      execute 'alter table submissoes add constraint submissoes_autor_admin_fk '
              'foreign key (autor_admin_id) references admins(id) on delete set null';
    end if;
  end if;
end$$;

-- Torna fellow_id opcional (admin pode submeter sem fellow)
alter table submissoes alter column fellow_id drop not null;

-- XOR entre fellow_id e autor_admin_id
alter table submissoes drop constraint if exists submissoes_autor_xor_check;
alter table submissoes add constraint submissoes_autor_xor_check check (
  (fellow_id is not null and autor_admin_id is null) or
  (fellow_id is null and autor_admin_id is not null)
);

comment on column submissoes.autor_admin_id is
  'Quando preenchido, indica que a submissão foi feita por um admin em nome próprio (não por fellow). XOR com fellow_id.';

-- ─────────────────────────────────────────────────────────────────
-- 7) RLS — políticas básicas (leitura pública nas tabelas auxiliares)
-- ─────────────────────────────────────────────────────────────────
alter table tags             enable row level security;
alter table submissao_tags   enable row level security;
alter table veiculo_tags     enable row level security;

drop policy if exists "leitura publica tags" on tags;
create policy "leitura publica tags" on tags for select using (true);

drop policy if exists "leitura publica submissao_tags" on submissao_tags;
create policy "leitura publica submissao_tags" on submissao_tags for select using (true);

drop policy if exists "leitura publica veiculo_tags" on veiculo_tags;
create policy "leitura publica veiculo_tags" on veiculo_tags for select using (true);
