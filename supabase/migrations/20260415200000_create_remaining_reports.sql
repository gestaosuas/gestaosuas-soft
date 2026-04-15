-- ==========================================
-- 1. PROTEÇÃO ESPECIAL À CRIANÇA E ADOLESCENTE
-- ==========================================

-- Tabela Medida Protetiva (creas_protetivo)
CREATE TABLE IF NOT EXISTS creas_protetivo_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    directorate_id UUID NOT NULL REFERENCES directorates(id) ON DELETE CASCADE,
    month SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'submitted')),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Famílias
    fam_mes_anterior INTEGER DEFAULT 0,
    fam_admitidas INTEGER DEFAULT 0,
    fam_desligadas INTEGER DEFAULT 0,
    fam_atual INTEGER DEFAULT 0,

    -- Direitos Violados
    viol_fis_psic_masc INTEGER DEFAULT 0,
    viol_fis_psic_fem INTEGER DEFAULT 0,
    abuso_sexual_masc INTEGER DEFAULT 0,
    abuso_sexual_fem INTEGER DEFAULT 0,
    expl_sexual_masc INTEGER DEFAULT 0,
    expl_sexual_fem INTEGER DEFAULT 0,
    negli_aband_masc INTEGER DEFAULT 0,
    negli_aband_fem INTEGER DEFAULT 0,
    trab_infantil_masc INTEGER DEFAULT 0,
    trab_infantil_fem INTEGER DEFAULT 0,

    -- Atendimentos
    atend_mes_anterior INTEGER DEFAULT 0,
    atend_admitidas INTEGER DEFAULT 0,
    atend_desligadas INTEGER DEFAULT 0,
    atend_atual INTEGER DEFAULT 0,

    CONSTRAINT creas_protetivo_unq UNIQUE (directorate_id, month, year)
);

-- Tabela Medida Socioeducativa (creas_socioeducativo)
CREATE TABLE IF NOT EXISTS creas_socioeducativo_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    directorate_id UUID NOT NULL REFERENCES directorates(id) ON DELETE CASCADE,
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

-- Tabela Proteção Especial Consolidado (Geral)
CREATE TABLE IF NOT EXISTS protecao_especial_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    directorate_id UUID NOT NULL REFERENCES directorates(id) ON DELETE CASCADE,
    month SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'submitted')),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Campos Union (Para dados históricos consolidados)
    fam_mes_anterior INTEGER DEFAULT 0,
    fam_admitidas INTEGER DEFAULT 0,
    fam_desligadas INTEGER DEFAULT 0,
    fam_atual INTEGER DEFAULT 0,
    atend_mes_anterior INTEGER DEFAULT 0,
    atend_admitidas INTEGER DEFAULT 0,
    atend_desligadas INTEGER DEFAULT 0,
    atend_atual INTEGER DEFAULT 0,
    
    fam_acompanhamento_1_dia INTEGER DEFAULT 0,
    fam_inseridas INTEGER DEFAULT 0,
    fam_total_acompanhamento INTEGER DEFAULT 0,
    masc_acompanhamento_1_dia INTEGER DEFAULT 0,
    masc_admitidos INTEGER DEFAULT 0,
    masc_desligados INTEGER DEFAULT 0,
    masc_total_parcial INTEGER DEFAULT 0,
    fem_acompanhamento_1_dia INTEGER DEFAULT 0,
    fem_admitidos INTEGER DEFAULT 0,
    fem_total_parcial INTEGER DEFAULT 0,

    CONSTRAINT protecao_especial_unq UNIQUE (directorate_id, month, year)
);

-- ==========================================
-- 2. CASA DA MULHER
-- ==========================================

