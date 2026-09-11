-- ECOsmart — migración a múltiples salones
--
-- Cómo usar: SQL Editor de Supabase → New query → pega TODO esto → Run.
-- Es seguro correrlo una sola vez (si lo corres dos veces, falla al intentar
-- insertar salon-a/salon-b de nuevo — eso está bien, significa que ya corrió).

-- ---------------------------------------------------------------------------
-- 1. Tabla de salones (reemplaza el concepto de una sola fila fija)
-- ---------------------------------------------------------------------------
create table if not exists rooms (
  id text primary key,
  name text not null,
  state text not null default 'OFF' check (state in ('ON', 'OFF')),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

alter table rooms enable row level security;

create policy "Cualquier usuario autenticado puede leer los salones"
  on rooms for select
  to authenticated
  using (true);

create policy "Cualquier usuario autenticado puede actualizar los salones"
  on rooms for update
  to authenticated
  using (true)
  with check (true);

-- Trae tu salón actual (el de relay_state) como "salon-a", y crea "salon-b" nuevo.
insert into rooms (id, name, state)
select 'salon-a', 'Salón A', state from relay_state where id = 1
on conflict (id) do nothing;

insert into rooms (id, name, state)
values ('salon-b', 'Salón B', 'OFF')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 2. Vincular el historial existente a salon-a, y agregar la columna a futuro
-- ---------------------------------------------------------------------------
alter table light_actions add column if not exists room_id text references rooms (id);

update light_actions set room_id = 'salon-a' where room_id is null;

alter table light_actions alter column room_id set not null;

-- ---------------------------------------------------------------------------
-- 3. (Opcional) Limpieza — solo corre esto cuando confirmes que todo
--    funciona con la tabla "rooms". No es necesario borrar relay_state,
--    puede quedar sin usarse sin causar ningún problema.
-- ---------------------------------------------------------------------------
-- drop table relay_state;
