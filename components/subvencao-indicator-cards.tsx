"use client"

import { useState } from "react"
import { Card, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { 
    Users, 
    Calendar, 
    User, 
    ClipboardCheck, 
    FileText, 
    AlertCircle, 
    CheckCircle2, 
    Building2 
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Visit {
    id: string
    status: string
    visit_date: string
    assinaturas?: {
        tecnico1_nome?: string
        tecnico2_nome?: string
    }
    parecer_tecnico?: {
        status: string
    }
    relatorio_final?: {
        status: string
    }
    parecer_conclusivo?: {
        status: string
    }
    oscs?: {
        name: string
    }
}

interface SubvencaoIndicatorCardsProps {
    visits: Visit[]
    totalOSCs: number
}

export function SubvencaoIndicatorCards({ visits, totalOSCs }: SubvencaoIndicatorCardsProps) {
    const [selectedCategory, setSelectedCategory] = useState<{
        title: string
        visits: Visit[]
        color: string
        isOpen: boolean
        showDetailedStatus?: boolean
    }>({
        title: "",
        visits: [],
        color: "blue",
        isOpen: false,
        showDetailedStatus: false
    })

    const totalVisits = visits.length
    const finalizedVisits = visits.filter(v => v.status === 'finalized').length
    const draftReports = visits.filter(v => v.parecer_tecnico?.status === 'draft').length
    const finalizedReports = visits.filter(v => v.parecer_tecnico?.status === 'finalized').length
    const finalizedFinalReports = visits.filter(v => v.relatorio_final?.status === 'finalized').length
    const finalizedConclusiveOpinions = visits.filter(v => v.parecer_conclusivo?.status === 'finalized').length

    const openModal = (title: string, filteredVisits: Visit[], color: string, showDetailed: boolean = false) => {
        setSelectedCategory({
            title,
            visits: filteredVisits,
            color,
            isOpen: true,
            showDetailedStatus: showDetailed
        })
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return "-"
        return new Date(dateString + 'T12:00:00').toLocaleDateString('pt-BR')
    }

    const getTechnicians = (visit: Visit) => {
        const names = []
        if (visit.assinaturas?.tecnico1_nome) names.push(visit.assinaturas.tecnico1_nome)
        if (visit.assinaturas?.tecnico2_nome) names.push(visit.assinaturas.tecnico2_nome)
        return names.join(", ") || "Não informado"
    }

    const StatusTag = ({ status }: { status?: string }) => {
        if (status === 'finalized') return <div className="px-2 py-0.5 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded text-[9px] font-black text-green-700 dark:text-green-400 uppercase tracking-tighter">Finalizado</div>
        if (status === 'draft') return <div className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded text-[9px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-tighter">Rascunho</div>
        return <div className="px-2 py-0.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter italic">A fazer</div>
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
                {/* OSCs Cadastradas */}
                <Card className="bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800 p-2.5 transition-all hover:shadow-md rounded-2xl flex flex-col items-center justify-center text-center shadow-sm h-28">
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-2 leading-tight">OSCs<br/>Cadastradas</span>
                    <span className="text-2xl font-black text-blue-900 dark:text-blue-100 leading-none">{totalOSCs}</span>
                </Card>
                
                {/* Total de Visitas */}
                <Card 
                    onClick={() => openModal("Total de Visitas", visits, "blue")}
                    className="bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800 p-2.5 transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 cursor-pointer group rounded-2xl flex flex-col items-center justify-center text-center shadow-sm h-28"
                >
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-2 leading-tight group-hover:text-blue-500 transition-colors">Total de<br/>Visitas</span>
                    <span className="text-2xl font-black text-blue-900 dark:text-blue-100 leading-none">{totalVisits}</span>
                </Card>

                {/* Visitas Finalizadas */}
                <Card 
                    onClick={() => openModal("Visitas Finalizadas", visits.filter(v => v.status === 'finalized'), "green")}
                    className="bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800 p-2.5 transition-all hover:shadow-md hover:border-green-200 dark:hover:border-green-800 cursor-pointer group rounded-2xl flex flex-col items-center justify-center text-center shadow-sm h-28"
                >
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-2 leading-tight group-hover:text-green-500 transition-colors">Visitas<br/>Finalizadas</span>
                    <span className="text-2xl font-black text-green-600 dark:text-green-400 leading-none">{finalizedVisits}</span>
                    <span className="text-[8px] font-bold text-zinc-400 mt-1 uppercase">de {totalVisits}</span>
                </Card>

                {/* Relatórios (Parecer) */}
                <Card 
                    onClick={() => openModal("Relatórios (Pareceres Técnicos)", visits, "amber")}
                    className="bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800 p-2.5 transition-all hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800 cursor-pointer group rounded-2xl flex flex-col items-center justify-center text-center shadow-sm h-28"
                >
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-2 leading-tight group-hover:text-amber-500 transition-colors">Relatórios<br/>(Pareceres)</span>
                    <span className="text-2xl font-black text-amber-600 dark:text-amber-400 leading-none">{finalizedReports}</span>
                    <span className="text-[8px] font-bold text-zinc-400 mt-1 uppercase">{draftReports} rascunhos</span>
                </Card>

                {/* Relatórios Finais */}
                <Card 
                    onClick={() => openModal("Relatórios Finais", visits, "indigo", true)}
                    className="bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800 p-2.5 transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 cursor-pointer group rounded-2xl flex flex-col items-center justify-center text-center shadow-sm h-28"
                >
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-2 leading-tight group-hover:text-indigo-500 transition-colors">Relatórios<br/>Finais</span>
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 leading-none">{finalizedFinalReports}</span>
                    <span className="text-[8px] font-bold text-zinc-400 mt-1 uppercase">de {totalVisits} finalizados</span>
                </Card>

                {/* Pareceres Conclusivos */}
                <Card 
                    onClick={() => openModal("Pareceres Conclusivos", visits, "cyan", true)}
                    className="bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800 p-2.5 transition-all hover:shadow-md hover:border-cyan-200 dark:hover:border-cyan-800 cursor-pointer group rounded-2xl flex flex-col items-center justify-center text-center shadow-sm h-28"
                >
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-2 leading-tight group-hover:text-cyan-500 transition-colors">Pareceres<br/>Conclusivos</span>
                    <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400 leading-none">{finalizedConclusiveOpinions}</span>
                    <span className="text-[8px] font-bold text-zinc-400 mt-1 uppercase">de {totalVisits} finalizados</span>
                </Card>

                {/* Rascunhos Gerais (Unificado se necessário ou apenas mais um) */}
                <Card className="bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-200/60 dark:border-zinc-800 p-2.5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm h-28 opacity-60">
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-2 leading-tight">Total<br/>Indicadores</span>
                    <span className="text-2xl font-black text-zinc-400 leading-none">6/6</span>
                </Card>
            </div>

            <Dialog open={selectedCategory.isOpen} onOpenChange={(open) => setSelectedCategory(prev => ({ ...prev, isOpen: open }))}>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0 border-none rounded-[2rem] shadow-2xl bg-zinc-50 dark:bg-zinc-950">
                    <DialogHeader className={cn(
                        "p-8 pb-6 transition-colors duration-500",
                        selectedCategory.color === "blue" && "bg-blue-600",
                        selectedCategory.color === "green" && "bg-green-600",
                        selectedCategory.color === "amber" && "bg-amber-500",
                        selectedCategory.color === "indigo" && "bg-indigo-600",
                        selectedCategory.color === "cyan" && "bg-cyan-600"
                    )}>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                {selectedCategory.color === "blue" && <ClipboardCheck className="w-6 h-6 text-white" />}
                                {selectedCategory.color === "green" && <CheckCircle2 className="w-6 h-6 text-white" />}
                                {selectedCategory.color === "amber" && <AlertCircle className="w-6 h-6 text-white" />}
                                {selectedCategory.color === "indigo" && <FileText className="w-6 h-6 text-white" />}
                                {selectedCategory.color === "cyan" && <FileCheck className="w-6 h-6 text-white" />}
                            </div>
                            <DialogTitle className="text-2xl font-black text-white uppercase tracking-tight">
                                {selectedCategory.title}
                            </DialogTitle>
                        </div>
                        <p className="text-white/70 font-bold uppercase tracking-[0.2em] text-[10px]">
                            {selectedCategory.visits.length} {selectedCategory.visits.length === 1 ? 'visita encontrada' : 'visitas encontradas'}
                        </p>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                        {selectedCategory.visits.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-600 space-y-4">
                                <AlertCircle className="w-12 h-12 opacity-20" />
                                <p className="font-bold uppercase tracking-widest text-[11px]">Nenhuma visita encontrada nesta categoria</p>
                            </div>
                        ) : selectedCategory.showDetailedStatus ? (
                            <div className="space-y-2">
                                <div className="grid grid-cols-12 gap-4 px-5 py-2">
                                    <div className="col-span-6 text-[9px] font-black uppercase text-zinc-400 tracking-widest">Instituição</div>
                                    <div className="col-span-3 text-[9px] font-black uppercase text-zinc-400 tracking-widest text-center">Relatório Final</div>
                                    <div className="col-span-3 text-[9px] font-black uppercase text-zinc-400 tracking-widest text-center">Parecer Conclusivo</div>
                                </div>
                                {selectedCategory.visits.map((visit) => (
                                    <div key={visit.id} className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-all grid grid-cols-12 items-center gap-4">
                                        <div className="col-span-6">
                                            <h3 className="text-sm font-black text-blue-900 dark:text-blue-100 truncate" title={visit.oscs?.name}>
                                                {visit.oscs?.name || "OSC não identificada"}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Calendar className="w-3 h-3 text-zinc-400" />
                                                <span className="text-[10px] text-zinc-400 font-bold">{formatDate(visit.visit_date)}</span>
                                            </div>
                                        </div>
                                        <div className="col-span-3 flex justify-center">
                                            <StatusTag status={visit.relatorio_final?.status} />
                                        </div>
                                        <div className="col-span-3 flex justify-center">
                                            <StatusTag status={visit.parecer_conclusivo?.status} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            selectedCategory.visits.map((visit) => (
                                <div 
                                    key={visit.id} 
                                    className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group border-l-4"
                                    style={{ borderLeftColor: 
                                        selectedCategory.color === "blue" ? '#2563eb' : 
                                        selectedCategory.color === "green" ? '#16a34a' : 
                                        selectedCategory.color === "amber" ? '#f59e0b' :
                                        selectedCategory.color === "indigo" ? '#4f46e5' :
                                        '#0891b2'
                                    }}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                        <div className="md:col-span-12 flex flex-col gap-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                                                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Instituição</span>
                                            </div>
                                            <h3 className="text-lg font-black text-blue-900 dark:text-blue-100 tracking-tight leading-tight">
                                                {visit.oscs?.name || "OSC não identificada"}
                                            </h3>
                                        </div>

                                        <div className="md:col-span-4 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                                                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Data da Visita</span>
                                            </div>
                                            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                                {formatDate(visit.visit_date)}
                                            </p>
                                        </div>

                                        <div className="md:col-span-8 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 text-zinc-400" />
                                                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Técnicos Responsáveis</span>
                                            </div>
                                            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                                {getTechnicians(visit)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
