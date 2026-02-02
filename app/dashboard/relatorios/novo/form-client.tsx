'use client'

import { FormEngine, FormDefinition } from "@/components/form-engine"
import { submitReport, getPreviousMonthData } from "@/app/dashboard/actions"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Calendar, FileText } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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


    // Effect to fetch previous month data when month/year changes
    useEffect(() => {
        let isMounted = true;

        async function loadPreviousData() {
            // Reset to avoid showing wrong data while loading
            if (isMounted) setFetchedInitialData({})

            if (setor !== 'creas') {
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

                    if (setor === 'creas') {
                        // Calculations for CREAS subcategories
                        // We check both raw numbers and possible string values from DB

                        // Helper to safely parse
                        const getNum = (val: any) => {
                            const n = Number(val)
                            return isNaN(n) ? 0 : n
                        }

                        if (subcategory === 'idoso') {
                            // FA (Famílias)
                            // Check if we have the necessary fields in previous data
                            if (prevData.fa_atual !== undefined) {
                                newData.fa_mes_anterior = getNum(prevData.fa_atual) - getNum(prevData.fa_desligadas)
                            }
                            // IA (Idosos)
                            if (prevData.ia_atual !== undefined) {
                                newData.ia_mes_anterior = getNum(prevData.ia_atual) - getNum(prevData.ia_desligadas)
                            }
                        } else if (subcategory === 'deficiente') {
                            // PCD
                            if (prevData.pcd_atual !== undefined) {
                                newData.pcd_mes_anterior = getNum(prevData.pcd_atual) - getNum(prevData.pcd_desligadas)
                            }
                        }
                    }
                    console.log("Fetched Previous Data:", prevData)
                    console.log("Calculated New Data:", newData)
                    setFetchedInitialData(newData)
                } else if (isMounted) {
                    console.log("No previous data found for CREAS or data is empty for", { directorateId, month, year, setor, subcategory });
                    setFetchedInitialData({}); // Ensure it's empty if no data is found
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
    }, [month, year, directorateId, setor, subcategory])


    const handleSubmit = async (data: Record<string, any>) => {
        if (!confirm(`Confirma o envio do relatório de ${directorateName} referente a ${month}/${year}?`)) {
            return
        }

        setLoading(true)
        try {
            // Include unit and subcategory in data if present
            const finalData = { ...data, ...fetchedInitialData, _unit: unit, _subcategory: subcategory }
            // Note: attributes from form (data) overwrite fetchedInitialData if collision.
            // But we want the opposite for 'mes_anterior' if user didn't touch it?
            // Actually 'data' comes from FormEngine. If FormEngine was initialized with fetchedInitialData, 'data' will contain it (or modified version).
            // So just `...data` is enough, `fetchedInitialData` is passed to FormEngine.

            const result = await submitReport(finalData, Number(month), Number(year), directorateId, setor)
            if (result?.error) {
                alert(result.error)
            } else {
                alert("Relatório enviado e sincronizado com sucesso!")
                if (setor === 'beneficios') {
                    window.location.href = '/dashboard/diretoria/efaf606a-53ae-4bbc-996c-79f4354ce0f9'
                } else if (setor === 'cras' || setor === 'creas') {
                    window.location.href = `/dashboard/diretoria/${directorateId}`
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <Link href={setor === 'beneficios' ? `/dashboard/diretoria/efaf606a-53ae-4bbc-996c-79f4354ce0f9` : `/dashboard/diretoria/${directorateId}`}>
                        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">
                            <ArrowLeft className="h-5 w-5 text-zinc-500" />
                        </Button>
                    </Link>
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
                </div>
            </div>

            {/* Selection Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4">
                    <Card className="border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-none rounded-2xl overflow-hidden sticky top-8">
                        <CardHeader className="pt-8 px-8 pb-6 border-b border-zinc-100 dark:border-zinc-800/60">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-zinc-900 dark:text-zinc-50" />
                                <h3 className="text-[12px] font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Referência</h3>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-3">
                                <Label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-0.5">Ciclo Mensal</Label>
                                <Select value={month} onValueChange={setMonth} disabled={loading}>
                                    <SelectTrigger className="h-11 bg-zinc-50/50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-semibold uppercase tracking-tight">
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
                                                    className="uppercase text-[11px] font-bold py-3 px-4 focus:bg-zinc-900 dark:focus:bg-zinc-50 focus:text-white dark:focus:text-zinc-900 cursor-pointer mb-1 last:mb-0 transition-colors"
                                                >
                                                    {new Date(0, m - 1).toLocaleString('pt-BR', { month: 'long' })}
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-0.5">Exercício</Label>
                                <Select value={year} onValueChange={setYear} disabled={loading}>
                                    <SelectTrigger className="h-11 bg-zinc-50/50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-bold tracking-tight">
                                        <SelectValue placeholder="Ano" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl">
                                        {Array.from({ length: 3 }, (_, i) => 2024 + i).map(y => (
                                            <SelectItem key={y} value={String(y)} className="text-[11px] font-bold py-3 px-4 focus:bg-zinc-900 dark:focus:bg-zinc-50 focus:text-white dark:focus:text-zinc-900 cursor-pointer mb-1 last:mb-0 transition-colors">{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/60">
                                <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-[0.15em] leading-relaxed">
                                        Os dados preenchidos serão consolidados para o exercício de <span className="text-zinc-900 dark:text-zinc-100">{year}</span> no mês de <span className="text-zinc-900 dark:text-zinc-100 capitalize">{monthName}</span>.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-8">
                    <Card className="border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-none rounded-2xl">
                        <CardHeader className="pt-8 px-10 pb-6 border-b border-zinc-100 dark:border-zinc-800/60">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Indicadores Operacionais</h3>
                                    <p className="text-[12px] font-medium text-zinc-500">Preencha todos os campos obrigatórios para prosseguir.</p>
                                </div>
                                <span className="hidden sm:inline-flex items-center px-3 py-1 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 text-[10px] font-bold rounded-full uppercase tracking-widest">
                                    Formulário Oficial
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10">
                            <FormEngine
                                key={`${month}-${year}`} // Reset form when month/year changes to load new initialData
                                definition={definition}
                                initialData={fetchedInitialData}
                                onSubmit={handleSubmit}
                                onDataChange={(data, setData) => {
                                    if (setor === 'cras') {
                                        const mes_anterior = Number(data.mes_anterior) || 0
                                        const admitidas = Number(data.admitidas) || 0
                                        const total = mes_anterior + admitidas

                                        if (data.atual !== total) {
                                            setData(prev => ({ ...prev, atual: total }))
                                        }
                                    }

                                    if (setor === 'creas') {
                                        // Auto-calc for Families (fa_) and Idosos (ia_)
                                        // Concept: Atual = Mes Anterior + Admitidas (No subtraction per user request)
                                        const fa_anterior = Number(data.fa_mes_anterior) || 0
                                        const fa_admitidas = Number(data.fa_admitidas) || 0
                                        const fa_total = fa_anterior + fa_admitidas

                                        if (Number(data.fa_atual) !== fa_total) {
                                            setData(prev => ({ ...prev, fa_atual: fa_total }))
                                        }

                                        const ia_anterior = Number(data.ia_mes_anterior) || 0
                                        const ia_admitidas = Number(data.ia_admitidas) || 0
                                        const ia_total = ia_anterior + ia_admitidas

                                        if (Number(data.ia_atual) !== ia_total) {
                                            setData(prev => ({ ...prev, ia_atual: ia_total }))
                                        }

                                        // Auto-calc for PCD
                                        const pcd_anterior = Number(data.pcd_mes_anterior) || 0
                                        const pcd_admitidas = Number(data.pcd_admitidas) || 0
                                        const pcd_total = pcd_anterior + pcd_admitidas

                                        if (Number(data.pcd_atual) !== pcd_total) {
                                            setData(prev => ({ ...prev, pcd_atual: pcd_total }))
                                        }
                                    }
                                }}
                                disabled={loading}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
