
import { FormDefinition } from "@/components/form-engine";

export const DIARIO_CENTROS = [
    { id: 'luizote', label: 'CP Luizote' },
    { id: 'campo_alegre', label: 'CP Campo Alegre' },
    { id: 'morumbi', label: 'CP Morumbi' },
    { id: 'planalto', label: 'CP Planalto' },
    { id: 'lagoinha', label: 'CP Lagoinha' },
    { id: 'itinerante', label: 'Ônibus Itinerantes' },
    { id: 'construcao_civil', label: 'CP Luizote Construção Civil' },
    { id: 'tocantins', label: 'CP Tocantins' },
    { id: 'maravilha', label: 'Complexo Maravilha' },
    { id: 'uditech', label: 'CPTA UdiTech' },
];

export const DIARIO_CP_INDICATORS = [
    { id: 'atendimento', label: 'ATENDIMENTO' },
    { id: 'inscricoes', label: 'Nº DE INSCRIÇÕES REALIZADAS' },
    { id: 'pessoas_presentes', label: 'Nº PESSOAS PRESENTES NOS CURSOS' },
    { id: 'ligacoes_recebidas', label: 'Nº DE LIGAÇÕES RECEBIDAS' },
    { id: 'ligacoes_realizadas', label: 'Nº DE LIGAÇÕES REALIZADAS' },
    { id: 'total_procedimentos', label: 'TOTAL DE PROCEDIMENTOS' },
];

export const DIARIO_FORM_DEFINITION: FormDefinition = {
    sections: [
        {
            title: "SINE - Relatório Diário",
            fields: [
                { id: "sine_atend_trabalhador", label: "ATENDIMENTO AO TRABALHADOR", type: "number", required: true },
                { id: "sine_atend_trabalhador_online", label: "ATENDIMENTO AO TRABALHADOR ON-LINE", type: "number", required: true },
                { id: "sine_atend_empregador", label: "ATENDIMENTO AO EMPREGADOR", type: "number", required: true },
                { id: "sine_atend_empregador_online", label: "ATENDIMENTO ON-LINE AO EMPREGADOR", type: "number", required: true },
                { id: "sine_seguro_desemprego", label: "SEGURO DESEMPREGO", type: "number", required: true },
                { id: "sine_ctps_digital", label: "CTPS DIGITAL", type: "number", required: true },
                { id: "sine_vagas_captadas", label: "VAGAS CAPTADAS", type: "number", required: true },
                { id: "sine_ligacoes_recebidas", label: "Nº DE LIGAÇÕES RECEBIDAS (SINE)", type: "number", required: true },
                { id: "sine_ligacoes_realizadas", label: "Nº DE LIGAÇÕES REALIZADAS (SINE)", type: "number", required: true },
                { id: "sine_curriculos", label: "CURRÍCULOS", type: "number", required: true },
                { id: "sine_entrevistados", label: "ENTREVISTADOS", type: "number", required: true },
                { id: "sine_processo_seletivo", label: "PROCESSO SELETIVO", type: "number", required: true },
                { id: "sine_orientacao_profissional", label: "ORIENTAÇÃO PROFISSIONAL", type: "number", required: true },
                { id: "sine_total", label: "TOTAL SINE", type: "number", required: true },
            ]
        },
        ...DIARIO_CENTROS.map(centro => ({
            title: `Centro: ${centro.label}`,
            fields: DIARIO_CP_INDICATORS.map(ind => ({
                id: `cp_${centro.id}_${ind.id}`,
                label: ind.label,
                type: "number" as const,
                required: true
            }))
        }))
    ]
};
