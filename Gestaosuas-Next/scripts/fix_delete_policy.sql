
-- Garantir que usuários autenticados (ou pelo menos admins) possam DELETAR relatórios
-- Primeiro, desabilitar RLS temporariamente para checar ou recriar políticas
ALTER TABLE "submissions" ENABLE ROW LEVEL SECURITY;

-- Remover política antiga de delete se existir para evitar duplicação ou conflito
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON "submissions";
DROP POLICY IF EXISTS "Enable delete for admins" ON "submissions";
DROP POLICY IF EXISTS "Users can delete their own submissions" ON "submissions";

-- Criar política abrangente para DELETE
-- Permite deletar se o usuário for dono do registro OU se for admin
CREATE POLICY "Users can delete their own submissions or admins can delete all"
ON "submissions"
FOR DELETE
TO authenticated
USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
    OR
    auth.jwt() ->> 'email' IN ('klismanrds@gmail.com', 'gestaosuas@uberlandia.mg.gov.br')
);
