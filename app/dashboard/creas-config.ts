import { FormDefinition } from "@/components/form-engine"

export const CREAS_SPREADSHEET_ID = "1lFgnxKgouTqa-xHl-L8sVOhBj16TbuPF11q8mtiFjiQ"
export const CREAS_IDOSO_SHEET_NAME = "CREAS Idoso"

// Config for Google Sheets Integration
export const CREAS_IDOSO_SHEET_CONFIG = {
    spreadsheetId: CREAS_SPREADSHEET_ID,
    sheetName: CREAS_IDOSO_SHEET_NAME,
    // Mapping blocks to row ranges (1-based index from sheet)
    // Based on user description/image
    blocks: [
        { startRow: 2, endRow: 9 },   // Violência (8 rows)
        { startRow: 14, endRow: 17 }, // Famílias (4 rows)
        { startRow: 21, endRow: 24 }  // Idosos Acomp (4 rows)
    ]
}

export const CREAS_IDOSO_FORM_DEFINITION: FormDefinition = {
    sections: [
        {
            title: "IDOSO TIPO DE VIOLÊNCIA",
            fields: [
                { id: "violencia_fisica_m", label: "Violência Física/Psicológica Masc.", type: "number" },
                { id: "violencia_fisica_f", label: "Violência Física/Psicológica Fem.", type: "number" },
                { id: "negligencia_m", label: "Negligência/Abandono Masc.", type: "number" },
                { id: "negligencia_f", label: "Negligência/Abandono Fem.", type: "number" },
                { id: "abuso_sexual_m", label: "Abuso/Exploração Sexual Masc.", type: "number" },
                { id: "abuso_sexual_f", label: "Abuso/Exploração Sexual Fem.", type: "number" },
                { id: "exploracao_financeira_m", label: "Exploração Financeira Masc.", type: "number" },
                { id: "exploracao_financeira_f", label: "Exploração Financeira Fem.", type: "number" },
            ]
        },
        {
            title: "FAMÍLIAS E ACOMPANHAMENTOS",
            fields: [
                { id: "fa_mes_anterior", label: "Mês Anterior", type: "number" },
                { id: "fa_admitidas", label: "Admitidas", type: "number" },
                { id: "fa_desligadas", label: "Desligadas", type: "number" },
                { id: "fa_atual", label: "Atual", type: "number", disabled: true },
            ]
        },
        {
            title: "IDOSOS EM ACOMPANHAMENTO",
            fields: [
                { id: "ia_mes_anterior", label: "Mês Anterior", type: "number" },
                { id: "ia_admitidas", label: "Admitidas", type: "number" },
                { id: "ia_desligadas", label: "Desligadas", type: "number" },
                { id: "ia_atual", label: "Atual", type: "number", disabled: true },
            ]
        }
    ]
}

export const CREAS_DEFICIENTE_SHEET_NAME = "CREAS Deficiente"

export const CREAS_DEFICIENTE_SHEET_CONFIG = {
    spreadsheetId: CREAS_SPREADSHEET_ID,
    sheetName: CREAS_DEFICIENTE_SHEET_NAME,
    blocks: [
        { startRow: 2, endRow: 9 },   // Deficiente Tipo Violência (8 rows)
        { startRow: 12, endRow: 15 }  // Pessoa com Deficiência (4 rows)
    ]
}

export const CREAS_DEFICIENTE_FORM_DEFINITION: FormDefinition = {
    sections: [
        {
            title: "DEFICIENTE TIPO DE VIOLÊNCIA",
            fields: [
                { id: "def_violencia_fisica_m", label: "Violência Física/Psicológica Masc.", type: "number" },
                { id: "def_violencia_fisica_f", label: "Violência Física/Psicológica Fem.", type: "number" },
                { id: "def_negligencia_m", label: "Negligência/Abandono Masc.", type: "number" },
                { id: "def_negligencia_f", label: "Negligência/Abandono Fem.", type: "number" },
                { id: "def_abuso_sexual_m", label: "Abuso/Exploração Sexual Masc.", type: "number" },
                { id: "def_abuso_sexual_f", label: "Abuso/Exploração Sexual Fem.", type: "number" },
                { id: "def_exploracao_financeira_m", label: "Exploração Financeira Masc.", type: "number" },
                { id: "def_exploracao_financeira_f", label: "Exploração Financeira Fem.", type: "number" },
            ]
        },
        {
            title: "PESSOA COM DEFICIÊNCIA",
            fields: [
                { id: "pcd_mes_anterior", label: "Mês Anterior", type: "number" },
                { id: "pcd_admitidas", label: "Admitidas", type: "number" },
                { id: "pcd_desligadas", label: "Desligadas", type: "number" },
                { id: "pcd_atual", label: "Atual", type: "number", disabled: true },
            ]
        }
    ]
}
