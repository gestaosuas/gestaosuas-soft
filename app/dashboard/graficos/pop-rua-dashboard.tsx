
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MonthSelector } from "./month-selector"
import { YearSelector } from "@/components/year-selector"
import { MetricsCards, GenericPieChart, ComparisonLineChart, GenericLineChart } from "./charts"
import { BarChart3, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface PopRuaDashboardProps {
    submissions: any[]
    selectedMonth: string
    selectedYear: number
    directorateId: string
}

export function PopRuaDashboard({ submissions, selectedMonth, selectedYear, directorateId }: PopRuaDashboardProps) {
    const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"]
    const selectedMonthNum = selectedMonth === 'all' ? 0 : Number(selectedMonth)
    const selectedMonthName = selectedMonth === 'all' ? "Ano Inteiro" : monthNames[selectedMonthNum - 1]

    // Data Map by Month (1-12)
    const dataByMonth = new Map<number, any>()
    submissions.forEach(sub => dataByMonth.set(sub.month, sub.data))

    // 1. Prepare Cards Data (Filtered by Month or Latest if All - wait, user said "cards ... reagirá aos filtros")
    // If 'all' is selected, usually we show latest or sum. Let's assume 'latest' for counters like "Situation".

    let currentData: any = {}
    if (selectedMonth === 'all') {
        // If all, maybe show latest month data? Or Average? 
        // For "Situation Status", it's likely a snapshot. 
        // Let's use the latest available data for the year.
        const monthsWithData = Array.from(dataByMonth.keys()).sort((a, b) => b - a)
        if (monthsWithData.length > 0) {
            currentData = dataByMonth.get(monthsWithData[0])
        }
    } else {
        currentData = dataByMonth.get(selectedMonthNum) || {}
    }

    const cardsData = [
        {
            label: `Situação Rua Masc (${selectedMonthName})`,
            value: Number(currentData.cr_a1_masc || 0), // Using Centro Ref A1 Masc as proxy
            color: "#0ea5e9"
        },
        {
            label: `Situação Rua Fem (${selectedMonthName})`,
            value: Number(currentData.cr_a1_fem || 0), // Using Centro Ref A1 Fem as proxy
            color: "#0ea5e9"
        }
    ]

    // 2. Prepare Line Chart 1 Data (All Year)
    // "Centro de Referência, Abordagem Social e Migração"
    const lineChart1Data = monthNames.map((name, index) => {
        const monthNum = index + 1
        const data = dataByMonth.get(monthNum) || {}
        return {
            name,
            "Centro de Referência": Number(data.num_atend_centro_ref || 0),
            "Abordagem Social": Number(data.num_atend_abordagem || 0),
            "Migração": Number(data.num_atend_migracao || 0)
        }
    })

    // 3. Prepare Pie Chart Data (Filtered by Month)
    // "Usuários de Drogas": Centro Ref vs Abordagem
    const pieChartData = [
        { name: "Centro Referencia", value: Number(currentData.cr_b1_drogas || 0) },
        { name: "Abordagem de Rua", value: Number(currentData.ar_e5_drogas || 0) }
    ].filter(d => d.value > 0)

    // 4. Prepare Line Chart 2 Data (All Year)
    // "Pessoas Que se Recusam a Sair das Ruas"
    const lineChart2Data = monthNames.map((name, index) => {
        const monthNum = index + 1
        const data = dataByMonth.get(monthNum) || {}
        return {
            name,
            "Recusam Identificação": Number(data.ar_recusa_identificacao || 0), // Using this or persistentes? 
            // The image title is "Pessoas Que se Recusam a Sair das Ruas". 
            // In config we have `ar_persistentes` called "Usuários que persistem em continuar nas ruas".
            // That matches better than "recusa identificação".
            "Persistem nas Ruas": Number(data.ar_persistentes || 0)
        }
    })


    return (
        <div className="space-y-6">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 relative z-[100] pointer-events-auto bg-white dark:bg-zinc-900 p-2 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all">
                <div className="flex items-center gap-6">
                    <Link href={`/dashboard/diretoria/${directorateId}`} className="transition-transform hover:scale-105">
                        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl border border-zinc-200 dark:border-zinc-800"><ArrowLeft className="h-5 w-5 text-zinc-500" /></Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg"><BarChart3 className="w-5 h-5 text-white" /></div>
                            <h1 className="text-2xl font-black tracking-tight text-blue-900 dark:text-blue-50">Dashboard População de Rua <span className="text-blue-600/60 font-medium ml-2">{selectedYear}</span></h1>
                        </div>
                        <p className="text-[13px] font-medium text-zinc-500 ml-11 -mt-0.5">{selectedMonthName}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-6">
                    <div className="flex flex-col gap-1"><span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Referência</span>
                        <div className="flex items-center gap-3"><YearSelector currentYear={selectedYear} /><MonthSelector currentMonth={selectedMonth} /></div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                {/* Cards Row - Just 2 cards, aligned start? Image has them full width? Image has them nicely sized side by side. */}
                {cardsData.map((card, idx) => (
                    <Card key={idx} className="border-l-4 border-l-cyan-500 shadow-sm">
                        <CardContent className="p-6">
                            <h3 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2">{card.label}</h3>
                            <p className="text-4xl font-bold text-cyan-600">{card.value}</p>
                        </CardContent>
                    </Card>
                ))}

            </div>
            {/* If the image shows cards taking full width or specific width, I can adjust. 
                In the image, the cards are top left, maybe 1/3 width each? 
                But prompt "3 gráficos em 3 colunas". Maybe cards are seperate.
            */}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <ComparisonLineChart
                    title="Centro de Referência, Abordagem Social e Migração"
                    data={lineChart1Data}
                    keys={["Centro de Referência", "Abordagem Social", "Migração"]}
                    colors={["#3b82f6", "#f59e0b", "#8b5cf6"]}
                />
                <GenericPieChart
                    title="Usuários de Drogas"
                    data={pieChartData}
                    colors={["#f59e0b", "#3b82f6"]}
                />
                <GenericLineChart
                    title="Pessoas Recusam Sair das Ruas"
                    data={lineChart2Data}
                    dataKey="Persistem nas Ruas"
                    color="#6366f1"
                />
            </div>
        </div>
    )
}
