-- Este script deve ser rodado **NO SITE DA PRODUÇÃO** (Supabase Dashboard > SQL Editor)
-- Ele forçará que a tabela de produção seja idêntica à do localhost, ganhando a coluna directorate_id.

ALTER TABLE cras_reports 
    ADD COLUMN IF NOT EXISTS directorate_id UUID REFERENCES directorates(id),
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
    ADD COLUMN IF NOT EXISTS unit_name TEXT DEFAULT '';

ALTER TABLE beneficios_reports 
    ADD COLUMN IF NOT EXISTS directorate_id UUID REFERENCES directorates(id),
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Rodar o clear de schema logo após para que o cache em produção limpe e permita inserções.
NOTIFY pgrst, 'reload schema';
