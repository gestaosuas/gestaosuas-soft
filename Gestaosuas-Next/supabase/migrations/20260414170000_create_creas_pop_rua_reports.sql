CREATE TABLE creas_pop_rua_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    directorate_id UUID NOT NULL REFERENCES directorates(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT NOT NULL, 

    -- Atendimentos
    num_atend_centro_ref INTEGER DEFAULT 0,
    num_atend_abordagem INTEGER DEFAULT 0,
    num_atend_migracao INTEGER DEFAULT 0,
    num_atend_total INTEGER DEFAULT 0,

    -- Centro de Referência
    cr_a1_masc INTEGER DEFAULT 0,
    cr_a1_fem INTEGER DEFAULT 0,
    cr_b1_drogas INTEGER DEFAULT 0,
    cr_b2_migrantes INTEGER DEFAULT 0,
    cr_b3_mental INTEGER DEFAULT 0,
    cr_cad_unico INTEGER DEFAULT 0,
    cr_enc_mercado INTEGER DEFAULT 0,
    cr_enc_caps INTEGER DEFAULT 0,
    cr_enc_saude INTEGER DEFAULT 0,
    cr_enc_consultorio INTEGER DEFAULT 0,
    cr_segunda_via INTEGER DEFAULT 0,

    -- Abordagem de Rua
    ar_e1_masc INTEGER DEFAULT 0,
    ar_e2_fem INTEGER DEFAULT 0,
    ar_e5_drogas INTEGER DEFAULT 0,
    ar_e6_migrantes INTEGER DEFAULT 0,
    ar_persistentes INTEGER DEFAULT 0,
    ar_enc_centro_ref INTEGER DEFAULT 0,
    ar_recusa_identificacao INTEGER DEFAULT 0,

    -- Núcleo do Migrante
    nm_total_passagens INTEGER DEFAULT 0,
    nm_passagens_deferidas INTEGER DEFAULT 0,
    nm_passagens_indeferidas INTEGER DEFAULT 0,
    nm_estrangeiros INTEGER DEFAULT 0,
    nm_retorno_familiar INTEGER DEFAULT 0,
    nm_busca_trabalho INTEGER DEFAULT 0,
    nm_busca_saude INTEGER DEFAULT 0,

    CONSTRAINT creas_pop_rua_reports_unq UNIQUE (directorate_id, month, year)
);

-- Enable RLS
ALTER TABLE creas_pop_rua_reports ENABLE ROW LEVEL SECURITY;

-- Admins can do anything
CREATE POLICY "Admins can do everything on creas_pop_rua_reports"
ON creas_pop_rua_reports
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Users can read their directorate's reports
CREATE POLICY "Users can read their directorate's pop rua reports"
ON creas_pop_rua_reports
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR
    EXISTS (
        SELECT 1 FROM profile_directorates
        WHERE profile_directorates.profile_id = auth.uid()
        AND profile_directorates.directorate_id = creas_pop_rua_reports.directorate_id
    )
);

-- Users can insert/update if they belong to that directorate
CREATE POLICY "Users can edit their directorate's pop rua reports"
ON creas_pop_rua_reports
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profile_directorates
        WHERE profile_directorates.profile_id = auth.uid()
        AND profile_directorates.directorate_id = creas_pop_rua_reports.directorate_id
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profile_directorates
        WHERE profile_directorates.profile_id = auth.uid()
        AND profile_directorates.directorate_id = creas_pop_rua_reports.directorate_id
    )
);
