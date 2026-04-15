-- Criação de uma função de bypass para evitar Recursão Infinita
-- Ao checar `profiles` dentro de políticas RLS, causamos ciclo infinito se a própria profiles usar.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Drop and replace NAICA policies
DROP POLICY IF EXISTS "Admins can do everything on naica_reports" ON naica_reports;
CREATE POLICY "Admins can do everything on naica_reports"
ON naica_reports FOR ALL TO authenticated USING ( public.is_admin() );

DROP POLICY IF EXISTS "Users can read their directorate's naica reports" ON naica_reports;
CREATE POLICY "Users can read their directorate's naica reports"
ON naica_reports FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profile_directorates
        WHERE profile_directorates.profile_id = auth.uid()
        AND profile_directorates.directorate_id = naica_reports.directorate_id
    ) OR public.is_admin()
);

DROP POLICY IF EXISTS "Users can edit their directorate's naica reports" ON naica_reports;
CREATE POLICY "Users can edit their directorate's naica reports"
ON naica_reports FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profile_directorates
        WHERE profile_directorates.profile_id = auth.uid()
        AND profile_directorates.directorate_id = naica_reports.directorate_id
    ) OR public.is_admin()
);

DROP POLICY IF EXISTS "Users can update their directorate's naica reports" ON naica_reports;
CREATE POLICY "Users can update their directorate's naica reports"
ON naica_reports FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profile_directorates
        WHERE profile_directorates.profile_id = auth.uid()
        AND profile_directorates.directorate_id = naica_reports.directorate_id
    ) OR public.is_admin()
);

-- Preemptively also fix POP RUA recursion since it uses the same buggy snippet
DROP POLICY IF EXISTS "Admins can do everything on creas_pop_rua_reports" ON creas_pop_rua_reports;
CREATE POLICY "Admins can do everything on creas_pop_rua_reports"
ON creas_pop_rua_reports FOR ALL TO authenticated USING ( public.is_admin() );

DROP POLICY IF EXISTS "Users can read their directorate's pop rua reports" ON creas_pop_rua_reports;
CREATE POLICY "Users can read their directorate's pop rua reports"
ON creas_pop_rua_reports FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profile_directorates
        WHERE profile_directorates.profile_id = auth.uid()
        AND profile_directorates.directorate_id = creas_pop_rua_reports.directorate_id
    ) OR public.is_admin()
);
