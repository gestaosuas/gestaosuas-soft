CREATE TABLE IF NOT EXISTS public.monitorings_genericmonitoringreport (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    directorate_id UUID NOT NULL REFERENCES public.directorates(id) ON DELETE CASCADE,
    month SMALLINT NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'submitted')),
    user_id UUID,
    created_by VARCHAR(255) NOT NULL DEFAULT '',
    reference VARCHAR(120) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT monitorings_genericmonitoringreport_unq UNIQUE (directorate_id, reference, month, year)
);

-- Enable RLS
ALTER TABLE public.monitorings_genericmonitoringreport ENABLE ROW LEVEL SECURITY;

-- Triggers for updated_at
CREATE TRIGGER trigger_update_monitorings_genericmonitoringreport
BEFORE UPDATE ON public.monitorings_genericmonitoringreport
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Admins can do anything
CREATE POLICY "Admins can do everything on genericmonitoringreport"
ON public.monitorings_genericmonitoringreport
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Users can read their directorate's reports
CREATE POLICY "Users can read their directorate's genericmonitoringreports"
ON public.monitorings_genericmonitoringreport
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profile_directorates
        WHERE profile_directorates.profile_id = auth.uid()
        AND profile_directorates.directorate_id = monitorings_genericmonitoringreport.directorate_id
    ) OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Users can insert/update if they belong to that directorate
CREATE POLICY "Users can edit their directorate's genericmonitoringreports"
ON public.monitorings_genericmonitoringreport
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profile_directorates
        WHERE profile_directorates.profile_id = auth.uid()
        AND profile_directorates.directorate_id = monitorings_genericmonitoringreport.directorate_id
    ) OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

CREATE POLICY "Users can update their directorate's genericmonitoringreports"
ON public.monitorings_genericmonitoringreport
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profile_directorates
        WHERE profile_directorates.profile_id = auth.uid()
        AND profile_directorates.directorate_id = monitorings_genericmonitoringreport.directorate_id
    ) OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);
