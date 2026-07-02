-- 1. Create SINE Reports Table
CREATE TABLE IF NOT EXISTS public.sine_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    directorate_id UUID REFERENCES public.directorates(id),
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    
    -- Indicators from sine-config.ts
    atend_trabalhador INTEGER DEFAULT 0,
    atend_online_trabalhador INTEGER DEFAULT 0,
    atend_empregador INTEGER DEFAULT 0,
    atend_online_empregador INTEGER DEFAULT 0,
    seguro_desemprego INTEGER DEFAULT 0,
    vagas_captadas INTEGER DEFAULT 0,
    ligacoes_recebidas INTEGER DEFAULT 0,
    ligacoes_realizadas INTEGER DEFAULT 0,
    curriculos INTEGER DEFAULT 0,
    entrevistados INTEGER DEFAULT 0,
    proc_administrativos INTEGER DEFAULT 0,
    processo_seletivo INTEGER DEFAULT 0,
    inseridos_mercado INTEGER DEFAULT 0,
    carteira_digital INTEGER DEFAULT 0,
    orientacao_profissional INTEGER DEFAULT 0,
    convocacao_trabalhadores INTEGER DEFAULT 0,
    vagas_alto_valor INTEGER DEFAULT 0,
    atendimentos INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: Only one SINE report per month/year
    UNIQUE(month, year)
);

-- 2. Create Qualificacao Reports Table (Centro Profissionalizante)
CREATE TABLE IF NOT EXISTS public.qualificacao_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    directorate_id UUID REFERENCES public.directorates(id),
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,

    -- Block: Resumo CP
    resumo_vagas INTEGER DEFAULT 0,
    resumo_cursos INTEGER DEFAULT 0,
    resumo_turmas INTEGER DEFAULT 0,
    resumo_concluintes INTEGER DEFAULT 0,
    resumo_mulheres INTEGER DEFAULT 0,
    resumo_homens INTEGER DEFAULT 0,
    resumo_mercado_fem INTEGER DEFAULT 0,
    resumo_mercado_masc INTEGER DEFAULT 0,
    resumo_vagas_ocupadas INTEGER DEFAULT 0,
    resumo_taxa_ocupacao NUMERIC,

    -- Block: Concluintes
    cp_morumbi_concluintes INTEGER DEFAULT 0,
    cp_lagoinha_concluintes INTEGER DEFAULT 0,
    cp_campo_alegre_concluintes INTEGER DEFAULT 0,
    cp_luizote_1_concluintes INTEGER DEFAULT 0,
    cp_luizote_2_concluintes INTEGER DEFAULT 0,
    cp_tocantins_concluintes INTEGER DEFAULT 0,
    cp_planalto_concluintes INTEGER DEFAULT 0,
    onibus_concluintes_unit INTEGER DEFAULT 0,
    maravilha_concluintes INTEGER DEFAULT 0,
    uditech_concluintes INTEGER DEFAULT 0,

    -- Block: Onibus
    bairros_visitados INTEGER DEFAULT 0,
    concluintes_onibus INTEGER DEFAULT 0,
    cursos_onibus INTEGER DEFAULT 0,

    -- Block: Atendimentos
    cp_morumbi_atendimentos INTEGER DEFAULT 0,
    cp_lagoinha_atendimentos INTEGER DEFAULT 0,
    cp_campo_alegre_atendimentos INTEGER DEFAULT 0,
    cp_luizote_1_atendimentos INTEGER DEFAULT 0,
    cp_luizote_2_atendimentos INTEGER DEFAULT 0,
    cp_tocantis_atendimentos INTEGER DEFAULT 0,
    cp_planalto_atendimentos INTEGER DEFAULT 0,
    maravilha_atendimentos INTEGER DEFAULT 0,
    unitech_atendimentos INTEGER DEFAULT 0,
    onibus_atendimentos INTEGER DEFAULT 0,

    -- Block: Parcerias
    cursos_andamento INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraint: Only one Qualificacao report per month/year
    UNIQUE(month, year)
);

-- 3. Enable RLS
ALTER TABLE public.sine_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualificacao_reports ENABLE ROW LEVEL SECURITY;

-- 4. Policies (Simple: Viewable by authenticated, manageable by users in directorate)
CREATE POLICY "Viewable by authenticated" ON public.sine_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Viewable by authenticated" ON public.qualificacao_reports FOR SELECT TO authenticated USING (true);

CREATE POLICY "Manageable by admins" ON public.sine_reports FOR ALL TO authenticated USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Manageable by admins" ON public.qualificacao_reports FOR ALL TO authenticated USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
