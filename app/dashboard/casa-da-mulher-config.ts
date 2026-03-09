import { FormDefinition } from "@/components/form-engine"

export const CASA_DA_MULHER_FORM_DEFINITION: FormDefinition = {
    sections: [
        {
            title: "ATENDIMENTOS",
            fields: [
                { id: "cm_atend_mulheres_atendidas", label: "Mulheres Atendidas", type: "number" },
            ]
        },
        {
            title: "FAIXA ETÁRIA QTD",
            fields: [
                { id: "cm_faixa_16_17", label: "16 à 17 anos", type: "number" },
                { id: "cm_faixa_18_30", label: "18 à 30 anos", type: "number" },
                { id: "cm_faixa_31_40", label: "31 à 40 anos", type: "number" },
                { id: "cm_faixa_41_50", label: "41 à 50 anos", type: "number" },
                { id: "cm_faixa_51_60", label: "51 à 60 anos", type: "number" },
                { id: "cm_faixa_acima_60", label: "Acima de 60", type: "number" },
                { id: "cm_faixa_nao_consta", label: "Não Consta", type: "number" },
            ]
        },
        {
            title: "COR/RAÇA",
            fields: [
                { id: "cm_raca_branca", label: "Branca", type: "number" },
                { id: "cm_raca_preta", label: "Preta", type: "number" },
                { id: "cm_raca_parda", label: "Parda", type: "number" },
                { id: "cm_raca_amarelo", label: "Amarelo", type: "number" },
                { id: "cm_raca_indigena", label: "Indígena", type: "number" },
                { id: "cm_raca_nao_consta", label: "Não Consta", type: "number" },
            ]
        },
        {
            title: "TIPO DE VIOLÊNCIA",
            fields: [
                { id: "cm_violencia_fisica", label: "Física", type: "number" },
                { id: "cm_violencia_moral", label: "Moral", type: "number" },
                { id: "cm_violencia_psicologica", label: "Psicológica", type: "number" },
                { id: "cm_violencia_sexual", label: "Sexual", type: "number" },
                { id: "cm_violencia_patrimonial", label: "Patrimonial", type: "number" },
                { id: "cm_violencia_nenhuma", label: "Nenhuma Agressão física", type: "number" },
                { id: "cm_violencia_outras", label: "Outras", type: "number" },
            ]
        },
        {
            title: "PROCEDIMENTOS",
            fields: [
                { id: "cm_proced_entrevista_psicol_novos", label: "Entrevista Psicol. Novos", type: "number" },
                { id: "cm_proced_entrevista_psicol_reentrada", label: "Entrevista Psicol. Reentrada", type: "number" },
                { id: "cm_proced_entrevista_social_novos", label: "Entrevista Social Novos", type: "number" },
                { id: "cm_proced_entrevista_social_reentrada", label: "Entrevista Social Reentrada", type: "number" },
                { id: "cm_proced_atendimento_convocado", label: "Atendimento Convocado", type: "number" },
            ]
        },
        {
            title: "ENCAMINHAMENTOS",
            fields: [
                { id: "cm_encam_bo_ocorrencia", label: "Boletim de Ocorrência", type: "number" },
                { id: "cm_encam_casa_abrigo", label: "Casa Abrigo", type: "number" },
                { id: "cm_encam_conselho_idoso", label: "Conselho Idoso", type: "number" },
                { id: "cm_encam_conselho_tutelar", label: "Conselho Tutelar", type: "number" },
                { id: "cm_encam_defens_publica", label: "Defens. Pública", type: "number" },
                { id: "cm_encam_forum_juizados", label: "Fórum/Juizados", type: "number" },
                { id: "cm_encam_exame_c_delito", label: "Exame Corpo de Delito", type: "number" },
                { id: "cm_encam_deam", label: "DEAM", type: "number" },
                { id: "cm_encam_ministerio_publico", label: "Ministério Público", type: "number" },
                { id: "cm_encam_outra_delegacia", label: "Outra Delegacia", type: "number" },
                { id: "cm_encam_ppvd", label: "PPVD", type: "number" },
                { id: "cm_encam_rede_ass_social", label: "Rede Assistência Social", type: "number" },
                { id: "cm_encam_rede_saude", label: "Rede de Saúde", type: "number" },
                { id: "cm_encam_sine", label: "SINE", type: "number" },
                { id: "cm_encam_outros", label: "Outros", type: "number" },
            ]
        }
    ]
}

export const DIVERSIDADE_FORM_DEFINITION: FormDefinition = {
    sections: [
        {
            title: "ATENDIMENTO",
            fields: [
                { id: "div_atend_mulheres_atendidas", label: "Pessoas Atendidas", type: "number" },
                { id: "div_atend_nucleo_diversidade", label: "Núcleo Diversidade", type: "number" },
            ]
        },
        {
            title: "FAIXA ETÁRIA",
            fields: [
                { id: "div_faixa_16_17", label: "16 à 17 anos", type: "number" },
                { id: "div_faixa_18_30", label: "18 à 30 anos", type: "number" },
                { id: "div_faixa_31_40", label: "31 à 40 anos", type: "number" },
                { id: "div_faixa_41_50", label: "41 à 50 anos", type: "number" },
                { id: "div_faixa_51_60", label: "51 à 60 anos", type: "number" },
                { id: "div_faixa_acima_60", label: "Acima de 60", type: "number" },
                { id: "div_faixa_nao_consta", label: "Não Consta", type: "number" },
            ]
        },
        {
            title: "COR/RAÇA",
            fields: [
                { id: "div_raca_branca", label: "Branca", type: "number" },
                { id: "div_raca_preta", label: "Preta", type: "number" },
                { id: "div_raca_parda", label: "Parda", type: "number" },
                { id: "div_raca_amarela", label: "Amarelo", type: "number" },
                { id: "div_raca_indigena", label: "Indígena", type: "number" },
                { id: "div_raca_nao_consta", label: "Não Consta", type: "number" },
            ]
        },
        {
            title: "SITUAÇÃO DA DEMANDA",
            fields: [
                { id: "div_sit_violencia_infrafamiliar", label: "Violência infrafamiliar que não incide Lei Maria da Penha", type: "number" },
                { id: "div_sit_violencia_extrafamiliar", label: "Violência extrafamiliar", type: "number" },
                { id: "div_sit_demanda_fora_contexto", label: "Demanda fora do contexto de violência", type: "number" },
            ]
        },
        {
            title: "ENCAMINHAMENTOS",
            fields: [
                { id: "div_encam_juizado", label: "Juizado Especial", type: "number" },
                { id: "div_encam_rede_socioassist", label: "Rede Socioassistencial", type: "number" },
                { id: "div_encam_curso_prof", label: "Curso Profissionalizante", type: "number" },
                { id: "div_encam_sine", label: "Sine", type: "number" },
                { id: "div_encam_serv_saude", label: "Serviços de Saúde da Rede", type: "number" },
                { id: "div_encam_mobilizacao_familia", label: "Mobilização da família extensa ou ampliada do usuário", type: "number" },
                { id: "div_encam_orient_juridicas", label: "Orientações Jurídicas", type: "number" },
                { id: "div_encam_bo_reds", label: "Registro BO/REDS", type: "number" },
                { id: "div_encam_exame_delito", label: "Exame de Corpo de Delito", type: "number" },
                { id: "div_encam_outros", label: "Outros", type: "number" },
            ]
        }
    ]
}
