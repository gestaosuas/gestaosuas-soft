
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    Calendar as CalendarIcon, Filter, Info, Users, Briefcase, Phone, ClipboardCheck,
    Laptop, Building, Globe, ShieldCheck, IdCard, PhoneIncoming, PhoneOutgoing,
    FileText, UserCheck, ListChecks, Compass, TrendingUp, Activity
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"

export function DailyDashboard() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [reports, setReports] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchReports()
    }, [date])

    async function fetchReports() {
        setLoading(true)
        const { data, error } = await supabase
            .from('daily_reports')
            .select(`
                *,
                directorate:directorates(name)
            `)
            .eq('date', date)

        if (!error && data) {
            setReports(data)
        }
        setLoading(false)
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
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-zinc-900/50 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                        Acompanhamento Diário
                    </h2>
                    <p className="text-[13px] text-zinc-500 dark:text-zinc-400 font-medium">Consolidado institucional das diretorias por data.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Label htmlFor="dash-date" className="sr-only">Data</Label>
                        <Input
                            id="dash-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-[180px] h-11 rounded-lg bg-zinc-50/50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 font-bold text-zinc-700 dark:text-zinc-300 transition-all"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {[1, 2].map(i => (
                        <div key={i} className="h-96 rounded-2xl bg-zinc-50 dark:bg-zinc-900 animate-pulse border border-zinc-100 dark:border-zinc-800"></div>
                    ))}
                </div>
            ) : reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-zinc-50/30 dark:bg-zinc-950/20 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 mb-4">
                        <Info className="w-8 h-8 text-zinc-300" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Sem registros para esta data</h3>
                    <p className="text-[13px] text-zinc-500 dark:text-zinc-400 font-medium mt-1">Selecione outro período no calendário acima.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-10">
                    {reports.map(report => {
                        const cp = getCPTotals(report.data)
                        const isSineCP = report.directorate?.name?.toLowerCase().includes('sine')

                        return (
                            <Card key={report.id} className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm overflow-hidden rounded-2xl">
                                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 px-8 py-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                                {report.directorate?.name}
                                            </CardTitle>
                                            <CardDescription className="text-sm font-medium text-zinc-500">
                                                Dados coletados em {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                            <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest leading-none">Relatório Consolidado</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                    {isSineCP ? (
                                        <div className="space-y-12">
                                            {/* SINE SECTION */}
                                            <div className="space-y-8">
                                                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                                                    <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                        SINE • Indicadores de Atendimento
                                                    </h4>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-4">
                                                    {[
                                                        { label: "Atendimento Trabalhador", val: report.data.sine_atend_trabalhador, icon: Users },
                                                        { label: "Atendimento Online", val: report.data.sine_atend_trabalhador_online, icon: Laptop },
                                                        { label: "Atendimento Empregador", val: report.data.sine_atend_empregador, icon: Building },
                                                        { label: "Empregador Online", val: report.data.sine_atend_empregador_online, icon: Globe },
                                                        { label: "Seguro Desemprego", val: report.data.sine_seguro_desemprego, icon: ShieldCheck },
                                                        { label: "CTPS Digital", val: report.data.sine_ctps_digital, icon: IdCard },
                                                        { label: "Vagas Captadas", val: report.data.sine_vagas_captadas, icon: Briefcase },
                                                        { label: "Ligações Recebidas", val: report.data.sine_ligacoes_recebidas, icon: PhoneIncoming },
                                                        { label: "Ligações Realizadas", val: report.data.sine_ligacoes_realizadas, icon: PhoneOutgoing },
                                                        { label: "Currículos", val: report.data.sine_curriculos, icon: FileText },
                                                        { label: "Entrevistados", val: report.data.sine_entrevistados, icon: UserCheck },
                                                        { label: "Processo Seletivo", val: report.data.sine_processo_seletivo, icon: ListChecks },
                                                        { label: "Orientação Profissional", val: report.data.sine_orientacao_profissional, icon: Compass },
                                                    ].map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between group transition-all">
                                                            <div className="flex items-center gap-3">
                                                                <item.icon className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors" />
                                                                <span className="text-[13px] font-medium text-zinc-600 dark:text-zinc-400">{item.label}</span>
                                                            </div>
                                                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{item.val || 0}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* SINE TOTAL HIGHLIGHT */}
                                                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                                                    <div className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-8 py-5 rounded-2xl shadow-xl shadow-zinc-900/10 flex items-center gap-10">
                                                        <div className="space-y-0.5">
                                                            <span className="text-[10px] font-bold uppercase opacity-60 tracking-[0.1em] block">Volume Total SINE</span>
                                                            <span className="text-3xl font-bold tabular-nums tracking-tight">{report.data.sine_total || 0}</span>
                                                        </div>
                                                        <div className="p-3 bg-white/10 dark:bg-black/5 rounded-xl">
                                                            <TrendingUp className="w-6 h-6" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CENTROS SECTION */}
                                            <div className="space-y-8 pt-4">
                                                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                                                    <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                        Centros Profissionalizantes • Performance
                                                    </h4>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                                                    {[
                                                        { label: "Atendimento", val: cp.atendimento, icon: Users },
                                                        { label: "Inscrições", val: cp.inscricoes, icon: ClipboardCheck },
                                                        { label: "Presenças", val: cp.pessoas_presentes, icon: UserCheck },
                                                        { label: "Lançamento", val: cp.ligacoes_recebidas, icon: PhoneIncoming },
                                                        { label: "Retorno", val: cp.ligacoes_realizadas, icon: PhoneOutgoing },
                                                    ].map((item, idx) => (
                                                        <div key={idx} className="bg-white dark:bg-zinc-900/50 p-5 rounded-xl border border-zinc-200/60 dark:border-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)] group hover:border-zinc-900 dark:hover:border-zinc-50 transition-all">
                                                            <div className="flex flex-col gap-4">
                                                                <div className="p-2 w-fit bg-zinc-50 dark:bg-zinc-800 rounded-lg group-hover:bg-zinc-900 dark:group-hover:bg-zinc-50 transition-colors">
                                                                    <item.icon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white dark:group-hover:text-zinc-900 transition-colors" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{item.label}</span>
                                                                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums leading-none tracking-tight">{item.val || 0}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {/* TOTAL PROCEDIMENTOS */}
                                                    <div className="bg-zinc-900 dark:bg-zinc-50 p-5 rounded-xl text-white dark:text-zinc-900 sm:col-span-2 lg:col-span-1 flex flex-col justify-between gap-4 shadow-lg shadow-zinc-900/5 transition-transform hover:scale-[1.02] cursor-default">
                                                        <div className="p-2 w-fit bg-white/10 dark:bg-black/5 rounded-lg">
                                                            <Activity className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Total Proc.</span>
                                                            <p className="text-2xl font-bold tabular-nums leading-none tracking-tight">{cp.total_procedimentos || 0}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
                                            {Object.entries(report.data).map(([k, v]: [any, any]) => (
                                                <div key={k} className="flex items-center justify-between p-4 bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800 rounded-xl hover:border-zinc-900 dark:hover:border-zinc-50 transition-all">
                                                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase truncate pr-4">{k.replace(/_/g, ' ')}</span>
                                                    <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">{v}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
