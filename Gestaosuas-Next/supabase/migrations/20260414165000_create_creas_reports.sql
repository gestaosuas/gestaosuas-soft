-- Create table for CREAS Idoso Reports
CREATE TABLE IF NOT EXISTS public.creas_idoso_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    directorate_id UUID NOT NULL REFERENCES public.directorates(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    month SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'submitted')),
    
    -- PAEFI Block
    paefi_novos_casos INTEGER DEFAULT 0,
    paefi_acomp_inicio INTEGER DEFAULT 0,
    paefi_inseridos INTEGER DEFAULT 0,
    paefi_desligados INTEGER DEFAULT 0,
    paefi_bolsa_familia INTEGER DEFAULT 0,
    paefi_bpc INTEGER DEFAULT 0,
    paefi_substancias INTEGER DEFAULT 0,

    -- Violência Física
    violencia_fisica_atendidas_anterior INTEGER DEFAULT 0,
    violencia_fisica_inseridos INTEGER DEFAULT 0,
    violencia_fisica_desligados INTEGER DEFAULT 0,
    violencia_fisica_total INTEGER DEFAULT 0,

    -- Abuso Sexual
    abuso_sexual_atendidas_anterior INTEGER DEFAULT 0,
    abuso_sexual_inseridos INTEGER DEFAULT 0,
    abuso_sexual_desligados INTEGER DEFAULT 0,
    abuso_sexual_total INTEGER DEFAULT 0,

    -- Exploração Sexual
    exploracao_sexual_atendidas_anterior INTEGER DEFAULT 0,
    exploracao_sexual_inseridos INTEGER DEFAULT 0,
    exploracao_sexual_desligados INTEGER DEFAULT 0,
    exploracao_sexual_total INTEGER DEFAULT 0,

    -- Negligência
    negligencia_atendidas_anterior INTEGER DEFAULT 0,
    negligencia_inseridos INTEGER DEFAULT 0,
    negligencia_desligados INTEGER DEFAULT 0,
    negligencia_total INTEGER DEFAULT 0,

    -- Exploração Financeira
    exploracao_financeira_atendidas_anterior INTEGER DEFAULT 0,
    exploracao_financeira_inseridos INTEGER DEFAULT 0,
    exploracao_financeira_desligados INTEGER DEFAULT 0,
    exploracao_financeira_total INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Unique constraint to prevent duplicate reports for the same month/year per directorate
    UNIQUE(directorate_id, month, year)
);

-- Enable RLS
ALTER TABLE public.creas_idoso_reports ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view reports for their directorate" ON public.creas_idoso_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profile_directorates
            WHERE profile_id = auth.uid()
            AND directorate_id = creas_idoso_reports.directorate_id
        ) OR EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Users can insert reports for their directorate" ON public.creas_idoso_reports
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profile_directorates
            WHERE profile_id = auth.uid()
            AND directorate_id = creas_idoso_reports.directorate_id
        ) OR EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Users can update reports for their directorate" ON public.creas_idoso_reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profile_directorates
            WHERE profile_id = auth.uid()
            AND directorate_id = creas_idoso_reports.directorate_id
        ) OR EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Admin can delete reports" ON public.creas_idoso_reports
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Create table for CREAS PCD Reports
CREATE TABLE IF NOT EXISTS public.creas_pcd_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    directorate_id UUID NOT NULL REFERENCES public.directorates(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    month SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'submitted')),
    
    -- No PAEFI Block for PCD according to current form configuration

    -- Def Violência Física
    def_violencia_fisica_atendidas_anterior INTEGER DEFAULT 0,
    def_violencia_fisica_inseridos INTEGER DEFAULT 0,
    def_violencia_fisica_desligados INTEGER DEFAULT 0,
    def_violencia_fisica_total INTEGER DEFAULT 0,

    -- Def Abuso Sexual
    def_abuso_sexual_atendidas_anterior INTEGER DEFAULT 0,
    def_abuso_sexual_inseridos INTEGER DEFAULT 0,
    def_abuso_sexual_desligados INTEGER DEFAULT 0,
    def_abuso_sexual_total INTEGER DEFAULT 0,

    -- Def Exploração Sexual
    def_exploracao_sexual_atendidas_anterior INTEGER DEFAULT 0,
    def_exploracao_sexual_inseridos INTEGER DEFAULT 0,
    def_exploracao_sexual_desligados INTEGER DEFAULT 0,
    def_exploracao_sexual_total INTEGER DEFAULT 0,

    -- Def Negligência
    def_negligencia_atendidas_anterior INTEGER DEFAULT 0,
    def_negligencia_inseridos INTEGER DEFAULT 0,
    def_negligencia_desligados INTEGER DEFAULT 0,
    def_negligencia_total INTEGER DEFAULT 0,

    -- Def Exploração Financeira
    def_exploracao_financeira_atendidas_anterior INTEGER DEFAULT 0,
    def_exploracao_financeira_inseridos INTEGER DEFAULT 0,
    def_exploracao_financeira_desligados INTEGER DEFAULT 0,
    def_exploracao_financeira_total INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Unique constraint
    UNIQUE(directorate_id, month, year)
);

-- Enable RLS
ALTER TABLE public.creas_pcd_reports ENABLE ROW LEVEL SECURITY;

-- Policies for PCD
CREATE POLICY "Users can view pcd reports for their directorate" ON public.creas_pcd_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profile_directorates
            WHERE profile_id = auth.uid()
            AND directorate_id = creas_pcd_reports.directorate_id
        ) OR EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Users can insert pcd reports for their directorate" ON public.creas_pcd_reports
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profile_directorates
            WHERE profile_id = auth.uid()
            AND directorate_id = creas_pcd_reports.directorate_id
        ) OR EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Users can update pcd reports for their directorate" ON public.creas_pcd_reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profile_directorates
            WHERE profile_id = auth.uid()
            AND directorate_id = creas_pcd_reports.directorate_id
        ) OR EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Admin can delete pcd reports" ON public.creas_pcd_reports
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Create Triggers to automatically update "updated_at" timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_creas_idoso_reports
BEFORE UPDATE ON public.creas_idoso_reports
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trigger_update_creas_pcd_reports
BEFORE UPDATE ON public.creas_pcd_reports
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
