-- Tabela de Relatórios de Benefícios Socioassistenciais
-- Execute este comando no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS beneficios_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    directorate_id UUID REFERENCES directorates(id),
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    
    -- SERVIÇOS E BENEFÍCIOS
    encaminhadas_inclusao_cadunico INTEGER DEFAULT 0,
    encaminhadas_atualizacao_cadunico INTEGER DEFAULT 0,
    consulta_cadunico INTEGER DEFAULT 0,
    numero_nis INTEGER DEFAULT 0,
    dmae INTEGER DEFAULT 0,
    pro_pao INTEGER DEFAULT 0,
    auxilio_documento INTEGER DEFAULT 0,
    carteirinha_idoso INTEGER DEFAULT 0,
    bpc_presencial INTEGER DEFAULT 0,
    bpc_online INTEGER DEFAULT 0,
    solicitacao_colchoes INTEGER DEFAULT 0,
    cesta_basica INTEGER DEFAULT 0,
    solicitacao_fraldas INTEGER DEFAULT 0,
    absorvente INTEGER DEFAULT 0,
    agasalho_cobertor INTEGER DEFAULT 0,
    
    -- VISITAS DOMICILIARES
    visitas_cadunico INTEGER DEFAULT 0,
    visita_nucleo_habitacao INTEGER DEFAULT 0,
    visita_cesta_fraldas_colchoes INTEGER DEFAULT 0,
    visita_dmae INTEGER DEFAULT 0,
    visitas_pro_pao INTEGER DEFAULT 0,
    total_visitas INTEGER DEFAULT 0,
    
    -- ATENDIMENTOS
    busao_social_1 INTEGER DEFAULT 0,
    busao_social_2 INTEGER DEFAULT 0,
    dibs INTEGER DEFAULT 0,
    
    -- Acompanhamento CadÚnico/PBF
    familias_pbf INTEGER DEFAULT 0,
    pessoas_cadunico INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Garante apenas um relatório por diretoria por mês
    UNIQUE(directorate_id, month, year)
);

-- Habilitar RLS
ALTER TABLE beneficios_reports ENABLE ROW LEVEL SECURITY;

-- Manter políticas idempotentes (permite executar o script várias vezes)
DROP POLICY IF EXISTS "Users can view their own benefits reports" ON beneficios_reports;
CREATE POLICY "Users can view their own benefits reports" 
    ON beneficios_reports FOR SELECT 
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users can insert their own benefits reports" ON beneficios_reports;
CREATE POLICY "Users can insert their own benefits reports" 
    ON beneficios_reports FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own benefits reports" ON beneficios_reports;
CREATE POLICY "Users can update their own benefits reports" 
    ON beneficios_reports FOR UPDATE 
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
