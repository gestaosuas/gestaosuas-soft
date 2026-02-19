
export const PROTECAO_ESPECIAL_UNITS = [
    "CREAS Protetivo",
    "CREAS Socioeducativo"
]

export const CREAS_PROTETIVO_FIELDS = [
    { id: "atendidos_anterior", label: "Atendidos Mês Anterior", type: "number" },
    { id: "inseridos", label: "Inseridos no Mês", type: "number" },
    { id: "desligados", label: "Desligados no Mês", type: "number" },
    { id: "atual", label: "Atual", type: "number", disabled: true }
]

export const CREAS_SOCIOEDUCATIVO_FIELDS = [
    { id: "atendidos_anterior", label: "Atendidos Mês Anterior", type: "number" },
    { id: "inseridos", label: "Inseridos no Mês", type: "number" },
    { id: "desligados", label: "Desligados no Mês", type: "number" },
    { id: "atual", label: "Atual", type: "number", disabled: true }
]
