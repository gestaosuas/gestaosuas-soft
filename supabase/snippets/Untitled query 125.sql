-- Criação forçada da tabela Socioeducativo
CREATE TABLE IF NOT EXISTS public.creas_socioeducativo_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    directorate_id UUID NOT NULL REFERENCES public.directorates(id) ON DELETE CASCADE,
    month SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'submitted')),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Famílias
    fam_acompanhamento_1_dia INTEGER DEFAULT 0,
    fam_inseridas INTEGER DEFAULT 0,
    fam_desligadas INTEGER DEFAULT 0,
    fam_total_acompanhamento INTEGER DEFAULT 0,

    -- Acompanhamento Masculino
    masc_acompanhamento_1_dia INTEGER DEFAULT 0,
    masc_admitidos INTEGER DEFAULT 0,
    masc_desligados INTEGER DEFAULT 0,
    masc_total_parcial INTEGER DEFAULT 0,

    -- Acompanhamento Feminino
    fem_acompanhamento_1_dia INTEGER DEFAULT 0,
    fem_admitidos INTEGER DEFAULT 0,
    fem_desligadas INTEGER DEFAULT 0,
    fem_total_parcial INTEGER DEFAULT 0,

    -- Medidas Masculino
    med_masc_la_andamento INTEGER DEFAULT 0,
    med_masc_psc_andamento INTEGER DEFAULT 0,
    med_masc_la_novas INTEGER DEFAULT 0,
    med_masc_psc_novas INTEGER DEFAULT 0,
    med_masc_la_encerradas INTEGER DEFAULT 0,
    med_masc_psc_encerradas INTEGER DEFAULT 0,
    med_masc_la_total_parcial INTEGER DEFAULT 0,
    med_masc_psc_total_parcial INTEGER DEFAULT 0,

    -- Medidas Feminino
    med_fem_la_andamento INTEGER DEFAULT 0,
    med_fem_psc_andamento INTEGER DEFAULT 0,
    med_fem_la_novas INTEGER DEFAULT 0,
    med_fem_psc_novas INTEGER DEFAULT 0,
    med_fem_la_encerradas INTEGER DEFAULT 0,
    med_fem_psc_encerradas INTEGER DEFAULT 0,
    med_fem_la_total_parcial INTEGER DEFAULT 0,
    med_fem_psc_total_parcial INTEGER DEFAULT 0,

    -- Totais
    med_total_la_geral INTEGER DEFAULT 0,
    med_total_psc_geral INTEGER DEFAULT 0,

    CONSTRAINT creas_socioeducativo_unq UNIQUE (directorate_id, month, year)
);

-- Habilitar RLS e dar permissões
ALTER TABLE public.creas_socioeducativo_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON public.creas_socioeducativo_reports
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Forçar o recarregamento do cache (opcional mas ajuda)
NOTIFY pgrst, 'reload schema';
