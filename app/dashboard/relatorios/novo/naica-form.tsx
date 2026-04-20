'use client'

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveNaicaReport } from "@/app/dashboard/diretoria/[id]/naica-actions"

export function NaicaForm({ 
    directorateId, 
    unitName,
    month, 
    year, 
    initialData, 
    isAdmin 
}: { 
    directorateId: string, 
    unitName: string,
    month: number, 
    year: number, 
    initialData: any, 
    isAdmin: boolean 
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)
    
    // Live calculated totals
    const [totalMasc, setTotalMasc] = useState<number>(0)
    const [totalFem, setTotalFem] = useState<number>(0)
    const [totalCrianças, setTotalCrianças] = useState<number>(0)

    const handleInputBlurOrChange = () => {
        if (!formRef.current) return
        const formData = new FormData(formRef.current)
        
        const mAnt = Number(formData.get("mes_anterior_masc")) || 0
        const mIns = Number(formData.get("inseridos_masc")) || 0
        const mDes = Number(formData.get("desligados_masc")) || 0
        
        const fAnt = Number(formData.get("mes_anterior_fem")) || 0
        const fIns = Number(formData.get("inseridos_fem")) || 0
        const fDes = Number(formData.get("desligados_fem")) || 0
        
        // This is not specifically displayed directly, but we can compute standard UI totals if we want to visually reflect the logic.
        // For total_atendidas = the sum of strictly active children this month.
        const currentActiveMasc = mAnt + mIns - mDes;
        const currentActiveFem = fAnt + fIns - fDes;
        
        setTotalMasc(currentActiveMasc)
        setTotalFem(currentActiveFem)
        setTotalCrianças(Math.max(0, currentActiveMasc) + Math.max(0, currentActiveFem))
    }

    // Evaluate total on mount
    useEffect(() => {
        handleInputBlurOrChange()
    }, [initialData])

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!formRef.current) return
        
        if (!confirm(`Confirma o envio do relatório do NAICA ${unitName} para ${month}/${year}?`)) {
            return
        }

        setLoading(true)

        const formData = new FormData(formRef.current)
        const dbPayload: any = {}
        
        const keys = [
            "mes_anterior_masc", "mes_anterior_fem", 
            "inseridos_masc", "inseridos_fem", 
            "desligados_masc", "desligados_fem", 
            "atendimentos"
        ]

        keys.forEach(k => {
            const val = formData.get(k)
            dbPayload[k] = val === '' || val === null ? 0 : Number(val)
        })
        
        // Manual totals
        dbPayload.total_atendidas = totalCrianças
        dbPayload.status = isAdmin ? 'finalized' : 'submitted'

        const result = await saveNaicaReport(directorateId, unitName, month, year, dbPayload)
        
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
            <Card className="border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-none">
                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-blue-900 dark:text-blue-100">
                        Indicadores de Público (Masculino)
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6">
                    <div className="space-y-2">
                        <Label>Masculino em acompanhamento no 1º dia do Mês</Label>
                        <Input type="number" name="mes_anterior_masc" defaultValue={initialData?.mes_anterior_masc ?? 0} min="0" placeholder="0" className="dark:bg-zinc-950 font-bold text-blue-800" />
                    </div>
                    <div className="space-y-2">
                        <Label>Admitidos Masculino (Novo)</Label>
                        <Input type="number" name="inseridos_masc" defaultValue={initialData?.inseridos_masc || ''} min="0" placeholder="0" className="dark:bg-zinc-950" />
                    </div>
                    <div className="space-y-2">
                        <Label>Desligados Masculino</Label>
                        <Input type="number" name="desligados_masc" defaultValue={initialData?.desligados_masc || ''} min="0" placeholder="0" className="dark:bg-zinc-950" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-none">
                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-rose-900 dark:text-rose-100">
                        Indicadores de Público (Feminino)
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6">
                    <div className="space-y-2">
                        <Label>Feminino em acompanhamento no 1º dia do Mês</Label>
                        <Input type="number" name="mes_anterior_fem" defaultValue={initialData?.mes_anterior_fem ?? 0} min="0" placeholder="0" className="dark:bg-zinc-950 font-bold text-rose-800" />
                    </div>
                    <div className="space-y-2">
                        <Label>Admitidas Feminino (Novo)</Label>
                        <Input type="number" name="inseridos_fem" defaultValue={initialData?.inseridos_fem || ''} min="0" placeholder="0" className="dark:bg-zinc-950" />
                    </div>
                    <div className="space-y-2">
                        <Label>Desligadas Feminino</Label>
                        <Input type="number" name="desligados_fem" defaultValue={initialData?.desligados_fem || ''} min="0" placeholder="0" className="dark:bg-zinc-950" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-none">
                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-green-900 dark:text-green-100">
                        Resumo e Indicadores Adicionais
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6">
                    <div className="space-y-2">
                        <Label className="font-bold text-green-800">Total Crianças Inseridas</Label>
                        <Input type="number" name="total_atendidas" value={totalCrianças} readOnly className="bg-green-50/50 opacity-100 border-green-200 font-bold" />
                        <p className="text-[10px] text-zinc-500">Masc Ativo: {Math.max(0, totalMasc)} • Fem Ativo: {Math.max(0, totalFem)}</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Atendimentos Realizados</Label>
                        <Input type="number" name="atendimentos" defaultValue={initialData?.atendimentos || ''} min="0" placeholder="0" className="dark:bg-zinc-950" />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end mb-10 pb-8 mt-8">
                <Button 
                    type="submit" 
                    className="w-full sm:w-auto px-8 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide shadow-lg shadow-blue-600/20 transition-all"
                    disabled={loading}
                >
                    {loading ? "Salvando..." : "Salvar Relatório"}
                </Button>
            </div>
        </form>
    )
}
