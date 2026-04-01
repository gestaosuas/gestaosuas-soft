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
    { startRow: 2, endRow: 17 },   // Block 1: SERVIÇOS E BENEFÍCIOS
    { startRow: 21, endRow: 27 },  // Block 2: VISITAS DOMICILIARES
    { startRow: 40, endRow: 42 },  // Block 3: ATENDIMENTOS (formerly Busão Social area)
    { startRow: 45, endRow: 46 }   // Block 4: Acompanhamento CadÚnico/PBF
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
                { id: "dmae", label: "DMAE (Deferidos)", type: "number" },
                { id: "pro_pao", label: "Pró - pão (Cestas Entregues)", type: "number" },
                { id: "auxilio_documento", label: "Auxílio Documento", type: "number", tooltip: "Soma de Cert. Nasc, Cert. Cas. e Cert. Óbito." },
                { id: "carteirinha_idoso", label: "Carteirinha do Idoso", type: "number" },
                { id: "bpc_presencial", label: "BPC/ Presencial", type: "number" },
                { id: "bpc_online", label: "BPC/Online", type: "number" },
                { id: "solicitacao_colchoes", label: "Solicitação de Colchões", type: "number" },
                { id: "cesta_basica", label: "Cesta Básica (Entregues)", type: "number" },
                { id: "solicitacao_fraldas", label: "Solicitação de fraldas", type: "number" },
                { id: "absorvente", label: "Absorvente", type: "number" },
                { id: "agasalho_cobertor", label: "Agasalho/cobertor", type: "number" },
            ]
        },
        {
            title: "VISITAS DOMICILIARES",
            fields: [
                { id: "visitas_cadunico", label: "Visitas Cadúnico", type: "number" },
                { id: "visita_nucleo_habitacao", label: "Visita Nucleo S. Habitaç.", type: "number" },
                { id: "visita_cesta_fraldas_colchoes", label: "Visita Cesta Básica/ Fraldas/ Colchões", type: "number" },
                { id: "visita_dmae", label: "Visita DMAE", type: "number" },
                { id: "visitas_pro_pao", label: "Visitas Pró-pão", type: "number" },
                { id: "total_visitas", label: "Total de Visita", type: "number" },
            ]
        },
        {
            title: "ATENDIMENTOS",
            fields: [
                { id: "busao_social_1", label: "Busão Social 1", type: "number" },
                { id: "busao_social_2", label: "Busão Social 2", type: "number" },
                { id: "dibs", label: "Dibs", type: "number" },
            ]
        },
        {
            title: "Acompanhamento CadÚnico/PBF",
            fields: [
                { id: "familias_pbf", label: "Famílias beneficiadas no PBF", type: "number" },
                { id: "pessoas_cadunico", label: "Famílias cadastradas no CadUnico", type: "number" },
            ]
        }
    ]
}
