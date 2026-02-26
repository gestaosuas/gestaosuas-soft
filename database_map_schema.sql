-- Tabela para gerenciar Cores e Categorias do Mapa
CREATE TABLE IF NOT EXISTS public.map_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT 'gray',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela para gerenciar as Unidades plotadas no Mapa
CREATE TABLE IF NOT EXISTS public.map_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.map_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    region TEXT,
    address TEXT,
    phone TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Políticas de RLS
ALTER TABLE public.map_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_units ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura para todos (anônimos ou autenticados)
CREATE POLICY "Map Categories are viewable by everyone" ON public.map_categories FOR SELECT USING (true);
CREATE POLICY "Map Units are viewable by everyone" ON public.map_units FOR SELECT USING (true);

-- Políticas de inserção/atualização/deleção para Administradores
-- Apenas usuários autenticados para modificações
CREATE POLICY "Admins can insert map categories" ON public.map_categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update map categories" ON public.map_categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete map categories" ON public.map_categories FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert map units" ON public.map_units FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update map units" ON public.map_units FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete map units" ON public.map_units FOR DELETE USING (auth.role() = 'authenticated');

-- População Inicial Básica de Cores (Opcional, com base no arquivo Python)
INSERT INTO public.map_categories (name, color) VALUES 
('Casa da Mulher', 'pink'),
('Casa Dia', 'lightgreen'),
('CEAI', 'purple'),
('Centro Prof.', 'blue'),
('Complexo', 'black'),
('Condomínio do Idoso', 'darkblue'),
('Conselhos Municipais', 'darkred'),
('Conselhos Tutelares', 'cadetblue'),
('CRAS', 'red'),
('CREAS', 'lightblue'),
('NAICA', 'green'),
('SINE', 'orange'),
('OSCs SUBVENC', 'orange'),
('Outro', 'brown')
ON CONFLICT (name) DO NOTHING;
