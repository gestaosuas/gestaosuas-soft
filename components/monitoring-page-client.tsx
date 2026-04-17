"use client"

import { 
    FilePlus, 
    ClipboardList, 
    FolderOpen, 
    FileCheck,
    Calendar,
    BarChart3,
    ChevronDown,
    ChevronUp,
    Settings2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { SubvencaoIndicatorCards } from "./subvencao-indicator-cards"
import { SubvencaoDashboardCharts } from "./subvencao-dashboard-charts"
import { cn } from "@/lib/utils"

interface MonitoringPageClientProps {
    directorate: any
    isAdmin: boolean
    hasDelegations?: boolean
    allVisitsData: any[] | null
    subvencaoStats: {
        totalOSCs: number
        totalVisits: number
        finalizedVisits: number
        draftReports: number
        finalizedReports: number
    }
    bimesterLabel: string
    title: string
}

export function MonitoringPageClient({
    directorate,
    isAdmin,
    hasDelegations = false,
    allVisitsData,
    subvencaoStats,
    bimesterLabel,
    title
}: MonitoringPageClientProps) {
    const [isActionsExpanded, setIsActionsExpanded] = useState(false)
    const router = useRouter()
    const id = String(directorate.id)

    const navigateTo = (path: string, disabled?: boolean) => {
        if (disabled) return
        router.push(`/dashboard/diretoria/${id}/subvencao/${path}`)
    }

    const name = directorate?.name?.toLowerCase() || ""
    const isOutrosMode = name.includes('outros')
    const isEmendasMode = name.includes('emendas') || name.includes('fundos')
    const isSubvencaoMode = name.includes('subvencao') || id === '63553b96-3771-4842-9f45-630c7558adac'
    
    // Permission Flags
    const canManageOSC = isAdmin
    const canManageWorkPlan = isAdmin
    const canManageReports = true // Always enabled so they can see delegations
    const canManageVisits = true // Always enabled so they can see delegations

    // As ações ficam colapsadas se for Admin E (Emendas/Fundos OU Subvenção)
    const shouldCollapseActions = isAdmin && (isEmendasMode || isSubvencaoMode)

    return (
        <section className="space-y-8 pb-20">
            {/* Título Principal com Botão de Expansão na mesma linha */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <header className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-[#1e3a8a] dark:text-blue-50">
                        {title}
                    </h1>
                </header>
                
                {shouldCollapseActions && (
                    <button 
                        onClick={() => setIsActionsExpanded(!isActionsExpanded)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-full shadow-sm hover:bg-zinc-50 transition-all text-xs font-bold text-zinc-600 w-fit"
                    >
                        <Settings2 className="w-3.5 h-3.5" />
                        <span>{isActionsExpanded ? 'Ocultar Ações' : 'Gerenciar Ações'}</span>
                        {isActionsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                )}
            </div>

            {/* Grid de Ações Principais */}
            <div className={cn(
                "grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-300 overflow-hidden",
                shouldCollapseActions && !isActionsExpanded ? "max-h-0 opacity-0 pointer-events-none" : "max-h-[500px] opacity-100"
            )}>
                {/* 1. Cadastrar OSC */}
                <button 
                    onClick={() => navigateTo('oscs/novo', !canManageOSC)}
                    disabled={!canManageOSC}
                    className={cn(
                        "group bg-white border border-zinc-200 p-5 rounded-3xl transition-all duration-300 flex flex-col items-center text-center gap-3 relative",
                        canManageOSC ? "hover:border-blue-500 hover:shadow-xl cursor-pointer" : "opacity-50 grayscale cursor-not-allowed"
                    )}
                >
                    <div className={cn(
                        "p-3.5 bg-blue-50 rounded-xl transition-colors duration-300",
                        canManageOSC && "group-hover:bg-blue-600"
                    )}>
                        <FilePlus className={cn("w-5 h-5 text-blue-600", canManageOSC && "group-hover:text-white")} />
                    </div>
                    <span className="font-bold text-blue-900 text-[13px]">Cadastrar OSC</span>
                    {!canManageOSC && <span className="absolute top-2 right-2 text-[8px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-sm border border-zinc-200/50">Admin</span>}
                </button>

                {/* 2. Instrumental de Visita */}
                <button 
                    onClick={() => navigateTo('visitas')}
                    className="group bg-white border border-zinc-200 p-5 rounded-3xl hover:border-orange-500 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center gap-3"
                >
                    <div className="p-3.5 bg-orange-50 rounded-xl group-hover:bg-orange-600 transition-colors duration-300">
                        <ClipboardList className="w-5 h-5 text-orange-600 group-hover:text-white" />
                    </div>
                    <span className="font-bold text-blue-900 text-[13px]">Instrumental de Visita</span>
                </button>

                {!isOutrosMode && (
                    <>
                        {/* 3. Plano de Trabalho */}
                        <button 
                            onClick={() => navigateTo('plano-de-trabalho', !canManageWorkPlan)}
                            disabled={!canManageWorkPlan}
                            className={cn(
                                "group bg-white border border-zinc-200 p-5 rounded-3xl transition-all duration-300 flex flex-col items-center text-center gap-3 relative",
                                canManageWorkPlan ? "hover:border-purple-500 hover:shadow-xl cursor-pointer" : "opacity-50 grayscale cursor-not-allowed"
                            )}
                        >
                            <div className={cn(
                                "p-3.5 bg-purple-50 rounded-xl transition-colors duration-300",
                                canManageWorkPlan && "group-hover:bg-purple-600"
                            )}>
                                <FolderOpen className={cn("w-5 h-5 text-purple-600", canManageWorkPlan && "group-hover:text-white")} />
                            </div>
                            <span className="font-bold text-blue-900 text-[13px]">Plano de Trabalho</span>
                            {!canManageWorkPlan && <span className="absolute top-2 right-2 text-[8px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-sm border border-zinc-200/50">Admin</span>}
                        </button>

                        {/* 4. Relatórios e Pareceres */}
                        <button 
                            onClick={() => navigateTo('relatorio-final')}
                            className="group bg-white border border-zinc-200 p-5 rounded-3xl hover:border-emerald-500 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center gap-3"
                        >
                            <div className="p-3.5 bg-emerald-50 rounded-xl group-hover:bg-emerald-600 transition-colors duration-300">
                                <FileCheck className="w-5 h-5 text-emerald-600 group-hover:text-white" />
                            </div>
                            <span className="font-bold text-blue-900 text-[13px]">Relatórios e Pareceres</span>
                        </button>
                    </>
                )}
            </div>

            {/* Bloco de Indicadores (Apenas para Admin e NOT in Outros Mode) */}
            {isAdmin && !isOutrosMode && (
                <div className="pt-2 border-t border-zinc-100 space-y-6">
                    <div className="flex items-center justify-end">
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full">
                            <Calendar className="h-3.5 w-3.5 text-blue-600" />
                            <span className="text-[10px] font-black text-blue-700 uppercase tracking-tight">Período: {bimesterLabel}</span>
                        </div>
                    </div>
                    
                    <SubvencaoIndicatorCards 
                        visits={allVisitsData || []} 
                        totalOSCs={subvencaoStats.totalOSCs} 
                    />

                    <div className="grid grid-cols-1 gap-6">
                        <SubvencaoDashboardCharts stats={subvencaoStats} />
                    </div>
                </div>
            )}
        </section>
    )
}
