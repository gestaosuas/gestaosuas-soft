-- Add notificacoes column to visits table
ALTER TABLE visits ADD COLUMN IF NOT EXISTS notificacoes JSONB DEFAULT '[]'::jsonb;

