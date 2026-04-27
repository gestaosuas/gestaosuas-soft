-- Criar o bucket se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('system-assets', 'system-assets', true)
ON CONFLICT (id) DO NOTHING;
-- Política para permitir upload (Admin/Autenticado)
CREATE POLICY "Permitir upload de RMAs" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'system-assets');
-- Política para permitir leitura pública
CREATE POLICY "Permitir leitura pública de RMAs" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'system-assets');