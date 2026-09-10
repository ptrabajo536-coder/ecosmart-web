-- ECOsmart — esquema de base de datos (Supabase / PostgreSQL)
--
-- Cómo usar este archivo:
--   1. Entra a tu proyecto en https://supabase.com
--   2. Ve a "SQL Editor" -> "New query"
--   3. Pega TODO este archivo y ejecútalo (Run)
--
-- Esto crea:
--   - relay_state:   una sola fila que representa el estado real y compartido
--                     del relé del salón (todos los estudiantes ven lo mismo).
--   - light_actions: historial de quién encendió/apagó y cuándo.
--
-- Row Level Security (RLS) queda activado: cualquier usuario autenticado
-- puede leer y escribir (porque el salón es un recurso compartido), pero
-- nadie sin sesión puede tocar la base de datos directamente.

-- ---------------------------------------------------------------------------
-- 1. Estado del relé (una sola fila, id fijo = 1)
-- ---------------------------------------------------------------------------
create table if not exists relay_state (
  id int primary key default 1,
  state text not null default 'OFF' check (state in ('ON', 'OFF')),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id),
  constraint single_row check (id = 1)
);

insert into relay_state (id, state)
values (1, 'OFF')
on conflict (id) do nothing;

alter table relay_state enable row level security;

create policy "Cualquier usuario autenticado puede leer el relé"
  on relay_state for select
  to authenticated
  using (true);

create policy "Cualquier usuario autenticado puede actualizar el relé"
  on relay_state for update
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- 2. Historial de acciones ("Últimas acciones")
-- ---------------------------------------------------------------------------
create table if not exists light_actions (
  id uuid primary key default gen_random_uuid(),
  action text not null check (action in ('ON', 'OFF')),
  user_id uuid not null references auth.users (id),
  user_email text not null,
  created_at timestamptz not null default now()
);

create index if not exists light_actions_created_at_idx
  on light_actions (created_at desc);

alter table light_actions enable row level security;

create policy "Cualquier usuario autenticado puede leer el historial"
  on light_actions for select
  to authenticated
  using (true);

create policy "Cualquier usuario autenticado puede insertar en el historial"
  on light_actions for insert
  to authenticated
  with check (auth.uid() = user_id);
