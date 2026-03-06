-- Create the activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID,
    user_name TEXT,
    directorate_id UUID REFERENCES directorates(id) ON DELETE SET NULL,
    directorate_name TEXT,
    action_type TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'DRAFT'
    resource_type TEXT NOT NULL, -- 'REPORT', 'VISIT', 'OSC', 'WORK_PLAN', etc
    resource_name TEXT,
    details JSONB
);

-- Turn on Row Level Security (RLS)
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can insert new logs (when they save/edit something)
CREATE POLICY "Users can insert activity logs" 
ON activity_logs FOR INSERT TO authenticated 
WITH CHECK (true);

-- Policy: Only Admins can view activity logs
CREATE POLICY "Admins can view activity logs" 
ON activity_logs FOR SELECT TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR
    (auth.jwt() ->> 'email') IN ('klismanrds@gmail.com', 'gestaosuas@uberlandia.mg.gov.br')
);

-- Enable Realtime for this table so the Admin Dashboard updates instantly
ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;
