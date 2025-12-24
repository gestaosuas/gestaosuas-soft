-- Reinforce RLS on core tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE directorates ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
FOR SELECT TO authenticated USING (
    auth.uid() = id OR 
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Directorates Policies
DROP POLICY IF EXISTS "Authenticated users can view directorates" ON directorates;
CREATE POLICY "Authenticated users can view directorates" ON directorates
FOR SELECT TO authenticated USING (true);

-- OSCs (Organizações da Sociedade Civil)
ALTER TABLE oscs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view OSCs" ON oscs;
CREATE POLICY "Users can view OSCs" ON oscs
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage OSCs" ON oscs;
CREATE POLICY "Admins can manage OSCs" ON oscs
FOR ALL TO authenticated USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Visits (Visit Monitoring)
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Technicians can view visits for their directorate" ON visits;
CREATE POLICY "Technicians can view visits for their directorate" ON visits
FOR SELECT TO authenticated USING (
    directorate_id IN (
        SELECT directorate_id FROM profile_directorates WHERE profile_id = auth.uid()
    ) OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Technicians can manage their own visits" ON visits;
CREATE POLICY "Technicians can manage their own visits" ON visits
FOR ALL TO authenticated USING (
    (user_id = auth.uid() AND status = 'draft') OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
