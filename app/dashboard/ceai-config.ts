import { FormDefinition } from "@/components/form-engine"

export const CEAI_UNITS = [
    "Brasil",
    "Laranjeiras",
    "Luizote",
    "Guarani",
    "Morumbi"
]

export const CEAI_FORM_DEFINITION: FormDefinition = {
    sections: [
        {
            title: "Atendimentos e Movimentação",
            fields: [
                { id: "atendidos_anterior_masc", label: "Atendidos no 1º dia do Mês (Masc)", type: "number" },
                { id: "atendidos_anterior_fem", label: "Atendidos no 1º dia do Mês (Fem)", type: "number" },
                { id: "inseridos_masc", label: "Inseridos no mês (Masc)", type: "number" },
                { id: "inseridos_fem", label: "Inseridos no mês (Fem)", type: "number" },
                { id: "desligados_masc", label: "Desligados (Masc)", type: "number" },
                { id: "desligados_fem", label: "Desligados (Fem)", type: "number" },
                { id: "total_inseridos", label: "Total usuários Inseridos", type: "number", disabled: true },
                { id: "total_atendimentos", label: "Atendimentos", type: "number" }
            ]
        }
    ]
}

export const CONDOMINIO_IDOSO_FORM_DEFINITION: FormDefinition = {
    sections: [
        {
            title: "Laranjeiras",
            fields: [
                { id: "lar_moradores_fem", label: "Moradores Fem", type: "number" },
                { id: "lar_moradores_masc", label: "Moradores Masc", type: "number" },
                { id: "lar_atendimentos", label: "Atendimentos", type: "number" },
            ]
        },
        {
            title: "Guarani",
            fields: [
                { id: "gua_moradores_fem", label: "Moradores Fem", type: "number" },
                { id: "gua_moradores_masc", label: "Moradores Masc", type: "number" },
                { id: "gua_atendimentos", label: "Atendimentos", type: "number" },
            ]
        }
    ]
}

export const CEAI_SPREADSHEET_ID = '13KSnx_-zY7Xc_V3OZDzIYjxRa21y8fx88fAQuFHRPF8'

export const CEAI_SHEET_BLOCKS = [
    { startRow: 2, endRow: 9 } // Block mapping for the fields above, starting at C2
]
