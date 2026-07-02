'use client'

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveCreasPcdReport } from "@/app/dashboard/diretoria/[id]/creas-actions"

// Helper defining the sections
const victimSections = [
    { key: "def_violencia_fisica", label: "Pessoas com deficiência vítimas de violência física ou psicológica" },
    { key: "def_abuso_sexual", label: "Pessoas com deficiência vítimas de abuso sexual" },
    { key: "def_exploracao_sexual", label: "Pessoas com deficiência vítimas de exploração sexual" },
    { key: "def_negligencia", label: "Pessoas com deficiência vítimas de negligência ou abandono" },
    { key: "def_exploracao_financeira", label: "Pessoas com deficiência vítimas de exploração financeira" },
]

export function CreasPcdForm({ 
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
    const searchParams = useSearchParams()
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

        if (!confirm(`Confirma o envio do relatório de CREAS PCD para ${month}/${year}?`)) {
            return
        }

        setLoading(true)

        const formData = new FormData(formRef.current)
        const dbPayload: any = {}
        
        const keys: string[] = []
        victimSections.forEach(sec => {
            keys.push(`${sec.key}_atendidas_anterior`)
            keys.push(`${sec.key}_inseridos`)
            keys.push(`${sec.key}_desligados`)
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

        const result = await saveCreasPcdReport(directorateId, month, year, dbPayload)
        
        setLoading(false)

        if (!result.success) {
            alert(`Erro ao salvar: ${result.error}`)
        } else {
            alert("Relatório salvo com sucesso!")
            
            const isModal = searchParams?.get('modal') === 'true'
            if (isModal) {
                window.parent.postMessage({ type: 'closeModal', refresh: true }, '*')
                return
            }

            router.push(`/dashboard/diretoria/${directorateId}`)
            router.refresh()
        }
    }

    return (
        <form ref={formRef} onSubmit={onSubmit} onChange={handleInputBlurOrChange} className="space-y-6">
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
