"use client"

import { useState, useMemo } from "react"
import { MetricsCards, GenericLineChart, ComparisonLineChart } from "@/app/dashboard/graficos/charts"
import { MonthSelector } from "@/app/dashboard/graficos/month-selector"
import { YearSelector } from "@/components/year-selector"
import { UnitSelector } from "@/app/dashboard/graficos/unit-selector"
import { CRAS_UNITS } from "@/app/dashboard/cras-config"
import { cn } from "@/lib/utils"

interface CrasDashboardProps {
    submissions: any[]
    selectedYear: number
    selectedMonth: string
    selectedUnit: string
    tvMode?: boolean
}

export function CrasDashboard({ 
    submissions: initialSubmissions, 
    selectedYear, 
    selectedMonth, 
    selectedUnit,
    tvMode = false
}: CrasDashboardProps) {
    const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"]
    
    const filteredSubmissions = useMemo(() => {
        return initialSubmissions.filter(s => s.year === selectedYear)
    }, [initialSubmissions, selectedYear])

    // ... (keep the useMemo for unitDataByMonth but use props)
    const unitDataByMonth = useMemo(() => {
        const map = new Map<number, any>()
        
        for (const sub of filteredSubmissions) {
            let dataToUse: any = null
            const subData = sub.data
            
            if (selectedUnit === 'all') {
                const sumData: any = {}
                if (subData._is_multi_unit && subData.units) {
                    // Optimized sum: iterate units then keys once
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
                Object.keys(mData).forEach(key => {
                    const val = Number(mData[key])
                    if (!isNaN(val)) result[key] = (result[key] || 0) + val
                })
            })
            if (monthsWithData.length > 0) {
                const lastMonthData = unitDataByMonth.get(monthsWithData[0])
                result.atual = Number(lastMonthData?.atual || 0)
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

    const desligadas = Number(latestData.desligadas || 0)
    const atual = Number(latestData.atual || 0)
    const taxaRetencaoValue = atual > 0 ? (((atual - desligadas) / atual) * 100).toFixed(1) : "0.0"

    const cardsData = [
        { label: "Ativ. PAIF", value: atual, color: "#3b82f6", trend: getTrend('atual'), history: getHistory('atual') },
        { label: "Visita Dom.", value: Number(latestData.visita_domiciliar || 0), color: "#60a5fa", trend: getTrend('visita_domiciliar'), history: getHistory('visita_domiciliar') },
        { label: "Cadastros Novos", value: Number(latestData.cadastros_novos || 0), color: "#0ea5e9", trend: getTrend('cadastros_novos'), history: getHistory('cadastros_novos') },
        { label: "Atualização Cad.", value: Number(latestData.recadastros || 0), color: "#f59e0b", trend: getTrend('recadastros'), history: getHistory('recadastros') },
        { label: "Admitidas", value: Number(latestData.admitidas || 0), color: "#10b981", trend: getTrend('admitidas'), history: getHistory('admitidas') },
        { label: "Desligadas", value: desligadas, color: "#ef4444", trend: getTrend('desligadas'), history: getHistory('desligadas') },
        { label: "Taxa Retenção", value: `${taxaRetencaoValue}%`, color: "#8b5cf6" },
    ]

    const selectedMonthName = selectedMonth === 'all' ? "Ano Inteiro" : monthNames[selectedMonthNum - 1]

    return (
        <div className={cn("space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000", tvMode && "space-y-4")}>
            <MetricsCards data={cardsData} monthName={selectedMonthName} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-10">
                <ComparisonLineChart 
                    title="Cadastros e Recadastros" 
                    data={monthNames.map((name, i) => ({ 
                        name, 
                        "Cadastros Novos": Number(unitDataByMonth.get(i + 1)?.cadastros_novos || 0), 
                        "Recadastros": Number(unitDataByMonth.get(i + 1)?.recadastros || 0) 
                    }))} 
                    keys={['Cadastros Novos', 'Recadastros']} 
                    colors={['#3b82f6', '#f59e0b']} 
                    tvMode={tvMode}
                />
                <ComparisonLineChart 
                    title="Famílias Admitidas e Desligadas" 
                    data={monthNames.map((name, i) => ({ 
                        name, 
                        "Admitidas": Number(unitDataByMonth.get(i + 1)?.admitidas || 0), 
                        "Desligadas": Number(unitDataByMonth.get(i + 1)?.desligadas || 0) 
                    }))} 
                    keys={['Admitidas', 'Desligadas']} 
                    colors={['#10b981', '#ef4444']} 
                    tvMode={tvMode}
                />
                <GenericLineChart 
                    title="Evolução de Atendimentos" 
                    data={monthNames.map((name, i) => ({ name, value: Number(unitDataByMonth.get(i + 1)?.atendimentos || 0) }))} 
                    dataKey="value" 
                    color="#3b82f6" 
                    tvMode={tvMode}
                />
                <GenericLineChart 
                    title="Famílias em Acompanhamento (PAIF)" 
                    data={monthNames.map((name, i) => ({ name, value: Number(unitDataByMonth.get(i + 1)?.atual || 0) }))} 
                    dataKey="value" 
                    color="#8b5cf6" 
                    tvMode={tvMode}
                />
            </div>
            
            <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 text-center pt-8 uppercase tracking-[0.2em]">
                * SISTEMA DE VIGILÂNCIA SOCIOASSISTENCIAL - UBERLÂNDIA-MG
            </div>
        </div>
    )
}
