"use client"

import { useMemo } from "react"
import { MetricsCards, ServicesBarChart, AttendanceLineChart } from "@/app/dashboard/graficos/charts"
import { cn } from "@/lib/utils"

interface SineDashboardProps {
    submissions: any[]
    selectedYear: number
    selectedMonth: string
    directorate: any
    tvMode?: boolean
}

// Extrai dados SINE de uma submission.
// Os dados são salvos com colunas diretas em sine_reports e integrados em data.sine.xxx
function getSineData(subData: any): any {
    if (!subData) return {}
    // Se tiver a chave sine (integrado via cached-data), usa ela
    if (subData.sine && typeof subData.sine === 'object') return subData.sine
    // Fallback: tenta ler direto (submissão legada via form_definition)
    return subData
}

export function SineDashboard({ 
    submissions: initialSubmissions, 
    selectedYear,
    selectedMonth,
    tvMode = false
}: SineDashboardProps) {
    const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"]

    // Colunas conhecidas da tabela sine_reports
    const COL = {
        inseridos:        'inseridos_mercado',
        entrevistas:      'entrevistados',
        vagas:            'vagas_alto_valor',
        seguro:           'curriculos',      // fallback – ajustar se tiver coluna seguro_desemprego
        curriculos:       'curriculos',
        orientacao:       'orientacao_profissional',
        carteira:         'carteira_digital',
        processo:         'processo_seletivo',
        atend_empregador: 'atendimentos',
        atend_trabalhador:'convocacao_trabalhadores',
        proc_admin:       'proc_administrativos',
    }

    const filteredSubmissions = useMemo(() => {
        return initialSubmissions.filter(s => s.year === selectedYear)
    }, [initialSubmissions, selectedYear])

    // Mapa mês → dados SINE (já extraídos de data.sine)
    const dataByMonth = useMemo(() => {
        const map = new Map<number, any>()
        filteredSubmissions.forEach(sub => {
            const sineData = getSineData(sub.data)
            if (Object.keys(sineData).length > 0) {
                map.set(sub.month, sineData)
            }
        })
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
            Object.assign(result, mData)
        }
        return result
    }, [dataByMonth, selectedMonth])

    const getVal = (data: any, col: string) => Number(data?.[col] || 0)

    const getHistory = (col: string) => monthNames.map((name, i) => ({
        name,
        value: getVal(dataByMonth.get(i + 1), col)
    }))

    const getTrend = (col: string) => {
        const monthsWithData = Array.from(dataByMonth.keys()).sort((a, b) => b - a)
        const currentMonthNum = selectedMonth === 'all' ? monthsWithData[0] || 0 : Number(selectedMonth)
        
        if (!currentMonthNum || currentMonthNum === 1) return 0
        const currentVal = getVal(dataByMonth.get(currentMonthNum), col)
        const prevVal = getVal(dataByMonth.get(currentMonthNum - 1), col)
        
        if (prevVal === 0) return currentVal > 0 ? 100 : 0
        return Number(((currentVal - prevVal) / prevVal * 100).toFixed(1))
    }

    const cardsData = [
        { label: "Inseridos no Mercado",  value: getVal(latestData, COL.inseridos),   color: "#3b82f6", trend: getTrend(COL.inseridos),   history: getHistory(COL.inseridos) },
        { label: "Entrevistados",          value: getVal(latestData, COL.entrevistas), color: "#60a5fa", trend: getTrend(COL.entrevistas), history: getHistory(COL.entrevistas) },
        { label: "Vagas Alto Valor",       value: getVal(latestData, COL.vagas),       color: "#0ea5e9", trend: getTrend(COL.vagas),       history: getHistory(COL.vagas) },
        { label: "Primeiro Emprego",  value: getVal(latestData, COL.proc_admin),  color: "#10b981", trend: getTrend(COL.proc_admin),  history: getHistory(COL.proc_admin) },
    ]

    const selectedMonthName = selectedMonth === 'all' ? "Ano Inteiro" : monthNames[Number(selectedMonth) - 1]

    return (
        <div className={cn("space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000", tvMode && "space-y-4")}>
            <MetricsCards data={cardsData} monthName={selectedMonthName} tvMode={tvMode} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
                <ServicesBarChart data={[
                    { name: "Orientação Profissional", value: getVal(latestData, COL.orientacao) },
                    { name: "Carteira Digital",        value: getVal(latestData, COL.carteira) },
                    { name: "Processo Seletivo",       value: getVal(latestData, COL.processo) },
                    { name: "Currículos",              value: getVal(latestData, COL.curriculos) },
                    { name: "Primeiro Emprego",   value: getVal(latestData, COL.proc_admin) }
                ]} tvMode={tvMode} />
                <AttendanceLineChart data={monthNames.map((name, i) => { 
                    const mData = dataByMonth.get(i + 1) || {}; 
                    const emp = (Number(mData['atend_empregador']) || 0) + (Number(mData['atend_online_empregador']) || 0);
                    const trab = (Number(mData['atend_trabalhador']) || 0) + (Number(mData['atend_online_trabalhador']) || 0);
                    return { 
                        name, 
                        empregador: emp, 
                        trabalhador: trab
                    } 
                })} tvMode={tvMode} />
            </div>

            <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 text-center pt-8 uppercase tracking-[0.2em]">
                * SISTEMA DE VIGILÂNCIA SOCIOASSISTENCIAL - UBERLÂNDIA-MG
            </div>
        </div>
    )
}
