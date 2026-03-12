'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Save, CheckCircle2, Loader2, Printer } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { SignaturePad } from "@/components/signature-pad"
import { saveParecerConclusivo, getVisitById } from "@/app/dashboard/actions"
import { createClient } from "@/utils/supabase/client"

interface FormData {
    osc_name: string
    cnpj: string
    emenda: string
    termo_fomento: string
    vigencia: string
    valor_autorizado: string
    fundamentacao: string
    cumprimento_objeto: string
    beneficios_impactos: string
    conclusao: string
    local_data: string
    signature_tecnico: string | null
    tecnico_nome: string
    signature_financeiro: string | null
    financeiro_nome: string
    status: 'draft' | 'finalized'
}

export default function ParecerConclusivoForm() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const visitId = params.visitId as string

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [finalizing, setFinalizing] = useState(false)
    const [savingSignature, setSavingSignature] = useState<string | null>(null)
    const [logoUrl, setLogoUrl] = useState<string | null>(null)
    const [formData, setFormData] = useState<FormData>({
        osc_name: '',
        cnpj: '',
        emenda: '',
        termo_fomento: '',
        vigencia: '',
        valor_autorizado: '',
        fundamentacao: '',
        cumprimento_objeto: '',
        beneficios_impactos: '',
        conclusao: '',
        local_data: `Uberlândia, ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`,
        signature_tecnico: null,
        tecnico_nome: '',
        signature_financeiro: null,
        financeiro_nome: '',
        status: 'draft'
    })

    const isFinalized = formData.status === 'finalized'

    useEffect(() => {
        async function fetchData() {
            try {
                const supabase = createClient()
                
                // Fetch visit using server action for robustness
                const visit = await getVisitById(visitId)

                if (!visit) {
                    throw new Error("Visita não encontrada ou sem permissão.")
                }

                if (visit.parecer_conclusivo) {
                    setFormData(prev => ({
                        ...prev,
                        ...visit.parecer_conclusivo
                    }))
                } else if (visit.oscs) {
                    setFormData(prev => ({
                        ...prev,
                        osc_name: Array.isArray(visit.oscs) ? visit.oscs[0]?.name : visit.oscs.name
                    }))
                }

                // Fetch logo from settings
                const { data: settings } = await supabase
                    .from('system_settings')
                    .select('value')
                    .eq('key', 'logo_url')
                    .single()
                
                if (settings) setLogoUrl(settings.value)

            } catch (error: any) {
                console.error("Error fetching data:", error)
                alert("Erro ao carregar dados: " + (error.message || "Erro desconhecido"))
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [visitId])

    const handleSave = async (status: 'draft' | 'finalized' = 'draft') => {
        if (status === 'finalized') {
            if (!formData.tecnico_nome || !formData.signature_tecnico) {
                alert("O nome e a assinatura do Técnico são obrigatórios para finalizar.")
                return
            }
            if (!formData.financeiro_nome || !formData.signature_financeiro) {
                alert("O nome e a assinatura do Financeiro são obrigatórios para finalizar.")
                return
            }
            if (!confirm("Tem certeza que deseja finalizar este parecer conclusivo? Após a finalização, não será possível editar.")) {
                return
            }
        }

        setSaving(status === 'draft')
        setFinalizing(status === 'finalized')
        
        try {
            await saveParecerConclusivo(visitId, formData, status, { logAction: status === 'draft' ? 'FORM_UPDATE' : undefined })
            setFormData(prev => ({ ...prev, status }))
            alert(status === 'finalized' ? "Parecer finalizado com sucesso!" : "Rascunho salvo com sucesso!")
            if (status === 'finalized') {
                router.refresh()
            }
        } catch (error: any) {
            alert("Erro ao salvar: " + error.message)
        } finally {
            setSaving(false)
            setFinalizing(false)
        }
    }

    const handleSaveIndividualSignature = async (type: 'tecnico' | 'financeiro') => {
        const name = type === 'tecnico' ? formData.tecnico_nome : formData.financeiro_nome;
        
        if (!name || name.trim() === '') {
            alert(`Por favor, preencha o nome do ${type === 'tecnico' ? 'Técnico' : 'Financeiro'} antes de salvar a assinatura.`);
            return;
        }

        setSavingSignature(type)
        try {
            const logLabel = type === 'tecnico' ? 'Técnico' : 'Financeiro'
            await saveParecerConclusivo(visitId, formData, 'draft', { logAction: 'SIGNATURE', logDetail: logLabel })
            alert("Assinatura e nome salvos com sucesso!")
        } catch (error: any) {
            alert("Erro ao salvar assinatura: " + error.message)
        } finally {
            setSavingSignature(null)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 space-y-8 max-w-5xl print:p-0 print:max-w-none">
            <div className="flex items-center justify-between print:hidden">
                <Link
                    href={`/dashboard/diretoria/${id}/subvencao/relatorio-final`}
                    className="group flex items-center gap-2 text-zinc-500 hover:text-blue-900 transition-colors w-fit"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Voltar para Listagem
                </Link>

                <div className="flex gap-3">
                    {isFinalized && (
                        <Button variant="outline" onClick={handlePrint} className="gap-2 font-bold uppercase text-[10px]">
                            <Printer className="h-4 w-4" /> Imprimir
                        </Button>
                    )}
                    {!isFinalized && (
                        <>
                            <Button 
                                variant="outline" 
                                onClick={() => handleSave('draft')} 
                                disabled={saving || finalizing}
                                className="gap-2 font-bold uppercase text-[10px]"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Salvar Rascunho
                            </Button>
                            <Button 
                                onClick={() => handleSave('finalized')} 
                                disabled={saving || finalizing}
                                className="bg-green-600 hover:bg-green-700 text-white gap-2 font-bold uppercase text-[10px]"
                            >
                                {finalizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                Finalizar Parecer
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <Card className="border-none shadow-xl print:shadow-none bg-white rounded-2xl overflow-hidden">
                <CardContent className="p-12 space-y-12 print:p-8">
                    {/* Header with Logo */}
                    <div className="flex flex-col items-center text-center space-y-6 border-b pb-8">
                        {logoUrl && (
                            <img src={logoUrl} alt="Logo" className="h-20 object-contain" />
                        )}
                        <h1 className="text-2xl font-black text-blue-900 uppercase tracking-tight max-w-2xl">
                            PARECER TÉCNICO CONCLUSIVO DE PRESTAÇÃO DE CONTAS FINAL
                        </h1>
                    </div>

                    {/* Section 1: DADOS DA PARCERIA */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-1 bg-blue-600 rounded-full" />
                            <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-tight">1. DADOS DA PARCERIA</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-zinc-500 uppercase text-[10px] font-black">OSC parceira</Label>
                                <Input 
                                    value={formData.osc_name} 
                                    readOnly 
                                    className="bg-zinc-50 border-zinc-200 font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-500 uppercase text-[10px] font-black">CNPJ</Label>
                                <Input 
                                    value={formData.cnpj}
                                    onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                                    readOnly={isFinalized}
                                    placeholder="00.000.000/0000-00"
                                    className="border-zinc-200 placeholder:text-zinc-300 placeholder:font-normal font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-500 uppercase text-[10px] font-black">Emenda Impositiva</Label>
                                <Input 
                                    value={formData.emenda}
                                    onChange={e => setFormData({ ...formData, emenda: e.target.value })}
                                    readOnly={isFinalized}
                                    placeholder="Ex: 1430/2023"
                                    className="border-zinc-200 placeholder:text-zinc-300 placeholder:font-normal font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-500 uppercase text-[10px] font-black">Nº Termo de Fomento</Label>
                                <Input 
                                    value={formData.termo_fomento}
                                    onChange={e => setFormData({ ...formData, termo_fomento: e.target.value })}
                                    readOnly={isFinalized}
                                    placeholder="Ex: 629/2024"
                                    className="border-zinc-200 placeholder:text-zinc-300 placeholder:font-normal font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-500 uppercase text-[10px] font-black">Vigência</Label>
                                <Input 
                                    value={formData.vigencia}
                                    onChange={e => setFormData({ ...formData, vigencia: e.target.value })}
                                    readOnly={isFinalized}
                                    placeholder="Ex: 04/12/2024 a 30/06/2025"
                                    className="border-zinc-200 placeholder:text-zinc-300 placeholder:font-normal font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-500 uppercase text-[10px] font-black">Valor autorizado por lei e repassado</Label>
                                <Input 
                                    value={formData.valor_autorizado}
                                    onChange={e => setFormData({ ...formData, valor_autorizado: e.target.value })}
                                    readOnly={isFinalized}
                                    placeholder="R$ 0,00"
                                    className="border-zinc-200 placeholder:text-zinc-300 placeholder:font-normal font-bold"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Section 2: FUNDAMENTAÇÃO */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-1 bg-blue-600 rounded-full" />
                            <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-tight">2. FUNDAMENTAÇÃO</h2>
                        </div>
                        <div className="space-y-4">
                            <Textarea 
                                value={formData.fundamentacao}
                                onChange={e => setFormData({ ...formData, fundamentacao: e.target.value })}
                                readOnly={isFinalized}
                                placeholder="Digite a fundamentação técnica..."
                                className="min-h-[150px] border-zinc-200"
                            />
                            
                            <div className="space-y-2">
                                <Label className="text-zinc-700 font-black uppercase text-xs">a) Quanto ao cumprimento do objeto:</Label>
                                <Textarea 
                                    value={formData.cumprimento_objeto}
                                    onChange={e => setFormData({ ...formData, cumprimento_objeto: e.target.value })}
                                    readOnly={isFinalized}
                                    placeholder="Descreva o cumprimento do objeto..."
                                    className="min-h-[100px] border-zinc-200"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-zinc-700 font-black uppercase text-xs">b) Quanto aos benefícios e impactos da parceria:</Label>
                                <Textarea 
                                    value={formData.beneficios_impactos}
                                    onChange={e => setFormData({ ...formData, beneficios_impactos: e.target.value })}
                                    readOnly={isFinalized}
                                    placeholder="Descreva os benefícios e impactos..."
                                    className="min-h-[100px] border-zinc-200"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Section 3: CONCLUSÃO */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-1 bg-blue-600 rounded-full" />
                            <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-tight">3. CONCLUSÃO</h2>
                        </div>
                        <Textarea 
                            value={formData.conclusao}
                            onChange={e => setFormData({ ...formData, conclusao: e.target.value })}
                            readOnly={isFinalized}
                            placeholder="Digite a conclusão final..."
                            className="min-h-[150px] border-zinc-200"
                        />
                    </section>

                    {/* Footer - Date and Signatures */}
                    <div className="pt-8 space-y-12">
                        <div className="text-right">
                             <input 
                                value={formData.local_data}
                                onChange={e => setFormData({ ...formData, local_data: e.target.value })}
                                readOnly={isFinalized}
                                className="text-right border-none focus:ring-0 bg-transparent font-bold w-full"
                             />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 max-w-3xl mx-auto">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-full border-b border-zinc-300 print:border-zinc-400 min-h-[120px] relative">
                                    <SignaturePad 
                                        defaultValue={formData.signature_tecnico || undefined}
                                        onSave={(sig: string) => setFormData({ ...formData, signature_tecnico: sig })}
                                        readOnly={isFinalized}
                                    />
                                </div>
                                <div className="text-center w-full space-y-3">
                                    <Input 
                                        placeholder="NOME DO TÉCNICO"
                                        value={formData.tecnico_nome}
                                        onChange={e => setFormData({ ...formData, tecnico_nome: e.target.value.toUpperCase() })}
                                        readOnly={isFinalized}
                                        className="text-center font-bold text-xs border-none bg-zinc-50 h-8"
                                    />
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Gestor da Parceria Técnico</p>
                                    {!isFinalized && (
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => handleSaveIndividualSignature('tecnico')}
                                            disabled={savingSignature === 'tecnico'}
                                            className="text-[9px] h-7 gap-1 font-bold border-blue-200 text-blue-600 hover:text-white hover:bg-blue-600 px-3 uppercase transition-colors"
                                        >
                                            {savingSignature === 'tecnico' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                            Salvar Assinatura Técnico
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-full border-b border-zinc-300 print:border-zinc-400 min-h-[120px] relative">
                                    <SignaturePad 
                                        defaultValue={formData.signature_financeiro || undefined}
                                        onSave={(sig: string) => setFormData({ ...formData, signature_financeiro: sig })}
                                        readOnly={isFinalized}
                                    />
                                </div>
                                <div className="text-center w-full space-y-3">
                                    <Input 
                                        placeholder="NOME DO FINANCEIRO"
                                        value={formData.financeiro_nome}
                                        onChange={e => setFormData({ ...formData, financeiro_nome: e.target.value.toUpperCase() })}
                                        readOnly={isFinalized}
                                        className="text-center font-bold text-xs border-none bg-zinc-50 h-8"
                                    />
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Gestor da Parceria Financeiro</p>
                                    {!isFinalized && (
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => handleSaveIndividualSignature('financeiro')}
                                            disabled={savingSignature === 'financeiro'}
                                            className="text-[9px] h-7 gap-1 font-bold border-blue-200 text-blue-600 hover:text-white hover:bg-blue-600 px-3 uppercase transition-colors"
                                        >
                                            {savingSignature === 'financeiro' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                            Salvar Assinatura Financeiro
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
