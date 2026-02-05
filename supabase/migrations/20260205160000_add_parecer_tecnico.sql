-- Add parecer_tecnico column to visits table
ALTER TABLE visits ADD COLUMN IF NOT EXISTS parecer_tecnico JSONB DEFAULT NULL;
