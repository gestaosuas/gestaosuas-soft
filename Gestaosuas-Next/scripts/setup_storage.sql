
-- Enable storage extension if not enabled (usually enabled by default in Supabase projects)
-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('system-assets', 'system-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Remote existing policies to avoid conflicts during testing
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

-- Policy: Public Read (Anyone can view the logo)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'system-assets' );

-- Policy: Authenticated Upload (Only logged in users can upload)
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'system-assets' );

-- Policy: Authenticated Update/Delete (Allow users to replace assets)
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'system-assets' );

CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'system-assets' );
