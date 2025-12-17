'use client'

import { FormEngine, FormDefinition } from "@/components/form-engine"
import { submitReport } from "./actions"
import { useState } from "react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export function SubmissionForm({
    definition,
    directorateName
}: {
    definition: FormDefinition,
    directorateName: string
}) {
    const [month, setMonth] = useState<string>(String(new Date().getMonth() + 1))
    const [year, setYear] = useState<string>(String(new Date().getFullYear()))
    const [loading, setLoading] = useState(false)

    // Basic Toast implementation hook mock if shadcn toast not fully setup, 
    // but we usually have a Toaster. 
    // We'll just use alert for MVP if needed, but let's assume we can add simple feedback.

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
                alert("Relatório enviado com sucesso!")
                window.location.reload()
            }
        } catch (e) {
            alert("Erro inesperado ao enviar.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Mês de Referência</Label>
                            <Select value={month} onValueChange={setMonth} disabled={loading}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Mês" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                        <SelectItem key={m} value={String(m)}>{m}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Ano</Label>
                            <Select value={year} onValueChange={setYear} disabled={loading}>
                                <SelectTrigger>
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

            <FormEngine
                definition={definition}
                onSubmit={handleSubmit}
                disabled={loading}
            />
        </div>
    )
}
