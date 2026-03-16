"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { CheckCircle2, AlertCircle, Loader2, FileText } from "lucide-react"
import { getMonthlyProgressData } from "@/app/dashboard/actions"
import { cn } from "@/lib/utils"
import { CRAS_UNITS } from "@/app/dashboard/cras-config"
import { CEAI_UNITS } from "@/app/dashboard/ceai-config"
import { NAICA_UNITS } from "@/app/dashboard/naica-config"

// Multi-unit directorates mapping
const MULTI_UNIT_CONFIG: Record<string, string[]> = {
    "CRAS": CRAS_UNITS,
    "CEAI": CEAI_UNITS,
    "NAICAs": NAICA_UNITS,
    "Qualificação Profissional e SINE": ["SINE", "Centro Profissionalizante"]
}

interface Directorate {
    id: string
    name: string
}

export function DataProgress({ directorates }: { directorates: Directorate[] }) {
    const [month, setMonth] = useState(new Date().getMonth() + 1)
    const [year, setYear] = useState(new Date().getFullYear())
    const [loading, setLoading] = useState(true)
    const [progressData, setProgressData] = useState<any[]>([])

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ]

    useEffect(() => {
        async function loadData() {
            setLoading(true)
            const data = await getMonthlyProgressData(month, year)
            setProgressData(data)
            setLoading(false)
        }
        loadData()
    }, [month, year])

    const getDirectorateProgress = (dir: Directorate) => {
        const dirSubmissions = progressData.filter(s => s.directorate_id === dir.id)
        const units = MULTI_UNIT_CONFIG[dir.name]

        if (!units) {
            // Single unit directorates (or others not declared as multi)
            // Special case for Casa da Mulher & Diversidade which share the same ID but have different keys
            if (dir.name.includes("Casa da Mulher")) {
                const isOk = dirSubmissions.some(s => s.data?.cm_atend_mulheres_atendidas !== undefined)
                return { type: "status", ok: isOk }
            }
            if (dir.name === "Diversidade") {
                const isOk = dirSubmissions.some(s => s.data?.div_atend_mulheres_atendidas !== undefined)
                return { type: "status", ok: isOk }
            }

            return { type: "status", ok: dirSubmissions.length > 0 }
        }

        // Multi-unit logic
        let submittedUnits = 0
        units.forEach(unitName => {
            const hasSubmitted = dirSubmissions.some(s => {
                if (dir.name === "Qualificação Profissional e SINE") {
                    // Check if the data belongs to SINE or CP (accounting for merged records)
                    if (unitName === "SINE") {
                        return !!(s.data?._has_sine || s.data?._setor === "sine" || s.data?._setor === "merged_sine")
                    }
                    if (unitName === "Centro Profissionalizante") {
                        return !!(s.data?._has_centros || s.data?._setor === "centros" || s.data?._setor === "merged_centros")
                    }
                    return s.data?._setor === unitName.toLowerCase()
                }
                // CRAS, NAICA, CEAI use _unit key (or units object for multi-unit submission if implemented)
                return s.data?._unit === unitName || (s.data?._is_multi_unit && s.data?.units && s.data?.units[unitName])
            })
            if (hasSubmitted) submittedUnits++
        })

        const percentage = Math.round((submittedUnits / units.length) * 100)
        return { type: "progress", percentage, count: submittedUnits, total: units.length }
    }

    return (
        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Progresso de Preenchimento</CardTitle>
                    <p className="text-sm text-zinc-500 font-medium">Acompanhamento mensal por diretoria e unidade</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-sm font-bold text-zinc-700 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        {months.map((m, i) => (
                            <option key={m} value={i + 1}>{m}</option>
                        ))}
                    </select>
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-sm font-bold text-zinc-700 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        {[2024, 2025, 2026].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : directorates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <AlertCircle className="w-10 h-10 text-zinc-300 mb-4" />
                        <p className="text-zinc-500 font-medium">Nenhuma diretoria encontrada.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
                        {directorates.map((dir) => {
                            const prog = getDirectorateProgress(dir)
                            const dirSubmissions = progressData.filter(s => s.directorate_id === dir.id)
                            const hasMonthlyReport = dirSubmissions.some(s => 
                                s.data?._report_content !== undefined || 
                                s.data?.report_content !== undefined ||
                                Object.keys(s.data || {}).some(k => k.startsWith('_report_content_'))
                            )

                            return (
                                <div key={dir.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                                    <div className="min-w-[280px] space-y-3">
                                        <div>
                                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{dir.name}</h3>
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                                                {MULTI_UNIT_CONFIG[dir.name] ? `${MULTI_UNIT_CONFIG[dir.name].length} Unidades` : "Unidade Administrativa"}
                                            </p>
                                        </div>

                                        {/* Relatório Mensal Status */}
                                        <div className="flex items-center gap-2 pt-1">
                                            <FileText className={cn("w-3.5 h-3.5", hasMonthlyReport ? "text-blue-600 dark:text-blue-400" : "text-zinc-300 dark:text-zinc-700")} />
                                            <span className={cn(
                                                "text-[10px] font-black uppercase tracking-tight",
                                                hasMonthlyReport ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-400"
                                            )}>
                                                Relatório Mensal:
                                            </span>
                                            {hasMonthlyReport ? (
                                                <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/40">
                                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                                    Enviado
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-black text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
                                                    Pendente
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 flex items-center gap-4">
                                        {prog.type === "progress" ? (
                                            <>
                                                <div className="flex-1 space-y-1.5">
                                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                        <span className={cn(
                                                            prog.percentage === 100 ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400"
                                                        )}>
                                                            {prog.percentage}% Concluído
                                                        </span>
                                                        <span className="text-zinc-400">{prog.count} de {prog.total}</span>
                                                    </div>
                                                    <Progress
                                                        value={prog.percentage}
                                                        className="h-2 bg-zinc-100 dark:bg-zinc-900"
                                                        // @ts-ignore
                                                        indicatorClassName={cn(
                                                            prog.percentage === 100 ? "bg-emerald-500" : "bg-blue-500"
                                                        )}
                                                    />
                                                </div>
                                                {prog.percentage === 100 ? (
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                                ) : (
                                                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                                )}
                                            </>
                                        ) : (
                                            <div className="w-full flex justify-end">
                                                {prog.ok ? (
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-full text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Atualizado
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-zinc-400 text-xs font-black uppercase">
                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                        Pendente
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
