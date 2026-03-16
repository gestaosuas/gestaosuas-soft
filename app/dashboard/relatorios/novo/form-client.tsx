'use client'

import { FormEngine, FormDefinition } from "@/components/form-engine"
import { StepperForm } from "@/components/stepper-form"
import { submitReport, getPreviousMonthData, checkSubmissionExists, deleteMonthData } from "@/app/dashboard/actions"
import { getOficinasComCategorias } from "@/app/dashboard/diretoria/[id]/ceai-actions"
import { useState, useEffect, useCallback } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Calendar, FileText, AlertTriangle, Lock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn, getCategoryBadgeColor } from "@/lib/utils"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function SubmissionFormClient({
    definition,
    directorateName,
    directorateId,
    setor,
    unit,
    subcategory,
    isAdmin = false
}: {
    definition: FormDefinition,
    directorateName: string,
    directorateId: string,
    setor?: string,
    unit?: string,
    subcategory?: string,
    isAdmin?: boolean
}) {
    const [month, setMonth] = useState<string>(String(new Date().getMonth() + 1))
    const [year, setYear] = useState<string>(String(new Date().getFullYear()))
    const [loading, setLoading] = useState(false)
    const [fetchedInitialData, setFetchedInitialData] = useState<Record<string, any>>({})
    const [dataLoaded, setDataLoaded] = useState(false)
    const [dynamicDefinition, setDynamicDefinition] = useState<FormDefinition>(definition)
    const [alreadySubmitted, setAlreadySubmitted] = useState(false)
    const [showWarning, setShowWarning] = useState(true)

    // Effect to check if submission already exists for the selected period
    useEffect(() => {
        async function check() {
            if (!directorateId || !month || !year) return
            const exists = await checkSubmissionExists(directorateId, Number(month), Number(year), unit, setor)
            setAlreadySubmitted(exists)
        }
        check()
    }, [month, year, unit, setor, directorateId])

    // Effect to fetch previous month data when month/year changes
    useEffect(() => {
        let isMounted = true;

        async function loadPreviousData() {
            // Reset to avoid showing wrong data while loading
            if (isMounted) setFetchedInitialData({})

            if (setor !== 'creas' && setor !== 'ceai' && setor !== 'cras' && setor !== 'naica' && setor !== 'creas_protetivo' && setor !== 'creas_socioeducativo') {
                if (isMounted) {
                    setLoading(false)
                    setDataLoaded(true)
                }
                return
            }

            setLoading(true)
            try {
                // Ensure month/year are valid numbers
                const m = Number(month)
                const y = Number(year)

                if (isNaN(m) || isNaN(y)) {
                    console.warn("Invalid month or year for fetching previous data:", { month, year });
                    return;
                }

                const prevData = await getPreviousMonthData(directorateId, m, y)

                if (isMounted && prevData && Object.keys(prevData).length > 0) {
                    let newData: any = {}
                    const getNum = (val: any) => {
                        const n = Number(val)
                        return isNaN(n) ? 0 : n
                    }

                    if (setor === 'creas') {
                        // New Logic for 5 recurring sections
                        let prefixes: string[] = []
                        if (subcategory === 'idoso') {
                            prefixes = ['violencia_fisica', 'abuso_sexual', 'exploracao_sexual', 'negligencia', 'exploracao_financeira']
                        } else if (subcategory === 'deficiente') {
                            prefixes = ['def_violencia_fisica', 'def_abuso_sexual', 'def_exploracao_sexual', 'def_negligencia', 'def_exploracao_financeira']
                        }

                        prefixes.forEach(prefix => {
                            // Logic: Atendidas Anterior = Prev Total - Prev Desligados
                            // Note: If fields didn't exist in prev month (schema change), this defaults to 0.
                            const prevTotal = getNum(prevData[`${prefix}_total`])
                            const prevDesligados = getNum(prevData[`${prefix}_desligados`])

                            // Only set if we have positive value, or 0 if strictly required.
                            if (prevTotal > 0 || prevDesligados > 0) {
                                newData[`${prefix}_atendidas_anterior`] = prevTotal - prevDesligados
                            }
                        })
                    } else if (setor === 'ceai') {
                        // CEAI logic (Multi-unit)
                        let targetData = prevData
                        if (prevData._is_multi_unit && prevData.units && unit) {
                            targetData = prevData.units[unit] || {}
                        }

                        if (targetData.atendidos_anterior_masc !== undefined || targetData.inseridos_masc !== undefined) {
                            newData.atendidos_anterior_masc = getNum(targetData.atendidos_anterior_masc) + getNum(targetData.inseridos_masc) - getNum(targetData.desligados_masc)
                        }
                        if (targetData.atendidos_anterior_fem !== undefined || targetData.inseridos_fem !== undefined) {
                            newData.atendidos_anterior_fem = getNum(targetData.atendidos_anterior_fem) + getNum(targetData.inseridos_fem) - getNum(targetData.desligados_fem)
                        }
                        // Pre-fetch the cumulative total from the previous month
                        newData.prev_total_atendidos_ano = getNum(targetData.total_inseridos)
                    } else if (setor === 'cras') {
                        // CRAS logic (Multi-unit)
                        let targetData = prevData
                        if (prevData._is_multi_unit && prevData.units && unit) {
                            targetData = prevData.units[unit] || {}
                        }

                        // Mês Anterior = Prev Atual - Prev Desligadas
                        if (targetData.atual !== undefined || targetData.desligadas !== undefined) {
                            newData.mes_anterior = getNum(targetData.atual) - getNum(targetData.desligadas)
                        }
                    } else if (setor === 'naica') {
                        // NAICA Logic (Multi-unit)
                        let targetData = prevData
                        if (prevData._is_multi_unit && prevData.units && unit) {
                            targetData = prevData.units[unit] || {}
                        }

                        // Mês Anterior Masculino = (Anterior M + Inseridos M) - Desligados M
                        newData.mes_anterior_masc = (getNum(targetData.mes_anterior_masc) + getNum(targetData.inseridos_masc)) - getNum(targetData.desligados_masc)

                        // Mês Anterior Feminino = (Anterior F + Inseridos F) - Desligados F
                        newData.mes_anterior_fem = (getNum(targetData.mes_anterior_fem) + getNum(targetData.inseridos_fem)) - getNum(targetData.desligados_fem)
                    } else if (setor === 'creas_protetivo') {
                        // CRAS Protetivo Logic (Famílias e Atendimentos)
                        // Famílias: Atual (Anterior) - Desligadas (Anterior)
                        if (prevData.fam_atual !== undefined || prevData.fam_desligadas !== undefined) {
                            newData.fam_mes_anterior = getNum(prevData.fam_atual) - getNum(prevData.fam_desligadas)
                        }
                        // Atendimentos: Atual (Anterior) - Desligadas (Anterior)
                        if (prevData.atend_atual !== undefined || prevData.atend_desligadas !== undefined) {
                            newData.atend_mes_anterior = getNum(prevData.atend_atual) - getNum(prevData.atend_desligadas)
                        }
                    }

                    console.log("Fetched Previous Data:", prevData)
                    console.log("Calculated New Data:", newData)
                    setFetchedInitialData(newData)
                } else if (isMounted) {
                    console.log("No previous data found for", { directorateId, month, year, setor, unit, subcategory });
                    setFetchedInitialData({});
                }
            } catch (err) {
                console.error("Error fetching previous data", err)
            } finally {
                if (isMounted) {
                    setLoading(false)
                    setDataLoaded(true)
                }
            }
        }

        loadPreviousData()

        return () => { isMounted = false }
    }, [month, year, directorateId, setor, subcategory, unit])

    // Effect to load CEAI Oficinas and dynamically modify the FormDefinition
    useEffect(() => {
        let isMounted = true

        async function loadOficinas() {
            if (setor === 'ceai' && subcategory !== 'condominio' && unit) {
                try {
                    const oficinas = await getOficinasComCategorias(unit)

                    if (isMounted && oficinas && oficinas.length > 0) {
                        // Create a new definition based on the original one
                        const baseDefinition = { ...definition, sections: [...definition.sections] }

                        // Map the oficinas to form fields
                        const oficinaFields = oficinas.flatMap((oficina: any) => ([
                            {
                                id: `oficina_${oficina.id}_vagas_totais`,
                                label: `${oficina.activity_name} - Qtd. de Vagas`,
                                type: "number" as const,
                                badgeNode: (
                                    <span className={cn("px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded border", getCategoryBadgeColor(oficina.category_name))}>
                                        {oficina.category_name}
                                    </span>
                                )
                            },
                            {
                                id: `oficina_${oficina.id}_vagas_ocupadas`,
                                label: `${oficina.activity_name} - Vagas Ocupadas`,
                                type: "number" as const,
                                badgeNode: (
                                    <span className={cn("px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded border", getCategoryBadgeColor(oficina.category_name))}>
                                        {oficina.category_name}
                                    </span>
                                )
                            }
                        ]))

                        // Add the new section
                        baseDefinition.sections.push({
                            title: "Ocupação de Oficinas",
                            fields: oficinaFields
                        })

                        setDynamicDefinition(baseDefinition)
                    } else if (isMounted) {
                        setDynamicDefinition(definition)
                    }
                } catch (error) {
                    console.error("Erro ao buscar oficinas:", error)
                    if (isMounted) setDynamicDefinition(definition)
                }
            } else {
                if (isMounted) setDynamicDefinition(definition)
            }
        }

        loadOficinas()

        return () => { isMounted = false }
    }, [definition, setor, subcategory, unit])

    const handleDataChange = useCallback((data: Record<string, any>, setData: any) => {
        if (setor === 'cras') {
            const mes_anterior = Number(data.mes_anterior) || 0
            const admitidas = Number(data.admitidas) || 0
            const total = mes_anterior + admitidas

            if (data.atual !== total) {
                setData((prev: any) => ({ ...prev, atual: total }))
            }
        }

        if (setor === 'creas') {
            let prefixes: string[] = []
            if (subcategory === 'idoso') {
                prefixes = ['violencia_fisica', 'abuso_sexual', 'exploracao_sexual', 'negligencia', 'exploracao_financeira']
            } else if (subcategory === 'deficiente') {
                prefixes = ['def_violencia_fisica', 'def_abuso_sexual', 'def_exploracao_sexual', 'def_negligencia', 'def_exploracao_financeira']
            }
            prefixes.forEach(prefix => {
                const ant = Number(data[`${prefix}_atendidas_anterior`]) || 0
                const ins = Number(data[`${prefix}_inseridos`]) || 0
                const total = ant + ins

                if (data[`${prefix}_total`] !== total) {
                    setData((prev: any) => ({ ...prev, [`${prefix}_total`]: total }))
                }
            })
        }

        if (setor === 'ceai') {
            const inseridos_masc = Number(data.inseridos_masc) || 0
            const inseridos_fem = Number(data.inseridos_fem) || 0
            const prev_total = Number(data.prev_total_atendidos_ano) || 0
            const total = prev_total + inseridos_masc + inseridos_fem

            if (data.total_inseridos !== total) {
                setData((prev: any) => ({ ...prev, total_inseridos: total }))
            }
        }

        if (setor === 'pop_rua') {
            const c = Number(data.num_atend_centro_ref) || 0
            const a = Number(data.num_atend_abordagem) || 0
            const m = Number(data.num_atend_migracao) || 0
            const total = c + a + m

            if (data.num_atend_total !== total) {
                setData((prev: any) => ({ ...prev, num_atend_total: total }))
            }
        }

        if (setor === 'naica') {
            const m1 = Number(data.mes_anterior_masc) || 0
            const f1 = Number(data.mes_anterior_fem) || 0
            const am = Number(data.inseridos_masc) || 0
            const af = Number(data.inseridos_fem) || 0
            const total = m1 + f1 + am + af

            if (data.total_atendidas !== total) {
                setData((prev: any) => ({ ...prev, total_atendidas: total }))
            }
        }

        if (setor === 'creas_socioeducativo') {
            // Famílias
            const fam_1 = Number(data.fam_acompanhamento_1_dia) || 0
            const fam_ins = Number(data.fam_inseridas) || 0
            const fam_total = fam_1 + fam_ins
            if (data.fam_total_acompanhamento !== fam_total) {
                setData((prev: any) => ({ ...prev, fam_total_acompanhamento: fam_total }))
            }

            // Masculino
            const masc_1 = Number(data.masc_acompanhamento_1_dia) || 0
            const masc_adm = Number(data.masc_admitidos) || 0
            const masc_total = masc_1 + masc_adm
            if (data.masc_total_parcial !== masc_total) {
                setData((prev: any) => ({ ...prev, masc_total_parcial: masc_total }))
            }

            // Feminino
            const fem_1 = Number(data.fem_acompanhamento_1_dia) || 0
            const fem_adm = Number(data.fem_admitidos) || 0
            const fem_total = fem_1 + fem_adm
            if (data.fem_total_parcial !== fem_total) {
                setData((prev: any) => ({ ...prev, fem_total_parcial: fem_total }))
            }

            // Medidas Masculino
            const m_la_1 = Number(data.med_masc_la_andamento) || 0
            const m_la_novas = Number(data.med_masc_la_novas) || 0
            const m_la_total = m_la_1 + m_la_novas
            if (data.med_masc_la_total_parcial !== m_la_total) {
                setData((prev: any) => ({ ...prev, med_masc_la_total_parcial: m_la_total }))
            }

            const m_psc_1 = Number(data.med_masc_psc_andamento) || 0
            const m_psc_novas = Number(data.med_masc_psc_novas) || 0
            const m_psc_total = m_psc_1 + m_psc_novas
            if (data.med_masc_psc_total_parcial !== m_psc_total) {
                setData((prev: any) => ({ ...prev, med_masc_psc_total_parcial: m_psc_total }))
            }

            // Medidas Feminino
            const f_la_1 = Number(data.med_fem_la_andamento) || 0
            const f_la_novas = Number(data.med_fem_la_novas) || 0
            const f_la_total = f_la_1 + f_la_novas
            if (data.med_fem_la_total_parcial !== f_la_total) {
                setData((prev: any) => ({ ...prev, med_fem_la_total_parcial: f_la_total }))
            }

            const f_psc_1 = Number(data.med_fem_psc_andamento) || 0
            const f_psc_novas = Number(data.med_fem_psc_novas) || 0
            const f_psc_total = f_psc_1 + f_psc_novas
            if (data.med_fem_psc_total_parcial !== f_psc_total) {
                setData((prev: any) => ({ ...prev, med_fem_psc_total_parcial: f_psc_total }))
            }

            // Totais Gerais
            const total_la_geral = m_la_total + f_la_total
            if (data.med_total_la_geral !== total_la_geral) {
                setData((prev: any) => ({ ...prev, med_total_la_geral: total_la_geral }))
            }

            const total_psc_geral = m_psc_total + f_psc_total
            if (data.med_total_psc_geral !== total_psc_geral) {
                setData((prev: any) => ({ ...prev, med_total_psc_geral: total_psc_geral }))
            }
        }

        if (setor === 'creas_protetivo') {
            // Famílias
            const fam_ant = Number(data.fam_mes_anterior) || 0
            const fam_adm = Number(data.fam_admitidas) || 0
            const fam_total = fam_ant + fam_adm
            if (data.fam_atual !== fam_total) {
                setData((prev: any) => ({ ...prev, fam_atual: fam_total }))
            }

            // Atendimentos
            const atend_ant = Number(data.atend_mes_anterior) || 0
            const atend_adm = Number(data.atend_admitidas) || 0
            const atend_total = atend_ant + atend_adm
            if (data.atend_atual !== atend_total) {
                setData((prev: any) => ({ ...prev, atend_atual: atend_total }))
            }
        }

        if (setor === 'centros') {
            const oferecidas = Number(data.resumo_vagas) || 0
            const ocupadas = Number(data.resumo_vagas_ocupadas) || 0
            const taxa = oferecidas > 0 ? Number(((ocupadas / oferecidas) * 100).toFixed(1)) : 0

            if (data.resumo_taxa_ocupacao !== taxa) {
                setData((prev: any) => ({ ...prev, resumo_taxa_ocupacao: taxa }))
            }
        }
    }, [setor, subcategory])


    const handleUnlock = async () => {
        if (!confirm("Isso irá remover os dados atuais deste mês/unidade para permitir um novo preenchimento pelo usuário. Esta ação não pode ser desfeita. Confirmar?")) {
            return
        }

        setLoading(true)
        try {
            const result = await deleteMonthData(directorateId, Number(month), Number(year), unit, setor)
            if (result.success) {
                setAlreadySubmitted(false)
                setFetchedInitialData({}) // Limpa dados carregados para permitir nova entrada limpa
                alert("Preenchimento liberado com sucesso!")
            } else {
                alert("Erro ao liberar preenchimento.")
            }
        } catch (e) {
            console.error(e)
            alert("Erro ao liberar preenchimento.")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (data: Record<string, any>) => {
        if (!confirm(`Confirma o envio do relatório de ${directorateName} referente a ${month}/${year}?`)) {
            return
        }

        setLoading(true)
        try {
            // Use FormData for file support
            const fd = new FormData()

            // Merge labels and values
            const finalData = { ...fetchedInitialData, ...data }

            // Append all fields to FormData
            Object.entries(finalData).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    fd.append(key, value instanceof File ? value : String(value))
                }
            })

            // Meta fields
            fd.append('_unit', unit || '')
            fd.append('_subcategory', subcategory || '')

            console.log("Submitting form data via FormData")

            const result = await submitReport(fd, Number(month), Number(year), directorateId, setor)
            if (result?.error) {
                alert(result.error)
            } else {
                alert("Relatório enviado e sincronizado com sucesso!")
                if (setor === 'beneficios') {
                    window.location.href = '/dashboard/diretoria/efaf606a-53ae-4bbc-996c-79f4354ce0f9'
                } else if (setor === 'centros' || setor === 'sine') {
                    window.location.href = `/dashboard/relatorios/lista?setor=${setor}&directorate_id=${directorateId}`
                } else if (setor === 'cras' || setor === 'creas' || setor === 'pop_rua' || setor === 'naica' || setor === 'creas_protetivo' || setor === 'creas_socioeducativo' || setor === 'casa_da_mulher' || setor === 'diversidade') {
                    window.location.href = `/dashboard/diretoria/${directorateId}`
                } else if (setor === 'ceai') {
                    window.location.href = `/dashboard/dados?setor=ceai&directorate_id=${directorateId}`
                } else {
                    window.location.href = `/dashboard/relatorios/lista?directorate_id=${directorateId}`
                }
            }
        } catch (e: any) {
            console.error(e)
            alert("Erro inesperado ao enviar: " + (e.message || JSON.stringify(e)))
        } finally {
            setLoading(false)
        }
    }

    const monthName = new Date(0, Number(month) - 1).toLocaleString('pt-BR', { month: 'long' })

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-start gap-6">
                    <Link href={setor === 'beneficios' ? `/dashboard/diretoria/efaf606a-53ae-4bbc-996c-79f4354ce0f9` : `/dashboard/diretoria/${directorateId}`}>
                        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all mt-1">
                            <ArrowLeft className="h-5 w-5 text-zinc-500" />
                        </Button>
                    </Link>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-extrabold tracking-tight text-blue-900 dark:text-blue-50">
                                Entrada de Dados
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{directorateName}</span>
                                {unit && (
                                    <>
                                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{unit}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Top Reference Filters */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
                            <div className="flex items-center gap-3 pr-4 border-r border-zinc-100 dark:border-zinc-800/60">
                                <Calendar className="w-4 h-4 text-blue-900 dark:text-blue-400" />
                                <span className="text-[11px] font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Referência</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider hidden sm:block">Mês:</Label>
                                    <Select value={month} onValueChange={setMonth} disabled={loading}>
                                        <SelectTrigger className="h-9 w-[140px] bg-zinc-50/50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold uppercase tracking-tight">
                                            <SelectValue placeholder="Mês" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl">
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
                                                const currentDate = new Date()
                                                const currentMonth = currentDate.getMonth() + 1
                                                const currentYear = currentDate.getFullYear()
                                                const selectedYearInt = parseInt(year)

                                                let isDisabled = false
                                                if (!isAdmin) {
                                                    if (selectedYearInt > currentYear) isDisabled = true
                                                    else if (selectedYearInt === currentYear && m > currentMonth) isDisabled = true
                                                }

                                                return (
                                                    <SelectItem
                                                        key={m}
                                                        value={String(m)}
                                                        disabled={isDisabled}
                                                        className="uppercase text-[11px] font-bold py-2 px-3 focus:bg-zinc-900 dark:focus:bg-zinc-50 focus:text-white dark:focus:text-zinc-900 cursor-pointer mb-1 last:mb-0 transition-colors"
                                                    >
                                                        {new Date(0, m - 1).toLocaleString('pt-BR', { month: 'short' })}
                                                    </SelectItem>
                                                )
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider hidden sm:block">Ano:</Label>
                                    <Select value={year} onValueChange={setYear} disabled={loading}>
                                        <SelectTrigger className="h-9 w-[100px] bg-zinc-50/50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold tracking-tight">
                                            <SelectValue placeholder="Ano" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl">
                                            {Array.from({ length: 3 }, (_, i) => 2024 + i).map(y => (
                                                <SelectItem key={y} value={String(y)} className="text-[11px] font-bold py-2 px-3 focus:bg-zinc-900 dark:focus:bg-zinc-50 focus:text-white dark:focus:text-zinc-900 cursor-pointer mb-1 last:mb-0 transition-colors">{y}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Container */}
            <div className="w-full">
                <Card className="border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-none rounded-2xl w-full">
                    <CardHeader className="pt-4 px-6 lg:px-8 pb-4 border-b border-zinc-100 dark:border-zinc-800/60">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 italic">
                                    {unit ? `Unidade: ${unit}` : directorateName}
                                </h3>
                                <p className="text-[12px] font-medium text-zinc-500">Preencha todos os campos obrigatórios para prosseguir.</p>
                            </div>
                            <div className="hidden md:flex items-center px-4 py-2 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                                <p className="text-[10px] text-blue-900/70 dark:text-blue-400/70 font-bold uppercase tracking-[0.1em] leading-relaxed">
                                    Consolidando p/ <span className="text-blue-900 dark:text-blue-400">{year}</span> no mês de <span className="text-blue-900 dark:text-blue-400 capitalize">{monthName}</span>
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 lg:p-8 w-full overflow-x-hidden">
                        {alreadySubmitted && !isAdmin && (
                            <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4 text-amber-800 animate-in fade-in slide-in-from-top-2 duration-500">
                                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-[15px] mb-1">Registro Já Enviado & Bloqueado</p>
                                    <p className="text-[13px] leading-relaxed opacity-90">
                                        Os dados para <strong>{monthName} de {year}</strong> já foram consolidados nesta unidade.
                                        Para evitar duplicidade ou erros, o reenvio está desativado.
                                        <br />
                                        <span className="font-semibold block mt-1 italic">Caso precise realizar alguma correção, entre em contato com a equipe de Gestão/Administração.</span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {alreadySubmitted && isAdmin && (
                            <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-blue-800 animate-in fade-in slide-in-from-top-2 duration-500">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[15px] mb-1">Registro Existente (Modo Admin)</p>
                                        <p className="text-[13px] leading-relaxed opacity-90">
                                            Já existe um envio para este período. Você pode editar os dados ou liberar para um novo preenchimento.
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleUnlock}
                                    disabled={loading}
                                    className="shrink-0 border-blue-200 hover:bg-blue-100 text-blue-700 font-bold text-[10px] uppercase tracking-wider h-10 px-4"
                                >
                                    <Lock className="w-3.5 h-3.5 mr-2" />
                                    Liberar Novo Preenchimento
                                </Button>
                            </div>
                        )}

                        {setor === 'casa_da_mulher' || setor === 'diversidade' ? (
                            <StepperForm
                                key={`${month}-${year}-${unit}-${subcategory}-${dynamicDefinition.sections.length}-stepper`}
                                definition={dynamicDefinition}
                                initialData={fetchedInitialData}
                                onSubmit={handleSubmit}
                                onDataChange={handleDataChange}
                                disabled={loading || (alreadySubmitted && !isAdmin)}
                                stepsConfig={
                                    setor === 'casa_da_mulher' ? [
                                        { title: "Perfil de Atendimento", sectionIndexes: [0, 1] },
                                        { title: "Caracterização Social", sectionIndexes: [2, 3] },
                                        { title: "Encaminhamentos", sectionIndexes: [4] }
                                    ] : [
                                        { title: "Perfil de Atendimento", sectionIndexes: [0, 1] },
                                        { title: "Caracterização Social", sectionIndexes: [2, 3] },
                                        { title: "Encaminhamentos", sectionIndexes: [4] }
                                    ]
                                }
                            />
                        ) : (
                            <FormEngine
                                key={`${month}-${year}-${unit}-${subcategory}-${dynamicDefinition.sections.length}`}
                                definition={dynamicDefinition}
                                initialData={fetchedInitialData}
                                onSubmit={handleSubmit}
                                onDataChange={handleDataChange}
                                disabled={loading || (alreadySubmitted && !isAdmin)}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
                <AlertDialogContent className="rounded-2xl max-w-[22rem] sm:max-w-md p-6 lg:p-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
                    <AlertDialogHeader className="space-y-4">
                        <div className="mx-auto w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mb-1">
                            <Calendar className="w-7 h-7 text-amber-600 dark:text-amber-500" />
                        </div>
                        <AlertDialogTitle className="text-xl font-black text-center text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                            Mês de Referência
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-[13px] text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                            Antes de começar o preenchimento dos dados, por favor verifique com cuidado se o <strong className="text-zinc-900 dark:text-zinc-100">mês e o ano selecionados</strong> no topo da página correspondem ao período que deseja informar.<br /><br />
                            O sistema carrega os dados do mês vigente por padrão.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 sm:justify-center">
                        <AlertDialogAction onClick={() => setShowWarning(false)} className="w-full sm:w-[80%] px-8 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-sm hover:shadow-md font-bold text-[13px] tracking-wide transition-all duration-300 transform active:scale-[0.98]">
                            Entendido, Prosseguir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
