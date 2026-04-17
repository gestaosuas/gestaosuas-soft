"use client"

import { useState } from "react"
import { DirectorateQuickActions } from "@/components/directorate-quick-actions"
import { CrasDashboard } from "@/components/cras-dashboard"
import { UnitSelector } from "@/app/dashboard/graficos/unit-selector"
import { YearSelector } from "@/components/year-selector"
import { MonthSelector } from "@/app/dashboard/graficos/month-selector"
import { CRAS_UNITS } from "@/app/dashboard/cras-config"
import { Database, FileText, FolderOpen, FilePlus, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Card, CardTitle } from "@/components/ui/card"

interface CrasPageClientProps {
    directorate: any
    submissions: any[]
    currentYear: number
    allowedUnits: string[] | null
    getMonthName: (month: number) => string
    getCardTheme: (label: string) => any
}

export function CrasPageClient({
    directorate,
    submissions,
    currentYear: initialYear,
    allowedUnits,
}: Omit<CrasPageClientProps, 'getMonthName' | 'getCardTheme'>) {
    const [selectedYear, setSelectedYear] = useState(initialYear)
    const [selectedMonth, setSelectedMonth] = useState<string>("all")
    const [selectedUnit, setSelectedUnit] = useState<string>("all")

    const getMonthName = (month: number) => {
        return new Date(0, month - 1).toLocaleString('pt-BR', { month: 'long' })
    }

    const getCardTheme = (label: string) => {
        if (label.includes("Atualizar")) return { base: "indigo", border: "hover:border-indigo-500", iconBg: "bg-indigo-50 dark:bg-indigo-900/20", iconActive: "group-hover:bg-indigo-600", iconText: "text-indigo-600 dark:text-indigo-400" };
        if (label.includes("Ver Dados") || label.includes("Dados")) return { base: "emerald", border: "hover:border-emerald-500", iconBg: "bg-emerald-50 dark:bg-emerald-900/20", iconActive: "group-hover:bg-emerald-600", iconText: "text-emerald-600 dark:text-emerald-400" };
        if (label.includes("Dashboard") || label.includes("Gráficos")) return { base: "amber", border: "hover:border-amber-500", iconBg: "bg-amber-50 dark:bg-amber-900/20", iconActive: "group-hover:bg-amber-600", iconText: "text-amber-600 dark:text-amber-400" };
        if (label.includes("Mensal")) return { base: "violet", border: "hover:border-violet-500", iconBg: "bg-violet-50 dark:bg-violet-900/20", iconActive: "group-hover:bg-violet-600", iconText: "text-violet-600 dark:text-violet-400" };
        if (label.includes("Ver Relatórios") || label.includes("Histórico")) return { base: "sky", border: "hover:border-sky-500", iconBg: "bg-sky-50 dark:bg-sky-900/20", iconActive: "group-hover:bg-sky-600", iconText: "text-sky-600 dark:text-sky-400" };
        if (label.includes("Diário") || label.includes("OSC")) return { base: "blue", border: "hover:border-blue-500", iconBg: "bg-blue-50 dark:bg-blue-900/20", iconActive: "group-hover:bg-blue-600", iconText: "text-blue-600 dark:text-blue-400" };
        if (label.includes("Visita")) return { base: "orange", border: "hover:border-orange-500", iconBg: "bg-orange-50 dark:bg-orange-900/20", iconActive: "group-hover:bg-orange-600", iconText: "text-orange-600 dark:text-orange-400" };
        if (label.includes("Plano")) return { base: "purple", border: "hover:border-purple-500", iconBg: "bg-purple-50 dark:bg-purple-900/20", iconActive: "group-hover:bg-purple-600", iconText: "text-purple-600 dark:text-purple-400" };
        if (label.includes("Pareceres") || label.includes("Final")) return { base: "emerald", border: "hover:border-emerald-500", iconBg: "bg-emerald-50 dark:bg-emerald-900/20", iconActive: "group-hover:bg-emerald-600", iconText: "text-emerald-600 dark:text-emerald-400" };
        return { base: "zinc", border: "hover:border-zinc-500", iconBg: "bg-zinc-50 dark:bg-zinc-800", iconActive: "group-hover:bg-zinc-600", iconText: "text-zinc-500" };
    }

    const filteredUnits = allowedUnits ? CRAS_UNITS.filter(u => allowedUnits.includes(u)) : CRAS_UNITS

    const filters = (
        <div className="flex items-center gap-2">
            <UnitSelector 
                currentUnit={selectedUnit} 
                units={filteredUnits} 
                onChange={setSelectedUnit} 
            />
            <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1" />
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
            >
                <div className="space-y-8 p-1">
                    {/* Ações Consolidadas */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-4 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                            <h3 className="text-[10px] font-black text-blue-900/40 dark:text-blue-400/40 uppercase tracking-[0.2em]">Painel de Controle CRAS</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {[
                                { label: "Ver Dados", href: `/dashboard/dados?setor=cras&directorate_id=${directorate.id}`, icon: Database },
                                { label: "Relatório Mensal", href: `/dashboard/relatorios/mensal?setor=cras&directorate_id=${directorate.id}`, icon: FileText },
                                { label: "Ver Relatórios", href: `/dashboard/relatorios/lista?setor=cras&directorate_id=${directorate.id}`, icon: FolderOpen },
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

                    {/* Unidades Territoriais */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-4 bg-green-600 dark:bg-green-400 rounded-full"></div>
                            <h3 className="text-[10px] font-black text-blue-900/40 dark:text-blue-400/40 uppercase tracking-[0.2em]">Sincronizar Unidades CRAS</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                            {filteredUnits.map((unit, idx) => {
                                const unitLatestSub = submissions?.find(s => s.data._unit === unit || s.data.units?.[unit])
                                const latestUnitMonth = unitLatestSub ? getMonthName(unitLatestSub.month) : null
                                const theme = getCardTheme("Atualizar")

                                return (
                                    <Link key={idx} href={`/dashboard/relatorios/novo?setor=cras&directorate_id=${directorate.id}&unit=${encodeURIComponent(unit)}`} className="group">
                                        <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${theme.border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-3 text-center relative overflow-hidden`}>
                                            <div className={`p-1.5 ${theme.iconBg} rounded-md ${theme.iconActive} transition-all duration-300 mb-1.5 shadow-xs relative z-10`}>
                                                <FilePlus className={`w-3.5 h-3.5 ${theme.iconText} group-hover:text-white transition-colors`} />
                                            </div>
                                            <CardTitle className="text-[10px] font-black text-blue-900 dark:text-blue-100 leading-tight mb-1 relative z-10">{unit}</CardTitle>
                                            {latestUnitMonth && (
                                                <div className="flex items-center justify-center gap-1 px-1.5 py-0.5 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-full w-fit mx-auto">
                                                    <CheckCircle2 className="w-2 h-2 text-green-600" />
                                                    <span className="text-[7px] font-black text-green-700 uppercase">{latestUnitMonth}</span>
                                                </div>
                                            )}
                                        </Card>
                                    </Link>
                                )
                            })}
                        </div>
                    </section>
                </div>
            </DirectorateQuickActions>

            <CrasDashboard 
                submissions={submissions} 
                selectedYear={selectedYear} 
                selectedMonth={selectedMonth}
                selectedUnit={selectedUnit}
            />
        </div>
    )
}
