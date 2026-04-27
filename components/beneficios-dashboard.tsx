"use client"

import { useMemo } from "react"
import { MetricsCards, GenericLineChart, GenericPieChart } from "@/app/dashboard/graficos/charts"
import { cn } from "@/lib/utils"

interface BeneficiosDashboardProps {
    submissions: any[]
    selectedYear: number
    selectedMonth: string
    tvMode?: boolean
}

export function BeneficiosDashboard({ 
    submissions: initialSubmissions, 
    selectedYear,
    selectedMonth,
    tvMode = false
}: BeneficiosDashboardProps) {
    const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"]
    
    const id_inclusao = "encaminhadas_inclusao_cadunico"
    const id_atualizacao = "encaminhadas_atualizacao_cadunico"
    const id_pro_pao = "pro_pao"
    const id_cesta = "cesta_basica"
    const id_familias_pbf = "familias_pbf"
    const id_pessoas_cadunico = "pessoas_cadunico"
    
    const visitas_ids = [
        { id: "visitas_cadunico", label: "Visitas D. CadÚnico" },
        { id: "visitas_convocacoes", label: "Visitas Convocações" },
        { id: "visita_nucleo_habitacao", label: "Visita Nucleo S. Habitação" },
        { id: "visita_cesta_fraldas_colchoes", label: "Visita D. Cesta Básica" },
        { id: "visita_dmae", label: "Visita DMAE" },
        { id: "visitas_pro_pao", label: "Visitas Pró-pão" }
    ]

    const filteredSubmissions = useMemo(() => {
        return initialSubmissions.filter(s => s.year === selectedYear)
    }, [initialSubmissions, selectedYear])

    const dataByMonth = useMemo(() => {
        const map = new Map<number, any>()
        filteredSubmissions.forEach(sub => map.set(sub.month, sub.data))
        return map
    }, [filteredSubmissions])

    const latestData = useMemo(() => {
        const result: any = {}
        if (selectedMonth === 'all') {
            dataByMonth.forEach((mData) => {
                Object.keys(mData).forEach(key => {
                    const val = Number(mData[key])
                    if (!isNaN(val)) result[key] = (result[key] || 0) + val
                })
            })
        } else {
            const monthNum = Number(selectedMonth)
            const mData = dataByMonth.get(monthNum) || {}
            Object.keys(mData).forEach(key => {
                result[key] = mData[key]
            })
        }
        return result
    }, [dataByMonth, selectedMonth])

    const getHistory = (id: string) => monthNames.map((name, i) => ({
        name,
        value: Number(dataByMonth.get(i + 1)?.[id] || 0)
    }))

    const getTrend = (id: string) => {
        const monthsWithData = Array.from(dataByMonth.keys()).sort((a, b) => b - a)
        const currentMonthNum = selectedMonth === 'all' ? monthsWithData[0] || 0 : Number(selectedMonth)
        
        if (!currentMonthNum || currentMonthNum === 1) return 0
        const currentVal = Number(dataByMonth.get(currentMonthNum)?.[id] || 0)
        const prevVal = Number(dataByMonth.get(currentMonthNum - 1)?.[id] || 0)
        
        if (prevVal === 0) return currentVal > 0 ? 100 : 0
        // Use a safe division to avoid parser confusion
        const diff = currentVal - prevVal
        const trendValue = (diff / prevVal) * 100
        return Number(trendValue.toFixed(1))
    }

    const cardsData = [
        { label: "Inclusão CadÚnico", value: Number(latestData[id_inclusao] || 0), color: "#3b82f6", trend: getTrend(id_inclusao), history: getHistory(id_inclusao) },
        { label: "Atualização CadÚnico", value: Number(latestData[id_atualizacao] || 0), color: "#0ea5e9", trend: getTrend(id_atualizacao), history: getHistory(id_atualizacao) },
        { label: "Pró-Pão Total", value: Number(latestData[id_pro_pao] || 0), color: "#f59e0b", trend: getTrend(id_pro_pao), history: getHistory(id_pro_pao) },
        { label: "Cesta Básica", value: Number(latestData[id_cesta] || 0), color: "#10b981", trend: getTrend(id_cesta), history: getHistory(id_cesta) },
    ]

    const monthNum = selectedMonth === 'all' ? 0 : Number(selectedMonth)
    const selectedMonthName = selectedMonth === 'all' ? "Ano Inteiro" : monthNames[monthNum - 1]

    return (
        <div className={cn("space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000", tvMode && "space-y-4")}>
            <MetricsCards data={cardsData} monthName={selectedMonthName} tvMode={tvMode} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
                <GenericLineChart
                    title="Famílias Beneficiadas no BPF"
                    subtitle={selectedMonth === 'all' ? `Jan - Dez ${selectedYear}` : selectedMonthName}
                    data={monthNames.map((name, i) => ({ name, value: Number(dataByMonth.get(i + 1)?.[id_familias_pbf] || 0) }))}
                    dataKey="value"
                    color="#3b82f6"
                    tvMode={tvMode}
                />
                <GenericLineChart
                    title="Pessoas Cadastradas"
                    subtitle="Tendência Acumulada"
                    data={monthNames.map((name, i) => ({ name, value: Number(dataByMonth.get(i + 1)?.[id_pessoas_cadunico] || 0) }))}
                    dataKey="value"
                    color="#f59e0b"
                    tvMode={tvMode}
                />
                <GenericPieChart
                    title="Visitas Domiciliares"
                    data={visitas_ids.map(v => ({ name: v.label, value: Number(latestData[v.id] || 0) })).filter(d => d.value > 0)}
                    colors={['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316']}
                    tvMode={tvMode}
                />
            </div>
            
            <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 text-center pt-8 uppercase tracking-[0.2em]">
                * SISTEMA DE VIGILÂNCIA SOCIOASSISTENCIAL - UBERLÂNDIA-MG
            </div>
        </div>
    )
}
