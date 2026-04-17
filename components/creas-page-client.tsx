"use client"

import { useState } from "react"
import { YearSelector } from "./year-selector"
import { MonthSelector } from "@/app/dashboard/graficos/month-selector"
import { DirectorateQuickActions } from "./directorate-quick-actions"
import { CreasDashboard } from "@/app/dashboard/graficos/creas-dashboard"
import { FilePlus, Database, FileText, FolderOpen, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Card, CardTitle } from "@/components/ui/card"

interface CreasPageClientProps {
    directorate: any
    submissions: any[]
    currentYear: number
    latestMonth?: string | null
}

export function CreasPageClient({
    directorate,
    submissions,
    currentYear,
    latestMonth
}: CreasPageClientProps) {
    const [selectedYear, setSelectedYear] = useState(currentYear)
    const [selectedMonth, setSelectedMonth] = useState("all")

    // Filtrar submissions pelo ano selecionado para o dashboard
    const filteredSubmissions = submissions.filter(s => s.year === selectedYear)

    const operations = [
        { label: "Atualizar Dados", href: `/dashboard/relatorios/novo?setor=creas&directorate_id=${directorate.id}`, icon: FilePlus, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20", border: "hover:border-indigo-500" },
        { label: "Ver Dados", href: `/dashboard/dados?setor=creas&directorate_id=${directorate.id}`, icon: Database, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "hover:border-emerald-500" },
        { label: "Relatório Mensal", href: `/dashboard/relatorios/mensal?setor=creas&directorate_id=${directorate.id}`, icon: FileText, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20", border: "hover:border-violet-500" },
        { label: "Ver Relatórios", href: `/dashboard/relatorios/lista?setor=creas&directorate_id=${directorate.id}`, icon: FolderOpen, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-900/20", border: "hover:border-sky-500" },
    ]

    const headerFilters = (
        <div className="flex items-center gap-2">
            <YearSelector 
                currentYear={selectedYear} 
                onChange={setSelectedYear}
            />
            <MonthSelector 
                currentMonth={selectedMonth} 
                onMonthChange={setSelectedMonth}
            />
        </div>
    )

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-1000">
            <DirectorateQuickActions 
                title={directorate.name}
                actions={headerFilters}
            >
                <div className="p-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-4 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                        <h3 className="text-[10px] font-black text-blue-900/40 dark:text-blue-400/40 uppercase tracking-[0.2em]">Operações CREAS</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {operations.map((item, idx) => (
                            <Link key={idx} href={item.href} className="group">
                                <Card className={`h-full min-h-[100px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${item.border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-4 text-center relative overflow-hidden`}>
                                    <div className={`p-2.5 ${item.bg} rounded-lg group-hover:bg-blue-600 transition-all duration-300 mb-2 shadow-sm relative z-10`}>
                                        <item.icon className={`w-5 h-5 ${item.color} group-hover:text-white transition-colors`} />
                                    </div>
                                    <CardTitle className="text-[11px] font-extrabold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">{item.label}</CardTitle>
                                    
                                    {item.label === "Atualizar Dados" && latestMonth && (
                                        <div className="mt-2 flex items-center justify-center gap-1 px-1.5 py-0.5 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-full w-fit relative z-10 mx-auto">
                                            <CheckCircle2 className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                                            <span className="text-[8px] font-black text-green-700 dark:text-green-400 uppercase tracking-tight">Vigência: {latestMonth}</span>
                                        </div>
                                    )}
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </DirectorateQuickActions>

            {/* Dashboard Principal */}
            <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm p-6 rounded-[2rem] border border-zinc-200/50 dark:border-zinc-800/50">
                <CreasDashboard 
                    submissions={filteredSubmissions}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                />
            </div>

            <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 text-center pt-2 uppercase tracking-[0.2em]">
                * SISTEMA DE VIGILÂNCIA SOCIOASSISTENCIAL - UBERLÂNDIA-MG
            </div>
        </div>
    )
}
