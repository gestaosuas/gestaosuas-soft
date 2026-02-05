import { FormDefinition, SectionDefinition } from "@/components/form-engine"

export const CREAS_SPREADSHEET_ID = "1lFgnxKgouTqa-xHl-L8sVOhBj16TbuPF11q8mtiFjiQ"
export const CREAS_IDOSO_SHEET_NAME = "CREAS Idoso"

// Config for Google Sheets Integration
export const CREAS_IDOSO_SHEET_CONFIG = {
    spreadsheetId: CREAS_SPREADSHEET_ID,
    sheetName: CREAS_IDOSO_SHEET_NAME,
    // Mapping blocks to row ranges (1-based index from sheet)
    blocks: [] as { startRow: number }[]
}

// Helper to generate the identical victim sections
const createVictimSection = (title: string, prefix: string): SectionDefinition => ({
    title: title,
    fields: [
        { id: `${prefix}_atendidas_anterior`, label: "Atendidas no mês anterior", type: "number" as const },
        { id: `${prefix}_inseridos`, label: "Inseridos / Novos", type: "number" as const },
        { id: `${prefix}_desligados`, label: "Desligados no PAEFI", type: "number" as const },
        { id: `${prefix}_total`, label: "Total", type: "number" as const, disabled: true }, // Logic: Atendidas Anterior + Inseridos
    ]
})

const PAEFI_SECTION: SectionDefinition = {
    title: "Famílias em Acompanhamento pelo PAEFI/Mês Referência",
    fields: [
        { id: "paefi_novos_casos", label: "Casos Novos Recebidos", type: "number" as const },
        { id: "paefi_acomp_inicio", label: "Famílias em Acomp. 1º Dia Mês", type: "number" as const },
        { id: "paefi_inseridos", label: "Famílias Inseridos/Atend.", type: "number" as const },
        { id: "paefi_desligados", label: "Núm de Casos Desligados", type: "number" as const },
        { id: "paefi_bolsa_familia", label: "Famílias Benef. Bolsa Família", type: "number" as const },
        { id: "paefi_bpc", label: "Famílias com BPC", type: "number" as const },
        { id: "paefi_substancias", label: "Famílias com Dep. Substâncias", type: "number" as const },
    ]
}

export const CREAS_IDOSO_FORM_DEFINITION: FormDefinition = {
    sections: [
        PAEFI_SECTION,
        createVictimSection("Pessoas idosas vítimas de violência física ou psicológica", "violencia_fisica"),
        createVictimSection("Pessoas idosas vítimas de abuso sexual", "abuso_sexual"),
        createVictimSection("Pessoas idosas vítimas de exploração sexual", "exploracao_sexual"),
        createVictimSection("Pessoas idosas vítimas de negligência ou abandono", "negligencia"),
        createVictimSection("Pessoas idosas vítimas de exploração financeira", "exploracao_financeira"),
    ]
}

export const CREAS_DEFICIENTE_SHEET_NAME = "CREAS Deficiente"

export const CREAS_DEFICIENTE_SHEET_CONFIG = {
    spreadsheetId: CREAS_SPREADSHEET_ID,
    sheetName: CREAS_DEFICIENTE_SHEET_NAME,
    blocks: [] as { startRow: number }[]
}

export const CREAS_DEFICIENTE_FORM_DEFINITION: FormDefinition = {
    sections: [
        createVictimSection("Pessoas com deficiência vítimas de violência física ou psicológica", "def_violencia_fisica"),
        createVictimSection("Pessoas com deficiência vítimas de abuso sexual", "def_abuso_sexual"),
        createVictimSection("Pessoas com deficiência vítimas de exploração sexual", "def_exploracao_sexual"),
        createVictimSection("Pessoas com deficiência vítimas de negligência ou abandono", "def_negligencia"),
        createVictimSection("Pessoas com deficiência vítimas de exploração financeira", "def_exploracao_financeira"),
    ]
}
