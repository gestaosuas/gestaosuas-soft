
alter table public.submissions 
add column if not exists report_content jsonb default '[]'::jsonb;
