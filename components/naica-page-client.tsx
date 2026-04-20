"use client"

import { useState } from "react"
import { YearSelector } from "./year-selector"
import { MonthSelector } from "@/app/dashboard/graficos/month-selector"
import { UnitSelector } from "@/app/dashboard/graficos/unit-selector"
import { DirectorateQuickActions } from "./directorate-quick-actions"
import { NaicaDashboard } from "@/app/dashboard/graficos/naica-dashboard"
import { Database, FileText, FolderOpen, FilePlus, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Card, CardTitle } from "@/components/ui/card"

interface NaicaPageClientProps {
    directorate: any
    submissions: any[]
    currentYear: number
    filteredNAICA: string[]
}

export function NaicaPageClient({
    directorate,
    submissions,
    currentYear,
    filteredNAICA
}: NaicaPageClientProps) {
    const [selectedYear, setSelectedYear] = useState(currentYear)
    const [selectedMonth, setSelectedMonth] = useState("all")
    const [selectedUnit, setSelectedUnit] = useState("all")

    const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]
    
    const getMonthName = (month: number) => monthNames[month - 1]

    // Filtrar submissions pelo ano selecionado para o dashboard
    const filteredSubmissions = submissions.filter(s => s.year === selectedYear)

    const globalOperations = [
        { label: "Ver Dados Consolidados", href: `/dashboard/dados?setor=naica&directorate_id=${directorate.id}`, icon: Database, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
        { label: "Relatório Mensal", href: `/dashboard/relatorios/mensal?setor=naica&directorate_id=${directorate.id}`, icon: FileText, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20" },
        { label: "Ver Relatórios", href: `/dashboard/relatorios/lista?setor=naica&directorate_id=${directorate.id}`, icon: FolderOpen, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-900/20" },
    ]

    const headerFilters = (
        <div className="flex items-center gap-3">
            <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Unidade</span>
                <UnitSelector 
                    currentUnit={selectedUnit} 
                    units={filteredNAICA} 
                    onChange={setSelectedUnit} 
                />
            </div>
            <div className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1"></div>
            <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Referência</span>
                <div className="flex items-center gap-2">
                    <YearSelector 
                        currentYear={selectedYear} 
                        onChange={setSelectedYear}
                    />
                    <MonthSelector 
                        currentMonth={selectedMonth} 
                        onChange={setSelectedMonth}
                    />
                </div>
            </div>
        </div>
    )

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-1000">
            <DirectorateQuickActions 
                title={directorate.name}
                actions={headerFilters}
            >
                <div className="p-1 space-y-6">
                    {/* Seção 1: Operações Globais */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-4 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                            <h3 className="text-[10px] font-black text-blue-900/40 dark:text-blue-400/40 uppercase tracking-[0.2em]">Consolidado NAICA</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {globalOperations.map((item, idx) => (
                                <Link key={idx} href={item.href} className="group">
                                    <Card className="h-full min-h-[80px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none hover:border-blue-500 transition-all duration-300 rounded-xl group-hover:shadow-lg flex items-center p-4 gap-4 relative overflow-hidden">
                                        <div className={`p-2.5 ${item.bg} rounded-lg group-hover:bg-blue-600 transition-all duration-300 shadow-sm relative z-10`}>
                                            <item.icon className={`w-5 h-5 ${item.color} group-hover:text-white transition-colors`} />
                                        </div>
                                        <CardTitle className="text-[12px] font-extrabold text-blue-800 dark:text-blue-100 transition-colors leading-tight relative z-10">{item.label}</CardTitle>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Seção 2: Unidades do NAICA */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-4 bg-green-600 dark:bg-green-400 rounded-full"></div>
                            <h3 className="text-[10px] font-black text-green-900/40 dark:text-green-400/40 uppercase tracking-[0.2em]">Sedes NAICA (Atualizar)</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {filteredNAICA.map((unit, idx) => {
                                const unitSubmissions = submissions?.filter(s => {
                                    if (s.data._is_multi_unit && s.data.units) {
                                        return !!s.data.units[unit]
                                    }
                                    return s.data._unit === unit
                                })
                                const unitLatestSub = unitSubmissions?.[0]
                                const latestUnitMonth = unitLatestSub ? getMonthName(unitLatestSub.month) : null

                                return (
                                    <Link key={idx} href={`/dashboard/relatorios/novo?setor=naica&directorate_id=${directorate.id}&unit=${encodeURIComponent(unit)}`} className="group">
                                        <Card className="h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none hover:border-green-500 transition-all duration-300 rounded-xl group-hover:shadow-md flex flex-col items-center justify-center p-3 text-center relative overflow-hidden">
                                            <div className="p-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-md group-hover:bg-green-600 transition-all duration-300 mb-1.5 relative z-10">
                                                <FilePlus className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                                            </div>
                                            <CardTitle className="text-[10px] font-bold text-zinc-700 dark:text-zinc-200 transition-colors leading-tight mb-1 relative z-10">{unit}</CardTitle>
                                            
                                            {latestUnitMonth && (
                                                <div className="flex items-center justify-center gap-1 px-1.5 py-0.5 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-full w-fit relative z-10">
                                                    <CheckCircle2 className="w-2 h-2 text-green-600 dark:text-green-400" />
                                                    <span className="text-[7px] font-black text-green-700 dark:text-green-400 uppercase tracking-tight">Mês: {latestUnitMonth}</span>
                                                </div>
                                            )}
                                        </Card>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </DirectorateQuickActions>

            {/* Dashboard Principal */}
            <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm p-6 rounded-[2rem] border border-zinc-200/50 dark:border-zinc-800/50">
                <NaicaDashboard 
                    submissions={filteredSubmissions}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    selectedUnit={selectedUnit}
                />
            </div>

            <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 text-center pt-2 uppercase tracking-[0.2em]">
                * SISTEMA DE VIGILÂNCIA SOCIOASSISTENCIAL - UBERLÂNDIA-MG
            </div>
        </div>
    )
}
