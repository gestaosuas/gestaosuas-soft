
import { FormDefinition } from "@/components/form-engine"

export const POP_RUA_SPREADSHEET_ID = "1bP0asvPnbZqngqdFnpZh-5WOFlUeupgozLbV1udP0BM"

export const POP_RUA_FORM_DEFINITION: FormDefinition = {
    sections: [
        {
            title: "Número de Atendimentos",
            fields: [
                {
                    id: "num_atend_centro_ref",
                    label: "Centro de Referência",
                    type: "number",
                    tooltip: "Soma de Atendimento Técnico, Atendimento ADM e Diretoria CREAS/Ruas -gestão do Suas, Vigilância Social e Projetos"
                },
                { id: "num_atend_abordagem", label: "Abordagem Social", type: "number" },
                { id: "num_atend_migracao", label: "Migração", type: "number" },
                {
                    id: "num_atend_total",
                    label: "Total",
                    type: "number",
                    disabled: true,
                    tooltip: "Soma automática: Centro de Referência + Abordagem Social + Migração"
                }
            ]
        },
        {
            title: "Centro de Referência",
            fields: [
                { id: "cr_a1_masc", label: "A.1 Centro Especializado para Pessoas em Situação de Rua Masculino", type: "number" },
                { id: "cr_a1_fem", label: "A.1 Centro Especializado para Pessoas em Situação de Rua Feminino", type: "number" },
                { id: "cr_b1_drogas", label: "B.1 Usuários de drogas", type: "number" },
                { id: "cr_b2_migrantes", label: "B.2 Pessoas Consideradas Migrantes/Trecheiros", type: "number" },
                { id: "cr_b3_mental", label: "B.3 Doença ou transtorno Psiquiatrico (Mental)", type: "number" },
                { id: "cr_cad_unico", label: "Pessoas cadastradas no Cad Único", type: "number" },
                { id: "cr_enc_mercado", label: "Pessoas encaminhadas para o mercado de trabalho", type: "number" },
                { id: "cr_enc_caps", label: "Pessoas encaminhadas para CAPs AD e Saúde Mental", type: "number" },
                { id: "cr_enc_saude", label: "Pessoas encaminhadas para a Saúde Pública (UAI/UBS)", type: "number" },
                { id: "cr_enc_consultorio", label: "Pessoas encaminhadas para Consultório na Rua", type: "number" },
                { id: "cr_segunda_via", label: "Segunda via de Documentação", type: "number" }
            ]
        },
        {
            title: "Abordagem de Rua",
            fields: [
                { id: "ar_e1_masc", label: "E.1 Abordagem Social Masculino", type: "number" },
                { id: "ar_e2_fem", label: "E.2 Abordagem Social Feminino", type: "number" },
                { id: "ar_e5_drogas", label: "E.5 Usuários de drogas", type: "number" },
                { id: "ar_e6_migrantes", label: "E.6 Migrantes", type: "number" },
                { id: "ar_persistentes", label: "Usuários que persistem em continuar nas ruas", type: "number" },
                { id: "ar_enc_centro_ref", label: "Nº de encaminhamentos para o Centro de Referência", type: "number" },
                { id: "ar_recusa_identificacao", label: "Nº de pessoas que se recusaram a ser identificadas", type: "number" }
            ]
        },
        {
            title: "Núcleo do Migrante",
            fields: [
                { id: "nm_total_passagens", label: "Total de Usuários que pleitearam passagens", type: "number" },
                { id: "nm_passagens_deferidas", label: "Passagens Deferidas", type: "number" },
                { id: "nm_passagens_indeferidas", label: "Passagens Indeferidas", type: "number" },
                { id: "nm_estrangeiros", label: "Pessoas Estrangeiras", type: "number" },
                { id: "nm_retorno_familiar", label: "Pessoas que retornaram para o Núcleo Familiar", type: "number" },
                { id: "nm_busca_trabalho", label: "Pessoas em busca de trabalho", type: "number" },
                { id: "nm_busca_saude", label: "Pessoas em busca de tratamento de saúde", type: "number" }
            ]
        }
    ]
}

export const POP_RUA_SHEET_BLOCKS = [
    {
        sheetName: "Dados_Gerais",
        startRow: 2,
        endRow: 5 // 4 fields
    },
    {
        sheetName: "Centro_Referencia",
        startRow: 2,
        endRow: 12 // 11 fields
    },
    {
        sheetName: "Abordagem_de_Rua",
        startRow: 2,
        endRow: 8 // 7 fields
    },
    {
        sheetName: "Núcleo do Migrante",
        startRow: 2,
        endRow: 8 // 7 fields
    }
]
