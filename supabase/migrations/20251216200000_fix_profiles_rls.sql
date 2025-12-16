-- 1. Criar Trigger para novos usuários (para o futuro)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Garantir que o perfil do usuário atual exista e seja Admin + SINE
INSERT INTO public.profiles (id, role, full_name, directorate_id)
VALUES (
  'fc51361e-34fa-4be8-b47c-23c6925e8f69', 
  'admin', 
  'Gestão SUAS',
  (SELECT id FROM directorates WHERE name = 'Formação Profissional e SINE' LIMIT 1)
)
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  directorate_id = (SELECT id FROM directorates WHERE name = 'Formação Profissional e SINE' LIMIT 1);

-- 3. Liberar RLS para Leitura
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE directorates ENABLE ROW LEVEL SECURITY;

-- Profiles: Usuário vê o seu próprio
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

-- Directorates: Todos autenticados podem ler
DROP POLICY IF EXISTS "Authenticated can view directorates" ON directorates;
CREATE POLICY "Authenticated can view directorates" ON directorates FOR SELECT TO authenticated USING (true);
