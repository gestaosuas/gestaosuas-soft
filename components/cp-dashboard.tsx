"use client"

import { useMemo } from "react"
import { MetricsCards, GenericLineChart, ComparisonLineChart, GenderPieChart } from "@/app/dashboard/graficos/charts"
import { CP_FORM_DEFINITION } from "@/app/dashboard/cp-config"

interface CpDashboardProps {
    submissions: any[]
    selectedYear: number
    selectedMonth: string
}

export function CpDashboard({ 
    submissions: initialSubmissions, 
    selectedYear,
    selectedMonth 
}: CpDashboardProps) {
    const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"]
    
    const cpFields = CP_FORM_DEFINITION.sections.flatMap(s => s.fields)
    const id_concluintes = "resumo_concluintes"
    const id_cursos = "resumo_cursos"
    const id_turmas = "resumo_turmas"
    const id_homens = "resumo_homens"
    const id_mulheres = "resumo_mulheres"
    const atendimentosFields = cpFields.filter(f => f.id.endsWith('_atendimentos')).map(f => f.id)
    const procedimentosFields = cpFields.filter(f => f.id.endsWith('_procedimentos')).map(f => f.id)
    
    const sumFields = (data: any, fields: string[]) => fields.reduce((acc, f) => acc + (Number(data[f]) || 0), 0)

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

    const totalCursos = useMemo(() => {
        let total = 0
        dataByMonth.forEach(d => { total += Number(d[id_cursos] || 0); })
        return total
    }, [dataByMonth])

    const totalTurmas = useMemo(() => {
        let total = 0
        dataByMonth.forEach(d => { total += Number(d[id_turmas] || 0); })
        return total
    }, [dataByMonth])

    const getHistory = (id: string, isSumField = false, fields?: string[]) => monthNames.map((name, i) => ({
        name,
        value: isSumField && fields ? sumFields(dataByMonth.get(i + 1) || {}, fields) : Number(dataByMonth.get(i + 1)?.[id] || 0)
    }))

    const getTrend = (id: string, isSumField = false, fields?: string[]) => {
        const monthsWithData = Array.from(dataByMonth.keys()).sort((a, b) => b - a)
        const currentMonthNum = selectedMonth === 'all' ? monthsWithData[0] || 0 : Number(selectedMonth)
        
        if (!currentMonthNum || currentMonthNum === 1) return 0
        const currentVal = isSumField && fields ? sumFields(dataByMonth.get(currentMonthNum) || {}, fields) : Number(dataByMonth.get(currentMonthNum)?.[id] || 0)
        const prevVal = isSumField && fields ? sumFields(dataByMonth.get(currentMonthNum - 1) || {}, fields) : Number(dataByMonth.get(currentMonthNum - 1)?.[id] || 0)
        
        if (prevVal === 0) return currentVal > 0 ? 100 : 0
        const diff = currentVal - prevVal
        const trendValue = (diff / prevVal) * 100
        return Number(trendValue.toFixed(1))
    }

    const cardsData = [
        { label: "Concluintes", value: Number(latestData[id_concluintes] || 0), color: "#3b82f6", trend: getTrend(id_concluintes), history: getHistory(id_concluintes) },
        { label: "Atendimentos", value: sumFields(latestData, atendimentosFields), color: "#60a5fa", trend: getTrend('', true, atendimentosFields), history: getHistory('', true, atendimentosFields) },
        { label: "Procedimentos", value: sumFields(latestData, procedimentosFields), color: "#0ea5e9", trend: getTrend('', true, procedimentosFields), history: getHistory('', true, procedimentosFields) },
        { label: "Cursos Total", value: totalCursos, color: "#f59e0b" },
        { label: "Turmas Total", value: totalTurmas, color: "#10b981" },
    ]

    const selectedMonthName = selectedMonth === 'all' ? "Ano Inteiro" : monthNames[Number(selectedMonth) - 1]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <MetricsCards data={cardsData} monthName={selectedMonthName} />

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mt-10">
                <GenericLineChart title="Concluintes" data={monthNames.map((name, i) => ({ name, value: Number(dataByMonth.get(i + 1)?.[id_concluintes] || 0) }))} dataKey="value" color="#0ea5e9" />
                <ComparisonLineChart title="Atendimentos e Procedimentos" data={monthNames.map((name, i) => { const mData = dataByMonth.get(i + 1) || {}; return { name, Atendimentos: sumFields(mData, atendimentosFields), Procedimentos: sumFields(mData, procedimentosFields) } })} keys={['Atendimentos', 'Procedimentos']} colors={['#3b82f6', '#10b981']} />
                <GenderPieChart data={[{ name: "Homem", value: Number(latestData[id_homens] || 0) }, { name: "Mulher", value: Number(latestData[id_mulheres] || 0) }].filter(d => d.value > 0)} />
            </div>

            <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 text-center pt-8 uppercase tracking-[0.2em]">
                * SISTEMA DE VIGILÂNCIA SOCIOASSISTENCIAL - UBERLÂNDIA-MG
            </div>
        </div>
    )
}
