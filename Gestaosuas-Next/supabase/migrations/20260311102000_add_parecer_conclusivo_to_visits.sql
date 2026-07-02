-- Add parecer_conclusivo column to visits table
ALTER TABLE visits ADD COLUMN IF NOT EXISTS parecer_conclusivo JSONB DEFAULT NULL;
