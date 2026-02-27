'use client'

import { FormEngine, FormDefinition } from "@/components/form-engine"
import { submitReport, getPreviousMonthData } from "@/app/dashboard/actions"
import { getOficinasComCategorias } from "@/app/dashboard/diretoria/[id]/ceai-actions"
import { useState, useEffect, useCallback } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Calendar, FileText } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn, getCategoryBadgeColor } from "@/lib/utils"

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
    }, [setor, subcategory])


    const handleSubmit = async (data: Record<string, any>) => {
        if (!confirm(`Confirma o envio do relatório de ${directorateName} referente a ${month}/${year}?`)) {
            return
        }

        setLoading(true)
        try {
            // Include unit and subcategory in data if present
            // We merge fetchedInitialData first, then data (user input), then metadata.
            // This ensures that mes_anterior (from fetchedInitialData) is present even if not touched.
            const finalData = { ...fetchedInitialData, ...data, _unit: unit, _subcategory: subcategory }

            console.log("Submitting CRAS data for unit:", unit, finalData)

            const result = await submitReport(finalData, Number(month), Number(year), directorateId, setor)
            if (result?.error) {
                alert(result.error)
            } else {
                alert("Relatório enviado e sincronizado com sucesso!")
                if (setor === 'beneficios') {
                    window.location.href = '/dashboard/diretoria/efaf606a-53ae-4bbc-996c-79f4354ce0f9'
                } else if (setor === 'cras' || setor === 'creas' || setor === 'pop_rua' || setor === 'naica' || setor === 'creas_protetivo' || setor === 'creas_socioeducativo') {
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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-20">
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
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
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
                    <CardHeader className="pt-8 px-6 lg:px-10 pb-6 border-b border-zinc-100 dark:border-zinc-800/60">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Indicadores Operacionais</h3>
                                <p className="text-[12px] font-medium text-zinc-500">Preencha todos os campos obrigatórios para prosseguir.</p>
                            </div>
                            <div className="hidden md:flex items-center px-4 py-2 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                                <p className="text-[10px] text-blue-900/70 dark:text-blue-400/70 font-bold uppercase tracking-[0.1em] leading-relaxed">
                                    Consolidando p/ <span className="text-blue-900 dark:text-blue-400">{year}</span> no mês de <span className="text-blue-900 dark:text-blue-400 capitalize">{monthName}</span>
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 lg:p-10 w-full overflow-x-hidden">
                        <FormEngine
                            key={`${month}-${year}-${unit}-${subcategory}-${dynamicDefinition.sections.length}`}
                            definition={dynamicDefinition}
                            initialData={fetchedInitialData}
                            onSubmit={handleSubmit}
                            onDataChange={handleDataChange}
                            disabled={loading}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
