-- FIX FOR INFINITE RECURSION IN RLS POLICIES
-- Affected tables: profiles, oscs, visits, sine_reports, qualificacao_reports

-- 1. Profiles Table (The root of the issue)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Profiles are viewable by self or admin" ON public.profiles
FOR SELECT TO authenticated USING (
    auth.uid() = id OR public.is_admin()
);

-- 2. OSCs Table
DROP POLICY IF EXISTS "Admins can manage OSCs" ON public.oscs;
CREATE POLICY "Admins can manage OSCs" ON public.oscs
FOR ALL TO authenticated USING ( public.is_admin() );

-- 3. Visits Table
DROP POLICY IF EXISTS "Technicians can view visits for their directorate" ON public.visits;
CREATE POLICY "Technicians can view visits for their directorate" ON public.visits
FOR SELECT TO authenticated USING (
    directorate_id IN (
        SELECT directorate_id FROM profile_directorates WHERE profile_id = auth.uid()
    ) OR public.is_admin()
);

DROP POLICY IF EXISTS "Technicians can manage their own visits" ON public.visits;
CREATE POLICY "Technicians can manage their own visits" ON public.visits
FOR ALL TO authenticated USING (
    (user_id = auth.uid() AND status = 'draft') OR public.is_admin()
);

-- 4. SINE Reports
DROP POLICY IF EXISTS "Manageable by admins" ON public.sine_reports;
CREATE POLICY "Manageable by admins" ON public.sine_reports
FOR ALL TO authenticated USING ( public.is_admin() );

-- 5. Qualificacao Reports
DROP POLICY IF EXISTS "Manageable by admins" ON public.qualificacao_reports;
CREATE POLICY "Manageable by admins" ON public.qualificacao_reports
FOR ALL TO authenticated USING ( public.is_admin() );
