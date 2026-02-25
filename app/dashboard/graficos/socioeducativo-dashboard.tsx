"use client"

import { MetricsCards, GenericLineChart, GenericPieChart } from "./charts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Cell } from "recharts"

export function SocioeducativoDashboard({
    submissions,
    selectedMonth,
    selectedYear
}: {
    submissions: any[],
    selectedMonth: string,
    selectedYear: number
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
            latestData.med_masc_la_total_parcial = Number(lastMonthData?.med_masc_la_total_parcial || 0)
            latestData.med_fem_la_total_parcial = Number(lastMonthData?.med_fem_la_total_parcial || 0)
            latestData.med_masc_psc_total_parcial = Number(lastMonthData?.med_masc_psc_total_parcial || 0)
            latestData.med_fem_psc_total_parcial = Number(lastMonthData?.med_fem_psc_total_parcial || 0)
            latestData.med_total_la_geral = Number(lastMonthData?.med_total_la_geral || 0)
            latestData.med_total_psc_geral = Number(lastMonthData?.med_total_psc_geral || 0)
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

    const cardsData = [
        { label: "Total LA Masculino", value: Number(latestData.med_masc_la_total_parcial || 0), color: "#0ea5e9", trend: getTrend('med_masc_la_total_parcial'), history: getHistory('med_masc_la_total_parcial') },
        { label: "Total LA Feminino", value: Number(latestData.med_fem_la_total_parcial || 0), color: "#0ea5e9", trend: getTrend('med_fem_la_total_parcial'), history: getHistory('med_fem_la_total_parcial') },
        { label: "Total PSC Masculino", value: Number(latestData.med_masc_psc_total_parcial || 0), color: "#0ea5e9", trend: getTrend('med_masc_psc_total_parcial'), history: getHistory('med_masc_psc_total_parcial') },
        { label: "Total PSC Feminino", value: Number(latestData.med_fem_psc_total_parcial || 0), color: "#0ea5e9", trend: getTrend('med_fem_psc_total_parcial'), history: getHistory('med_fem_psc_total_parcial') },
        { label: "Total Geral LA", value: Number(latestData.med_total_la_geral || 0), color: "#0ea5e9", trend: getTrend('med_total_la_geral'), history: getHistory('med_total_la_geral') },
        { label: "Total Geral PSC", value: Number(latestData.med_total_psc_geral || 0), color: "#0ea5e9", trend: getTrend('med_total_psc_geral'), history: getHistory('med_total_psc_geral') },
        { label: "Adolescentes Admitidos", value: (Number(latestData.masc_admitidos || 0) + Number(latestData.fem_admitidos || 0)), color: "#0ea5e9", trend: getTrend(['masc_admitidos', 'fem_admitidos']), history: getHistory(['masc_admitidos', 'fem_admitidos']) },
    ]

    // --------- CHART 1: Total LA e PSC Mensal (Grouped Bar Chart) ---------
    const chart1_LAxPSC = monthNames.map((name, index) => {
        const mData = dataByMonth.get(index + 1) || {}
        return {
            name,
            LA: Number(mData.med_total_la_geral || 0),
            PSC: Number(mData.med_total_psc_geral || 0)
        }
    })

    // --------- CHART 2: Medidas Aplicadas LA x PSC (Pie Chart) ---------
    const chart2_PieLAxPSC = [
        { name: "LA", value: Number(latestData.med_total_la_geral || 0) },
        { name: "PSC", value: Number(latestData.med_total_psc_geral || 0) },
    ].filter(d => d.value > 0)

    // --------- CHART 3: Medidas Aplicadas por Gênero (Grouped Bar Chart) ---------
    const chart3_GeneroBar = [
        {
            name: "Masculino",
            LA: Number(latestData.med_masc_la_total_parcial || 0),
            PSC: Number(latestData.med_masc_psc_total_parcial || 0)
        },
        {
            name: "Feminino",
            LA: Number(latestData.med_fem_la_total_parcial || 0),
            PSC: Number(latestData.med_fem_psc_total_parcial || 0)
        },
    ]

    // --------- CHART 4: Adolescentes Admitidos por Gênero (Pie Chart) ---------
    const chart4_PieAdmitidosGenero = [
        { name: "Masc", value: Number(latestData.masc_admitidos || 0) },
        { name: "Fem", value: Number(latestData.fem_admitidos || 0) },
    ].filter(d => d.value > 0)

    // --------- CHART 5: Crianças e Adolescentes em Acompanhamento (Line Chart) ---------
    const chart5_Acompanhamento = monthNames.map((name, index) => {
        const mData = dataByMonth.get(index + 1) || {}
        const totalAcompanhamento = Number(mData.masc_total_parcial || 0) + Number(mData.fem_total_parcial || 0)
        return { name, Total: totalAcompanhamento }
    })


    return (
        <div className="space-y-8">
            <MetricsCards data={cardsData} monthName={selectedMonthName} />

            {/* ROW 1: 2 Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 1. Total LA e PSC Mensal */}
                <Card className="rounded-[2.5rem] border-zinc-100/80 bg-white dark:bg-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-[11px] font-black text-slate-800 dark:text-zinc-300 uppercase tracking-widest leading-tight flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                            Total LA e PSC Mensal
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] p-8 pt-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chart1_LAxPSC} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Bar dataKey="LA" fill="#3b82f6" label={{ position: 'top', fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="PSC" fill="#f59e0b" label={{ position: 'top', fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 2. Medidas Aplicadas (LA x PSC) Pie */}
                <GenericPieChart
                    title="Medidas Aplicadas (LA x PSC)"
                    data={chart2_PieLAxPSC}
                    colors={['#3b82f6', '#f59e0b']}
                />
            </div>

            {/* ROW 2: 2 Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 3. Medidas Aplicadas por Gênero */}
                <Card className="rounded-[2.5rem] border-zinc-100/80 bg-white dark:bg-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-[11px] font-black text-slate-800 dark:text-zinc-300 uppercase tracking-widest leading-tight flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                            Medidas Aplicadas por Gênero
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] p-8 pt-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chart3_GeneroBar} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Bar dataKey="LA" fill="#3b82f6" label={{ position: 'top', fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="PSC" fill="#f59e0b" label={{ position: 'top', fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 4. Adolescentes Admitidos por Gênero */}
                <GenericPieChart
                    title="Adolescentes Admitidos por Gênero"
                    data={chart4_PieAdmitidosGenero}
                    colors={['#3b82f6', '#f59e0b']}
                />
            </div>

            {/* ROW 3: 1 Chart */}
            <div className="grid grid-cols-1 gap-8">
                {/* 5. Adolescentes em Acompanhamento (Line Chart) */}
                <GenericLineChart
                    title="Adolescentes em Acompanhamento"
                    data={chart5_Acompanhamento}
                    dataKey="Total"
                    color="#3b82f6"
                />
            </div>

        </div>
    )
}
