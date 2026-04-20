"use client"

import { useState } from "react"
import { YearSelector } from "./year-selector"
import { MonthSelector } from "@/app/dashboard/graficos/month-selector"
import { DirectorateQuickActions } from "./directorate-quick-actions"
import { CasaMulherDashboard } from "@/app/dashboard/graficos/casa-mulher-dashboard"
import { FilePlus, Database, FileText, FolderOpen, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Card, CardTitle } from "@/components/ui/card"

interface CasaMulherPageClientProps {
    directorate: any
    submissions: any[]
    currentYear: number
}

export function CasaMulherPageClient({
    directorate,
    submissions,
    currentYear
}: CasaMulherPageClientProps) {
    const [selectedYear, setSelectedYear] = useState(currentYear)
    const [selectedMonth, setSelectedMonth] = useState("all")

    const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]
    const getMonthName = (month: number) => monthNames[month - 1]

    // Filtrar submissions pelo ano selecionado para o dashboard
    const filteredSubmissions = submissions.filter(s => s.year === selectedYear)

    // Helpers para pegar a vigência de cada sub-setor
    const getVigencia = (setor: string) => {
        const sub = submissions.find(s => s.data._setor === setor || (setor === 'casa_da_mulher' && !s.data._setor))
        return sub ? getMonthName(sub.month) : null
    }

    const sections = [
        {
            title: "Casa da Mulher - Violência Doméstica",
            color: "bg-blue-600",
            vigencia: getVigencia('casa_da_mulher'),
            actions: [
                { label: "Atualizar Dados", href: `/dashboard/relatorios/novo?setor=casa_da_mulher&directorate_id=${directorate.id}`, icon: FilePlus, theme: "indigo" },
                { label: "Ver Dados", href: `/dashboard/dados?setor=casa_da_mulher&directorate_id=${directorate.id}`, icon: Database, theme: "emerald" },
                { label: "Relatório Mensal", href: `/dashboard/relatorios/mensal?setor=casa_da_mulher&directorate_id=${directorate.id}`, icon: FileText, theme: "violet" },
                { label: "Ver Relatórios", href: `/dashboard/relatorios/lista?setor=casa_da_mulher&directorate_id=${directorate.id}`, icon: FolderOpen, theme: "sky" },
            ]
        },
        {
            title: "Casa da Mulher - Atendimentos Diversos",
            color: "bg-purple-600",
            vigencia: getVigencia('diversidade'),
            actions: [
                { label: "Atualizar Dados", href: `/dashboard/relatorios/novo?setor=diversidade&directorate_id=${directorate.id}`, icon: FilePlus, theme: "indigo" },
                { label: "Ver Dados", href: `/dashboard/dados?setor=diversidade&directorate_id=${directorate.id}`, icon: Database, theme: "emerald" },
            ]
        },
        {
            title: "Núcleo de Diversidade",
            color: "bg-pink-600",
            vigencia: getVigencia('nucleo_diversidade'),
            actions: [
                { label: "Atualizar Dados", href: `/dashboard/relatorios/novo?setor=nucleo_diversidade&directorate_id=${directorate.id}`, icon: FilePlus, theme: "indigo" },
                { label: "Ver Dados", href: `/dashboard/dados?setor=nucleo_diversidade&directorate_id=${directorate.id}`, icon: Database, theme: "emerald" },
            ]
        }
    ]

    const getThemeStyles = (theme: string) => {
        switch (theme) {
            case "indigo": return { border: "hover:border-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20", icon: "text-indigo-600 dark:text-indigo-400", active: "group-hover:bg-indigo-600" }
            case "emerald": return { border: "hover:border-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: "text-emerald-600 dark:text-emerald-400", active: "group-hover:bg-emerald-600" }
            case "violet": return { border: "hover:border-violet-500", bg: "bg-violet-50 dark:bg-violet-900/20", icon: "text-violet-600 dark:text-violet-400", active: "group-hover:bg-violet-600" }
            case "sky": return { border: "hover:border-sky-500", bg: "bg-sky-50 dark:bg-sky-900/20", icon: "text-sky-600 dark:text-sky-400", active: "group-hover:bg-sky-600" }
            default: return { border: "hover:border-zinc-500", bg: "bg-zinc-50 dark:bg-zinc-800", icon: "text-zinc-500", active: "group-hover:bg-zinc-600" }
        }
    }

    const headerFilters = (
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-1000">
            <DirectorateQuickActions 
                title={directorate.name}
                actions={headerFilters}
            >
                <div className="p-1 space-y-8">
                    {sections.map((section, sIdx) => (
                        <div key={sIdx} className="space-y-4">
                            <div className="flex items-center justify-between pr-2">
                                <div className="flex items-center gap-3">
                                    <div className={`h-1 w-4 ${section.color} rounded-full`}></div>
                                    <h3 className="text-[10px] font-black text-blue-900/40 dark:text-blue-400/40 uppercase tracking-[0.2em]">{section.title}</h3>
                                </div>
                                {section.vigencia && (
                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-full">
                                        <CheckCircle2 className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                                        <span className="text-[8px] font-black text-green-700 dark:text-green-400 uppercase tracking-tight font-mono">Vigência: {section.vigencia}</span>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {section.actions.map((item, idx) => {
                                    const styles = getThemeStyles(item.theme)
                                    return (
                                        <Link key={idx} href={item.href} className="group">
                                            <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${styles.border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-3 text-center relative overflow-hidden`}>
                                                <div className={`p-2 ${styles.bg} rounded-lg ${styles.active} transition-all duration-300 mb-1.5 shadow-sm relative z-10`}>
                                                    <item.icon className={`w-4 h-4 ${styles.icon} group-hover:text-white transition-colors`} />
                                                </div>
                                                <CardTitle className="text-[11px] font-extrabold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">{item.label}</CardTitle>
                                            </Card>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </DirectorateQuickActions>

            {/* Dashboard Principal */}
            <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm p-6 rounded-[2rem] border border-zinc-200/50 dark:border-zinc-800/50">
                <CasaMulherDashboard 
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
