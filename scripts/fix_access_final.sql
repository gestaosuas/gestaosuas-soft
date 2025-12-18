
-- Função auxiliar SECURITY DEFINER para checar acesso sem barreiras de RLS nas tabelas consultadas
CREATE OR REPLACE FUNCTION public.has_directorate_access(target_directorate_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 1. Se for admin, tem acesso
    IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RETURN true;
    END IF;

    -- 2. Se tiver email de admin (whitelist), tem acesso
    IF (SELECT auth.jwt() ->> 'email') IN ('klismanrds@gmail.com', 'gestaosuas@uberlandia.mg.gov.br') THEN
        RETURN true;
    END IF;

    -- 3. Se tiver vínculo na tabela profile_directorates, tem acesso
    IF EXISTS (
        SELECT 1 
        FROM profile_directorates pd
        WHERE pd.user_id = auth.uid() 
        AND pd.directorate_id = target_directorate_id
    ) THEN
        RETURN true;
    END IF;

    RETURN false;
END;
$$;

-- Recriar a política de SELECT na tabela submissions usando a função segura
ALTER TABLE "submissions" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for submissions" ON "submissions";

CREATE POLICY "Enable read access for submissions"
ON "submissions"
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() -- Dono do registro sempre vê
    OR
    has_directorate_access(directorate_id) -- Validação robusta via função
);

-- BÔNUS: Garantir que a leitura do PRÓPRIO perfil e vínculos seja irrestrita para o usuário logado
-- Muitas vezes o Join falha porque o usuário não consegue ler a tabela 'directorates' ou 'profile_directorates'
-- Vamos abrir leitura dessas tabelas auxiliares para 'authenticated' de forma mais ampla, pois não contêm dados sigilosos críticos (apenas nomes de diretorias e IDs)

DROP POLICY IF EXISTS "Authenticated users can view directorates" ON "directorates";
CREATE POLICY "Authenticated users can view directorates" ON "directorates"
FOR SELECT TO authenticated USING (true); 

DROP POLICY IF EXISTS "Users can view their own directorate links" ON "profile_directorates";
CREATE POLICY "Users can view their own directorate links" ON "profile_directorates"
FOR SELECT TO authenticated USING (
    user_id = auth.uid()
);
