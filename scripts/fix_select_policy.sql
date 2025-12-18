
-- Garantir que usuários possam visualizar submissões das diretorias que estão vinculados
ALTER TABLE "submissions" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for linked directorates" ON "submissions";
DROP POLICY IF EXISTS "Users can view submissions for directorates they are linked to" ON "submissions";
DROP POLICY IF EXISTS "Users can view their own submissions" ON "submissions";
DROP POLICY IF EXISTS "Admins can view all submissions" ON "submissions";

-- Criar política abrangente para SELECT
CREATE POLICY "Enable read access for submissions"
ON "submissions"
FOR SELECT
TO authenticated
USING (
    -- Admin pode ver tudo
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
    OR
    -- Usuário pode ver se seu email estiver na whitelist de admin (just in case)
    auth.jwt() ->> 'email' IN ('klismanrds@gmail.com', 'gestaosuas@uberlandia.mg.gov.br')
    OR
    -- Usuário pode ver suas próprias submissões
    auth.uid() = user_id 
    OR 
    -- Usuário pode ver se estiver vinculado à diretoria da submissão
    EXISTS (
        SELECT 1 FROM profile_directorates pd
        WHERE pd.user_id = auth.uid()
        AND pd.directorate_id = submissions.directorate_id
    )
);
