CREATE TABLE IF NOT EXISTS public.settings (
    key text PRIMARY KEY,
    value text,
    description text,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow admin all settings" ON public.settings FOR ALL USING (
    exists (
        select 1 from profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
);

-- Seed initial value if not exists
INSERT INTO public.settings (key, value, description)
VALUES ('logo_url', '', 'URL da Logo do Sistema')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.settings (key, value, description)
VALUES ('system_name', 'Sistema Vigilância Socioassistencial 2026', 'Nome do Sistema')
ON CONFLICT (key) DO NOTHING;
