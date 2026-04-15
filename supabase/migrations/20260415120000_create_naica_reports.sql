CREATE TABLE IF NOT EXISTS naica_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    directorate_id UUID NOT NULL REFERENCES directorates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    month SMALLINT NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    unit_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'submitted')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT NOT NULL, 

    -- Indicadores de Participação e Transferência Contábil
    mes_anterior_masc INTEGER DEFAULT 0,
    mes_anterior_fem INTEGER DEFAULT 0,
    inseridos_masc INTEGER DEFAULT 0,
    inseridos_fem INTEGER DEFAULT 0,
    desligados_masc INTEGER DEFAULT 0,
    desligados_fem INTEGER DEFAULT 0,
    
    -- Este campo pode ser gerado matematicamente, mas o guardamos cacheado.
    total_atendidas INTEGER DEFAULT 0, 

    -- Indicadores Adicionais
    atendimentos INTEGER DEFAULT 0,

    CONSTRAINT naica_reports_unq UNIQUE (directorate_id, unit_name, month, year)
);

-- Enable RLS
ALTER TABLE naica_reports ENABLE ROW LEVEL SECURITY;

-- Triggers for updated_at
CREATE TRIGGER trigger_update_naica_reports
BEFORE UPDATE ON public.naica_reports
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Admins can do anything
CREATE POLICY "Admins can do everything on naica_reports"
ON naica_reports
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Users can read their directorate's reports
CREATE POLICY "Users can read their directorate's naica reports"
ON naica_reports
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profile_directorates
        WHERE profile_directorates.profile_id = auth.uid()
        AND profile_directorates.directorate_id = naica_reports.directorate_id
    ) OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Users can insert/update if they belong to that directorate
CREATE POLICY "Users can edit their directorate's naica reports"
ON naica_reports
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profile_directorates
        WHERE profile_directorates.profile_id = auth.uid()
        AND profile_directorates.directorate_id = naica_reports.directorate_id
    ) OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

CREATE POLICY "Users can update their directorate's naica reports"
ON naica_reports
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profile_directorates
        WHERE profile_directorates.profile_id = auth.uid()
        AND profile_directorates.directorate_id = naica_reports.directorate_id
    ) OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);
