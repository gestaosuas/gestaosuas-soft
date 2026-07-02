const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    console.log('Initializing Supabase client...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role Key for Admin write access

    if (!supabaseUrl || !supabaseKey) {
        console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
        console.log('Please ensure your .env.local contains these keys.');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const formDefinition = {
        sections: [
            {
                title: "SERVIÇOS E BENEFÍCIOS",
                fields: [
                    { id: "encaminhadas_inclusao_cadunico", label: "Famílias encaminhadas para inclusão CadUnico", type: "number" },
                    { id: "encaminhadas_atualizacao_cadunico", label: "Famílias encaminhadas para atualização cadastral no CadUnico", type: "number" },
                    { id: "consulta_cadunico", label: "Consulta CadÚnico", type: "number" },
                    { id: "numero_nis", label: "Numero NIS", type: "number" },
                    { id: "dmae", label: "DMAE", type: "number" },
                    { id: "pro_pao", label: "Pró - pão", type: "number" },
                    { id: "auxilio_documento", label: "Auxílio Documento", type: "number" },
                    { id: "guia_foto", label: "Guia de foto", type: "number" },
                    { id: "carteirinha_idoso", label: "Carteirinha do Idoso", type: "number" },
                    { id: "bpc_presencial", label: "BPC/ Presencial", type: "number" },
                    { id: "bpc_online", label: "BPC/Online", type: "number" },
                    { id: "solicitacao_colchoes", label: "Solicitação de Colchões", type: "number" },
                    { id: "cesta_basica", label: "Cesta básica", type: "number" },
                    { id: "solicitacao_fraldas", label: "Solicitação de fraldas", type: "number" },
                    { id: "absorvente", label: "Absorvente", type: "number" },
                    { id: "agasalho_cobertor", label: "Agasalho/cobertor", type: "number" },
                ]
            },
            {
                title: "VISITAS DOMICILIARES",
                fields: [
                    { id: "visitas_cadunico", label: "Visitas D. CadÚnico", type: "number" },
                    { id: "visitas_convocacoes", label: "Visitas Convocações", type: "number" },
                    { id: "visita_nucleo_habitacao", label: "Visita Nucleo S. Habitaç.", type: "number" },
                    { id: "visita_cesta_fraldas_colchoes", label: "Visita D. Cesta Básica/ fraldas / colchões", type: "number" },
                    { id: "visita_dmae", label: "Visita DMAE", type: "number" },
                    { id: "visitas_pro_pao", label: "Visitas Pró-pão", type: "number" },
                    { id: "total_visitas", label: "Total de Visita", type: "number" },
                ]
            },
            {
                title: "CESTA BÁSICA (INDEFERIDAS)",
                fields: [
                    { id: "cesta_indeferida_renda_superior", label: "Cesta básica indeferida – renda superior", type: "number" },
                    { id: "cesta_indeferida_kit_escolar", label: "Cesta básica indeferida – kit escolar", type: "number" },
                    { id: "cesta_indeferida_renda_pro_pao", label: "Cesta básica indeferida – renda pró-pão", type: "number" },
                    { id: "cesta_indeferida_ninguem_local", label: "Cesta básica indeferida – 02 visitas ninguém no local", type: "number" },
                    { id: "cesta_indeferida_nao_localizado", label: "Cesta básica indeferida – endereço não localizado", type: "number" },
                    { id: "cesta_indeferida_nao_reside", label: "Cesta básica indeferida – não reside no endereço/mudou", type: "number" },
                ]
            },
            {
                title: "BUSÃO SOCIAL",
                fields: [
                    { id: "busao_atendimentos", label: "Atendimentos", type: "number" },
                    { id: "busao_procedimentos", label: "Procedimentos", type: "number" },
                ]
            },
            {
                title: "FAMÍLIAS BENEFICIADAS E CADASTROS",
                fields: [
                    { id: "familias_pbf", label: "Famílias beneficiadas no PBF", type: "number" },
                    { id: "pessoas_cadunico", label: "Pessoas cadastradas no CadUnico", type: "number" },
                ]
            }
        ]
    };

    const sheetConfig = {
        sheetName: "BENEFICIOS",
        startRow: 2,
        spreadsheetId: "1Jbv5i3PBKXU4nDbqCH1RhqW5Cj1QH4uRlibM577PoDo" // Correct ID
    };

    const payload = {
        name: "Benefícios Socioassistenciais",
        sheet_config: sheetConfig,
        form_definition: formDefinition,
        // created_at: new Date().toISOString() // Let DB handle default
    };

    console.log('Inserting new directorate...');

    const { data, error } = await supabase
        .from('directorates')
        .insert(payload)
        .select()
        .single();

    if (error) {
        console.error('Error inserting directorate:', error);
    } else {
        console.log('Directorate created successfully!');
        console.log('ID:', data.id);
        console.log('Name:', data.name);
        console.log('\nIMPORTANT: Please ask the user to update their profile to use this Directorate ID.');
    }
}

main();
