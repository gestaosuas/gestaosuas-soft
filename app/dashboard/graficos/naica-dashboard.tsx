"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MetricsCards, ComparisonLineChart, GenericLineChart, GenericPieChart } from "./charts"
import { NAICA_UNITS } from "../naica-config"

interface NaicaDashboardProps {
    submissions: any[]
    selectedMonth: string
    selectedYear: number
    selectedUnit?: string
}

export function NaicaDashboard({ 
    submissions, 
    selectedMonth, 
    selectedYear,
    selectedUnit = 'all'
}: NaicaDashboardProps) {
    const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"]
    
    const unitDataByMonth = new Map<number, any>()

    submissions.forEach(sub => {
        let dataToUse = null
        if (selectedUnit === 'all') {
            const sumData: any = {}
            if (sub.data._is_multi_unit && sub.data.units) {
                Object.values(sub.data.units).forEach((uData: any) => {
                    Object.keys(uData).forEach(key => {
                        const val = Number(uData[key])
                        if (!isNaN(val)) {
                            sumData[key] = (sumData[key] || 0) + val
                        }
                    })
                })
            } else {
                Object.keys(sub.data).forEach(key => {
                    const val = Number(sub.data[key])
                    if (!isNaN(val)) {
                        sumData[key] = (sumData[key] || 0) + val
                    }
                })
            }
            dataToUse = sumData
        } else {
            if (sub.data._is_multi_unit && sub.data.units?.[selectedUnit]) {
                dataToUse = sub.data.units[selectedUnit]
            } else if (sub.data._unit === selectedUnit) {
                dataToUse = sub.data
            }
        }
        if (dataToUse) unitDataByMonth.set(sub.month, dataToUse)
    })

    const monthsWithData = Array.from(unitDataByMonth.keys()).sort((a, b) => b - a)
    const selectedMonthNum = selectedMonth === 'all' ? 0 : Number(selectedMonth)
    let latestData: any = {}
    let selectedMonthName = ""

    if (selectedMonth === 'all') {
        selectedMonthName = "Ano Inteiro"
        unitDataByMonth.forEach((mData) => {
            ['inseridos_masc', 'inseridos_fem', 'desligados_masc', 'desligados_fem'].forEach(key => {
                const val = Number(mData[key])
                if (!isNaN(val)) latestData[key] = (latestData[key] || 0) + val
            })
        })
        if (monthsWithData.length > 0) {
            const lastMonthData = unitDataByMonth.get(monthsWithData[0])
            latestData.total_atendidas = lastMonthData?.total_atendidas
        }
    } else {
        latestData = unitDataByMonth.get(selectedMonthNum) || {}
        selectedMonthName = monthNames[selectedMonthNum - 1] || "N/A"
    }

    const getHistory = (id: string) => monthNames.map((name, i) => ({
        name,
        value: Number(unitDataByMonth.get(i + 1)?.[id] || 0)
    }))

    const getTrend = (id: string) => {
        const currentMonthNum = selectedMonthNum || (monthsWithData.length > 0 ? monthsWithData[0] : 0)
        if (!currentMonthNum || currentMonthNum === 1) return 0
        const currentVal = Number(unitDataByMonth.get(currentMonthNum)?.[id] || 0)
        const prevVal = Number(unitDataByMonth.get(currentMonthNum - 1)?.[id] || 0)
        if (prevVal === 0) return currentVal > 0 ? 100 : 0
        return Number(((currentVal - prevVal) / prevVal * 100).toFixed(1))
    }

    const emAcompanhamento = (Number(latestData.total_atendidas) || 0)
    const capacidadeTotal = selectedUnit === 'all' ? 120 * NAICA_UNITS.length : 120
    const taxaOcupacao = emAcompanhamento > 0 ? ((emAcompanhamento / capacidadeTotal) * 100).toFixed(1) : "0.0"

    const cardsData = [
        { label: "Total em Acompanhamento", value: emAcompanhamento, color: "#3b82f6", trend: getTrend('total_atendidas'), history: getHistory('total_atendidas') },
        { label: "Taxa de Ocupação", value: `${taxaOcupacao}%`, color: "#8b5cf6" },
        { label: "Admitidos Masculino", value: Number(latestData.inseridos_masc || 0), color: "#3b82f6", trend: getTrend('inseridos_masc'), history: getHistory('inseridos_masc') },
        { label: "Admitidos Feminino", value: Number(latestData.inseridos_fem || 0), color: "#f472b6", trend: getTrend('inseridos_fem'), history: getHistory('inseridos_fem') },
    ]

    const naicaChartData = monthNames.map((name, index) => {
        const mData = unitDataByMonth.get(index + 1) || {}
        return {
            name,
            acompanhamento: Number(mData.total_atendidas || 0),
            admitidos: (Number(mData.inseridos_masc) || 0) + (Number(mData.inseridos_fem) || 0),
            desligados: (Number(mData.desligados_masc) || 0) + (Number(mData.desligados_fem) || 0)
        }
    })

    const pieData = [
        { name: "Feminino", value: Number(latestData.inseridos_fem || 0) },
        { name: "Masculino", value: Number(latestData.inseridos_masc || 0) }
    ].filter(d => d.value > 0)

    return (
        <div className="space-y-6">
            <MetricsCards data={cardsData} monthName={selectedMonthName} compact />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <GenericLineChart 
                    title="Acompanhamento (Crescimento)" 
                    data={naicaChartData} 
                    dataKey="acompanhamento" 
                    color="#3b82f6" 
                />
                <ComparisonLineChart 
                    title="Movimentação (Admitidos x Desligados)" 
                    data={naicaChartData.map(d => ({ name: d.name, Admitidos: d.admitidos, Desligados: d.desligados }))} 
                    keys={['Admitidos', 'Desligados']} 
                    colors={['#10b981', '#ef4444']} 
                />
                <GenericPieChart 
                    title="Perfil dos Admitidos" 
                    data={pieData} 
                    colors={['#f472b6', '#3b82f6']} 
                />
            </div>
        </div>
    )
}
