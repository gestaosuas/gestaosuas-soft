'use client'

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveCreasIdosoReport } from "@/app/dashboard/diretoria/[id]/creas-actions"

// Helper defining the sections
const victimSections = [
    { key: "violencia_fisica", label: "Pessoas idosas vítimas de violência física ou psicológica" },
    { key: "abuso_sexual", label: "Pessoas idosas vítimas de abuso sexual" },
    { key: "exploracao_sexual", label: "Pessoas idosas vítimas de exploração sexual" },
    { key: "negligencia", label: "Pessoas idosas vítimas de negligência ou abandono" },
    { key: "exploracao_financeira", label: "Pessoas idosas vítimas de exploração financeira" },
]

export function CreasIdosoForm({ 
    directorateId, 
    month, 
    year, 
    initialData, 
    isAdmin 
}: { 
    directorateId: string, 
    month: number, 
    year: number, 
    initialData: any, 
    isAdmin: boolean 
}) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)
    const [totals, setTotals] = useState<Record<string, number>>({})

    const handleInputBlurOrChange = () => {
        if (!formRef.current) return
        const formData = new FormData(formRef.current)
        const newTotals: Record<string, number> = {}
        
        victimSections.forEach(sec => {
            const anterior = Number(formData.get(`${sec.key}_atendidas_anterior`)) || 0
            const inseridos = Number(formData.get(`${sec.key}_inseridos`)) || 0
            newTotals[sec.key] = anterior + inseridos
        })
        setTotals(newTotals)
    }

    // Initialize totals on mount
    useEffect(() => {
        handleInputBlurOrChange()
    }, [])

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!formRef.current) return
        
        if (!confirm(`Confirma o envio do relatório de CREAS Idoso para ${month}/${year}?`)) {
            return
        }

        setLoading(true)

        const formData = new FormData(formRef.current)
        const dbPayload: any = {}
        
        // PAEFI fields
        const keys = [
            'paefi_novos_casos', 'paefi_acomp_inicio', 'paefi_inseridos', 'paefi_desligados', 'paefi_bolsa_familia', 'paefi_bpc', 'paefi_substancias'
        ]
        
        victimSections.forEach(sec => {
            keys.push(`${sec.key}_atendidas_anterior`)
            keys.push(`${sec.key}_inseridos`)
            keys.push(`${sec.key}_desligados`)
            // total is calculated
        })

        keys.forEach(k => {
            const val = formData.get(k)
            dbPayload[k] = val === '' || val === null ? 0 : Number(val)
        })
        
        // Append totals manually to payload
        victimSections.forEach(sec => {
            dbPayload[`${sec.key}_total`] = totals[sec.key] || 0
        })
        
        dbPayload.status = isAdmin ? 'finalized' : 'submitted'

        const result = await saveCreasIdosoReport(directorateId, month, year, dbPayload)
        
        setLoading(false)

        if (!result.success) {
            alert(`Erro ao salvar: ${result.error}`)
        } else {
            alert("Relatório salvo com sucesso!")
            router.push(`/dashboard/diretoria/${directorateId}`)
            router.refresh()
        }
    }

    return (
        <form ref={formRef} onSubmit={onSubmit} onChange={handleInputBlurOrChange} className="space-y-6">
            <Card className="border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-none">
                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-blue-900 dark:text-blue-100">
                        Famílias em Acompanhamento pelo PAEFI
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
                    <div className="space-y-2">
                        <Label>Casos Novos Recebidos</Label>
                        <Input type="number" name="paefi_novos_casos" defaultValue={initialData?.paefi_novos_casos || ''} min="0" placeholder="0" className="dark:bg-zinc-950" />
                    </div>
                    <div className="space-y-2">
                        <Label>Famílias em Acomp. 1º Dia Mês</Label>
                        <Input type="number" name="paefi_acomp_inicio" defaultValue={initialData?.paefi_acomp_inicio || ''} min="0" placeholder="0" className="dark:bg-zinc-950" />
                    </div>
                    <div className="space-y-2">
                        <Label>Famílias Inseridos/Atend.</Label>
                        <Input type="number" name="paefi_inseridos" defaultValue={initialData?.paefi_inseridos || ''} min="0" placeholder="0" className="dark:bg-zinc-950" />
                    </div>
                    <div className="space-y-2">
                        <Label>Núm de Casos Desligados</Label>
                        <Input type="number" name="paefi_desligados" defaultValue={initialData?.paefi_desligados || ''} min="0" placeholder="0" className="dark:bg-zinc-950" />
                    </div>
                    <div className="space-y-2">
                        <Label>Famílias Benef. Bolsa Família</Label>
                        <Input type="number" name="paefi_bolsa_familia" defaultValue={initialData?.paefi_bolsa_familia || ''} min="0" placeholder="0" className="dark:bg-zinc-950" />
                    </div>
                    <div className="space-y-2">
                        <Label>Famílias com BPC</Label>
                        <Input type="number" name="paefi_bpc" defaultValue={initialData?.paefi_bpc || ''} min="0" placeholder="0" className="dark:bg-zinc-950" />
                    </div>
                    <div className="space-y-2">
                        <Label>Famílias com Dep. Substâncias</Label>
                        <Input type="number" name="paefi_substancias" defaultValue={initialData?.paefi_substancias || ''} min="0" placeholder="0" className="dark:bg-zinc-950" />
                    </div>
                </CardContent>
            </Card>

            {victimSections.map(sec => (
                <Card key={sec.key} className="border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-none">
                    <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-purple-900 dark:text-purple-100">
                            {sec.label}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-6">
                        <div className="space-y-2">
                            <Label>Atendidas no mês anterior</Label>
                            <Input type="number" name={`${sec.key}_atendidas_anterior`} defaultValue={initialData[`${sec.key}_atendidas_anterior`] || ''} min="0" placeholder="0" className="dark:bg-zinc-950" />
                        </div>
                        <div className="space-y-2">
                            <Label>Inseridos / Novos</Label>
                            <Input type="number" name={`${sec.key}_inseridos`} defaultValue={initialData[`${sec.key}_inseridos`] || ''} min="0" placeholder="0" className="dark:bg-zinc-950" />
                        </div>
                        <div className="space-y-2">
                            <Label>Desligados no PAEFI</Label>
                            <Input type="number" name={`${sec.key}_desligados`} defaultValue={initialData[`${sec.key}_desligados`] || ''} min="0" placeholder="0" className="dark:bg-zinc-950" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-blue-600 font-bold">Total</Label>
                            <Input type="number" name={`${sec.key}_total`} value={totals[sec.key] || ''} readOnly className="bg-blue-50/50 opacity-100 border-blue-200 dark:bg-blue-900/10 font-bold" />
                        </div>
                    </CardContent>
                </Card>
            ))}

            <div className="flex justify-end mb-10 pb-8">
                <Button type="submit" disabled={loading} className="px-8 py-6 text-[13px] uppercase tracking-wider font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg">
                    {loading ? "Salvando..." : "Salvar Relatório"}
                </Button>
            </div>
        </form>
    )
}
