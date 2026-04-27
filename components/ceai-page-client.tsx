"use client"

import { useState } from "react"
import { DirectorateQuickActions } from "@/components/directorate-quick-actions"
import { YearSelector } from "@/components/year-selector"
import { MonthSelector } from "@/app/dashboard/graficos/month-selector"
import { UnitSelector } from "@/app/dashboard/graficos/unit-selector"
import { CeaiDashboard } from "@/components/ceai-dashboard"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
    Database, 
    FileText, 
    FolderOpen, 
    FilePlus, 
    LayoutDashboard,
    Home,
    Users,
    Settings2,
    CheckCircle2,
    BarChart3
} from "lucide-react"
import Link from "next/link"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CEAIOficinasModals } from "./ceai-oficinas-modals"

interface CeaiPageClientProps {
    directorate: any
    submissions: any[]
    currentYear: number
    allowedUnits: string[] | null
    filteredCEAI: string[]
    tvMode?: boolean
}

export function CeaiPageClient({ directorate, submissions, currentYear, allowedUnits, filteredCEAI, tvMode = false }: CeaiPageClientProps) {
    const [selectedYear, setSelectedYear] = useState(currentYear)
    const [selectedMonth, setSelectedMonth] = useState("all")
    const [selectedUnit, setSelectedUnit] = useState("all")

    const getMonthName = (month: number) => {
        return new Date(0, month - 1).toLocaleString('pt-BR', { month: 'long' })
    }

    const latestSubmission = submissions?.[0]
    const latestMonthSINE_CP = latestSubmission ? getMonthName(latestSubmission.month) : null

    const getCardTheme = (label: string) => {
        if (label.includes("Atualizar")) return { base: "indigo", border: "hover:border-indigo-500", iconBg: "bg-indigo-50 dark:bg-indigo-900/20", iconActive: "group-hover:bg-indigo-600", iconText: "text-indigo-600 dark:text-indigo-400" };
        if (label.includes("Ver Dados") || label.includes("Dados")) return { base: "emerald", border: "hover:border-emerald-500", iconBg: "bg-emerald-50 dark:bg-emerald-900/20", iconActive: "group-hover:bg-emerald-600", iconText: "text-emerald-600 dark:text-emerald-400" };
        if (label.includes("Dashboard") || label.includes("Gráficos")) return { base: "amber", border: "hover:border-amber-500", iconBg: "bg-amber-50 dark:bg-amber-900/20", iconActive: "group-hover:bg-amber-600", iconText: "text-amber-600 dark:text-amber-400" };
        if (label.includes("Relatório Mensal")) return { base: "violet", border: "hover:border-violet-500", iconBg: "bg-violet-50 dark:bg-violet-900/20", iconActive: "group-hover:bg-violet-600", iconText: "text-violet-600 dark:text-violet-400" };
        if (label.includes("Ver Relatórios") || label.includes("Histórico")) return { base: "sky", border: "hover:border-sky-500", iconBg: "bg-sky-50 dark:bg-sky-900/20", iconActive: "group-hover:bg-sky-600", iconText: "text-sky-600 dark:text-sky-400" };
        return { base: "zinc", border: "hover:border-zinc-500", iconBg: "bg-zinc-50 dark:bg-zinc-800", iconActive: "group-hover:bg-zinc-600", iconText: "text-zinc-500" };
    };

    const headerControls = (
        <div className="flex items-center gap-3">
            <UnitSelector currentUnit={selectedUnit} units={filteredCEAI} onChange={setSelectedUnit} />
            <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-700" />
            <YearSelector currentYear={selectedYear} onChange={setSelectedYear} />
            <MonthSelector currentMonth={selectedMonth} onChange={setSelectedMonth} />
        </div>
    )

    return (
        <div className="space-y-6">
            <DirectorateQuickActions 
                title="CEAI - Centro de Apoio ao Idoso"
                actions={headerControls}
                tvMode={tvMode}
            >
                {!tvMode && (
                    <div className="space-y-8 p-1">
                    {/* Consolidado CEAI Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                            <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Consolidado CEAI</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {[
                                { label: "Ver Dados", href: `/dashboard/dados?setor=ceai&directorate_id=${directorate.id}`, icon: Database },
                                { label: "Relatório Mensal", href: `/dashboard/relatorios/mensal?setor=ceai&directorate_id=${directorate.id}`, icon: FileText },
                                { label: "Ver Relatórios", href: `/dashboard/relatorios/lista?setor=ceai&directorate_id=${directorate.id}`, icon: FolderOpen },
                            ].map((item, idx) => {
                                const theme = getCardTheme(item.label);
                                return (
                                    <Link key={idx} href={item.href} className="group">
                                        <Card className={cn("h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden", theme.border)}>
                                            <div className={cn("p-2 rounded-lg transition-all duration-300 mb-1.5 shadow-sm relative z-10", theme.iconBg, theme.iconActive)}>
                                                <item.icon className={cn("w-4 h-4 transition-colors", theme.iconText, "group-hover:text-white")} />
                                            </div>
                                            <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">{item.label}</CardTitle>
                                        </Card>
                                    </Link>
                                )
                            })}
                        </div>
                    </section>

                    {/* Condomínio do Idoso Section */}
                    {(!allowedUnits) && (
                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-1 w-6 bg-orange-600 dark:bg-orange-400 rounded-full"></div>
                                <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Condomínio do Idoso</h2>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                {[
                                    { label: "Atualizar Dados", href: `/dashboard/relatorios/novo?setor=ceai&directorate_id=${directorate.id}&subcategory=condominio`, icon: FilePlus },
                                    { label: "Ver Dados", href: `/dashboard/dados?setor=ceai&directorate_id=${directorate.id}&subcategory=condominio`, icon: Database }
                                ].map((item, idx) => {
                                    const theme = getCardTheme(item.label);
                                    return (
                                        <Link key={idx} href={item.href} className="group">
                                            <Card className={cn("h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden", theme.border)}>
                                                <div className={cn("p-2 rounded-lg transition-all duration-300 mb-1.5 shadow-sm relative z-10", theme.iconBg, theme.iconActive)}>
                                                    <item.icon className={cn("w-4 h-4 transition-colors", theme.iconText, "group-hover:text-white")} />
                                                </div>
                                                {item.label === "Atualizar Dados" && latestMonthSINE_CP && (
                                                    <div className="mb-2 flex items-center justify-center gap-1 px-1.5 py-0.5 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-full w-fit relative z-10">
                                                        <CheckCircle2 className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                                                        <span className="text-[8px] font-black text-green-700 dark:text-green-400 uppercase tracking-tight">Vigência: {latestMonthSINE_CP}</span>
                                                    </div>
                                                )}
                                                <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">{item.label}</CardTitle>
                                            </Card>
                                        </Link>
                                    )
                                })}
                            </div>
                        </section>
                    )}

                    {/* Unit Cards Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-6 bg-green-600 dark:bg-green-400 rounded-full"></div>
                            <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Unidades Territoriais</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {filteredCEAI.map((unit, idx) => {
                                const unitLatestSub = submissions?.find(s => {
                                    if (s.data._is_multi_unit && s.data.units) {
                                        return !!s.data.units[unit]
                                    }
                                    return s.data._unit === unit
                                })
                                const latestUnitMonth = unitLatestSub ? getMonthName(unitLatestSub.month) : null
                                const theme = getCardTheme("Atualizar");

                                return (
                                    <Card key={idx} className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none hover:border-blue-600 dark:hover:border-blue-400 transition-all duration-300 rounded-xl group-hover:shadow-lg relative overflow-hidden">
                                        <CardHeader className="p-2.5 pb-1.5 text-center flex flex-col items-center">
                                            <div className={cn("p-2 rounded-lg transition-all duration-300 mb-2 shadow-sm relative z-10", theme.iconBg, theme.iconActive)}>
                                                <FilePlus className={cn("w-4 h-4 transition-colors", theme.iconText, "group-hover:text-white")} />
                                            </div>
                                            <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 mb-1 truncate w-full" title={unit}>{unit}</CardTitle>
                                            {latestUnitMonth && (
                                                <div className="flex items-center justify-center gap-1 px-1.5 py-0.5 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-full w-fit relative z-10">
                                                    <CheckCircle2 className="w-2 h-2 text-green-600 dark:text-green-400" />
                                                    <span className="text-[7.5px] font-black text-green-700 dark:text-green-400 uppercase tracking-tight">Mês: {latestUnitMonth}</span>
                                                </div>
                                            )}
                                        </CardHeader>
                                        <div className="p-2 pt-1 flex flex-col gap-1 mt-auto relative z-10">
                                            <Link href={`/dashboard/relatorios/novo?setor=ceai&directorate_id=${directorate.id}&unit=${encodeURIComponent(unit)}`} className="w-full">
                                                <div className="flex items-center justify-center w-full px-2 py-1 text-[9px] border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-md font-bold text-zinc-600 dark:text-zinc-400 transition-colors uppercase tracking-wider">
                                                    <FilePlus className="w-3 h-3 mr-1 opacity-60" />
                                                    Atualizar
                                                </div>
                                            </Link>
                                            <CEAIOficinasModals unit={unit} directorateId={directorate.id} />
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    </section>
                    </div>
                )}
            </DirectorateQuickActions>

            <main className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <CeaiDashboard 
                    submissions={submissions}
                    selectedYear={selectedYear}
                    selectedMonth={selectedMonth}
                    selectedUnit={selectedUnit}
                    tvMode={tvMode}
                />
            </main>
        </div>
    )
}
