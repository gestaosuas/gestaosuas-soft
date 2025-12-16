ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View submissions from my directorate" ON submissions;
CREATE POLICY "View submissions from my directorate" ON submissions
FOR SELECT
USING (
  directorate_id IN (
    SELECT directorate_id FROM profiles WHERE id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Insert submissions for my directorate" ON submissions;
CREATE POLICY "Insert submissions for my directorate" ON submissions
FOR INSERT
WITH CHECK (
  directorate_id IN (
    SELECT directorate_id FROM profiles WHERE id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Update submissions from my directorate" ON submissions;
CREATE POLICY "Update submissions from my directorate" ON submissions
FOR UPDATE
USING (
  directorate_id IN (
    SELECT directorate_id FROM profiles WHERE id = auth.uid()
  )
);
