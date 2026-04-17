"use client"

import { useState } from "react"
import { YearSelector } from "./year-selector"
import { MonthSelector } from "@/app/dashboard/graficos/month-selector"
import { DirectorateQuickActions } from "./directorate-quick-actions"
import { CreasDashboard } from "@/app/dashboard/graficos/creas-dashboard"
import { FilePlus, Database, FileText, FolderOpen } from "lucide-react"

interface CreasPageClientProps {
    directorate: any
    submissions: any[]
    currentYear: number
}

export function CreasPageClient({
    directorate,
    submissions,
    currentYear
}: CreasPageClientProps) {
    const [selectedYear, setSelectedYear] = useState(currentYear)
    const [selectedMonth, setSelectedMonth] = useState("all")

    // Filtrar submissions pelo ano selecionado para o dashboard
    const filteredSubmissions = submissions.filter(s => s.year === selectedYear)

    const actions = [
        { label: "Atualizar Dados", href: `/dashboard/relatorios/novo?setor=creas&directorate_id=${directorate.id}`, icon: FilePlus },
        { label: "Ver Dados", href: `/dashboard/dados?setor=creas&directorate_id=${directorate.id}`, icon: Database },
        { label: "Relatório Mensal", href: `/dashboard/relatorios/mensal?setor=creas&directorate_id=${directorate.id}`, icon: FileText },
        { label: "Ver Relatórios", href: `/dashboard/relatorios/lista?setor=creas&directorate_id=${directorate.id}`, icon: FolderOpen },
    ]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-1000">
            {/* Header Filters & Quick Actions */}
            <DirectorateQuickActions 
                directorate={directorate}
                actions={actions}
                rightSection={
                    <div className="flex items-center gap-2">
                        <YearSelector 
                            currentYear={selectedYear} 
                            onYearChange={setSelectedYear}
                        />
                        <MonthSelector 
                            currentMonth={selectedMonth} 
                            onMonthChange={setSelectedMonth}
                        />
                    </div>
                }
            />

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
