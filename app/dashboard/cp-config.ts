import { FormDefinition } from "@/components/form-engine"

export const CP_SHEET_NAME = "CENTRO PROFISSIONALIZANTE"

// Configuration for where each block of data lives in the Sheet
// Updated based on User Request (6 blocks).
// Block 1: Resumo CP e SINE (A1:B9 -> Data A2:A9 - 8 items)
// Block 2: CONCLUINTES (A11:M21 -> Data A12:A21 - 10 items)
// Block 3: ÔNIBUS MEU OFÍCIO (A25:M28 -> Data A26:A28 - 3 items)
// Block 4: ATENDIMENTOS (A32:M42 -> Data A33:A42 - 10 items)
// Block 5: PARCERIAS E CURSOS (A63:M65 -> Data A64:A65 - 2 items)

export const CP_SHEET_BLOCKS = [
    { startRow: 2, endRow: 9 },   // Block 1
    { startRow: 12, endRow: 21 },  // Block 2
    { startRow: 26, endRow: 28 },  // Block 3
    { startRow: 33, endRow: 42 },  // Block 4
    { startRow: 64, endRow: 65 }   // Block 5
]

export const CP_FORM_DEFINITION: FormDefinition = {
    sections: [
        {
            title: "RESUMO CP E SINE",
            fields: [
                { id: "resumo_vagas", label: "Vagas oferecidas", type: "number" },
                { id: "resumo_cursos", label: "Cursos", type: "number" },
                { id: "resumo_turmas", label: "Turmas", type: "number" },
                { id: "resumo_concluintes", label: "Concluintes", type: "number" },
                { id: "resumo_mulheres", label: "Mulheres", type: "number" },
                { id: "resumo_homens", label: "Homens", type: "number" },
                { id: "resumo_mercado_fem", label: "inseridos no mercado de trabalho (feminino)", type: "number" },
                { id: "resumo_mercado_masc", label: "inseridos no mercado de trabalho (masculino)", type: "number" },
            ]
        },
        {
            title: "CONCLUINTES",
            fields: [
                { id: "cp_morumbi_concluintes", label: "CP MORUMBI", type: "number" },
                { id: "cp_lagoinha_concluintes", label: "CP LAGOINHA", type: "number" },
                { id: "cp_campo_alegre_concluintes", label: "CP CAMPO ALEGRE", type: "number" },
                { id: "cp_luizote_1_concluintes", label: "CP LUIZOTE I", type: "number" },
                { id: "cp_luizote_2_concluintes", label: "CP LUIZOTE II", type: "number" },
                { id: "cp_tocantins_concluintes", label: "CP TOCANTINS", type: "number" },
                { id: "cp_planalto_concluintes", label: "CP PLANALTO", type: "number" },
                { id: "onibus_concluintes_unit", label: "ONIBUS", type: "number" },
                { id: "maravilha_concluintes", label: "MARAVILHA", type: "number" },
                { id: "uditech_concluintes", label: "UDITECH", type: "number" },
            ]
        },
        {
            title: "ÔNIBUS MEU OFÍCIO",
            fields: [
                { id: "bairros_visitados", label: "Bairros Visitados", type: "number" },
                { id: "concluintes_onibus", label: "Concluintes", type: "number" },
                { id: "cursos_onibus", label: "Cursos", type: "number" },
            ]
        },
        {
            title: "ATENDIMENTOS",
            fields: [
                { id: "cp_morumbi_atendimentos", label: "CP MORUMBI", type: "number" },
                { id: "cp_lagoinha_atendimentos", label: "CP LAGOINHA", type: "number" },
                { id: "cp_campo_alegre_atendimentos", label: "CP CAMPO ALEGRE", type: "number" },
                { id: "cp_luizote_1_atendimentos", label: "CP LUIZOTE I", type: "number" },
                { id: "cp_luizote_2_atendimentos", label: "CP LUIZOTE II", type: "number" },
                { id: "cp_tocantis_atendimentos", label: "CP TOCANTIS", type: "number" },
                { id: "cp_planalto_atendimentos", label: "CP PLANALTO", type: "number" },
                { id: "maravilha_atendimentos", label: "MARAVILHA", type: "number" },
                { id: "unitech_atendimentos", label: "UDITECH", type: "number" },
                { id: "onibus_atendimentos", label: "ONIBUS", type: "number" },
            ]
        },
        {
            title: "PARCERIAS E CURSOS",
            fields: [
                { id: "cursos_andamento", label: "Cursos em andamento (CP)", type: "number" },
            ]
        }
    ]
}
