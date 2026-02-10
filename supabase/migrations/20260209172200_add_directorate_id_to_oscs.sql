-- Add directorate_id to oscs table to isolate data between directorates
ALTER TABLE public.oscs 
ADD COLUMN IF NOT EXISTS directorate_id uuid REFERENCES public.directorates(id);

-- Update existing OSCs to a default directorate if any exist
-- We'll try to find the 'Subvenção' directorate ID first
DO $$
DECLARE
    subvencao_id uuid;
BEGIN
    SELECT id INTO subvencao_id FROM public.directorates WHERE name ILIKE '%subvenção%' LIMIT 1;
    
    IF subvencao_id IS NOT NULL THEN
        UPDATE public.oscs SET directorate_id = subvencao_id WHERE directorate_id IS NULL;
    END IF;
END $$;
