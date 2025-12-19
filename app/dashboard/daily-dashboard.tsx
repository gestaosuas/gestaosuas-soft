
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
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-indigo-500" />
                        Acompanhamento Diário
                    </h2>
                    <p className="text-sm text-muted-foreground">Consolidado de todas as diretorias por dia.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="dash-date" className="sr-only">Data</Label>
                        <Input
                            id="dash-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-[180px] h-10 rounded-full"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse"></div>
                    ))}
                </div>
            ) : reports.length === 0 ? (
                <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                    <Info className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Nenhum registro para esta data</h3>
                    <p className="text-zinc-500 max-w-xs mx-auto mt-1">Selecione outro dia ou solicite o preenchimento dos relatórios.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {reports.map(report => {
                        const cp = getCPTotals(report.data)
                        const sineTotal = report.data.sine_total || 0
                        const isSineCP = report.directorate?.name?.toLowerCase().includes('sine')

                        return (
                            <Card key={report.id} className="border-none shadow-xl bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 overflow-hidden group">
                                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                                    <CardTitle className="flex items-center justify-between">
                                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">{report.directorate?.name}</span>
                                        <div className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs">
                                            Diário
                                        </div>
                                    </CardTitle>
                                    <CardDescription>Resumo dos indicadores coletados em {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {isSineCP ? (
                                        <div className="space-y-10">
                                            {/* SINE INDICATORS */}
                                            <div>
                                                <div className="flex items-center justify-between mb-6">
                                                    <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                                        <div className="w-1.5 h-4 bg-indigo-600 rounded-full"></div> SINE - INDICADORES
                                                    </h4>
                                                    <div className="text-[10px] font-bold text-zinc-400 uppercase">Valores do dia</div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
                                                    {[
                                                        { label: "Atendimento Trabalhador", val: report.data.sine_atend_trabalhador, icon: Users, color: "blue" },
                                                        { label: "Atendimento Online", val: report.data.sine_atend_trabalhador_online, icon: Laptop, color: "sky" },
                                                        { label: "Atendimento Empregador", val: report.data.sine_atend_empregador, icon: Building, color: "slate" },
                                                        { label: "Empregador Online", val: report.data.sine_atend_empregador_online, icon: Globe, color: "slate" },
                                                        { label: "Seguro Desemprego", val: report.data.sine_seguro_desemprego, icon: ShieldCheck, color: "orange" },
                                                        { label: "CTPS Digital", val: report.data.sine_ctps_digital, icon: IdCard, color: "emerald" },
                                                        { label: "Vagas Captadas", val: report.data.sine_vagas_captadas, icon: Briefcase, color: "green" },
                                                        { label: "Ligações Recebidas", val: report.data.sine_ligacoes_recebidas, icon: PhoneIncoming, color: "rose" },
                                                        { label: "Ligações Realizadas", val: report.data.sine_ligacoes_realizadas, icon: PhoneOutgoing, color: "rose" },
                                                        { label: "Currículos", val: report.data.sine_curriculos, icon: FileText, color: "violet" },
                                                        { label: "Entrevistados", val: report.data.sine_entrevistados, icon: UserCheck, color: "indigo" },
                                                        { label: "Processo Seletivo", val: report.data.sine_processo_seletivo, icon: ListChecks, color: "purple" },
                                                        { label: "Orientação Profissional", val: report.data.sine_orientacao_profissional, icon: Compass, color: "pink" },
                                                    ].map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between py-2 border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 px-2 rounded-md transition-colors group">
                                                            <div className="flex items-center gap-3">
                                                                <item.icon className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                                                                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">{item.label}</span>
                                                            </div>
                                                            <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">{item.val || 0}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* TOTAL SINE HIGHLIGHT */}
                                                <div className="mt-6 flex justify-end">
                                                    <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center gap-8">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold uppercase opacity-80 tracking-tighter">Total Sine</span>
                                                            <span className="text-2xl font-black">{report.data.sine_total || 0}</span>
                                                        </div>
                                                        <TrendingUp className="w-8 h-8 opacity-20" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CENTROS TOTALS */}
                                            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                                <div className="flex items-center justify-between mb-6">
                                                    <h4 className="text-xs font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest flex items-center gap-2">
                                                        <div className="w-1.5 h-4 bg-violet-600 rounded-full"></div> CENTROS - TOTAIS CONSOLIDADOS
                                                    </h4>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                                    {[
                                                        { label: "Atendimento", val: cp.atendimento, icon: Users, color: "violet" },
                                                        { label: "Inscrições", val: cp.inscricoes, icon: ClipboardCheck, color: "blue" },
                                                        { label: "Qtd. Presentes", val: cp.pessoas_presentes, icon: UserCheck, color: "amber" },
                                                        { label: "Lig. Recebidas", val: cp.ligacoes_recebidas, icon: PhoneIncoming, color: "rose" },
                                                        { label: "Lig. Realizadas", val: cp.ligacoes_realizadas, icon: PhoneOutgoing, color: "rose" },
                                                    ].map((item, idx) => (
                                                        <div key={idx} className="bg-white dark:bg-zinc-800/80 p-4 rounded-xl border border-zinc-100 dark:border-zinc-700/50 shadow-sm">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <item.icon className={`w-3.5 h-3.5 text-${item.color}-500`} />
                                                                <span className="text-[10px] font-bold text-zinc-500 uppercase">{item.label}</span>
                                                            </div>
                                                            <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">{item.val || 0}</p>
                                                        </div>
                                                    ))}

                                                    {/* TOTAL PROCEDIMENTOS */}
                                                    <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-4 rounded-xl shadow-md text-white sm:col-span-2 lg:col-span-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Activity className="w-3.5 h-3.5 text-violet-200" />
                                                            <span className="text-[10px] font-bold text-violet-100 uppercase">Total Proc.</span>
                                                        </div>
                                                        <p className="text-2xl font-black">{cp.total_procedimentos || 0}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {Object.entries(report.data).map(([k, v]: [any, any]) => (
                                                <div key={k} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-lg hover:border-indigo-200 transition-colors">
                                                    <span className="text-[10px] text-zinc-500 font-bold uppercase truncate pr-4">{k.replace(/_/g, ' ')}</span>
                                                    <span className="text-base font-black text-indigo-600">{v}</span>
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
