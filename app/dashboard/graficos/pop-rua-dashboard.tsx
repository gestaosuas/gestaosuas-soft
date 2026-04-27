
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MonthSelector } from "./month-selector"
import { YearSelector } from "@/components/year-selector"
import { MetricsCards, GenericPieChart, ComparisonLineChart, GenericLineChart } from "./charts"
import { BarChart3, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PopRuaDashboardProps {
    submissions: any[]
    selectedMonth: string
    selectedYear: number
    directorateId: string
    tvMode?: boolean
}

export function PopRuaDashboard({ submissions, selectedMonth, selectedYear, directorateId, tvMode = false }: PopRuaDashboardProps) {
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
        <div className={cn("space-y-6", tvMode && "space-y-4")}>
            {/* O cabeçalho foi movido para o PopRuaPageClient via DirectorateQuickActions */}

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
                    tvMode={tvMode}
                />
                <GenericPieChart
                    title="Usuários de Drogas"
                    data={pieChartData}
                    colors={["#f59e0b", "#3b82f6"]}
                    tvMode={tvMode}
                />
                <GenericLineChart
                    title="Pessoas Recusam Sair das Ruas"
                    data={lineChart2Data}
                    dataKey="Persistem nas Ruas"
                    color="#6366f1"
                    tvMode={tvMode}
                />
            </div>
        </div>
    )
}
