
-- Tabela para armazenar os Planos de Trabalho
create table if not exists work_plans (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  osc_id uuid references oscs(id) on delete cascade not null,
  directorate_id uuid references directorates(id) not null,
  user_id uuid references auth.users(id) not null,
  title text not null,
  content jsonb not null default '[]'::jsonb, 
  status text default 'draft' -- 'draft', 'finalized'
);

-- Políticas de segurança (RLS)
alter table work_plans enable row level security;

-- Política de leitura: Admin ou tecnicos da diretoria (similar a visits)
create policy "Enable read access for authenticated users"
on work_plans for select
to authenticated
using (true);

-- Política de inserção/atualização: Admin ou dono
create policy "Enable insert for authenticated users"
on work_plans for insert
to authenticated
with check (true);

create policy "Enable update for owners and admins"
on work_plans for update
to authenticated
using (auth.uid() = user_id or exists (
  select 1 from profiles where id = auth.uid() and role = 'admin'
));

create policy "Enable delete for owners and admins"
on work_plans for delete
to authenticated
using (auth.uid() = user_id or exists (
  select 1 from profiles where id = auth.uid() and role = 'admin'
));