-- Tabela Casa da Mulher - Violência Doméstica
CREATE TABLE IF NOT EXISTS casa_da_mulher_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    directorate_id UUID NOT NULL REFERENCES directorates(id) ON DELETE CASCADE,
    month SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'submitted')),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Atendimentos
    cm_atend_mulheres_atendidas INTEGER DEFAULT 0,

    -- Faixa Etária
    cm_faixa_16_17 INTEGER DEFAULT 0,
    cm_faixa_18_30 INTEGER DEFAULT 0,
    cm_faixa_31_40 INTEGER DEFAULT 0,
    cm_faixa_41_50 INTEGER DEFAULT 0,
    cm_faixa_51_60 INTEGER DEFAULT 0,
    cm_faixa_acima_60 INTEGER DEFAULT 0,
    cm_faixa_nao_consta INTEGER DEFAULT 0,

    -- Cor/Raça
    cm_raca_branca INTEGER DEFAULT 0,
    cm_raca_preta INTEGER DEFAULT 0,
    cm_raca_parda INTEGER DEFAULT 0,
    cm_raca_amarelo INTEGER DEFAULT 0,
    cm_raca_indigena INTEGER DEFAULT 0,
    cm_raca_nao_consta INTEGER DEFAULT 0,

    -- Violência
    cm_violencia_fisica INTEGER DEFAULT 0,
    cm_violencia_moral INTEGER DEFAULT 0,
    cm_violencia_psicologica INTEGER DEFAULT 0,
    cm_violencia_sexual INTEGER DEFAULT 0,
    cm_violencia_patrimonial INTEGER DEFAULT 0,
    cm_violencia_nenhuma INTEGER DEFAULT 0,
    cm_violencia_outras INTEGER DEFAULT 0,

    -- Encaminhamentos
    cm_encam_bo_ocorrencia INTEGER DEFAULT 0,
    cm_encam_casa_abrigo INTEGER DEFAULT 0,
    cm_encam_conselho_idoso INTEGER DEFAULT 0,
    cm_encam_conselho_tutelar INTEGER DEFAULT 0,
    cm_encam_defens_publica INTEGER DEFAULT 0,
    cm_encam_forum_juizados INTEGER DEFAULT 0,
    cm_encam_exame_c_delito INTEGER DEFAULT 0,
    cm_encam_deam INTEGER DEFAULT 0,
    cm_encam_ministerio_publico INTEGER DEFAULT 0,
    cm_encam_outra_delegacia INTEGER DEFAULT 0,
    cm_encam_ppvd INTEGER DEFAULT 0,
    cm_encam_rede_ass_social INTEGER DEFAULT 0,
    cm_encam_rede_saude INTEGER DEFAULT 0,
    cm_encam_sine INTEGER DEFAULT 0,
    cm_encam_outros INTEGER DEFAULT 0,

    CONSTRAINT casa_da_mulher_unq UNIQUE (directorate_id, month, year)
);

-- Tabela Diversidade
CREATE TABLE IF NOT EXISTS diversidade_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    directorate_id UUID NOT NULL REFERENCES directorates(id) ON DELETE CASCADE,
    month SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'submitted')),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Atendimentos
    div_atend_mulheres_atendidas INTEGER DEFAULT 0,
    div_atend_nucleo_diversidade INTEGER DEFAULT 0,

    -- Faixa Etária
    div_faixa_16_17 INTEGER DEFAULT 0,
    div_faixa_18_30 INTEGER DEFAULT 0,
    div_faixa_31_40 INTEGER DEFAULT 0,
    div_faixa_41_50 INTEGER DEFAULT 0,
    div_faixa_51_60 INTEGER DEFAULT 0,
    div_faixa_acima_60 INTEGER DEFAULT 0,
    div_faixa_nao_consta INTEGER DEFAULT 0,

    -- Cor/Raça
    div_raca_branca INTEGER DEFAULT 0,
    div_raca_preta INTEGER DEFAULT 0,
    div_raca_parda INTEGER DEFAULT 0,
    div_raca_amarela INTEGER DEFAULT 0,
    div_raca_indigena INTEGER DEFAULT 0,
    div_raca_nao_consta INTEGER DEFAULT 0,

    -- Situação
    div_sit_violencia_infrafamiliar INTEGER DEFAULT 0,
    div_sit_violencia_extrafamiliar INTEGER DEFAULT 0,
    div_sit_demanda_fora_contexto INTEGER DEFAULT 0,

    -- Encaminhamentos
    div_encam_juizado INTEGER DEFAULT 0,
    div_encam_rede_socioassist INTEGER DEFAULT 0,
    div_encam_curso_prof INTEGER DEFAULT 0,
    div_encam_sine INTEGER DEFAULT 0,
    div_encam_serv_saude INTEGER DEFAULT 0,
    div_encam_mobilizacao_familia INTEGER DEFAULT 0,
    div_encam_orient_juridicas INTEGER DEFAULT 0,
    div_encam_bo_reds INTEGER DEFAULT 0,
    div_encam_exame_delito INTEGER DEFAULT 0,
    div_encam_outros INTEGER DEFAULT 0,

    CONSTRAINT diversidade_unq UNIQUE (directorate_id, month, year)
);

