'use client'

import { FormEngine, FormDefinition } from "@/components/form-engine"
import { submitReport } from "@/app/dashboard/actions"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function SubmissionFormClient({
    definition,
    directorateName
}: {
    definition: FormDefinition,
    directorateName: string
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
            const result = await submitReport(data, Number(month), Number(year))
            if (result?.error) {
                alert(result.error)
            } else {
                alert("Relatório enviado e sincronizado com sucesso!")
                window.location.href = '/dashboard' // Volta para o hub
            }
        } catch (e) {
            alert("Erro inesperado ao enviar.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Novo Relatório Mensal</h1>
                    <p className="text-sm text-muted-foreground">{directorateName}</p>
                </div>
            </div>

            <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                        <div className="space-y-2">
                            <Label>Mês de Referência</Label>
                            <Select value={month} onValueChange={setMonth} disabled={loading}>
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Mês" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                        <SelectItem key={m} value={String(m)}>
                                            {new Date(0, m - 1).toLocaleString('pt-BR', { month: 'long' }).toUpperCase()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Ano</Label>
                            <Select value={year} onValueChange={setYear} disabled={loading}>
                                <SelectTrigger className="h-11">
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

            <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardContent className="pt-6">
                    <FormEngine
                        definition={definition}
                        onSubmit={handleSubmit}
                        disabled={loading}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
