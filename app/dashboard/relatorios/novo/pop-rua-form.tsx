'use client'

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { savePopRuaReport } from "@/app/dashboard/diretoria/[id]/pop-rua-actions"

// Based on POP_RUA_FORM_DEFINITION
const block2Fields = [
    { id: "cr_a1_masc", label: "A.1 Centro Especializado para Pessoas em Situação de Rua Masculino" },
    { id: "cr_a1_fem", label: "A.1 Centro Especializado para Pessoas em Situação de Rua Feminino" },
    { id: "cr_b1_drogas", label: "B.1 Usuários de drogas" },
    { id: "cr_b2_migrantes", label: "B.2 Pessoas Consideradas Migrantes/Trecheiros" },
    { id: "cr_b3_mental", label: "B.3 Doença ou transtorno Psiquiatrico (Mental)" },
    { id: "cr_cad_unico", label: "Pessoas cadastradas no Cad Único" },
    { id: "cr_enc_mercado", label: "Pessoas encaminhadas para o mercado de trabalho" },
    { id: "cr_enc_caps", label: "Pessoas encaminhadas para CAPs AD e Saúde Mental" },
    { id: "cr_enc_saude", label: "Pessoas encaminhadas para a Saúde Pública (UAI/UBS)" },
    { id: "cr_enc_consultorio", label: "Pessoas encaminhadas para Consultório na Rua" },
    { id: "cr_segunda_via", label: "Segunda via de Documentação" }
]

const block3Fields = [
    { id: "ar_e1_masc", label: "E.1 Abordagem Social Masculino" },
    { id: "ar_e2_fem", label: "E.2 Abordagem Social Feminino" },
    { id: "ar_e5_drogas", label: "E.5 Usuários de drogas" },
    { id: "ar_e6_migrantes", label: "E.6 Migrantes" },
    { id: "ar_persistentes", label: "Usuários que persistem em continuar nas ruas" },
    { id: "ar_enc_centro_ref", label: "Nº de encaminhamentos para o Centro de Referência" },
    { id: "ar_recusa_identificacao", label: "Nº de pessoas que se recusaram a ser identificadas" }
]

const block4Fields = [
    { id: "nm_total_passagens", label: "Total de Usuários que pleitearam passagens" },
    { id: "nm_passagens_deferidas", label: "Passagens Deferidas" },
    { id: "nm_passagens_indeferidas", label: "Passagens Indeferidas" },
    { id: "nm_estrangeiros", label: "Pessoas Estrangeiras" },
    { id: "nm_retorno_familiar", label: "Pessoas que retornaram para o Núcleo Familiar" },
    { id: "nm_busca_trabalho", label: "Pessoas em busca de trabalho" },
    { id: "nm_busca_saude", label: "Pessoas em busca de tratamento de saúde" }
]

export function PopRuaForm({ 
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
    const [totalAtendimentos, setTotalAtendimentos] = useState<number>(0)

    const handleInputBlurOrChange = () => {
        if (!formRef.current) return
        const formData = new FormData(formRef.current)
        
        const cr = Number(formData.get("num_atend_centro_ref")) || 0
        const abord = Number(formData.get("num_atend_abordagem")) || 0
        const migracao = Number(formData.get("num_atend_migracao")) || 0
        setTotalAtendimentos(cr + abord + migracao)
    }

    // Evaluate total on mount
    useEffect(() => {
        handleInputBlurOrChange()
    }, [])

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!formRef.current) return
        
        if (!confirm(`Confirma o envio do relatório de População de Rua e Migrantes para ${month}/${year}?`)) {
            return
        }

        setLoading(true)

        const formData = new FormData(formRef.current)
        const dbPayload: any = {}
        
        // Assemble all keys dynamically
        const keys = [
            "num_atend_centro_ref", "num_atend_abordagem", "num_atend_migracao",
            ...block2Fields.map(f => f.id),
            ...block3Fields.map(f => f.id),
            ...block4Fields.map(f => f.id)
        ]

        keys.forEach(k => {
            const val = formData.get(k)
            dbPayload[k] = val === '' || val === null ? 0 : Number(val)
        })
        
        // Manual totals
        dbPayload.num_atend_total = totalAtendimentos
        dbPayload.status = isAdmin ? 'finalized' : 'submitted'

        const result = await savePopRuaReport(directorateId, month, year, dbPayload)
        
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
                        Número de Atendimentos
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-6">
                    <div className="space-y-2">
                        <Label title="Soma de Atendimento Técnico, Atendimento ADM e Diretoria CREAS/Ruas -gestão do Suas, Vigilância Social e Projetos">Centro de Referência</Label>
                        <Input type="number" name="num_atend_centro_ref" defaultValue={initialData?.num_atend_centro_ref || ''} min="0" placeholder="0" className="dark:bg-zinc-950" />
                    </div>
                    <div className="space-y-2">
                        <Label>Abordagem Social</Label>
                        <Input type="number" name="num_atend_abordagem" defaultValue={initialData?.num_atend_abordagem || ''} min="0" placeholder="0" className="dark:bg-zinc-950" />
                    </div>
                    <div className="space-y-2">
                        <Label>Migração</Label>
                        <Input type="number" name="num_atend_migracao" defaultValue={initialData?.num_atend_migracao || ''} min="0" placeholder="0" className="dark:bg-zinc-950" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-blue-600 font-bold" title="Soma automática: Centro de Referência + Abordagem Social + Migração">Total</Label>
                        <Input type="number" name="num_atend_total" value={totalAtendimentos || ''} readOnly className="bg-blue-50/50 opacity-100 border-blue-200 dark:bg-blue-900/10 font-bold" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-none">
                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-purple-900 dark:text-purple-100">
                        Centro de Referência
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 md:grid-cols-3">
                    {block2Fields.map(f => (
                        <div key={f.id} className="space-y-2">
                            <Label>{f.label}</Label>
                            <Input type="number" name={f.id} defaultValue={initialData?.[f.id] || ''} min="0" placeholder="0" className="dark:bg-zinc-950" />
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-none">
                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-green-900 dark:text-green-100">
                        Abordagem de Rua
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6">
                    {block3Fields.map(f => (
                        <div key={f.id} className="space-y-2">
                            <Label>{f.label}</Label>
                            <Input type="number" name={f.id} defaultValue={initialData?.[f.id] || ''} min="0" placeholder="0" className="dark:bg-zinc-950" />
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-none">
                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-rose-900 dark:text-rose-100">
                        Núcleo do Migrante
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6">
                    {block4Fields.map(f => (
                        <div key={f.id} className="space-y-2">
                            <Label>{f.label}</Label>
                            <Input type="number" name={f.id} defaultValue={initialData?.[f.id] || ''} min="0" placeholder="0" className="dark:bg-zinc-950" />
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div className="flex justify-end mb-10 pb-8">
                <Button 
                    type="submit" 
                    className="w-full sm:w-auto px-8 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide shadow-lg shadow-blue-600/20 transition-all dark:bg-blue-600 dark:hover:bg-blue-500"
                    disabled={loading}
                >
                    {loading ? "Salvando..." : "Salvar Relatório"}
                </Button>
            </div>
        </form>
    )
}
