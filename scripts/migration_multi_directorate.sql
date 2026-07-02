-- 1. Create the join table for Many-to-Many relationship
create table if not exists public.profile_directorates (
  profile_id uuid references public.profiles(id) on delete cascade,
  directorate_id uuid references public.directorates(id) on delete cascade,
  assigned_at timestamptz default now(),
  primary key (profile_id, directorate_id)
);

-- 2. Enable RLS (Security)
alter table public.profile_directorates enable row level security;

-- 3. Create Policy (Allow admins to manage, users to view own)
create policy "Admins can manage directorate assignments"
  on public.profile_directorates
  for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Users can view own assignments"
  on public.profile_directorates
  for select
  using (
    profile_id = auth.uid()
  );

-- 4. Migrate existing data from the single column to the new table
insert into public.profile_directorates (profile_id, directorate_id)
select id, directorate_id 
from public.profiles
where directorate_id is not null
on conflict do nothing;
