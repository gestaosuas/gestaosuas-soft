
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DIARIO_CENTROS, DIARIO_CP_INDICATORS } from "../../diario-config"
import { submitDailyReport } from "@/app/dashboard/actions"
import { Loader2, Save, ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"

export function DailyFormClient({ directorateId }: { directorateId: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [data, setData] = useState<Record<string, any>>({})

    const handleInputChange = (id: string, value: string) => {
        setData(prev => ({ ...prev, [id]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!confirm("Deseja salvar os indicadores diários para a data selecionada?")) {
            return
        }

        setLoading(true)

        try {
            const numericData = Object.entries(data).reduce((acc, [key, val]) => {
                acc[key] = Number(val) || 0
                return acc
            }, {} as Record<string, number>)

            const result = await submitDailyReport(date, directorateId, numericData)

            if (result.success) {
                alert("Relatório diário salvo com sucesso!")
                router.push(`/dashboard/diretoria/${directorateId}`)
            } else {
                // @ts-ignore
                alert(result.error || "Erro ao salvar relatório")
            }
        } catch (error: any) {
            alert("Ocorreu um erro ao enviar os dados: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-24">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-6">
                    <Link href={`/dashboard/diretoria/${directorateId}`}>
                        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">
                            <ArrowLeft className="h-5 w-5 text-zinc-500" />
                        </Button>
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-extrabold tracking-tight text-blue-900 dark:text-blue-50">
                            Registro de Indicadores
                        </h1>
                        <p className="text-[13px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Controle Operacional Diário</p>
                    </div>
                </div>

                <div className="flex flex-col gap-2.5 min-w-[240px]">
                    <Label htmlFor="date" className="text-[11px] uppercase tracking-widest font-bold text-zinc-500 ml-0.5">Calendário de Referência</Label>
                    <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="h-11 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-600 transition-all font-bold uppercase tracking-tight"
                        required
                    />
                </div>
            </header>

            {/* SINE Section */}
            <Card className="border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-none rounded-2xl overflow-hidden">
                <CardHeader className="pt-8 px-8 pb-6 border-b border-zinc-100 dark:border-zinc-800/60">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="space-y-0.5">
                            <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100">Operações SINE</CardTitle>
                            <CardDescription className="text-[12px] font-medium text-zinc-500">Métricas de atendimento e gestão de vagas.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[
                            { id: "sine_atend_trabalhador", label: "Atend. Trabalhador" },
                            { id: "sine_atend_trabalhador_online", label: "Atend. Trabalhador Online" },
                            { id: "sine_atend_empregador", label: "Atend. Empregador" },
                            { id: "sine_atend_empregador_online", label: "Atend. Empregador Online" },
                            { id: "sine_seguro_desemprego", label: "Seguro Desemprego" },
                            { id: "sine_ctps_digital", label: "CTPS Digital" },
                            { id: "sine_vagas_captadas", label: "Vagas Captadas" },
                            { id: "sine_ligacoes_recebidas", label: "Ligações Recebidas" },
                            { id: "sine_ligacoes_realizadas", label: "Ligações Realizadas" },
                            { id: "sine_curriculos", label: "Currículos" },
                            { id: "sine_entrevistados", label: "Entrevistados" },
                            { id: "sine_processo_seletivo", label: "Processo Seletivo" },
                            { id: "sine_orientacao_profissional", label: "Orientação Profissional" },
                            { id: "sine_total", label: "TOTAL SINE", className: "bg-zinc-50 dark:bg-zinc-950 border-zinc-900/10 dark:border-zinc-50/10 font-bold" },
                        ].map((field) => (
                            <div key={field.id} className="space-y-2.5">
                                <Label htmlFor={field.id} className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider ml-0.5">{field.label}</Label>
                                <Input
                                    id={field.id}
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    className={cn("h-11 bg-zinc-50/30 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-lg focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 transition-all font-medium", field.className)}
                                    value={data[field.id] || ""}
                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* CP Section - Table Layout */}
            <Card className="border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-none rounded-2xl overflow-hidden">
                <CardHeader className="pt-8 px-8 pb-6 border-b border-zinc-100 dark:divide-blue-800/60 bg-blue-50/20 dark:bg-blue-950/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-900 dark:bg-blue-600 rounded-lg">
                            <Save className="w-5 h-5 text-white" />
                        </div>
                        <div className="space-y-0.5">
                            <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100">Qualificação Profissional</CardTitle>
                            <CardDescription className="text-[12px] font-medium text-zinc-500">Distribuição de procedimentos por unidade técnica.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm">
                        <thead className="bg-zinc-50/50 dark:bg-zinc-950/50 border-b border-zinc-100 dark:border-zinc-800/60">
                            <tr>
                                <th className="p-5 text-left font-bold border-r border-zinc-100 dark:border-zinc-800/60 sticky left-0 bg-white dark:bg-zinc-900 z-10 w-[260px] uppercase text-[11px] tracking-widest text-zinc-400">Classificação</th>
                                {DIARIO_CENTROS.map((centro: any) => (
                                    <th key={centro.id} className="p-5 text-center font-bold min-w-[160px] uppercase text-[10px] tracking-widest text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{centro.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                            {DIARIO_CP_INDICATORS.map((ind: any, idx: number) => (
                                <tr key={ind.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                                    <td className="p-5 font-bold border-r border-zinc-100 dark:border-zinc-800/60 sticky left-0 bg-white dark:bg-zinc-900 z-10 text-[13px] text-zinc-700 dark:text-zinc-300 uppercase tracking-tight">{ind.label}</td>
                                    {DIARIO_CENTROS.map((centro: any) => {
                                        const fieldId = `cp_${centro.id}_${ind.id}`;
                                        const isTotal = ind.id === 'total_procedimentos';
                                        return (
                                            <td key={centro.id} className="p-2 border-r border-zinc-100 dark:border-zinc-800/60 last:border-r-0">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    placeholder="0"
                                                    className={cn(
                                                        "h-10 text-center border-none bg-transparent focus-visible:ring-0 focus-visible:bg-zinc-50 dark:focus-visible:bg-zinc-800/50 rounded-lg transition-all font-bold text-zinc-600 dark:text-zinc-400",
                                                        isTotal && "text-zinc-900 dark:text-zinc-50 bg-zinc-50/50 dark:bg-zinc-800/50"
                                                    )}
                                                    value={data[fieldId] || ""}
                                                    onChange={(e) => handleInputChange(fieldId, e.target.value)}
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <div className="fixed bottom-10 right-10 z-50 animate-in slide-in-from-right-10 duration-500">
                <Button
                    size="lg"
                    className="h-14 px-10 bg-blue-900 dark:bg-blue-600 text-white hover:bg-blue-800 dark:hover:bg-blue-500 font-bold rounded-full transition-all active:scale-[0.95] shadow-[0_12px_40px_rgba(37,99,235,0.25)] dark:shadow-none uppercase tracking-widest text-[11px] gap-4"
                    disabled={loading}
                    type="submit"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Save className="h-4 w-4" />}
                    {loading ? "Efetivando Registro..." : "Efetivar Registro Diário"}
                </Button>
            </div>
        </form>
    )
}
