"use client"

import { useMemo } from "react"
import { MetricsCards, GenericLineChart, ComparisonLineChart, GenericPieChart } from "@/app/dashboard/graficos/charts"
import { cn } from "@/lib/utils"

interface CeaiDashboardProps {
    submissions: any[]
    selectedYear: number
    selectedMonth: string
    selectedUnit: string
    tvMode?: boolean
}

export function CeaiDashboard({ 
    submissions: initialSubmissions, 
    selectedYear, 
    selectedMonth, 
    selectedUnit,
    tvMode = false
}: CeaiDashboardProps) {
    const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"]
    
    const filteredSubmissions = useMemo(() => {
        return initialSubmissions.filter(s => s.year === selectedYear)
    }, [initialSubmissions, selectedYear])

    const unitDataByMonth = useMemo(() => {
        const map = new Map<number, any>()
        
        for (const sub of filteredSubmissions) {
            let dataToUse: any = null
            const subData = sub.data
            
            if (selectedUnit === 'all') {
                const sumData: any = {}
                if (subData._is_multi_unit && subData.units) {
                    for (const uName in subData.units) {
                        const uData = subData.units[uName]
                        for (const key in uData) {
                            const val = Number(uData[key])
                            if (!isNaN(val)) {
                                sumData[key] = (sumData[key] || 0) + val
                            }
                        }
                    }
                } else {
                    for (const key in subData) {
                        if (key.startsWith('_')) continue
                        const val = Number(subData[key])
                        if (!isNaN(val)) {
                            sumData[key] = (sumData[key] || 0) + val
                        }
                    }
                }
                dataToUse = sumData
            } else {
                if (subData._is_multi_unit && subData.units?.[selectedUnit]) {
                    dataToUse = subData.units[selectedUnit]
                } else if (subData._unit === selectedUnit) {
                    dataToUse = subData
                }
            }
            
            if (dataToUse) {
                map.set(sub.month, dataToUse)
            }
        }
        return map
    }, [filteredSubmissions, selectedUnit])

    const monthsWithData = useMemo(() => Array.from(unitDataByMonth.keys()).sort((a, b) => b - a), [unitDataByMonth])
    const selectedMonthNum = selectedMonth === 'all' ? 0 : Number(selectedMonth)

    const latestData = useMemo(() => {
        let result: any = {}
        if (selectedMonth === 'all') {
            unitDataByMonth.forEach((mData) => {
                ['inseridos_masc', 'inseridos_fem', 'desligados_masc', 'desligados_fem'].forEach(key => {
                    const val = Number(mData[key])
                    if (!isNaN(val)) result[key] = (result[key] || 0) + val
                })
            })
            if (monthsWithData.length > 0) {
                const lastMonthData = unitDataByMonth.get(monthsWithData[0])
                result.total_inseridos = Number(lastMonthData?.total_inseridos || 0)
                result.atendidos_anterior_masc = Number(lastMonthData?.atendidos_anterior_masc || 0)
                result.atendidos_anterior_fem = Number(lastMonthData?.atendidos_anterior_fem || 0)
            }
        } else {
            result = unitDataByMonth.get(selectedMonthNum) || {}
        }
        return result
    }, [unitDataByMonth, selectedMonth, selectedMonthNum, monthsWithData])

    const getHistory = (id: string) => monthNames.map((name, i) => ({
        name,
        value: Number(unitDataByMonth.get(i + 1)?.[id] || 0)
    }))

    const getTrend = (id: string) => {
        const currentMonthNum = selectedMonthNum || monthsWithData[0] || 0
        if (!currentMonthNum || currentMonthNum === 1) return 0
        const currentVal = Number(unitDataByMonth.get(currentMonthNum)?.[id] || 0)
        const prevVal = Number(unitDataByMonth.get(currentMonthNum - 1)?.[id] || 0)
        if (prevVal === 0) return currentVal > 0 ? 100 : 0
        return Number(((currentVal - prevVal) / prevVal * 100).toFixed(1))
    }

    const cardsData = [
        { label: "Admitidos Masc.", value: Number(latestData.inseridos_masc || 0), color: "#3b82f6", trend: getTrend('inseridos_masc'), history: getHistory('inseridos_masc') },
        { label: "Admitidos Fem.", value: Number(latestData.inseridos_fem || 0), color: "#f472b6", trend: getTrend('inseridos_fem'), history: getHistory('inseridos_fem') },
        { label: "Total Idosos", value: Number(latestData.total_inseridos || 0), color: "#8b5cf6" },
        { 
            label: "Atendidos Mês", 
            value: (Number(latestData.atendidos_anterior_masc || 0) + Number(latestData.atendidos_anterior_fem || 0) + Number(latestData.inseridos_masc || 0) + Number(latestData.inseridos_fem || 0)), 
            color: "#10b981" 
        },
        { label: "Desligados", value: (Number(latestData.desligados_masc || 0) + Number(latestData.desligados_fem || 0)), color: "#ef4444" },
    ]

    const ceaiChartData = useMemo(() => monthNames.map((name, index) => {
        const mData = unitDataByMonth.get(index + 1) || {}
        const prevM = Number(mData.atendidos_anterior_masc || 0)
        const prevF = Number(mData.atendidos_anterior_fem || 0)
        const insM = Number(mData.inseridos_masc || 0)
        const insF = Number(mData.inseridos_fem || 0)
        const desM = Number(mData.desligados_masc || 0)
        const desF = Number(mData.desligados_fem || 0)
        const totalInMonth = prevM + prevF + insM + insF
        return {
            name,
            total: totalInMonth > 0 ? totalInMonth : 0,
            admitidos: insM + insF,
            desligados: desM + desF
        }
    }), [unitDataByMonth])

    const pieData = [
        { name: "Feminino", value: Number(latestData.inseridos_fem || 0) },
        { name: "Masculino", value: Number(latestData.inseridos_masc || 0) }
    ].filter(d => d.value > 0)

    const selectedMonthName = selectedMonth === 'all' ? "Ano Inteiro" : monthNames[selectedMonthNum - 1]

    return (
        <div className={cn("space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000", tvMode && "space-y-4")}>
            <MetricsCards data={cardsData} monthName={selectedMonthName} tvMode={tvMode} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <ComparisonLineChart 
                    title="Admissões x Desligamentos" 
                    data={ceaiChartData.map(d => ({ name: d.name, Admitidos: d.admitidos, Desligados: d.desligados }))} 
                    keys={['Admitidos', 'Desligados']} 
                    colors={['#10b981', '#ef4444']} 
                    tvMode={tvMode}
                />
                <GenericLineChart 
                    title="Evolução de Atendidos no Mês" 
                    data={ceaiChartData} 
                    dataKey="total" 
                    color="#3b82f6" 
                    tvMode={tvMode}
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <GenericPieChart title="Gênero (Admitidos)" data={pieData} colors={['#f472b6', '#3b82f6']} tvMode={tvMode} />
                </div>
                <div className="md:col-span-2 flex flex-col justify-center bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-100 dark:border-zinc-800">
                    <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-2">Resumo Operacional</h3>
                    <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest animate-pulse">
                        Em Desenvolvimento
                    </p>
                </div>
            </div>
            
            <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 text-center pt-8 uppercase tracking-[0.2em]">
                * SISTEMA DE VIGILÂNCIA SOCIOASSISTENCIAL - UBERLÂNDIA-MG
            </div>
        </div>
    )
}
