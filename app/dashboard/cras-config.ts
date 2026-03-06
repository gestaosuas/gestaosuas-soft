import { FormDefinition } from "@/components/form-engine"

export const CRAS_UNITS = [
    "Campo Alegre",
    "Custódio Pereira",
    "Jardim Brasília",
    "Jardim Célia",
    "Mansour",
    "Marta Helena",
    "Morumbi",
    "São Jorge",
    "Tapuirama",
    "Shopping Park",
    "Pequis",
    "Canaã",
    "Tocantins"
]

export const CRAS_SHEET_RANGE = "A1:M20"
export const CRAS_SPREADSHEET_ID = "1Typ9-bDQj1SUFS1JzyGSrxJHu9muX3j9OeonNsIyQGo"

// Mapping for Google Sheets: startRow is where the first field "Mês Anterior" goes.
// Based on the provided image and "A1:M20" range, data starts at Row 2.
export const CRAS_SHEET_BLOCKS = [
    { startRow: 2, endRow: 20 }
]

export const CRAS_FORM_DEFINITION: FormDefinition = {
    sections: [
        {
            title: "DADOS DO CRAS",
            fields: [
                { id: "mes_anterior", label: "Mês Anterior", type: "number" },
                { id: "admitidas", label: "Famílias Inseridas (PAIF)", type: "number" },
                { id: "desligadas", label: "Famílias Desligadas (PAIF)", type: "number" },
                { id: "atual", label: "Atual", type: "number", disabled: true }, // Logic: Mês Anterior + Admitidas
                { id: "atendimentos", label: "Atendimentos", type: "number" },
                { id: "visita_domiciliar", label: "Visita Domiciliar", type: "number" },
                { id: "atend_particularizado", label: "Atend. Particularizado", type: "number" },
                { id: "pro_pao", label: "Pró Pão (Cestas Entregues)", type: "number" },
                { id: "dmae", label: "Dmae", type: "number" },
                { id: "auxilio_documento", label: "Auxílio documento", type: "number" },
                { id: "cesta_basica", label: "Cesta básica", type: "number" },
                { id: "fralda", label: "Fralda", type: "number" },
                { id: "absorvente", label: "Absorvente", type: "number" },
                { id: "bpc", label: "BPC (Orientações)", type: "number" },
                { id: "carteirinha_idoso", label: "Carteirinha Idoso", type: "number" },
                { id: "passe_livre_deficiente", label: "Passe livre do deficiente(Orientações)", type: "number" },
                { id: "cadastros_novos", label: "Cadastros Novos", type: "number" },
                { id: "recadastros", label: "Atualização Cadastral", type: "number" },
                { id: "anexo_rma", label: "Anexar RMA (PDF)", type: "file" },
            ]
        }
    ]
}
