import { FormDefinition } from "@/components/form-engine"

export const PROTECAO_ESPECIAL_UNITS = [
    "CREAS Protetivo",
    "CREAS Socioeducativo"
]

export const PROTETIVO_FORM_DEFINITION: FormDefinition = {
    sections: [
        {
            title: "Famílias em Acompanhamento",
            fields: [
                { id: "fam_mes_anterior", label: "Mês Anterior", type: "number" },
                { id: "fam_admitidas", label: "Admitidas", type: "number" },
                { id: "fam_desligadas", label: "Desligadas", type: "number" },
                { id: "fam_atual", label: "Atual", type: "number", disabled: true },
            ]
        },
        {
            title: "Direitos Violados",
            fields: [
                { id: "viol_fis_psic_masc", label: "Violência Física/Psicológica - Masculino", type: "number" },
                { id: "viol_fis_psic_fem", label: "Violência Física/Psicológica - Feminino", type: "number" },
                { id: "abuso_sexual_masc", label: "Abuso Sexual - Masculino", type: "number" },
                { id: "abuso_sexual_fem", label: "Abuso Sexual - Feminino", type: "number" },
                { id: "expl_sexual_masc", label: "Exploração Sexual - Masculino", type: "number" },
                { id: "expl_sexual_fem", label: "Exploração Sexual - Feminino", type: "number" },
                { id: "negli_aband_masc", label: "Negligência/Abandono - Masculino", type: "number" },
                { id: "negli_aband_fem", label: "Negligência/Abandono - Feminino", type: "number" },
                { id: "trab_infantil_masc", label: "Trabalho Infantil - Masculino", type: "number" },
                { id: "trab_infantil_fem", label: "Trabalho Infantil - Feminino", type: "number" },
            ]
        },
        {
            title: "Atendimento Criança/Adolescentes",
            fields: [
                { id: "atend_mes_anterior", label: "Mês Anterior", type: "number" },
                { id: "atend_admitidas", label: "Admitidas", type: "number" },
                { id: "atend_desligadas", label: "Desligadas", type: "number" },
                { id: "atend_atual", label: "Atual", type: "number", disabled: true },
            ]
        }
    ]
}

export const PROTETIVO_SPREADSHEET_ID = '1Lg5V8JjTneXbl9IKEWPVJmm6OghyaC6JozInoqlqpLA'

export const PROTETIVO_SHEET_BLOCKS = [
    { sheetName: 'Famílias', startRow: 2 },           // B2:B5
    { sheetName: 'Direitos Violados', startRow: 2 },  // B2:B11
    { sheetName: 'Atendimentos', startRow: 2 },       // B2:B5
]

export const SOCIOEDUCATIVO_FORM_DEFINITION: FormDefinition = {
    sections: [
        {
            title: "Famílias",
            fields: [
                { id: "fam_acompanhamento_1_dia", label: "Famílias em acompanhamento no 1º dia do mês", type: "number" },
                { id: "fam_inseridas", label: "Famílias INSERIDAS no mês", type: "number" },
                { id: "fam_desligadas", label: "Famílias DESLIGADAS no mês", type: "number" },
                { id: "fam_total_acompanhamento", label: "TOTAL DE FAMÍLIAS EM ACOMPANHAMENTO", type: "number", disabled: true },
            ]
        },
        {
            title: "Acompanhamento Masculino",
            fields: [
                { id: "masc_acompanhamento_1_dia", label: "Adolescentes em acompanhamento no 1º dia do mês", type: "number" },
                { id: "masc_admitidos", label: "Adolescentes admitidos no mês", type: "number" },
                { id: "masc_desligados", label: "Adolescentes desligados no mês", type: "number" },
                { id: "masc_total_parcial", label: "Total Parcial", type: "number", disabled: true },
            ]
        },
        {
            title: "Acompanhamento Feminino",
            fields: [
                { id: "fem_acompanhamento_1_dia", label: "Adolescentes em acompanhamento no 1º dia do mês", type: "number" },
                { id: "fem_admitidos", label: "Adolescentes admitidos no mês", type: "number" },
                { id: "fem_desligadas", label: "Adolescentes desligados no mês", type: "number" },
                { id: "fem_total_parcial", label: "Total Parcial", type: "number", disabled: true },
            ]
        },
        {
            title: "Medidas Masculino",
            fields: [
                { id: "med_masc_la_andamento", label: "Medidas LA em andamento no 1º dia do mês", type: "number" },
                { id: "med_masc_psc_andamento", label: "Medidas PSC em andamento no 1º dia do mês", type: "number" },
                { id: "med_masc_la_novas", label: "Novas medidas LA aplicadas no mês", type: "number" },
                { id: "med_masc_psc_novas", label: "Novas medidas PSC aplicadas no mês", type: "number" },
                { id: "med_masc_la_encerradas", label: "Medidas LA encerradas no mês", type: "number" },
                { id: "med_masc_psc_encerradas", label: "Medidas PSC encerradas no mês", type: "number" },
                { id: "med_masc_la_total_parcial", label: "Total parcial LA", type: "number", disabled: true },
                { id: "med_masc_psc_total_parcial", label: "Total parcial PSC", type: "number", disabled: true },
            ]
        },
        {
            title: "Medidas Feminino",
            fields: [
                { id: "med_fem_la_andamento", label: "Medidas LA em andamento no 1º dia do mês", type: "number" },
                { id: "med_fem_psc_andamento", label: "Medidas PSC em andamento no 1º dia do mês", type: "number" },
                { id: "med_fem_la_novas", label: "Novas medidas LA aplicadas no mês", type: "number" },
                { id: "med_fem_psc_novas", label: "Novas medidas PSC aplicadas no mês", type: "number" },
                { id: "med_fem_la_encerradas", label: "Medidas LA encerradas no mês", type: "number" },
                { id: "med_fem_psc_encerradas", label: "Medidas PSC encerradas no mês", type: "number" },
                { id: "med_fem_la_total_parcial", label: "Total parcial LA", type: "number", disabled: true },
                { id: "med_fem_psc_total_parcial", label: "Total parcial PSC", type: "number", disabled: true },
            ]
        },
        {
            title: "Totais Gerais Medidas",
            fields: [
                { id: "med_total_la_geral", label: "Total LA (Masc + Fem)", type: "number", disabled: true },
                { id: "med_total_psc_geral", label: "Total PSC (Masc + Fem)", type: "number", disabled: true },
            ]
        }
    ]
}

export const SOCIOEDUCATIVO_SPREADSHEET_ID = '1XE-w3WlQhA0GSulaMXL2DGP-5g5XVs3e5ffwIHP2Vp8'

export const SOCIOEDUCATIVO_SHEET_BLOCKS = [
    { sheetName: 'Famílias', startRow: 2 },        // C2:C5
    { sheetName: 'Acompanhamento', startRow: 2 }, // C2:C5 (Masculino)
    { sheetName: 'Acompanhamento', startRow: 9 }, // C9:C12 (Feminino)
    { sheetName: 'Medidas', startRow: 2 },       // C2:C9 (Masculino)
    { sheetName: 'Medidas', startRow: 13 },      // C13:C20 (Feminino)
]
