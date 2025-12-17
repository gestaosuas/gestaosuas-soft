import { FormDefinition } from "@/components/form-engine"

export const BENEFICIOS_SHEET_NAME = "BENEFICIOS"
export const BENEFICIOS_SPREADSHEET_ID = "1Jbv5i3PBKXU4nDbqCH1RhqW5Cj1QH4uRlibM577PoDo"


// Based on User Request and Images
// Block 1: SERVIÇOS E BENEFÍCIOS (A1:M17 -> Data A2:A17)
// Block 2: VISITAS DOMICILIARES (A19:M27 -> Data A21:A27) - Header at 20
// Block 3: CESTA BÁSICA (A30:M36 -> Data A31:A36)
// Block 4: BUSÃO SOCIAL (A39:M41 -> Data A40:A41)
// Block 5: PBF E CAD ÚNICO (A44:M46 -> Data A45:A46)

export const BENEFICIOS_SHEET_BLOCKS = [
    { startRow: 2, endRow: 17 },   // Block 1
    { startRow: 21, endRow: 27 },  // Block 2
    { startRow: 31, endRow: 36 },  // Block 3
    { startRow: 40, endRow: 41 },  // Block 4
    { startRow: 45, endRow: 46 }   // Block 5
]

export const BENEFICIOS_FORM_DEFINITION: FormDefinition = {
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
}
