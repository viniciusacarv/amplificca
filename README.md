# Amplifica! — Site Oficial

Site do Instituto Amplifica, construído em Next.js 14 + Supabase.

## Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Banco de dados**: Supabase (PostgreSQL)
- **Hospedagem**: Vercel
- **Automação fellows**: Google Forms → Google Sheets → Make.com → Supabase

## Setup local

```bash
npm install
cp .env.example .env.local
# Preencha as variáveis no .env.local
npm run dev
```

## Variáveis de ambiente necessárias

```
NEXT_PUBLIC_SUPABASE_URL=https://arbxtwjsdxjypgjeoxqr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

## Setup do banco de dados

1. Acesse seu projeto no Supabase
2. Vá em **SQL Editor → New query**
3. Cole o conteúdo do arquivo `supabase-setup.sql`
4. Clique em **Run**

## Deploy na Vercel

1. Conecte o repositório GitHub na Vercel
2. Adicione as variáveis de ambiente no painel da Vercel
3. Deploy automático a cada push no GitHub

## Estrutura de componentes

```
app/
  page.tsx          ← página principal (monta todos os componentes)
  layout.tsx        ← layout raiz + metadados SEO
  globals.css       ← estilos globais + fontes

components/
  Navbar.tsx        ← menu fixo com scroll detection
  Hero.tsx          ← seção principal + métricas + ticker de veículos
  Fellows.tsx       ← grid de fellows + filtro por área + modal de bio
  Artigos.tsx       ← feed de artigos publicados + filtro por veículo
  MapaBrasil.tsx    ← mapa SVG com estados com fellows destacados
  Missao.tsx        ← missão + valores defendidos
  Sobre.tsx         ← equipe + conselho estratégico
  Inscricao.tsx     ← CTA de inscrição e financiamento
  Footer.tsx        ← rodapé com links sociais

lib/
  supabase.ts       ← cliente Supabase + tipos TypeScript
```

## Adicionar artigo (Anne / Sara)

1. Acesse supabase.com → seu projeto → **Table Editor**
2. Clique na tabela **artigos**
3. Clique em **Insert row**
4. Preencha os campos e salve

## Adicionar fellow manualmente

1. Acesse supabase.com → **Table Editor → fellows**
2. Clique em **Insert row**
3. Preencha os campos e salve
