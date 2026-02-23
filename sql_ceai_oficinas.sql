-- === 1. CRIAR OU ATUALIZAR CATEGORIAS ===
CREATE TABLE IF NOT EXISTS public.ceai_categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- === 2. CRIAR A TABELA DE OFICINAS ===
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

-- === 3. SE VOCÊ RODOU O CÓDIGO ANTERIOR, ISSO VAI CORRIGIR AS COLUNAS ===
ALTER TABLE public.ceai_oficinas DROP COLUMN IF EXISTS occupied_vacancies;
ALTER TABLE public.ceai_oficinas ADD COLUMN IF NOT EXISTS classes_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.ceai_oficinas ADD COLUMN IF NOT EXISTS total_vacancies INTEGER NOT NULL DEFAULT 0;

-- === 4. SEGURANÇA (RLS) E POLICIES ===
ALTER TABLE public.ceai_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ceai_oficinas ENABLE ROW LEVEL SECURITY;

-- Removemos as políticas antigas para evitar o erro de "já existe"
DROP POLICY IF EXISTS "Acesso as categorias" ON public.ceai_categorias;
DROP POLICY IF EXISTS "Acesso as oficinas" ON public.ceai_oficinas;

-- Criamos elas de novo fresquinhas e atualizadas
CREATE POLICY "Acesso as categorias" ON public.ceai_categorias FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso as oficinas" ON public.ceai_oficinas FOR ALL TO authenticated USING (true) WITH CHECK (true);
