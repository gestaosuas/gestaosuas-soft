'use client'

import { FormEngine, FormDefinition } from "@/components/form-engine"
import { submitReport } from "@/app/dashboard/actions"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Calendar, FileText } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function SubmissionFormClient({
    definition,
    directorateName,
    directorateId,
    setor,
    isAdmin = false
}: {
    definition: FormDefinition,
    directorateName: string,
    directorateId: string,
    setor?: string,
    isAdmin?: boolean
}) {
    const [month, setMonth] = useState<string>(String(new Date().getMonth() + 1))
    const [year, setYear] = useState<string>(String(new Date().getFullYear()))
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (data: Record<string, any>) => {
        if (!confirm(`Confirma o envio do relatório de ${directorateName} referente a ${month}/${year}?`)) {
            return
        }

        setLoading(true)
        try {
            const result = await submitReport(data, Number(month), Number(year), directorateId, setor)
            if (result?.error) {
                alert(result.error)
            } else {
                alert("Relatório enviado e sincronizado com sucesso!")
                window.location.href = `/dashboard/diretoria/${directorateId}`
            }
        } catch (e) {
            alert("Erro inesperado ao enviar.")
        } finally {
            setLoading(false)
        }
    }

    const monthName = new Date(0, Number(month) - 1).toLocaleString('pt-BR', { month: 'long' })

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link href={setor === 'beneficios' ? `/dashboard/beneficios` : `/dashboard/diretoria/${directorateId}`}>
                        <Button variant="ghost" size="icon" className="hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                            Novo Relatório
                        </h1>
                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {directorateName}
                        </p>
                    </div>
                </div>
            </div>

            {/* Selection Card */}
            <Card className="border-indigo-100 dark:border-indigo-900/30 shadow-xl shadow-indigo-500/5 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-lg">Período de Referência</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
                        <div className="space-y-3">
                            <Label className="text-zinc-600 font-medium">Mês</Label>
                            <Select value={month} onValueChange={setMonth} disabled={loading}>
                                <SelectTrigger className="h-12 bg-zinc-50 border-zinc-200 focus:ring-indigo-500 text-base">
                                    <SelectValue placeholder="Mês" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
                                        const currentDate = new Date()
                                        const currentMonth = currentDate.getMonth() + 1
                                        const currentYear = currentDate.getFullYear()
                                        const selectedYearInt = parseInt(year)

                                        // Disable future months if not admin
                                        // If selected year is future -> all disabled
                                        // If selected year is current -> future months disabled
                                        // If selected year is past -> all enabled
                                        let isDisabled = false
                                        if (!isAdmin) {
                                            if (selectedYearInt > currentYear) isDisabled = true
                                            else if (selectedYearInt === currentYear && m > currentMonth) isDisabled = true
                                        }

                                        return (
                                            <SelectItem
                                                key={m}
                                                value={String(m)}
                                                disabled={isDisabled}
                                                className={`focus:bg-indigo-50 focus:text-indigo-700 cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {new Date(0, m - 1).toLocaleString('pt-BR', { month: 'long' }).toUpperCase()}
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-zinc-600 font-medium">Ano</Label>
                            <Select value={year} onValueChange={setYear} disabled={loading}>
                                <SelectTrigger className="h-12 bg-zinc-50 border-zinc-200 focus:ring-indigo-500 text-base">
                                    <SelectValue placeholder="Ano" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2025">2025</SelectItem>
                                    <SelectItem value="2026">2026</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Form Card */}
            <div className="relative">
                <div className="absolute -left-4 top-10 w-full h-full bg-indigo-500/5 rounded-3xl -z-10 blur-xl"></div>
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950">
                    <CardContent className="pt-8 px-8">
                        <div className="mb-8 flex items-center justify-between border-b border-zinc-100 pb-4">
                            <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
                                Indicadores de <span className="text-indigo-600 capitalize">{monthName}</span>
                            </h2>
                            <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-wider">
                                Entrada de Dados
                            </span>
                        </div>

                        <FormEngine
                            definition={definition}
                            onSubmit={handleSubmit}
                            disabled={loading}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
