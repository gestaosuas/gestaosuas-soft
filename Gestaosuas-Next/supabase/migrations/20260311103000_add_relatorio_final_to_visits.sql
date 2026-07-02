-- Add relatorio_final column to visits table
ALTER TABLE visits ADD COLUMN IF NOT EXISTS relatorio_final JSONB DEFAULT NULL;
