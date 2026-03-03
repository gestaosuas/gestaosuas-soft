
"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    Calendar as CalendarIcon, Filter, Info, Users, Briefcase, Phone, ClipboardCheck,
    Laptop, Building, Globe, ShieldCheck, IdCard, PhoneIncoming, PhoneOutgoing,
    FileText, UserCheck, ListChecks, Compass, TrendingUp, Activity, BarChart3,
    ChevronLeft, ChevronRight, Pause, Play
} from "lucide-react"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { createClient } from "@/utils/supabase/client"
import { DIARIO_CENTROS, DIARIO_CP_INDICATORS } from "./relatorios/diario-config"
import { getDailyReports } from "@/app/dashboard/actions"

export function DailyDashboard() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [reports, setReports] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [transitioning, setTransitioning] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        fetchReports()
    }, [date])

    async function fetchReports() {
        setLoading(true)
        try {
            // 1. Fetch existing reports and directorates from server action
            const result = await getDailyReports(date)
            const existingReports = result.data || []
            const directorates = result.directorates || []

            // 2. Filter monitorings
            const filteredDirs = directorates.filter((dir: any) =>
                !dir.name?.toLowerCase().includes('monitoramento')
            )

            // 3. Map to slides: every directorate gets a slide
            const allSlides = filteredDirs.map((dir: any) => {
                const report = existingReports.find((r: any) => r.directorate_id === dir.id)
                return {
                    id: report?.id || `empty-${dir.id}`,
                    directorate_id: dir.id,
                    directorate: { name: dir.name },
                    data: report?.data || {},
                    is_empty: !report
                }
            })

            // Sort: slides with data first, then alphabetically by name
            allSlides.sort((a: any, b: any) => {
                if (!a.is_empty && b.is_empty) return -1
                if (a.is_empty && !b.is_empty) return 1
                return a.directorate.name.localeCompare(b.directorate.name)
            })

            setReports(allSlides)
            setCurrentSlide(0)
        } catch (err: any) {
            console.error("Dashboard Fetch Exception:", err)
            setReports([])
        }
        setLoading(false)
    }

    // Auto-play logic
    useEffect(() => {
        if (isPaused || reports.length <= 1) return

        const timer = setInterval(() => {
            nextSlide()
        }, 15000) // 15 seconds per slide

        return () => clearInterval(timer)
    }, [isPaused, currentSlide, reports.length])

    const nextSlide = () => {
        setTransitioning(true)
        setTimeout(() => {
            setCurrentSlide((prev) => (prev + 1) % reports.length)
            setTransitioning(false)
        }, 300)
    }

    const prevSlide = () => {
        setTransitioning(true)
        setTimeout(() => {
            setCurrentSlide((prev) => (prev - 1 + reports.length) % reports.length)
            setTransitioning(false)
        }, 300)
    }

    // Helper to extract CP totals
    const getCPTotals = (reportData: any) => {
        const totals = {
            atendimento: 0,
            inscricoes: 0,
            pessoas_presentes: 0,
            ligacoes_recebidas: 0,
            ligacoes_realizadas: 0,
            total_procedimentos: 0
        }

        Object.entries(reportData).forEach(([key, val]) => {
            if (key.startsWith('cp_')) {
                if (key.endsWith('_atendimento')) totals.atendimento += Number(val)
                if (key.endsWith('_inscricoes')) totals.inscricoes += Number(val)
                if (key.endsWith('_pessoas_presentes')) totals.pessoas_presentes += Number(val)
                if (key.endsWith('_ligacoes_recebidas')) totals.ligacoes_recebidas += Number(val)
                if (key.endsWith('_ligacoes_realizadas')) totals.ligacoes_realizadas += Number(val)
                if (key.endsWith('_total_procedimentos')) totals.total_procedimentos += Number(val)
            }
        })
        return totals
    }

    return (
        <div className="flex flex-col gap-3 flex-1 h-full min-h-0">
            {/* COMPACT FILTER BAR */}
            <div className="flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl shadow-sm shrink-0">
                <p className="text-[12px] font-bold text-blue-600 uppercase tracking-widest hidden sm:block">Acompanhamento em Tempo Real</p>

                <div className="flex items-center gap-4">
                    <Label htmlFor="dash-date" className="text-[11px] font-black text-zinc-500 uppercase">Data</Label>

                    {reports.length > 1 && (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5 shadow-sm">
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={prevSlide}>
                                    <ChevronLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:text-blue-600" onClick={() => setIsPaused(!isPaused)}>
                                    {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={nextSlide}>
                                    <ChevronRight className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                                </Button>
                            </div>
                        </div>
                    )}

                    <Input
                        id="dash-date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-[140px] h-8 text-xs font-bold rounded-lg bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                    />

                    {reports.length > 1 && (
                        <div className="flex gap-1 items-center px-1">
                            {reports.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setTransitioning(true)
                                        setTimeout(() => {
                                            setCurrentSlide(idx)
                                            setTransitioning(false)
                                        }, 300)
                                    }}
                                    className={cn(
                                        "h-1.5 rounded-full transition-all duration-300",
                                        currentSlide === idx ? "w-4 bg-blue-600" : "w-1.5 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400"
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="h-64 rounded-xl bg-zinc-50 dark:bg-zinc-900 animate-pulse border border-zinc-100 dark:border-zinc-800"></div>
            ) : reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-50/30 dark:bg-zinc-950/20 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <Info className="w-6 h-6 text-zinc-300 mb-2" />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Sem registros para {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')}</h3>
                </div>
            ) : (
                <div className="relative group flex-1 flex flex-col min-h-0">
                    {/* CURRENT SLIDE CONTENT */}
                    <div className={cn(
                        "flex-1 flex flex-col min-h-0 transition-all duration-300 transform",
                        transitioning ? "opacity-0 scale-[0.99] translate-x-2" : "opacity-100 scale-100 translate-x-0"
                    )}>
                        {(() => {
                            const report = reports[currentSlide]
                            if (!report) return null;

                            const isEmpty = Object.keys(report.data).length === 0
                            const cp = getCPTotals(report.data)
                            const isSineCP = report.directorate?.name?.toLowerCase().includes('sine')

                            return (
                                <div key={report.id} className="flex-1 flex flex-col min-h-0">
                                    <Card className="flex-1 border-zinc-200 dark:border-zinc-800 shadow-none rounded-xl flex flex-col overflow-hidden">
                                        <div className="bg-zinc-100/80 dark:bg-zinc-800/80 px-4 py-2 border-b border-zinc-200 dark:border-zinc-700">
                                            <h4 className="text-[14px] font-black text-zinc-800 dark:text-zinc-100 uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
                                                {report.directorate?.name}
                                            </h4>
                                        </div>
                                        <CardContent className="p-6 flex-1 bg-zinc-50/30 dark:bg-zinc-900/10 flex flex-col">
                                            {isEmpty ? (
                                                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                                                    <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                                                        <Compass className="w-8 h-8 text-zinc-300" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Aguardando lançamentos</p>
                                                        <p className="text-[11px] text-zinc-400 font-medium">Os indicadores operacionais desta diretoria<br />serão exibidos aqui após o registro.</p>
                                                    </div>
                                                </div>
                                            ) : isSineCP ? (
                                                <div className="flex flex-row gap-2 items-stretch h-full min-h-0">
                                                    <Card className="w-[420px] shrink-0 border-zinc-200 dark:border-zinc-800 shadow-none overflow-hidden rounded-xl flex flex-col">
                                                        <div className="bg-zinc-100/80 dark:bg-zinc-800/80 px-2.5 py-1.5 border-b border-zinc-200 dark:border-zinc-700">
                                                            <h4 className="text-[10px] font-black text-zinc-800 dark:text-zinc-100 uppercase tracking-tighter">SINE • INDICADORES</h4>
                                                        </div>
                                                        <CardContent className="p-2 flex-1">
                                                            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 h-full">
                                                                {[
                                                                    { label: "Atendimento Trabalhador", val: report.data.sine_atend_trabalhador, icon: Users },
                                                                    { label: "Trabalhador Online", val: report.data.sine_atend_trabalhador_online, icon: Laptop },
                                                                    { label: "Atendimento Empregador", val: report.data.sine_atend_empregador, icon: Building },
                                                                    { label: "Empregador Online", val: report.data.sine_atend_empregador_online, icon: Globe },
                                                                    { label: "Seguro Desemprego", val: report.data.sine_seguro_desemprego, icon: ShieldCheck },
                                                                    { label: "CTPS Digital", val: report.data.sine_ctps_digital, icon: IdCard },
                                                                    { label: "Vagas Captadas", val: report.data.sine_vagas_captadas, icon: ListChecks },
                                                                    { label: "Ligações Atendidas", val: report.data.sine_ligacoes_recebidas, icon: PhoneIncoming },
                                                                    { label: "Ligações Feitas", val: report.data.sine_ligacoes_realizadas, icon: PhoneOutgoing },
                                                                    { label: "Currículos", val: report.data.sine_curriculos, icon: FileText },
                                                                    { label: "Entrevistados", val: report.data.sine_entrevistados, icon: UserCheck },
                                                                    { label: "Orientação Profissional", val: report.data.sine_orientacao_profissional, icon: Compass },
                                                                ].map((item, idx) => (
                                                                    <div key={idx} className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-1">
                                                                        <div className="flex items-center gap-1.5 min-w-0 pr-1">
                                                                            <item.icon className="w-2.5 h-2.5 text-zinc-500 shrink-0" />
                                                                            <span className="text-[9px] text-zinc-700 dark:text-zinc-300 font-bold leading-tight tracking-tight">{item.label}</span>
                                                                        </div>
                                                                        <span className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-[9px] font-black text-zinc-900 dark:text-zinc-100 px-1.5 py-0.5 rounded shadow-sm min-w-[24px] text-center">
                                                                            {item.val || 0}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="w-[240px] shrink-0 border-zinc-200 dark:border-zinc-800 shadow-none overflow-hidden rounded-xl flex flex-col">
                                                        <div className="bg-zinc-100/80 dark:bg-zinc-800/80 px-2.5 py-1.5 border-b border-zinc-200 dark:border-zinc-700">
                                                            <h4 className="text-[10px] font-black text-zinc-800 dark:text-zinc-100 uppercase tracking-tighter">CP • CONSOLIDADO</h4>
                                                        </div>
                                                        <CardContent className="p-2 flex-1">
                                                            <div className="grid grid-cols-1 gap-y-1.5 h-full">
                                                                {[
                                                                    { label: "Atendimento", val: cp.atendimento, icon: Users },
                                                                    { label: "Inscrições Realizadas", val: cp.inscricoes, icon: ClipboardCheck },
                                                                    { label: "Pessoas Presentes", val: cp.pessoas_presentes, icon: UserCheck },
                                                                    { label: "Ligações Atendidas", val: cp.ligacoes_recebidas, icon: PhoneIncoming },
                                                                    { label: "Ligações Feitas", val: cp.ligacoes_realizadas, icon: PhoneOutgoing },
                                                                ].map((item, idx) => (
                                                                    <div key={idx} className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-1">
                                                                        <div className="flex items-center gap-1.5 min-w-0 pr-1">
                                                                            <item.icon className="w-2.5 h-2.5 text-zinc-500 shrink-0" />
                                                                            <span className="text-[9px] text-zinc-700 dark:text-zinc-300 font-bold leading-tight tracking-tight">{item.label}</span>
                                                                        </div>
                                                                        <span className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-[9px] font-black text-zinc-900 dark:text-zinc-100 px-1.5 py-0.5 rounded shadow-sm min-w-[24px] text-center">
                                                                            {item.val || 0}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="flex-1 border-zinc-200 dark:border-zinc-800 shadow-none overflow-hidden rounded-xl flex flex-col">
                                                        <div className="bg-zinc-100/80 dark:bg-zinc-800/80 px-2.5 py-1 border-b border-zinc-200 dark:border-zinc-700">
                                                            <h4 className="text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-tighter">PERFORMANCE POR UNIDADE TÉCNICA</h4>
                                                        </div>
                                                        <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
                                                            <table className="w-full text-[9px] border-collapse min-w-max">
                                                                <thead>
                                                                    <tr className="bg-zinc-200/50 dark:bg-zinc-950/50 sticky top-0 z-20 h-7">
                                                                        <th className="px-3 text-left font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-700 sticky left-0 bg-zinc-200 dark:bg-zinc-950 z-30">Unidade</th>
                                                                        {DIARIO_CP_INDICATORS.filter(i => i.id !== 'total_procedimentos').map(ind => {
                                                                            let label = ind.label.split(' ').pop();
                                                                            if (ind.id === 'inscricoes') label = 'Inscrições';
                                                                            if (ind.id === 'pessoas_presentes') label = 'Presentes';
                                                                            if (ind.id === 'ligacoes_recebidas') label = 'Atendidas';
                                                                            if (ind.id === 'ligacoes_realizadas') label = 'Feitas';

                                                                            return (
                                                                                <th key={ind.id} className="px-2 text-center font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-700 whitespace-nowrap">
                                                                                    {label}
                                                                                </th>
                                                                            );
                                                                        })}
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                                                                    {DIARIO_CENTROS.map(centro => {
                                                                        const hasData = DIARIO_CP_INDICATORS.some(ind => report.data[`cp_${centro.id}_${ind.id}`] > 0);
                                                                        if (!hasData) return null;

                                                                        return (
                                                                            <tr key={centro.id} className="hover:bg-zinc-50/50 transition-colors h-7 text-[10px]">
                                                                                <td className="px-3 font-bold text-zinc-800 dark:text-zinc-200 border-r border-zinc-100 dark:border-zinc-800 sticky left-0 bg-white dark:bg-zinc-900 z-10">{centro.label}</td>
                                                                                {DIARIO_CP_INDICATORS.filter(i => i.id !== 'total_procedimentos').map(ind => (
                                                                                    <td key={ind.id} className="px-2 text-center text-zinc-900 dark:text-zinc-100 font-medium tabular-nums">{report.data[`cp_${centro.id}_${ind.id}`] || 0}</td>
                                                                                ))}
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                                    {Object.entries(report.data).map(([k, v]: [any, any]) => (
                                                        <div key={k} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300">
                                                            <div className="flex items-start justify-between mb-4">
                                                                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest leading-tight">{k.replace(/_/g, ' ')}</span>
                                                                <TrendingUp className="w-3 h-3 text-zinc-300" />
                                                            </div>
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tabular-nums">{v}</span>
                                                                <span className="text-[10px] text-zinc-400 font-bold">Unid.</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )
                        })()}
                    </div>
                </div>
            )}
        </div>
    )
}
