-- =====================================================
-- MUNDO DE DOCES DA GG
-- TABELA: encomendas
-- Executar no SQL Editor do Supabase
-- =====================================================

create extension if not exists pgcrypto;

create table if not exists public.encomendas (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null,
  telefone text not null,
  email text not null,
  servico text not null,
  data_evento date not null,
  convidados int not null,
  local_evento text,
  observacoes text,
  status text not null default 'Recebida',
  criado_em timestamptz not null default now()
);

create index if not exists idx_encomendas_codigo on public.encomendas(codigo);
create index if not exists idx_encomendas_status on public.encomendas(status);
create index if not exists idx_encomendas_criado_em on public.encomendas(criado_em desc);

alter table public.encomendas enable row level security;

-- Remove policies antigas para evitar conflitos
 drop policy if exists "encomendas_select_public" on public.encomendas;
 drop policy if exists "encomendas_insert_public" on public.encomendas;
 drop policy if exists "encomendas_update_public" on public.encomendas;

-- Leitura pública para rastreio por código
create policy "encomendas_select_public"
on public.encomendas
for select
to anon, authenticated
using (true);

-- Inserção pública para criação de encomendas pelo site
create policy "encomendas_insert_public"
on public.encomendas
for insert
to anon, authenticated
with check (true);

-- Atualização pública para o painel admin frontend
create policy "encomendas_update_public"
on public.encomendas
for update
to anon, authenticated
using (true)
with check (true);
