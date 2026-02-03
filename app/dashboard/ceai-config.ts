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
                { id: "atendidos_anterior_masc", label: "Atendidos no mês anterior (Masc)", type: "number" },
                { id: "atendidos_anterior_fem", label: "Atendidos no mês anterior (Fem)", type: "number" },
                { id: "inseridos_masc", label: "Inseridos no mês (Masc)", type: "number" },
                { id: "inseridos_fem", label: "Inseridos no mês (Fem)", type: "number" },
                { id: "desligados_masc", label: "Desligados (Masc)", type: "number" },
                { id: "desligados_fem", label: "Desligados (Fem)", type: "number" },
                { id: "total_inseridos", label: "Total usuários Inseridos", type: "number", disabled: true }
            ]
        }
    ]
}

export const CEAI_SPREADSHEET_ID = '13KSnx_-zY7Xc_V3OZDzIYjxRa21y8fx88fAQuFHRPF8'

export const CEAI_SHEET_BLOCKS = [
    { startRow: 2, endRow: 8 } // Block mapping for the fields above, starting at C2
]
