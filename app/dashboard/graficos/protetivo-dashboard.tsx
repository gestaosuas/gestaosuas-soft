"use client"

import { MetricsCards, GenericLineChart, ComparisonLineChart, GenericPieChart } from "./charts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Cell } from "recharts"
import { cn } from "@/lib/utils"

export function ProtetivoDashboard({
    submissions,
    selectedMonth,
    selectedYear
}: {
    submissions: any[],
    selectedMonth: string,
    selectedYear: number,
    tvMode?: boolean
}) {
    const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"]

    // Aggregation logic
    const dataByMonth = new Map<number, any>()
    submissions.forEach(sub => {
        dataByMonth.set(sub.month, sub.data)
    })

    const monthsWithData = Array.from(dataByMonth.keys()).sort((a, b) => b - a)
    const selectedMonthNum = selectedMonth === 'all' ? 0 : Number(selectedMonth)

    let latestData: any = {}
    let selectedMonthName = ""

    if (selectedMonth === 'all') {
        selectedMonthName = "Ano Inteiro"
        dataByMonth.forEach((mData) => {
            Object.keys(mData).forEach(key => {
                const val = Number(mData[key])
                if (!isNaN(val)) latestData[key] = (latestData[key] || 0) + val
            })
        })
        if (monthsWithData.length > 0) {
            const lastMonthData = dataByMonth.get(monthsWithData[0])
            latestData.fam_atual = Number(lastMonthData?.fam_atual || 0)
            latestData.atend_atual = Number(lastMonthData?.atend_atual || 0)
            // Atualizing previous month values is not a sum
            latestData.fam_mes_anterior = Number(lastMonthData?.fam_mes_anterior || 0)
            latestData.atend_mes_anterior = Number(lastMonthData?.atend_mes_anterior || 0)
        }
    } else {
        latestData = dataByMonth.get(selectedMonthNum) || {}
        selectedMonthName = monthNames[selectedMonthNum - 1] || "N/A"
    }

    const getHistory = (id: string | string[]) => monthNames.map((name, i) => {
        const mData = dataByMonth.get(i + 1) || {}
        if (Array.isArray(id)) {
            const sum = id.reduce((acc, currentId) => acc + (Number(mData[currentId]) || 0), 0)
            return { name, value: sum }
        }
        return { name, value: Number(mData[id] || 0) }
    })

    const getTrend = (id: string | string[]) => {
        const currentMonthNum = selectedMonthNum || (monthsWithData.length > 0 ? monthsWithData[0] : 0)
        if (!currentMonthNum || currentMonthNum === 1) return 0
        const mDataCur = dataByMonth.get(currentMonthNum) || {}
        const mDataPrev = dataByMonth.get(currentMonthNum - 1) || {}

        let currentVal = 0;
        let prevVal = 0;
        if (Array.isArray(id)) {
            currentVal = id.reduce((acc, currentId) => acc + (Number(mDataCur[currentId]) || 0), 0)
            prevVal = id.reduce((acc, currentId) => acc + (Number(mDataPrev[currentId]) || 0), 0)
        } else {
            currentVal = Number(mDataCur[id] || 0)
            prevVal = Number(mDataPrev[id] || 0)
        }

        if (prevVal === 0) return currentVal > 0 ? 100 : 0
        return Number(((currentVal - prevVal) / prevVal * 100).toFixed(1))
    }

    // Direitos Violados - Masculino e Feminino Fields
    const mascFields = [
        "violencia_fis_psic_masc",
        "abuso_sexual_masc",
        "exploracao_sexual_masc",
        "negligencia_abandono_masc",
        "trabalho_infantil_masc"
    ]
    const femFields = [
        "violencia_fis_psic_fem",
        "abuso_sexual_fem",
        "exploracao_sexual_fem",
        "negligencia_abandono_fem",
        "trabalho_infantil_fem"
    ]

    const totalDV_Masc = mascFields.reduce((acc, f) => acc + (Number(latestData[f]) || 0), 0)
    const totalDV_Fem = femFields.reduce((acc, f) => acc + (Number(latestData[f]) || 0), 0)

    const cardsData = [
        { label: "Direitos Violados - Masculino", value: totalDV_Masc, color: "#0ea5e9", trend: getTrend(mascFields), history: getHistory(mascFields) },
        { label: "Direitos Violados - Feminino", value: totalDV_Fem, color: "#0ea5e9", trend: getTrend(femFields), history: getHistory(femFields) },
        { label: "Crianças/Adol. Admitidas", value: Number(latestData.atend_admitidas || 0), color: "#0ea5e9", trend: getTrend('atend_admitidas'), history: getHistory('atend_admitidas') },
        { label: "Crianças/Adol. em Atendimento", value: Number(latestData.atend_atual || 0), color: "#0ea5e9", trend: getTrend('atend_atual'), history: getHistory('atend_atual') },
        { label: "Famílias Admitidas", value: Number(latestData.fam_admitidas || 0), color: "#0ea5e9", trend: getTrend('fam_admitidas'), history: getHistory('fam_admitidas') },
        { label: "Famílias em Atendimento", value: Number(latestData.fam_atual || 0), color: "#0ea5e9", trend: getTrend('fam_atual'), history: getHistory('fam_atual') }
    ]

    // --------- CHART 1: Direitos Violados (Line Chart M x F) ---------
    const chart1_DV_MXF = monthNames.map((name, index) => {
        const mData = dataByMonth.get(index + 1) || {}
        const mTotal = mascFields.reduce((acc, f) => acc + (Number(mData[f]) || 0), 0)
        const fTotal = femFields.reduce((acc, f) => acc + (Number(mData[f]) || 0), 0)
        return { name, Masculino: mTotal, Feminino: fTotal }
    })

    // --------- CHART 2: Atendimentos Admitidas x Atual (Line Chart) ---------
    const chart2_Atend_AdmxAtual = monthNames.map((name, index) => {
        const mData = dataByMonth.get(index + 1) || {}
        return {
            name,
            ADMITIDAS: Number(mData.atend_admitidas || 0),
            ATUAL: Number(mData.atend_atual || 0)
        }
    })

    // --------- CHART 3 & 4: Direitos Violados Masculino/Feminino (Pie Charts) ---------
    const chart3_PieGender = [
        { name: "Masculino", value: totalDV_Masc },
        { name: "Feminino", value: totalDV_Fem }
    ].filter(d => d.value > 0)

    // Pie chart colors matching the image roughly
    const pieColors = ['#3b82f6', '#f97316', '#10b981', '#ef4444', '#8b5cf6']

    // --------- CHART 5: Direitos Violados (Grouped Bar Chart Vertical) ---------
    const chart5_BarGrouped = [
        { name: "Violência Fís/Psic", Masculino: Number(latestData.violencia_fis_psic_masc || 0), Feminino: Number(latestData.violencia_fis_psic_fem || 0) },
        { name: "Abuso sexual", Masculino: Number(latestData.abuso_sexual_masc || 0), Feminino: Number(latestData.abuso_sexual_fem || 0) },
        { name: "Expl. Sexual", Masculino: Number(latestData.exploracao_sexual_masc || 0), Feminino: Number(latestData.exploracao_sexual_fem || 0) },
        { name: "Negligência/Abandono", Masculino: Number(latestData.negligencia_abandono_masc || 0), Feminino: Number(latestData.negligencia_abandono_fem || 0) },
        { name: "Trabalho Infantil", Masculino: Number(latestData.trabalho_infantil_masc || 0), Feminino: Number(latestData.trabalho_infantil_fem || 0) },
    ]

    // --------- CHART 7: Crianças e Adolescentes em Acompanhamento (Line Chart) ---------
    const chart7_CriancasAcompanhamento = monthNames.map((name, index) => {
        const mData = dataByMonth.get(index + 1) || {}
        return { name, ATUAL: Number(mData.atend_atual || 0) }
    })


    return (
        <div className={cn("space-y-8", tvMode && "space-y-4")}>
            <MetricsCards data={cardsData} monthName={selectedMonthName} tvMode={tvMode} />

            {/* 2x2 Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Direitos Violados (Line M/F) */}
                <ComparisonLineChart
                    title="Direitos Violados (Histórico)"
                    data={chart1_DV_MXF}
                    keys={['Masculino', 'Feminino']}
                    colors={['#3b82f6', '#f59e0b']}
                    tvMode={tvMode}
                />

                {/* 2. Direitos Violados (Unified Pie Gender) */}
                <GenericPieChart
                    title="Gênero (Direitos Violados)"
                    data={chart3_PieGender}
                    colors={['#3b82f6', '#f59e0b']}
                    tvMode={tvMode}
                />

                {/* 3. Direitos Violados (Bar Chart Horizontal) */}
                <Card className={cn(
                    "rounded-[2.5rem] border-zinc-100/80 bg-white dark:bg-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300",
                    tvMode && "rounded-2xl shadow-none border-zinc-100/50"
                )}>
                    <CardHeader className={cn("p-8 pb-4", tvMode && "p-4 pb-2")}>
                        <CardTitle className="text-[11px] font-black text-slate-800 dark:text-zinc-300 uppercase tracking-widest leading-tight flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                            Impacto por Categoria
                        </CardTitle>
                    </CardHeader>
                    <CardContent className={cn("h-[300px] p-8 pt-0", tvMode && "h-[220px] p-4 pt-0")}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={chart5_BarGrouped} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Bar dataKey="Masculino" fill="#3b82f6" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                                <Bar dataKey="Feminino" fill="#f59e0b" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 4. Crianças e Adolescentes em Acompanhamento (Line Chart) */}
                <GenericLineChart
                    title="Crianças/Adolescentes (Acomp.)"
                    data={chart7_CriancasAcompanhamento}
                    dataKey="ATUAL"
                    color="#3b82f6"
                    tvMode={tvMode}
                />
            </div>
        </div>
    )
}
