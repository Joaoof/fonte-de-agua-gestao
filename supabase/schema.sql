create extension if not exists "pgcrypto";

do $$ begin
  create type papel_usuario as enum ('lideranca', 'voluntario');
exception when duplicate_object then null; end $$;

create table if not exists public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  papel papel_usuario not null default 'voluntario',
  criado_em timestamptz not null default now()
);

create table if not exists public.familias (
  id uuid primary key default gen_random_uuid(),
  responsavel text not null,
  documento text,
  telefone text,
  endereco text,
  bairro text default 'São João',
  quantidade_pessoas integer not null default 1 check (quantidade_pessoas > 0),
  quantidade_criancas integer not null default 0 check (quantidade_criancas >= 0),
  situacao text not null default 'ativa' check (situacao in ('ativa', 'inativa')),
  observacoes text,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.perfis (id) on delete set null
);

create table if not exists public.atendimentos (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familias (id) on delete cascade,
  data date not null default current_date,
  tipo text not null default 'orientacao'
    check (tipo in ('alimentacao', 'moradia', 'saude', 'orientacao', 'outro')),
  descricao text not null,
  encaminhamento text,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.perfis (id) on delete set null
);

create table if not exists public.doacoes_cesta (
  id uuid primary key default gen_random_uuid(),
  data date not null default current_date,
  quantidade integer not null check (quantidade > 0),
  doador text,
  observacao text,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.perfis (id) on delete set null
);

create table if not exists public.entregas_cesta (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familias (id) on delete cascade,
  data date not null default current_date,
  quantidade integer not null default 1 check (quantidade > 0),
  observacao text,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.perfis (id) on delete set null
);

create table if not exists public.acolhimentos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  familia_id uuid references public.familias (id) on delete set null,
  data_entrada date not null default current_date,
  data_saida date,
  motivo text,
  observacoes text,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.perfis (id) on delete set null,
  check (data_saida is null or data_saida >= data_entrada)
);

create table if not exists public.voluntarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  funcao text not null default 'acao_social'
    check (funcao in ('obreiro', 'musico', 'acao_social', 'outro')),
  telefone text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.perfis (id) on delete set null
);

create index if not exists idx_atendimentos_familia on public.atendimentos (familia_id);
create index if not exists idx_atendimentos_data on public.atendimentos (data desc);
create index if not exists idx_entregas_familia on public.entregas_cesta (familia_id);
create index if not exists idx_entregas_data on public.entregas_cesta (data desc);
create index if not exists idx_acolhimentos_saida on public.acolhimentos (data_saida);

create or replace function public.e_lideranca()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.perfis where id = auth.uid() and papel = 'lideranca'
  );
$$;

create or replace function public.criar_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfis (id, nome, papel)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'nome', ''), split_part(new.email, '@', 1)),
    case when (select count(*) from public.perfis) = 0 then 'lideranca'::papel_usuario
         else 'voluntario'::papel_usuario end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil();

alter table public.perfis enable row level security;
alter table public.familias enable row level security;
alter table public.atendimentos enable row level security;
alter table public.doacoes_cesta enable row level security;
alter table public.entregas_cesta enable row level security;
alter table public.acolhimentos enable row level security;
alter table public.voluntarios enable row level security;

drop policy if exists perfis_leitura on public.perfis;
create policy perfis_leitura on public.perfis
  for select to authenticated using (true);

drop policy if exists perfis_atualiza_proprio on public.perfis;
create policy perfis_atualiza_proprio on public.perfis
  for update to authenticated using (id = auth.uid() or public.e_lideranca());

do $$
declare
  tabela text;
begin
  foreach tabela in array array[
    'familias', 'atendimentos', 'doacoes_cesta', 'entregas_cesta', 'acolhimentos', 'voluntarios'
  ] loop
    execute format('drop policy if exists %I on public.%I', tabela || '_leitura', tabela);
    execute format(
      'create policy %I on public.%I for select to authenticated using (true)',
      tabela || '_leitura', tabela
    );

    execute format('drop policy if exists %I on public.%I', tabela || '_insercao', tabela);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (true)',
      tabela || '_insercao', tabela
    );

    execute format('drop policy if exists %I on public.%I', tabela || '_atualizacao', tabela);
    execute format(
      'create policy %I on public.%I for update to authenticated using (true)',
      tabela || '_atualizacao', tabela
    );

    execute format('drop policy if exists %I on public.%I', tabela || '_exclusao', tabela);
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.e_lideranca())',
      tabela || '_exclusao', tabela
    );
  end loop;
end $$;

create or replace view public.estoque_cestas
with (security_invoker = on) as
select
  coalesce((select sum(quantidade) from public.doacoes_cesta), 0)::bigint as recebidas,
  coalesce((select sum(quantidade) from public.entregas_cesta), 0)::bigint as entregues,
  (coalesce((select sum(quantidade) from public.doacoes_cesta), 0)
   - coalesce((select sum(quantidade) from public.entregas_cesta), 0))::bigint as saldo;
