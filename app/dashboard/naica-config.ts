import { FormDefinition } from "@/components/form-engine"

export const NAICA_UNITS = [
    "Canaã",
    "Jdm Célia",
    "Lagoinha",
    "Luizote",
    "Mansour",
    "Marta Helena",
    "Morumbi",
    "Pequis",
    "Tibery",
    "Tocantins",
    "Tapuirama"
]

export const NAICA_SPREADSHEET_ID = "1HUF1G-3c_oZJ0ZwMbNyEU_pso3LtJh_AtLnQitFWdOY"

export const NAICA_SHEET_BLOCKS = [
    { startRow: 2, endRow: 8 } // Block mapping for rows 2 to 8
]

export const NAICA_FORM_DEFINITION: FormDefinition = {
    sections: [
        {
            title: "DADOS DO NAICA",
            fields: [
                { id: "mes_anterior_masc", label: "Masculino em acompanhamento no 1º dia do Mês", type: "number" },
                { id: "mes_anterior_fem", label: "Feminino em acompanhamento no 1º dia do Mês", type: "number" },
                { id: "inseridos_masc", label: "Admitidos Masculino", type: "number" },
                { id: "inseridos_fem", label: "Admitidos Feminino", type: "number" },
                { id: "desligados_masc", label: "Desligados Masculino", type: "number" },
                { id: "desligados_fem", label: "Desligados Feminino", type: "number" },
                { id: "total_atendidas", label: "Total Crianças Inseridas", type: "number", disabled: true },
            ]
        }
    ]
}
