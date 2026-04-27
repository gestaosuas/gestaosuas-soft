"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from "recharts"
import { MetricsCards } from "./charts"
import { Info } from "lucide-react"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface CreasDashboardProps {
    submissions: any[]
    selectedMonth: string
    selectedYear: number
    tvMode?: boolean
}

const COLORS = ["#3b82f6", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#f97316"]
const GENDER_COLORS = {
    Feminino: "#f59e0b", // Yellow/Orange as per screenshot
    Masculino: "#3b82f6"  // Blue
}

export function CreasDashboard({ submissions, selectedMonth, selectedYear, tvMode = false }: CreasDashboardProps) {
    const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"]
    const isAllYear = selectedMonth === 'all'
    const selectedMonthNum = Number(selectedMonth)

    // Helper to get value from a set of submissions for a specific month or year
    const getVal = (month: number, fieldId: string, subcat?: string) => {
        const subs = submissions.filter(s => s.month === month && (!subcat || s.data._subcategory === subcat))
        return subs.reduce((acc, s) => acc + (Number(s.data[fieldId]) || 0), 0)
    }

    const getAllVal = (fieldId: string, subcat?: string) => {
        const subs = subcat ? submissions.filter(s => s.data._subcategory === subcat) : submissions
        return subs.reduce((acc, s) => acc + (Number(s.data[fieldId]) || 0), 0)
    }

    const monthLabel = isAllYear ? "" : `(${monthNames[selectedMonthNum - 1]})`

    // KPIs for the selected month
    const kpiData = [
        {
            label: `VIOLÊNCIA IDOSO ${monthLabel}`,
            description: "Soma de todos os casos de Idosos: PAEFI (Novos), Violência Física/Psicológica, Abuso Sexual, Exploração Sexual, Negligência/Abandono e Exploração Financeira.",
            value: isAllYear ? (
                getAllVal('paefi_inseridos') +
                getAllVal('violencia_fisica_total') +
                getAllVal('abuso_sexual_total') +
                getAllVal('exploracao_sexual_total') +
                getAllVal('negligencia_total') +
                getAllVal('exploracao_financeira_total')
            ) : (
                getVal(selectedMonthNum, 'paefi_inseridos') +
                getVal(selectedMonthNum, 'violencia_fisica_total') +
                getVal(selectedMonthNum, 'abuso_sexual_total') +
                getVal(selectedMonthNum, 'exploracao_sexual_total') +
                getVal(selectedMonthNum, 'negligencia_total') +
                getVal(selectedMonthNum, 'exploracao_financeira_total')
            ),
            color: "#0ea5e9"
        },
        {
            label: `VIOLÊNCIA PCD ${monthLabel}`,
            description: "Soma de todos os casos de PCD: Violência Física/Psicológica, Abuso Sexual, Exploração Sexual, Negligência/Abandono e Exploração Financeira.",
            value: isAllYear ? (
                getAllVal('def_violencia_fisica_total') +
                getAllVal('def_abuso_sexual_total') +
                getAllVal('def_exploracao_sexual_total') +
                getAllVal('def_negligencia_total') +
                getAllVal('def_exploracao_financeira_total')
            ) : (
                getVal(selectedMonthNum, 'def_violencia_fisica_total') +
                getVal(selectedMonthNum, 'def_abuso_sexual_total') +
                getVal(selectedMonthNum, 'def_exploracao_sexual_total') +
                getVal(selectedMonthNum, 'def_negligencia_total') +
                getVal(selectedMonthNum, 'def_exploracao_financeira_total')
            ),
            color: "#0ea5e9"
        },
        {
            label: `FAMÍLIAS ACOMP. ${monthLabel}`,
            description: "Total de famílias que iniciaram o mês em acompanhamento somado às famílias inseridas no período.",
            value: isAllYear ? (
                submissions.length > 0 ? getVal(Math.max(...submissions.map(s => s.month)), 'paefi_acomp_inicio') + getVal(Math.max(...submissions.map(s => s.month)), 'paefi_inseridos') : 0
            ) : getVal(selectedMonthNum, 'paefi_acomp_inicio') + getVal(selectedMonthNum, 'paefi_inseridos'),
            color: "#0ea5e9"
        }
    ]

    // Line Charts Data (12 months)
    const lineData = monthNames.map((name, i) => {
        const m = i + 1
        return {
            name,
            idosos: getVal(m, 'ia_atual', 'idoso'),
            pcd: getVal(m, 'pcd_atual', 'deficiente')
        }
    })

    // Donut Chart Data (Aggregated by Type - Idosos only)
    const idososViolenceTypesData = [
        {
            name: "Negligência/Abandono",
            value: (isAllYear ? getAllVal('negligencia_total') : getVal(selectedMonthNum, 'negligencia_total'))
        },
        {
            name: "Violência Física/Psic.",
            value: (isAllYear ? getAllVal('violencia_fisica_total') : getVal(selectedMonthNum, 'violencia_fisica_total'))
        },
        {
            name: "Exploração Financeira",
            value: (isAllYear ? getAllVal('exploracao_financeira_total') : getVal(selectedMonthNum, 'exploracao_financeira_total'))
        },
        {
            name: "Abuso Sexual",
            value: (isAllYear ? getAllVal('abuso_sexual_total') : getVal(selectedMonthNum, 'abuso_sexual_total'))
        },
        {
            name: "Exploração Sexual",
            value: (isAllYear ? getAllVal('exploracao_sexual_total') : getVal(selectedMonthNum, 'exploracao_sexual_total'))
        }
    ].filter(d => d.value > 0)

    // Donut Chart Data (Aggregated by Type - PCD only)
    const pcdDonutData = [
        {
            name: "Negligência/Abandono",
            value: (isAllYear ? getAllVal('def_negligencia_total') : getVal(selectedMonthNum, 'def_negligencia_total'))
        },
        {
            name: "Violência Física/Psic.",
            value: (isAllYear ? getAllVal('def_violencia_fisica_total') : getVal(selectedMonthNum, 'def_violencia_fisica_total'))
        },
        {
            name: "Exploração Financeira",
            value: (isAllYear ? getAllVal('def_exploracao_financeira_total') : getVal(selectedMonthNum, 'def_exploracao_financeira_total'))
        },
        {
            name: "Abuso Sexual",
            value: (isAllYear ? getAllVal('def_abuso_sexual_total') : getVal(selectedMonthNum, 'def_abuso_sexual_total'))
        },
        {
            name: "Exploração Sexual",
            value: (isAllYear ? getAllVal('def_exploracao_sexual_total') : getVal(selectedMonthNum, 'def_exploracao_sexual_total'))
        }
    ].filter(d => d.value > 0)

    // Bar Chart Data (Idosos)
    const idososViolenceData = [
        {
            name: "Violência Fís/Psic",
            total: isAllYear ? getAllVal('violencia_fisica_total') : getVal(selectedMonthNum, 'violencia_fisica_total'),
        },
        {
            name: "Negligência/Abandono",
            total: isAllYear ? getAllVal('negligencia_total') : getVal(selectedMonthNum, 'negligencia_total'),
        },
        {
            name: "Exploração Financeira",
            total: isAllYear ? getAllVal('exploracao_financeira_total') : getVal(selectedMonthNum, 'exploracao_financeira_total'),
        },
        {
            name: "Abuso/Expl. Sexual",
            total: isAllYear ? (getAllVal('abuso_sexual_total') + getAllVal('exploracao_sexual_total')) : (getVal(selectedMonthNum, 'abuso_sexual_total') + getVal(selectedMonthNum, 'exploracao_sexual_total')),
        },
    ]

    // Bar Chart Data (PCD)
    const pcdViolenceData = [
        {
            name: "Violência Fís/Psic",
            total: isAllYear ? getAllVal('def_violencia_fisica_total') : getVal(selectedMonthNum, 'def_violencia_fisica_total'),
        },
        {
            name: "Negligência/Abandono",
            total: isAllYear ? getAllVal('def_negligencia_total') : getVal(selectedMonthNum, 'def_negligencia_total'),
        },
        {
            name: "Exploração Financeira",
            total: isAllYear ? getAllVal('def_exploracao_financeira_total') : getVal(selectedMonthNum, 'def_exploracao_financeira_total'),
        },
        {
            name: "Abuso/Expl. Sexual",
            total: isAllYear ? (getAllVal('def_abuso_sexual_total') + getAllVal('def_exploracao_sexual_total')) : (getVal(selectedMonthNum, 'def_abuso_sexual_total') + getVal(selectedMonthNum, 'def_exploracao_sexual_total')),
        },
    ]

    return (
        <div className={cn("space-y-6", tvMode && "space-y-3")}>
            <MetricsCards data={kpiData} monthName={isAllYear ? "Ano" : monthNames[selectedMonthNum - 1]} compact tvMode={tvMode} />

            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                {/* LINHA 1: 2 Gráficos de Rosca */}
                <Card className="lg:col-span-3 shadow-none border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="p-4 pb-0 flex flex-row items-center gap-2">
                        <span className="text-red-500 font-bold">◆</span>
                        <CardTitle className="text-[11px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-tight">Tipos de Violência Idosos</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[260px] p-6 pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={idososViolenceTypesData}
                                    cx="40%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={85}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ value }) => value}
                                    isAnimationActive={!tvMode}
                                >
                                    {idososViolenceTypesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend
                                    layout="vertical"
                                    verticalAlign="middle"
                                    align="right"
                                    iconType="rect"
                                    formatter={(value, entry: any) => {
                                        const item = idososViolenceTypesData.find(d => d.name === value)
                                        const total = idososViolenceTypesData.reduce((acc, curr) => acc + curr.value, 0)
                                        const percent = total > 0 ? ((item?.value || 0) / total * 100).toFixed(0) : 0
                                        return <span className="text-[9px] font-medium text-zinc-500">{value} ({percent}%)</span>
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 shadow-none border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="p-4 pb-0 flex flex-row items-center gap-2">
                        <span className="text-amber-500 font-bold">◆</span>
                        <CardTitle className="text-[11px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-tight">Tipos de Violência PCD</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[260px] p-6 pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pcdDonutData}
                                    cx="40%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={85}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ value }) => value}
                                    isAnimationActive={!tvMode}
                                >
                                    {pcdDonutData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend
                                    layout="vertical"
                                    verticalAlign="middle"
                                    align="right"
                                    iconType="rect"
                                    formatter={(value, entry: any) => {
                                        const item = pcdDonutData.find(d => d.name === value)
                                        const total = pcdDonutData.reduce((acc, curr) => acc + curr.value, 0)
                                        const percent = total > 0 ? ((item?.value || 0) / total * 100).toFixed(0) : 0
                                        return <span className="text-[9px] font-medium text-zinc-500">{value} ({percent}%)</span>
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* LINHA 2: 2 Gráficos (Cada um ocupa 3 de 6 colunas) */}
                <Card className="lg:col-span-3 shadow-none border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="p-4 pb-0 flex flex-row items-center gap-2">
                        <span className="text-indigo-500 font-bold">◆</span>
                        <CardTitle className="text-[11px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-tight flex items-center gap-2">
                            Violência Idosos
                            <TooltipProvider>
                                <UITooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-3 w-3 cursor-help text-zinc-300 hover:text-blue-500 transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[200px] text-[10px] font-normal normal-case tracking-normal">
                                        O campo Abuso/Expl. Sexual é a soma de "Abuso Sexual" e "Exploração Sexual".
                                    </TooltipContent>
                                </UITooltip>
                            </TooltipProvider>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[320px] p-6 pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={idososViolenceData} margin={{ top: 10, right: 10, left: -20, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold', angle: -30, textAnchor: 'end' } as any} axisLine={false} tickLine={false} interval={0} />
                                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar
                                    dataKey="total"
                                    fill="#3b82f6"
                                    radius={[3, 3, 0, 0]}
                                    label={{ position: 'top', fontSize: 10, fontWeight: '800', fill: '#3b82f6', formatter: (val: any) => val > 0 ? val : '' }}
                                    isAnimationActive={!tvMode}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 shadow-none border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="p-4 pb-0 flex flex-row items-center gap-2">
                        <span className="text-emerald-500 font-bold">◆</span>
                        <CardTitle className="text-[11px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-tight flex items-center gap-2">
                            Violência Pessoa com Deficiência
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-3 w-3 cursor-help text-zinc-300 hover:text-blue-500 transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[200px] text-[10px] font-normal normal-case tracking-normal">
                                        O campo Abuso/Expl. Sexual é a soma de "Abuso Sexual" e "Exploração Sexual".
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[320px] p-6 pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={pcdViolenceData} margin={{ top: 10, right: 10, left: -20, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold', angle: -30, textAnchor: 'end' } as any} axisLine={false} tickLine={false} interval={0} />
                                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar
                                    dataKey="total"
                                    fill="#10b981"
                                    radius={[3, 3, 0, 0]}
                                    label={{ position: 'top', fontSize: 10, fontWeight: '800', fill: '#10b981', formatter: (val: any) => val > 0 ? val : '' }}
                                    isAnimationActive={!tvMode}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
