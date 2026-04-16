"use client"

import { useState } from "react"
import { DirectorateQuickActions } from "@/components/directorate-quick-actions"
import { SineDashboard } from "@/components/sine-dashboard"
import { CpDashboard } from "@/components/cp-dashboard"
import { YearSelector } from "@/components/year-selector"
import { MonthSelector } from "@/app/dashboard/graficos/month-selector"
import { Database, FileText, FolderOpen, FilePlus, BarChart3, Briefcase, GraduationCap } from "lucide-react"
import Link from "next/link"
import { Card, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SineCpPageClientProps {
    directorate: any
    submissions: any[]
    currentYear: number
    latestMonthSINE_CP?: string | null
}

export function SineCpPageClient({
    directorate,
    submissions,
    currentYear: initialYear,
    latestMonthSINE_CP
}: SineCpPageClientProps) {
    const [selectedYear, setSelectedYear] = useState(initialYear)
    const [selectedMonth, setSelectedMonth] = useState<string>("all")
    const [activeTab, setActiveTab] = useState<"sine" | "cp">("sine")

    const getCardTheme = (label: string) => {
        if (label.includes("Atualizar")) return { base: "indigo", border: "hover:border-indigo-500", iconBg: "bg-indigo-50 dark:bg-indigo-900/20", iconActive: "group-hover:bg-indigo-600", iconText: "text-indigo-600 dark:text-indigo-400" };
        if (label.includes("Ver Dados")) return { base: "emerald", border: "hover:border-emerald-500", iconBg: "bg-emerald-50 dark:bg-emerald-900/20", iconActive: "group-hover:bg-emerald-600", iconText: "text-emerald-600 dark:text-emerald-400" };
        if (label.includes("Dashboard") || label.includes("Gráficos")) return { base: "amber", border: "hover:border-amber-500", iconBg: "bg-amber-50 dark:bg-amber-900/20", iconActive: "group-hover:bg-amber-600", iconText: "text-amber-600 dark:text-amber-400" };
        if (label.includes("Relatório Mensal")) return { base: "violet", border: "hover:border-violet-500", iconBg: "bg-violet-50 dark:bg-violet-900/20", iconActive: "group-hover:bg-violet-600", iconText: "text-violet-600 dark:text-violet-400" };
        if (label.includes("Ver Relatórios")) return { base: "sky", border: "hover:border-sky-500", iconBg: "bg-sky-50 dark:bg-sky-900/20", iconActive: "group-hover:bg-sky-600", iconText: "text-sky-600 dark:text-sky-400" };
        return { base: "zinc", border: "hover:border-zinc-500", iconBg: "bg-zinc-50 dark:bg-zinc-800", iconActive: "group-hover:bg-zinc-600", iconText: "text-zinc-500" };
    }

    const headerControls = (
        <div className="flex items-center gap-3">
            {/* Tab Switcher */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-inner mr-2">
                <button 
                    onClick={() => setActiveTab("sine")}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200",
                        activeTab === "sine" 
                            ? "bg-white dark:bg-zinc-900 text-blue-600 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700" 
                            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    )}
                >
                    <Briefcase className="w-3 h-3" />
                    SINE
                </button>
                <button 
                    onClick={() => setActiveTab("cp")}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200",
                        activeTab === "cp" 
                            ? "bg-white dark:bg-zinc-900 text-blue-600 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700" 
                            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    )}
                >
                    <GraduationCap className="w-3 h-3" />
                    QUALIFICAÇÃO
                </button>
            </div>

            <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-700" />

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

    const sineActions = [
        { label: "Atualizar Dados SINE", href: `/dashboard/relatorios/novo?setor=sine&directorate_id=${directorate.id}`, icon: FilePlus },
        { label: "Ver Dados SINE", href: `/dashboard/dados?setor=sine&directorate_id=${directorate.id}`, icon: Database },
        { label: "Relatório Mensal SINE", href: `/dashboard/relatorios/mensal?setor=sine&directorate_id=${directorate.id}`, icon: FileText },
        { label: "Ver Relatórios SINE", href: `/dashboard/relatorios/lista?setor=sine&directorate_id=${directorate.id}`, icon: FolderOpen },
    ]

    const cpActions = [
        { label: "Atualizar Dados CP", href: `/dashboard/relatorios/novo?setor=centros&directorate_id=${directorate.id}`, icon: FilePlus },
        { label: "Ver Dados CP", href: `/dashboard/dados?setor=centros&directorate_id=${directorate.id}`, icon: Database },
        { label: "Relatório Mensal CP", href: `/dashboard/relatorios/mensal?setor=centros&directorate_id=${directorate.id}`, icon: FileText },
        { label: "Ver Relatórios CP", href: `/dashboard/relatorios/lista?setor=centros&directorate_id=${directorate.id}`, icon: FolderOpen },
    ]

    const ActionSection = ({ title, actions, icon: Icon }: any) => (
        <section className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="h-1 w-4 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-blue-600/60 dark:text-blue-400/60" />
                    <h3 className="text-[10px] font-black text-blue-900/40 dark:text-blue-400/40 uppercase tracking-[0.2em]">{title}</h3>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {actions.map((item: any, idx: number) => {
                    const theme = getCardTheme(item.label)
                    const isVigencia = item.label.includes("Atualizar Dados") && latestMonthSINE_CP
                    return (
                        <Link key={idx} href={item.href} className="group">
                            <Card className={cn(
                                "h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-3 text-center relative overflow-hidden",
                                theme.border
                            )}>
                                <div className={cn("p-2 rounded-lg transition-all duration-300 mb-1.5 shadow-sm relative z-10", theme.iconBg, theme.iconActive)}>
                                    <item.icon className={cn("w-4 h-4 transition-colors", theme.iconText, "group-hover:text-white")} />
                                </div>
                                {isVigencia && (
                                    <div className="mb-1.5 flex items-center justify-center gap-1.5 px-2 py-0.5 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-full relative z-10 w-fit mx-auto">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[7px] font-black text-green-700 dark:text-green-400 uppercase tracking-tight">Vigência: {latestMonthSINE_CP}</span>
                                    </div>
                                )}
                                <CardTitle className="text-[10px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">{item.label}</CardTitle>
                            </Card>
                        </Link>
                    )
                })}
            </div>
        </section>
    )

    return (
        <div className="space-y-8">
            <DirectorateQuickActions 
                title={directorate.name} 
                defaultOpen={false}
                actions={headerControls}
            >
                <div className="space-y-8 p-1">
                    <ActionSection title="Gestão SINE" actions={sineActions} icon={Briefcase} />
                    <ActionSection title="Gestão Qualificação Profissional" actions={cpActions} icon={GraduationCap} />
                </div>
            </DirectorateQuickActions>

            <div className="relative overflow-hidden min-h-[600px]">
                {activeTab === "sine" ? (
                    <SineDashboard 
                        submissions={submissions} 
                        selectedYear={selectedYear} 
                        selectedMonth={selectedMonth} 
                        directorate={directorate}
                    />
                ) : (
                    <CpDashboard 
                        submissions={submissions} 
                        selectedYear={selectedYear} 
                        selectedMonth={selectedMonth} 
                    />
                )}
            </div>
        </div>
    )
}
