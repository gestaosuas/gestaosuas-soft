
-- Corrigir permissões de leitura para tabelas auxiliares que definem o acesso do usuário

-- 1. Profiles: Usuário deve poder ler seu próprio perfil (e talvez admins lerem todos)
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile" ON "profiles";
CREATE POLICY "Users can view their own profile" ON "profiles"
FOR SELECT TO authenticated USING (
    auth.uid() = id OR 
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 2. Directorates: Todos usuários logados precisam ver as diretorias (para menus, nomes, etc)
-- Se for sensível, limitar, mas geralmente é tabela pública de domínio
ALTER TABLE "directorates" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view directorates" ON "directorates";
CREATE POLICY "Authenticated users can view directorates" ON "directorates"
FOR SELECT TO authenticated USING (true); -- Permite leitura global para logados

-- 3. Profile Directorates: CRUCIAL. O usuário precisa saber seus vinculos.
ALTER TABLE "profile_directorates" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own directorate links" ON "profile_directorates";
CREATE POLICY "Users can view their own directorate links" ON "profile_directorates"
FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Reforçar Submissions (já feito, mas garantindo)
ALTER TABLE "submissions" ENABLE ROW LEVEL SECURITY;
-- (A política "Enable read access for submissions" já foi criada no passo anterior e cobre isso)
