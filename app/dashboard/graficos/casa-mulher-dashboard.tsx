"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MetricsCards, GenericPieChart, ServicesBarChart } from "./charts"

interface CasaMulherDashboardProps {
    submissions: any[]
    selectedMonth: string
    selectedYear: number
}

export function CasaMulherDashboard({ submissions, selectedMonth, selectedYear }: CasaMulherDashboardProps) {
    const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"]
    
    // Data Map by Month (1-12)
    const dataByMonth = new Map<number, any>()
    submissions.forEach(sub => dataByMonth.set(sub.month, sub.data))

    const monthsWithDataGlobal = Array.from(dataByMonth.keys()).sort((a, b) => b - a)
    const selectedMonthNum = selectedMonth === 'all' ? 0 : Number(selectedMonth)
    
    let latestData: any = {}
    if (selectedMonth === 'all') {
        dataByMonth.forEach((mData) => {
            Object.keys(mData).forEach(key => {
                const val = Number(mData[key])
                if (!isNaN(val)) latestData[key] = (latestData[key] || 0) + val
            })
        })
    } else {
        latestData = dataByMonth.get(selectedMonthNum) || {}
    }

    const sumFields = (data: any, fields: string[]) => fields.reduce((acc, f) => acc + (Number(data[f]) || 0), 0)

    const getTrend = (id: string) => {
        const currentMonthNum = selectedMonthNum || monthsWithDataGlobal[0] || 0
        if (!currentMonthNum || currentMonthNum === 1) return 0
        const currentVal = Number(dataByMonth.get(currentMonthNum)?.[id] || 0)
        const prevVal = Number(dataByMonth.get(currentMonthNum - 1)?.[id] || 0)
        if (prevVal === 0) return currentVal > 0 ? 100 : 0
        return Number(((currentVal - prevVal) / prevVal * 100).toFixed(1))
    }

    const getHistory = (id: string) => monthNames.map((name, i) => ({
        name,
        value: Number(dataByMonth.get(i + 1)?.[id] || 0)
    }))

    // Keys
    const k_vio_domestica = "cm_atend_mulheres_atendidas"
    const k_atend_diversos = "div_atend_mulheres_atendidas"
    const k_nucleo_diversidade = "div_atend_nucleo_diversidade"

    const cardsData = [
        { label: "Violência Doméstica (Total)", value: Number(latestData[k_vio_domestica] || 0), color: "#0ea5e9", trend: getTrend(k_vio_domestica), history: getHistory(k_vio_domestica) },
        { label: "Atend. Diversos (Total)", value: Number(latestData[k_atend_diversos] || 0), color: "#0ea5e9", trend: getTrend(k_atend_diversos), history: getHistory(k_atend_diversos) },
        { label: "Núcleo Diversidade (Total)", value: Number(latestData[k_nucleo_diversidade] || 0), color: "#0ea5e9", trend: getTrend(k_nucleo_diversidade), history: getHistory(k_nucleo_diversidade) },
    ]

    // Faixa Etária (Rosca)
    let ageFields = [
        { name: "16 à 17 anos", keys: ["cm_faixa_16_17", "div_faixa_16_17"] },
        { name: "18 à 30 anos", keys: ["cm_faixa_18_30", "div_faixa_18_30"] },
        { name: "31 à 40 anos", keys: ["cm_faixa_31_40", "div_faixa_31_40"] },
        { name: "41 à 50 anos", keys: ["cm_faixa_41_50", "div_faixa_41_50"] },
        { name: "51 à 60 anos", keys: ["cm_faixa_51_60", "div_faixa_51_60"] },
        { name: "Acima de 60", keys: ["cm_faixa_acima_60", "div_faixa_acima_60"] }
    ]
    const ageChartData = ageFields.map(field => ({
        name: field.name,
        value: sumFields(latestData, field.keys)
    })).filter(d => d.value > 0).sort((a, b) => b.value - a.value)

    // Cor/Raça (Rosca)
    let raceFields = [
        { name: "Branca", keys: ["cm_raca_branca", "div_raca_branca"] },
        { name: "Preta", keys: ["cm_raca_preta", "div_raca_preta"] },
        { name: "Parda", keys: ["cm_raca_parda", "div_raca_parda"] },
        { name: "Amarela", keys: ["cm_raca_amarelo", "div_raca_amarela"] },
        { name: "Indígena", keys: ["cm_raca_indigena", "div_raca_indigena"] },
        { name: "Não Consta", keys: ["cm_raca_nao_consta", "div_raca_nao_consta"] }
    ]
    const raceChartData = raceFields.map(field => ({
        name: field.name,
        value: sumFields(latestData, field.keys)
    })).filter(d => d.value > 0).sort((a, b) => b.value - a.value)

    // Violência Bar Chart
    let violFields = [
        { name: "Física", key: "cm_violencia_fisica" },
        { name: "Moral", key: "cm_violencia_moral" },
        { name: "Psicológica", key: "cm_violencia_psicologica" },
        { name: "Sexual", key: "cm_violencia_sexual" },
        { name: "Patrimonial", key: "cm_violencia_patrimonial" },
        { name: "Nenhuma", key: "cm_violencia_nenhuma" },
        { name: "Outras", key: "cm_violencia_outras" },
    ]
    const violChartData = violFields.map(field => ({
        name: field.name,
        value: Number(latestData[field.key]) || 0
    })).sort((a, b) => b.value - a.value).filter(d => d.value > 0)

    const selectedMonthName = selectedMonth === 'all' ? "Ano Inteiro" : monthNames[selectedMonthNum - 1]

    return (
        <div className="space-y-6">
            <MetricsCards data={cardsData} monthName={selectedMonthName} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <GenericPieChart title="Atendidas por Faixa Etária" data={ageChartData} colors={['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']} />
                <GenericPieChart title="Atendidas por Cor/Raça" data={raceChartData} colors={['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']} />
                <ServicesBarChart title="Tipos de Violência (Doméstica)" data={violChartData} color="#f43f5e" />
            </div>
        </div>
    )
}
