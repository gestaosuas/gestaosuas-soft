-- Add directorate_id to form_delegations to support delegation to entire directorates
ALTER TABLE public.form_delegations ADD COLUMN IF NOT EXISTS directorate_id UUID REFERENCES public.directorates(id) ON DELETE CASCADE;

-- Update RLS policies for form_delegations to allow users from delegated directorates to see the record
-- (The actual visibility logic for data like visits is handled in the app query, but RLS on this table is good practice)
DROP POLICY IF EXISTS "Users can view delegations for their own directorate" ON public.form_delegations;
CREATE POLICY "Users can view delegations for their own directorate" 
ON public.form_delegations FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (
            profiles.directorate_id = form_delegations.directorate_id OR
            EXISTS (
                SELECT 1 FROM profile_directorates 
                WHERE profile_directorates.profile_id = auth.uid() 
                AND profile_directorates.directorate_id = form_delegations.directorate_id
            )
        )
    )
);
