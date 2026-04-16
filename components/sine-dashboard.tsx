"use client"

import { useMemo } from "react"
import { MetricsCards, ServicesBarChart, AttendanceLineChart } from "@/app/dashboard/graficos/charts"
import { FormDefinition } from "@/components/form-engine"

interface SineDashboardProps {
    submissions: any[]
    selectedYear: number
    selectedMonth: string
    directorate: any
}

function findFieldId(fields: any[], keywords: string[]): string | undefined {
    const field = fields.find(f => {
        const label = f.label.toLowerCase()
        return keywords.every(k => label.includes(k.toLowerCase()))
    })
    return field?.id
}

export function SineDashboard({ 
    submissions: initialSubmissions, 
    selectedYear,
    selectedMonth,
    directorate
}: SineDashboardProps) {
    const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"]
    
    const formDef = directorate.form_definition as FormDefinition
    const allFields = formDef?.sections?.flatMap(s => s.fields) || []

    const ids = useMemo(() => ({
        inseridos: findFieldId(allFields, ['Inseridos', 'Mercado']),
        entrevistas: findFieldId(allFields, ['Entrevistas']),
        vagas: findFieldId(allFields, ['Vagas', 'Captadas']),
        seguro: findFieldId(allFields, ['Seguro', 'Desemprego']),
        curriculos: findFieldId(allFields, ['Currículos']),
        orientacao: findFieldId(allFields, ['Orientação', 'Profissional']),
        carteira: findFieldId(allFields, ['Carteira', 'digital']),
        processo: findFieldId(allFields, ['Processo', 'seletivo']),
        atend_empregador: findFieldId(allFields, ['Atendimento', 'Empregador']),
        atend_trabalhador: findFieldId(allFields, ['Atendimento', 'Trabalhador']),
    }), [allFields])

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
        const trendValue = ((currentVal - prevVal) / prevVal) * 100
        return Number(trendValue.toFixed(1))
    }

    const cardsData = [
        { label: "Inseridos no Mercado", value: Number(latestData[ids.inseridos || ''] || 0), color: "#3b82f6", trend: getTrend(ids.inseridos || ''), history: getHistory(ids.inseridos || '') },
        { label: "Entrevistas", value: Number(latestData[ids.entrevistas || ''] || 0), color: "#60a5fa", trend: getTrend(ids.entrevistas || ''), history: getHistory(ids.entrevistas || '') },
        { label: "Vagas Captadas", value: Number(latestData[ids.vagas || ''] || 0), color: "#0ea5e9", trend: getTrend(ids.vagas || ''), history: getHistory(ids.vagas || '') },
        { label: "Seguro Desemprego", value: Number(latestData[ids.seguro || ''] || 0), color: "#f59e0b", trend: getTrend(ids.seguro || ''), history: getHistory(ids.seguro || '') },
        { label: "Currículos", value: Number(latestData[ids.curriculos || ''] || 0), color: "#10b981", trend: getTrend(ids.curriculos || ''), history: getHistory(ids.curriculos || '') },
    ]

    const selectedMonthName = selectedMonth === 'all' ? "Ano Inteiro" : monthNames[Number(selectedMonth) - 1]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <MetricsCards data={cardsData} monthName={selectedMonthName} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
                <ServicesBarChart data={[
                    { name: "Orientação Profissional", value: Number(latestData[ids.orientacao || ''] || 0) },
                    { name: "Carteira Digital", value: Number(latestData[ids.carteira || ''] || 0) },
                    { name: "Processo Seletivo", value: Number(latestData[ids.processo || ''] || 0) },
                    { name: "Currículos", value: Number(latestData[ids.curriculos || ''] || 0) },
                    { name: "Seguro Desemprego", value: Number(latestData[ids.seguro || ''] || 0) }
                ]} />
                <AttendanceLineChart data={monthNames.map((name, i) => { 
                    const mData = dataByMonth.get(i + 1) || {}; 
                    return { 
                        name, 
                        empregador: Number(mData[ids.atend_empregador || ''] || 0), 
                        trabalhador: Number(mData[ids.atend_trabalhador || ''] || 0) 
                    } 
                })} />
            </div>

            <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 text-center pt-8 uppercase tracking-[0.2em]">
                * SISTEMA DE VIGILÂNCIA SOCIOASSISTENCIAL - UBERLÂNDIA-MG
            </div>
        </div>
    )
}