-- Tabela Núcleo de Diversidade
CREATE TABLE IF NOT EXISTS nucleo_diversidade_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    directorate_id UUID NOT NULL REFERENCES directorates(id) ON DELETE CASCADE,
    month SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'submitted')),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    nd_pessoas_atendidas INTEGER DEFAULT 0,

    CONSTRAINT nucleo_diversidade_unq UNIQUE (directorate_id, month, year)
);

-- ==========================================
-- 3. SEGURANÇA (RLS & BYPASS)
-- ==========================================

-- Ativar RLS em todas
ALTER TABLE creas_protetivo_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE creas_socioeducativo_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE protecao_especial_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE casa_da_mulher_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE diversidade_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE nucleo_diversidade_reports ENABLE ROW LEVEL SECURITY;

-- Políticas usando a função is_admin() já criada anteriormente
CREATE POLICY "Admins can do everything on creas_protetivo_reports" ON creas_protetivo_reports FOR ALL TO authenticated USING ( public.is_admin() );
CREATE POLICY "Users can edit their directorate's protetivo" ON creas_protetivo_reports FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profile_directorates WHERE profile_id = auth.uid() AND directorate_id = creas_protetivo_reports.directorate_id) OR public.is_admin()
);

CREATE POLICY "Admins can do everything on creas_socioeducativo_reports" ON creas_socioeducativo_reports FOR ALL TO authenticated USING ( public.is_admin() );
CREATE POLICY "Users can edit their directorate's socioeducativo" ON creas_socioeducativo_reports FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profile_directorates WHERE profile_id = auth.uid() AND directorate_id = creas_socioeducativo_reports.directorate_id) OR public.is_admin()
);

CREATE POLICY "Admins can do everything on protecao_especial_reports" ON protecao_especial_reports FOR ALL TO authenticated USING ( public.is_admin() );
CREATE POLICY "Users can edit their directorate's protecao_especial" ON protecao_especial_reports FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profile_directorates WHERE profile_id = auth.uid() AND directorate_id = protecao_especial_reports.directorate_id) OR public.is_admin()
);

CREATE POLICY "Admins can do everything on casa_da_mulher_reports" ON casa_da_mulher_reports FOR ALL TO authenticated USING ( public.is_admin() );
CREATE POLICY "Users can edit their directorate's casa_da_mulher" ON casa_da_mulher_reports FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profile_directorates WHERE profile_id = auth.uid() AND directorate_id = casa_da_mulher_reports.directorate_id) OR public.is_admin()
);

CREATE POLICY "Admins can do everything on diversidade_reports" ON diversidade_reports FOR ALL TO authenticated USING ( public.is_admin() );
CREATE POLICY "Users can edit their directorate's diversidade" ON diversidade_reports FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profile_directorates WHERE profile_id = auth.uid() AND directorate_id = diversidade_reports.directorate_id) OR public.is_admin()
);

CREATE POLICY "Admins can do everything on nucleo_diversidade_reports" ON nucleo_diversidade_reports FOR ALL TO authenticated USING ( public.is_admin() );
CREATE POLICY "Users can edit their directorate's nucleo_diversidade" ON nucleo_diversidade_reports FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profile_directorates WHERE profile_id = auth.uid() AND directorate_id = nucleo_diversidade_reports.directorate_id) OR public.is_admin()
);
