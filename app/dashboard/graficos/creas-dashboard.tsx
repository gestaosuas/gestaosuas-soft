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

interface CreasDashboardProps {
    submissions: any[]
    selectedMonth: string
    selectedYear: number
}

const COLORS = ["#3b82f6", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#f97316"]
const GENDER_COLORS = {
    Feminino: "#f59e0b", // Yellow/Orange as per screenshot
    Masculino: "#3b82f6"  // Blue
}

export function CreasDashboard({ submissions, selectedMonth, selectedYear }: CreasDashboardProps) {
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

    const currentMonthData = isAllYear
        ? null // Not used for cards if all year? Usually cards show latest month or total.
        // User screenshot shows (MAI), implying specific month.
        : selectedMonthNum

    const monthLabel = isAllYear ? "" : `(${monthNames[selectedMonthNum - 1]})`

    // KPIs for the selected month
    const kpiData = [
        {
            label: `VIOLÊNCIAS MASC. ${monthLabel}`,
            value: isAllYear ? 0 : (
                getVal(selectedMonthNum, 'violencia_fisica_m', 'idoso') +
                getVal(selectedMonthNum, 'negligencia_m', 'idoso') +
                getVal(selectedMonthNum, 'abuso_sexual_m', 'idoso') +
                getVal(selectedMonthNum, 'exploracao_financeira_m', 'idoso') +
                getVal(selectedMonthNum, 'def_violencia_fisica_m', 'deficiente') +
                getVal(selectedMonthNum, 'def_negligencia_m', 'deficiente') +
                getVal(selectedMonthNum, 'def_abuso_sexual_m', 'deficiente') +
                getVal(selectedMonthNum, 'def_exploracao_financeira_m', 'deficiente')
            ),
            color: "#0ea5e9"
        },
        {
            label: `VIOLÊNCIAS FEM. ${monthLabel}`,
            value: isAllYear ? 0 : (
                getVal(selectedMonthNum, 'violencia_fisica_f', 'idoso') +
                getVal(selectedMonthNum, 'negligencia_f', 'idoso') +
                getVal(selectedMonthNum, 'abuso_sexual_f', 'idoso') +
                getVal(selectedMonthNum, 'exploracao_financeira_f', 'idoso') +
                getVal(selectedMonthNum, 'def_violencia_fisica_f', 'deficiente') +
                getVal(selectedMonthNum, 'def_negligencia_f', 'deficiente') +
                getVal(selectedMonthNum, 'def_abuso_sexual_f', 'deficiente') +
                getVal(selectedMonthNum, 'def_exploracao_financeira_f', 'deficiente')
            ),
            color: "#0ea5e9"
        },
        {
            label: `VIOLÊNCIA PCD MASC. ${monthLabel}`,
            value: isAllYear ? 0 : (
                getVal(selectedMonthNum, 'def_violencia_fisica_m', 'deficiente') +
                getVal(selectedMonthNum, 'def_negligencia_m', 'deficiente') +
                getVal(selectedMonthNum, 'def_abuso_sexual_m', 'deficiente') +
                getVal(selectedMonthNum, 'def_exploracao_financeira_m', 'deficiente')
            ),
            color: "#0ea5e9"
        },
        {
            label: `VIOLÊNCIA PCD FEM. ${monthLabel}`,
            value: isAllYear ? 0 : (
                getVal(selectedMonthNum, 'def_violencia_fisica_f', 'deficiente') +
                getVal(selectedMonthNum, 'def_negligencia_f', 'deficiente') +
                getVal(selectedMonthNum, 'def_abuso_sexual_f', 'deficiente') +
                getVal(selectedMonthNum, 'def_exploracao_financeira_f', 'deficiente')
            ),
            color: "#0ea5e9"
        },
        {
            label: `FAMÍLIAS ACOMP. ${monthLabel}`,
            value: isAllYear ? 0 : getVal(selectedMonthNum, 'fa_atual', 'idoso'),
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

    // Donut Chart Data (Aggregated by Type)
    const violenceTypesData = [
        {
            name: "Negligência/Abandono",
            value: (isAllYear ? getAllVal('negligencia_m') + getAllVal('negligencia_f') + getAllVal('def_negligencia_m') + getAllVal('def_negligencia_f') :
                getVal(selectedMonthNum, 'negligencia_m') + getVal(selectedMonthNum, 'negligencia_f') + getVal(selectedMonthNum, 'def_negligencia_m') + getVal(selectedMonthNum, 'def_negligencia_f'))
        },
        {
            name: "Violência Física/Psicológica",
            value: (isAllYear ? getAllVal('violencia_fisica_m') + getAllVal('violencia_fisica_f') + getAllVal('def_violencia_fisica_m') + getAllVal('def_violencia_fisica_f') :
                getVal(selectedMonthNum, 'violencia_fisica_m') + getVal(selectedMonthNum, 'violencia_fisica_f') + getVal(selectedMonthNum, 'def_violencia_fisica_m') + getVal(selectedMonthNum, 'def_violencia_fisica_f'))
        },
        {
            name: "Exploração Financeira",
            value: (isAllYear ? getAllVal('exploracao_financeira_m') + getAllVal('exploracao_financeira_f') + getAllVal('def_exploracao_financeira_m') + getAllVal('def_exploracao_financeira_f') :
                getVal(selectedMonthNum, 'exploracao_financeira_m') + getVal(selectedMonthNum, 'exploracao_financeira_f') + getVal(selectedMonthNum, 'def_exploracao_financeira_m') + getVal(selectedMonthNum, 'def_exploracao_financeira_f'))
        },
        {
            name: "Abuso/Expl. Sexual",
            value: (isAllYear ? getAllVal('abuso_sexual_m') + getAllVal('abuso_sexual_f') + getAllVal('def_abuso_sexual_m') + getAllVal('def_abuso_sexual_f') :
                getVal(selectedMonthNum, 'abuso_sexual_m') + getVal(selectedMonthNum, 'abuso_sexual_f') + getVal(selectedMonthNum, 'def_abuso_sexual_m') + getVal(selectedMonthNum, 'def_abuso_sexual_f'))
        }
    ].filter(d => d.value > 0)

    // Bar Chart Data (Idosos)
    const idososGenderData = [
        {
            name: "Violência/Psic",
            Feminino: isAllYear ? getAllVal('violencia_fisica_f', 'idoso') : getVal(selectedMonthNum, 'violencia_fisica_f', 'idoso'),
            Masculino: isAllYear ? getAllVal('violencia_fisica_m', 'idoso') : getVal(selectedMonthNum, 'violencia_fisica_m', 'idoso'),
        },
        {
            name: "Negligência/Abandono",
            Feminino: isAllYear ? getAllVal('negligencia_f', 'idoso') : getVal(selectedMonthNum, 'negligencia_f', 'idoso'),
            Masculino: isAllYear ? getAllVal('negligencia_m', 'idoso') : getVal(selectedMonthNum, 'negligencia_m', 'idoso'),
        },
        {
            name: "Exploração Financeira",
            Feminino: isAllYear ? getAllVal('exploracao_financeira_f', 'idoso') : getVal(selectedMonthNum, 'exploracao_financeira_f', 'idoso'),
            Masculino: isAllYear ? getAllVal('exploracao_financeira_m', 'idoso') : getVal(selectedMonthNum, 'exploracao_financeira_m', 'idoso'),
        },
        {
            name: "Abuso/Expl. Sexual",
            Feminino: isAllYear ? getAllVal('abuso_sexual_f', 'idoso') : getVal(selectedMonthNum, 'abuso_sexual_f', 'idoso'),
            Masculino: isAllYear ? getAllVal('abuso_sexual_m', 'idoso') : getVal(selectedMonthNum, 'abuso_sexual_m', 'idoso'),
        },
    ]

    // Bar Chart Data (PCD)
    const pcdGenderData = [
        {
            name: "Violência/Psic",
            Feminino: isAllYear ? getAllVal('def_violencia_fisica_f', 'deficiente') : getVal(selectedMonthNum, 'def_violencia_fisica_f', 'deficiente'),
            Masculino: isAllYear ? getAllVal('def_violencia_fisica_m', 'deficiente') : getVal(selectedMonthNum, 'def_violencia_fisica_m', 'deficiente'),
        },
        {
            name: "Negligência/Abandono",
            Feminino: isAllYear ? getAllVal('def_negligencia_f', 'deficiente') : getVal(selectedMonthNum, 'def_negligencia_f', 'deficiente'),
            Masculino: isAllYear ? getAllVal('def_negligencia_m', 'deficiente') : getVal(selectedMonthNum, 'def_negligencia_m', 'deficiente'),
        },
        {
            name: "Exploração Financeira",
            Feminino: isAllYear ? getAllVal('def_exploracao_financeira_f', 'deficiente') : getVal(selectedMonthNum, 'def_exploracao_financeira_f', 'deficiente'),
            Masculino: isAllYear ? getAllVal('def_exploracao_financeira_m', 'deficiente') : getVal(selectedMonthNum, 'def_exploracao_financeira_m', 'deficiente'),
        },
        {
            name: "Abuso/Expl. Sexual",
            Feminino: isAllYear ? getAllVal('def_abuso_sexual_f', 'deficiente') : getVal(selectedMonthNum, 'def_abuso_sexual_f', 'deficiente'),
            Masculino: isAllYear ? getAllVal('def_abuso_sexual_m', 'deficiente') : getVal(selectedMonthNum, 'def_abuso_sexual_m', 'deficiente'),
        },
    ]

    return (
        <div className="space-y-6">
            <MetricsCards data={kpiData} monthName={isAllYear ? "Ano" : monthNames[selectedMonthNum - 1]} compact />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Idosos em Acompanhamento */}
                <Card className="shadow-none border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="p-4 pb-0 flex flex-row items-center gap-2">
                        <span className="text-orange-500 font-bold">◆</span>
                        <CardTitle className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-tight">Idosos em Acompanhamento</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[280px] p-6 pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="idosos"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ r: 3, fill: "#3b82f6" }}
                                    label={{ position: 'top', fontSize: 10, fill: '#3b82f6', formatter: (val: any) => val > 0 ? val : '' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* PCD em Acompanhamento */}
                <Card className="shadow-none border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="p-4 pb-0 flex flex-row items-center gap-2">
                        <span className="text-orange-500 font-bold">◆</span>
                        <CardTitle className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-tight">Pessoas com Deficiência em Acompanhamento</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[280px] p-6 pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="pcd"
                                    stroke="#f59e0b"
                                    strokeWidth={2}
                                    dot={{ r: 3, fill: "#f59e0b" }}
                                    label={{ position: 'top', fontSize: 10, fill: '#f59e0b', formatter: (val: any) => val > 0 ? val : '' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Donut Chart */}
                <Card className="shadow-none border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="p-4 pb-0 flex flex-row items-center gap-2">
                        <span className="text-orange-500 font-bold">◆</span>
                        <CardTitle className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-tight">Tipos de Violência (Agregado)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] p-6 pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={violenceTypesData}
                                    cx="40%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {violenceTypesData.map((entry, index) => (
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
                                        const item = violenceTypesData.find(d => d.name === value)
                                        const total = violenceTypesData.reduce((acc, curr) => acc + curr.value, 0)
                                        const percent = total > 0 ? ((item?.value || 0) / total * 100).toFixed(1) : 0
                                        return <span className="text-[11px] font-medium text-zinc-500">{value} ({percent}%)</span>
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Empty grid space or more content */}
                <div />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart Idosos */}
                <Card className="shadow-none border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="p-4 pb-0 flex flex-row items-center gap-2">
                        <span className="text-orange-500 font-bold">◆</span>
                        <CardTitle className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-tight">Violência por Gênero de Idosos</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px] p-6 pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={idososGenderData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 9, angle: -45, textAnchor: 'end' } as any} axisLine={false} tickLine={false} interval={0} />
                                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Legend verticalAlign="top" align="right" />
                                <Bar
                                    dataKey="Feminino"
                                    fill={GENDER_COLORS.Feminino}
                                    radius={[4, 4, 0, 0]}
                                    label={{ position: 'top', fontSize: 11, fontWeight: '800', fill: GENDER_COLORS.Feminino, formatter: (val: any) => val > 0 ? val : '' }}
                                />
                                <Bar
                                    dataKey="Masculino"
                                    fill={GENDER_COLORS.Masculino}
                                    radius={[4, 4, 0, 0]}
                                    label={{ position: 'top', fontSize: 11, fontWeight: '800', fill: GENDER_COLORS.Masculino, formatter: (val: any) => val > 0 ? val : '' }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Bar Chart PCD */}
                <Card className="shadow-none border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="p-4 pb-0 flex flex-row items-center gap-2">
                        <span className="text-orange-500 font-bold">◆</span>
                        <CardTitle className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-tight">Violência por Gênero de Pessoas com Deficiência</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px] p-6 pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={pcdGenderData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 9, angle: -45, textAnchor: 'end' } as any} axisLine={false} tickLine={false} interval={0} />
                                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Legend verticalAlign="top" align="right" />
                                <Bar
                                    dataKey="Feminino"
                                    fill={GENDER_COLORS.Feminino}
                                    radius={[4, 4, 0, 0]}
                                    label={{ position: 'top', fontSize: 11, fontWeight: '800', fill: GENDER_COLORS.Feminino, formatter: (val: any) => val > 0 ? val : '' }}
                                />
                                <Bar
                                    dataKey="Masculino"
                                    fill={GENDER_COLORS.Masculino}
                                    radius={[4, 4, 0, 0]}
                                    label={{ position: 'top', fontSize: 11, fontWeight: '800', fill: GENDER_COLORS.Masculino, formatter: (val: any) => val > 0 ? val : '' }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
