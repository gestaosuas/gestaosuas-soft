-- Enable UUID extension (legacy, keeping for compatibility if needed, but using gen_random_uuid)
create extension if not exists "uuid-ossp";

-- Directorates Table
create table if not exists directorates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sheet_config jsonb, -- { "spreadsheetId": "...", "sheetName": "..." }
  form_definition jsonb, -- { "sections": [{ "title": "...", "fields": [...] }] }
  created_at timestamp with time zone default now()
);

-- Profiles Table (Extends auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'user')),
  directorate_id uuid references directorates(id),
  full_name text,
  created_at timestamp with time zone default now()
);

-- Submissions Table
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  directorate_id uuid references directorates(id),
  month integer not null check (month between 1 and 12),
  year integer not null,
  data jsonb not null,
  created_at timestamp with time zone default now(),
  unique(directorate_id, month, year)
);

-- RLS
alter table directorates enable row level security;
alter table profiles enable row level security;
alter table submissions enable row level security;

-- Policies for Directorates
drop policy if exists "Directorates viewable by authenticated" on directorates;
create policy "Directorates viewable by authenticated" on directorates for select to authenticated using (true);

drop policy if exists "Directorates manageable by admin" on directorates;
create policy "Directorates manageable by admin" on directorates for all to authenticated using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Policies for Profiles
drop policy if exists "Profiles viewable by self" on profiles;
create policy "Profiles viewable by self" on profiles for select to authenticated using (auth.uid() = id);

drop policy if exists "Profiles manageable by admin" on profiles;
create policy "Profiles manageable by admin" on profiles for all to authenticated using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Policies for Submissions
drop policy if exists "Submissions viewable by admin" on submissions;
create policy "Submissions viewable by admin" on submissions for select to authenticated using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "Submissions insertable by user" on submissions;
create policy "Submissions insertable by user" on submissions for insert to authenticated with check (
  auth.uid() = user_id
);
