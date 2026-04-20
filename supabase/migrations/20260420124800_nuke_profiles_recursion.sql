-- FINAL AND COMPLETE FIX FOR PROFILES RLS RECURSION
-- This migration drops ALL known policy names for the profiles table to ensure no legacy recursive policies remain.

-- 1. DROP ALL POTENTIAL POLICIES ON PROFILES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles viewable by self" ON public.profiles;
DROP POLICY IF EXISTS "Profiles manageable by admin" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by self or admin" ON public.profiles;

-- 2. CREATE A SINGLE, SAFE SELECT POLICY
-- We use public.is_admin() which is SECURITY DEFINER to avoid recursion
CREATE POLICY "Profiles are viewable by self or admin" ON public.profiles
FOR SELECT TO authenticated USING (
    auth.uid() = id OR public.is_admin()
);

-- 3. CREATE A SAFE ALL POLICY FOR ADMINS
CREATE POLICY "Admins can manage all profiles" ON public.profiles
FOR ALL TO authenticated USING (
    public.is_admin()
);

-- 4. ALSO FIX OTHER TABLES MENTIONED IN REINFORCE_SECURITY
DROP POLICY IF EXISTS "Users can view OSCs" ON public.oscs;
CREATE POLICY "Users can view OSCs" ON public.oscs
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage OSCs" ON public.oscs;
CREATE POLICY "Admins can manage OSCs" ON public.oscs
FOR ALL TO authenticated USING ( public.is_admin() );

-- Visits
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
