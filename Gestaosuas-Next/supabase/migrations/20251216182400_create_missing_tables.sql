-- Ajustes em tabelas existentes
ALTER TABLE public.directorates ADD COLUMN IF NOT EXISTS available_units JSONB;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 1. Tabelas de Suporte e Log
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID,
    user_name TEXT,
    directorate_id UUID REFERENCES public.directorates(id) ON DELETE SET NULL,
    directorate_name TEXT,
    action_type TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_name TEXT,
    details JSONB
);

-- 2. Tabelas do Mapa
CREATE TABLE IF NOT EXISTS public.map_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT 'gray',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.map_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.map_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    region TEXT,
    address TEXT,
    phone TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabelas do CEAI
CREATE TABLE IF NOT EXISTS public.ceai_categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ceai_oficinas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit TEXT NOT NULL,
    activity_name TEXT NOT NULL,
    category_id UUID REFERENCES public.ceai_categorias(id) ON DELETE CASCADE,
    vacancies INTEGER NOT NULL,
    classes_count INTEGER NOT NULL DEFAULT 0,
    total_vacancies INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Entidades Principais (OSCs, Visitas, Relatórios)
CREATE TABLE IF NOT EXISTS public.oscs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cep TEXT,
    address TEXT,
    number TEXT,
    neighborhood TEXT,
    phone TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activity_type TEXT,
    subsidized_count INTEGER DEFAULT 0,
    objeto TEXT,
    objetivos TEXT,
    metas TEXT,
    atividades TEXT,
    directorate_id UUID REFERENCES public.directorates(id)
);

CREATE TABLE IF NOT EXISTS public.profile_directorates (
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    directorate_id UUID REFERENCES public.directorates(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    allowed_units JSONB,
    PRIMARY KEY (profile_id, directorate_id)
);

CREATE TABLE IF NOT EXISTS public.visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    osc_id UUID REFERENCES public.oscs(id) ON DELETE CASCADE,
    directorate_id UUID REFERENCES public.directorates(id),
    visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    visit_time TIME NOT NULL DEFAULT CURRENT_TIME,
    status TEXT DEFAULT 'draft',
    identificacao JSONB,
    atendimento JSONB,
    forma_acesso JSONB,
    rh_data JSONB,
    observacoes TEXT,
    recomendacoes TEXT,
    assinaturas JSONB,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    parecer_tecnico JSONB,
    documents JSONB,
    parecer_conclusivo JSONB,
    relatorio_final JSONB
);

CREATE TABLE IF NOT EXISTS public.daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    directorate_id UUID REFERENCES public.directorates(id),
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    user_id UUID REFERENCES auth.users(id),
    type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, directorate_id)
);

CREATE TABLE IF NOT EXISTS public.monthly_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    directorate_id UUID REFERENCES public.directorates(id),
    month INTEGER,
    year INTEGER,
    setor TEXT,
    content JSONB,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Planos, Delegações e Configs
CREATE TABLE IF NOT EXISTS public.work_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    osc_id UUID REFERENCES public.oscs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    directorate_id UUID REFERENCES public.directorates(id),
    content JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS public.form_delegations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    delegated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
