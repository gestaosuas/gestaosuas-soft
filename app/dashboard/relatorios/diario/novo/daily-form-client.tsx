
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
        <form onSubmit={handleSubmit} className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/diretoria/${directorateId}`}>
                        <Button variant="outline" size="icon" type="button">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Relatório Diário</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1 items-end">
                        <Label htmlFor="date" className="text-xs text-muted-foreground uppercase font-bold">Data de Referência</Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-[200px] h-11 font-bold border-indigo-200"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* SINE Section */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <CardHeader className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">SINE - Indicadores Diários</CardTitle>
                            <CardDescription>Preencha os números totais do SINE para o dia selecionado.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                            { id: "sine_total", label: "TOTAL SINE", className: "bg-zinc-50 border-zinc-300 font-bold" },
                        ].map((field) => (
                            <div key={field.id} className="space-y-2">
                                <Label htmlFor={field.id} className="text-zinc-500 text-xs uppercase font-bold tracking-wider">{field.label}</Label>
                                <Input
                                    id={field.id}
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    className={`h-11 ${field.className || ""}`}
                                    value={data[field.id] || ""}
                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* CP Section - Table Layout */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <CardHeader className="bg-indigo-50 dark:bg-indigo-900/10 border-b border-indigo-100 dark:border-indigo-900/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
                            <Save className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg text-indigo-700 dark:text-indigo-400">Centros Profissionalizantes</CardTitle>
                            <CardDescription>Preencha os indicadores por unidade.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-zinc-100/80 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700">
                                <th className="p-4 text-left font-bold border-r border-zinc-200 dark:border-zinc-700 sticky left-0 bg-zinc-100 dark:bg-zinc-800 z-10 w-[240px] uppercase text-xs tracking-widest text-zinc-500">INDICADOR</th>
                                {DIARIO_CENTROS.map((centro: any) => (
                                    <th key={centro.id} className="p-4 text-center font-bold min-w-[140px] uppercase text-[10px] tracking-wider text-zinc-600">{centro.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {DIARIO_CP_INDICATORS.map((ind: any, idx: number) => (
                                <tr key={ind.id} className={idx % 2 === 0 ? "bg-white dark:bg-zinc-950" : "bg-zinc-50/50 dark:bg-zinc-900/30"}>
                                    <td className="p-4 font-bold border-r border-zinc-200 dark:border-zinc-700 sticky left-0 bg-inherit z-10 text-zinc-700 dark:text-zinc-300">{ind.label}</td>
                                    {DIARIO_CENTROS.map((centro: any) => {
                                        const fieldId = `cp_${centro.id}_${ind.id}`;
                                        const isTotal = ind.id === 'total_procedimentos';
                                        return (
                                            <td key={centro.id} className="p-2 border-r border-zinc-200 dark:border-zinc-700 last:border-r-0">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    placeholder="0"
                                                    className={`h-10 text-center border-none bg-transparent focus-visible:ring-1 focus-visible:ring-indigo-500 rounded-none ${isTotal ? 'font-black bg-zinc-100/50 dark:bg-zinc-800/50' : ''}`}
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

            <div className="fixed bottom-6 right-6 lg:right-10 z-50">
                <Button size="lg" className="shadow-2xl h-14 px-8 rounded-full gap-2 bg-indigo-600 hover:bg-indigo-700" disabled={loading} type="submit">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    {loading ? "Salvando..." : "Salvar Relatório Diário"}
                </Button>
            </div>
        </form>
    )
}
