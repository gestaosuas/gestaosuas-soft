ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE directorates DISABLE ROW LEVEL SECURITY;

-- Reforçar update para o seu ID específico
UPDATE profiles 
SET directorate_id = (SELECT id FROM directorates WHERE name = 'Formação Profissional e SINE' LIMIT 1)
WHERE id = 'fc51361e-34fa-4be8-b47c-23c6925e8f69';
