-- Create cras_reports and beneficios_reports tables to resolve bootstrap deadlock
CREATE TABLE IF NOT EXISTS public.cras_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    directorate_id UUID REFERENCES public.directorates(id) ON DELETE SET NULL,
    unit_name TEXT NOT NULL DEFAULT '',
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    data JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.beneficios_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    directorate_id UUID REFERENCES public.directorates(id) ON DELETE SET NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    data JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
