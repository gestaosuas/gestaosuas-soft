"use client"

import { useState } from "react"
import { DirectorateQuickActions } from "@/components/directorate-quick-actions"
import { BeneficiosDashboard } from "@/components/beneficios-dashboard"
import { YearSelector } from "@/components/year-selector"
import { MonthSelector } from "@/app/dashboard/graficos/month-selector"
import { Database, FileText, FolderOpen, FilePlus } from "lucide-react"
import Link from "next/link"
import { Card, CardTitle } from "@/components/ui/card"

interface BeneficiosPageClientProps {
    directorate: any
    submissions: any[]
    currentYear: number
    tvMode?: boolean
}

export function BeneficiosPageClient({
    directorate,
    submissions,
    currentYear: initialYear,
    tvMode = false
}: BeneficiosPageClientProps) {
    const [selectedYear, setSelectedYear] = useState(initialYear)
    const [selectedMonth, setSelectedMonth] = useState<string>("all")

    const getCardTheme = (label: string) => {
        if (label.includes("Atualizar")) return { base: "indigo", border: "hover:border-indigo-500", iconBg: "bg-indigo-50 dark:bg-indigo-900/20", iconActive: "group-hover:bg-indigo-600", iconText: "text-indigo-600 dark:text-indigo-400" };
        if (label.includes("Ver Dados") || label.includes("Dados")) return { base: "emerald", border: "hover:border-emerald-500", iconBg: "bg-emerald-50 dark:bg-emerald-900/20", iconActive: "group-hover:bg-emerald-600", iconText: "text-emerald-600 dark:text-emerald-400" };
        if (label.includes("Dashboard") || label.includes("Gráficos")) return { base: "amber", border: "hover:border-amber-500", iconBg: "bg-amber-50 dark:bg-amber-900/20", iconActive: "group-hover:bg-amber-600", iconText: "text-amber-600 dark:text-amber-400" };
        if (label.includes("Mensal")) return { base: "violet", border: "hover:border-violet-500", iconBg: "bg-violet-50 dark:bg-violet-900/20", iconActive: "group-hover:bg-violet-600", iconText: "text-violet-600 dark:text-violet-400" };
        if (label.includes("Ver Relatórios") || label.includes("Histórico")) return { base: "sky", border: "hover:border-sky-500", iconBg: "bg-sky-50 dark:bg-sky-900/20", iconActive: "group-hover:bg-sky-600", iconText: "text-sky-600 dark:text-sky-400" };
        return { base: "zinc", border: "hover:border-zinc-500", iconBg: "bg-zinc-50 dark:bg-zinc-800", iconActive: "group-hover:bg-zinc-600", iconText: "text-zinc-500" };
    }

    const filters = (
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
    )

    return (
        <div className="space-y-8">
            <DirectorateQuickActions 
                title={directorate.name} 
                defaultOpen={false}
                actions={filters}
                tvMode={tvMode}
            >
                {!tvMode && (
                    <div className="space-y-8 p-1">
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-4 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                            <h3 className="text-[10px] font-black text-blue-900/40 dark:text-blue-400/40 uppercase tracking-[0.2em]">Painel de Gestão Direta</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: "Atualizar Dados", href: `/dashboard/relatorios/novo?setor=beneficios&directorate_id=${directorate.id}`, icon: FilePlus },
                                { label: "Ver Dados", href: `/dashboard/dados?setor=beneficios&directorate_id=${directorate.id}`, icon: Database },
                                { label: "Relatório Mensal", href: `/dashboard/relatorios/mensal?setor=beneficios&directorate_id=${directorate.id}`, icon: FileText },
                                { label: "Ver Relatórios", href: `/dashboard/relatorios/lista?setor=beneficios&directorate_id=${directorate.id}`, icon: FolderOpen },
                            ].map((item, idx) => {
                                const theme = getCardTheme(item.label)
                                return (
                                    <Link key={idx} href={item.href} className="group">
                                        <Card className={`h-full min-h-[100px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${theme.border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-4 text-center relative overflow-hidden`}>
                                            <div className={`p-2.5 ${theme.iconBg} rounded-lg ${theme.iconActive} transition-all duration-300 mb-2 shadow-sm relative z-10`}>
                                                <item.icon className={`w-5 h-5 ${theme.iconText} group-hover:text-white transition-colors`} />
                                            </div>
                                            <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">{item.label}</CardTitle>
                                        </Card>
                                    </Link>
                                )
                            })}
                        </div>
                    </section>
                    </div>
                )}
            </DirectorateQuickActions>

            <BeneficiosDashboard 
                submissions={submissions} 
                selectedYear={selectedYear} 
                selectedMonth={selectedMonth}
                tvMode={tvMode}
            />
        </div>
    )
}
