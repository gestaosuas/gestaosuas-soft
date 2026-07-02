-- Add partnership description fields to oscs table
ALTER TABLE oscs ADD COLUMN IF NOT EXISTS objeto TEXT;
ALTER TABLE oscs ADD COLUMN IF NOT EXISTS objetivos TEXT;
ALTER TABLE oscs ADD COLUMN IF NOT EXISTS metas TEXT;
ALTER TABLE oscs ADD COLUMN IF NOT EXISTS atividades TEXT;
