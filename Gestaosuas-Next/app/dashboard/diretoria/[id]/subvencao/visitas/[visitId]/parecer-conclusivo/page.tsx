'use client'

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Save, CheckCircle2, Loader2, Printer } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { SignaturePad } from "@/components/signature-pad"
import { saveParecerConclusivo, getVisitById } from "@/app/dashboard/actions"
import { createClient } from "@/utils/supabase/client"
import { cn } from "@/lib/utils"
import { ReturnLink } from "../../../return-link"

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

// Helper components for professional print display
const PrintField = ({ label, value, children, className, isPrintView }: { label: string, value: string, children?: React.ReactNode, className?: string, isPrintView?: boolean }) => (
    <div className={cn("space-y-1 print:space-y-0.5 print:break-inside-avoid print:py-1", className)}>
        <Label className="text-zinc-500 uppercase text-[10px] font-black print:text-zinc-600 print:text-[8px] tracking-tight">{label}</Label>
        <div className={cn("text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-1", !isPrintView && "hidden print:block")}>
            {value || "---"}
        </div>
        {!isPrintView && children}
    </div>
)

const PrintTextArea = ({ label, value, children, className, isPrintView }: { label: string, value: string, children?: React.ReactNode, className?: string, isPrintView?: boolean }) => (
    <div className={cn("space-y-2 print:break-inside-avoid print:py-2", className)}>
        {label && <Label className="text-zinc-700 font-black uppercase text-xs print:text-[10px] print:text-zinc-900">{label}</Label>}
        <div className={cn("text-[13px] text-zinc-800 leading-relaxed text-justify whitespace-pre-wrap pl-1 border-l-2 border-zinc-50", !isPrintView && "hidden print:block")}>
            {value || "---"}
        </div>
        {!isPrintView && children}
    </div>
)

export default function ParecerConclusivoForm() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
            <ParecerConclusivoContent />
        </Suspense>
    )
}

function ParecerConclusivoContent() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const id = params.id as string
    const visitId = params.visitId as string
    const isPrintView = searchParams.get('print') === 'true'
    const isPreview = searchParams.get('preview') === 'true'

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
                } else {
                    // Herança de dados do Relatório Final (se disponível) conforme solicitado pelo usuário
                    const relatorioFinal = visit.relatorio_final || {}
                    const oscNameFallback = Array.isArray(visit.oscs) ? visit.oscs[0]?.name : visit.oscs?.name;

                    setFormData(prev => ({
                        ...prev,
                        osc_name: relatorioFinal.osc_name || oscNameFallback || '',
                        cnpj: relatorioFinal.cnpj || '',
                        emenda: relatorioFinal.emenda || '',
                        termo_fomento: relatorioFinal.termo_fomento || '',
                        vigencia: relatorioFinal.vigencia || '',
                        valor_autorizado: relatorioFinal.valor_autorizado || '',
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

    useEffect(() => {
        if (!loading && isPrintView && !isPreview) {
            const timer = setTimeout(() => {
                window.print()
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [loading, isPrintView, isPreview])

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
        window.open(`/print/parecer-conclusivo/${id}/${visitId}`, '_blank')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 space-y-8 max-w-5xl print:p-0 print:max-w-none print:m-0 print:overflow-visible">
            {/* Professional Print Styles */}
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 1.5cm 1.5cm 1.5cm 1.5cm;
                        size: A4;
                    }
                    .no-print, .print\\:hidden { display: none !important; }
                    body {
                        background: #fff !important;
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                        font-family: inherit;
                        color: black !important;
                        overflow: visible !important;
                    }
                    div.container {
                        max-width: none !important;
                        width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        overflow: visible !important;
                    }
                    * {
                        animation: none !important;
                        box-shadow: none !important;
                    }
                    section {
                        break-inside: avoid-page !important;
                        margin-bottom: 2rem !important;
                        page-break-inside: avoid !important;
                    }
                    h1, h2, h3 {
                        page-break-after: avoid !important;
                        break-after: avoid !important;
                    }
                }
            `}</style>

            {isPreview ? null : (
                <div className="flex items-center justify-between print:hidden mb-6">
                <ReturnLink 
                    href={`/dashboard/diretoria/${id}/subvencao/relatorio-final`} 
                    label="Voltar para Relatórios" 
                />

                <div className="flex gap-3">
                    <Button variant="outline" onClick={handlePrint} className="gap-2 font-bold uppercase text-[10px] shadow-sm hover:bg-zinc-50 border-zinc-300">
                        <Printer className="h-4 w-4" /> Imprimir
                    </Button>
                    {!isFinalized && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => handleSave('draft')}
                                disabled={saving || finalizing}
                                className="gap-2 font-bold uppercase text-[10px] shadow-sm"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Salvar Rascunho
                            </Button>
                            <Button
                                onClick={() => handleSave('finalized')}
                                disabled={saving || finalizing}
                                className="bg-green-600 hover:bg-green-700 text-white gap-2 font-bold uppercase text-[10px] shadow-lg shadow-green-900/10"
                            >
                                {finalizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                Finalizar Parecer
                            </Button>
                        </>
                    )}
                </div>
            </div>
            )}

            <Card className="border-none shadow-2xl print:shadow-none bg-white rounded-xl overflow-hidden print:rounded-none max-w-[21cm] mx-auto min-h-[29.7cm]">
                <CardContent className="p-16 space-y-12 print:p-8">
                    {/* Header with Logo */}
                    <div className="flex flex-col items-center text-center space-y-6 border-b-2 border-zinc-100 pb-8 print:pb-6 print:border-zinc-200">
                        {logoUrl && (
                            <img src={logoUrl} alt="Logo" className="h-20 object-contain print:h-16" />
                        )}
                        <div className="space-y-1">
                            <h1 className="text-2xl font-black text-blue-900 uppercase tracking-tight max-w-2xl print:text-xl print:text-black">
                                PARECER TÉCNICO CONCLUSIVO
                            </h1>
                            <p className="text-sm font-bold text-blue-800 uppercase print:text-black print:text-xs">
                                Prestação de Contas Final
                            </p>
                        </div>
                    </div>

                    {/* Section 1: DADOS DA PARCERIA */}
                    <section className="space-y-6 print:space-y-4 print:break-inside-avoid">
                        <div className="flex items-center gap-3 print:gap-2">
                            <div className="h-6 w-1 bg-blue-600 rounded-full print:bg-black" />
                            <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-tight print:text-sm">1. DADOS DA PARCERIA</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 print:gap-y-6">
                            <PrintField isPrintView={isPrintView} label="OSC parceira" value={formData.osc_name} className="md:col-span-2">
                                <Input
                                    value={formData.osc_name}
                                    readOnly
                                    className="print:hidden bg-zinc-50 border-zinc-200 font-bold"
                                />
                            </PrintField>
                            <PrintField isPrintView={isPrintView} label="CNPJ" value={formData.cnpj}>
                                <Input
                                    value={formData.cnpj}
                                    onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                                    readOnly={isFinalized}
                                    placeholder="00.000.000/0000-00"
                                    className="print:hidden border-zinc-200 placeholder:text-zinc-300 placeholder:font-normal font-bold"
                                />
                            </PrintField>
                            <PrintField isPrintView={isPrintView} label="Recurso" value={formData.emenda}>
                                <Input
                                    value={formData.emenda}
                                    onChange={e => setFormData({ ...formData, emenda: e.target.value })}
                                    readOnly={isFinalized}
                                    placeholder="Ex: 1430/2023"
                                    className="print:hidden border-zinc-200 placeholder:text-zinc-300 placeholder:font-normal font-bold"
                                />
                            </PrintField>
                            <PrintField isPrintView={isPrintView} label="Nº Termo" value={formData.termo_fomento}>
                                <Input
                                    value={formData.termo_fomento}
                                    onChange={e => setFormData({ ...formData, termo_fomento: e.target.value })}
                                    readOnly={isFinalized}
                                    placeholder="Ex: 629/2024"
                                    className="print:hidden border-zinc-200 placeholder:text-zinc-300 placeholder:font-normal font-bold"
                                />
                            </PrintField>
                            <PrintField isPrintView={isPrintView} label="Vigência" value={formData.vigencia}>
                                <Input
                                    value={formData.vigencia}
                                    onChange={e => setFormData({ ...formData, vigencia: e.target.value })}
                                    readOnly={isFinalized}
                                    placeholder="Ex: 04/12/2024 a 30/06/2025"
                                    className="print:hidden border-zinc-200 placeholder:text-zinc-300 placeholder:font-normal font-bold"
                                />
                            </PrintField>
                            <PrintField isPrintView={isPrintView} label="Valor autorizado por lei e repassado" value={formData.valor_autorizado} className="md:col-span-2 print:col-span-1">
                                <Input
                                    value={formData.valor_autorizado}
                                    onChange={e => setFormData({ ...formData, valor_autorizado: e.target.value })}
                                    readOnly={isFinalized}
                                    placeholder="R$ 0,00"
                                    className="print:hidden border-zinc-200 placeholder:text-zinc-300 placeholder:font-normal font-bold"
                                />
                            </PrintField>
                        </div>
                    </section>

                    {/* Section 2: FUNDAMENTAÇÃO */}
                    <section className="space-y-6 print:space-y-4">
                        <div className="flex items-center gap-3 print:gap-2">
                            <div className="h-6 w-1 bg-blue-600 rounded-full print:bg-black" />
                            <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-tight print:text-sm">2. FUNDAMENTAÇÃO</h2>
                        </div>
                        <div className="space-y-6 print:space-y-4">
                            <PrintTextArea isPrintView={isPrintView} label="" value={formData.fundamentacao}>
                                <Textarea
                                    value={formData.fundamentacao}
                                    onChange={e => setFormData({ ...formData, fundamentacao: e.target.value })}
                                    readOnly={isFinalized}
                                    placeholder="Digite a fundamentação técnica..."
                                    className="print:hidden min-h-[150px] border-zinc-200"
                                />
                            </PrintTextArea>

                            <PrintTextArea isPrintView={isPrintView} label="a) Quanto ao cumprimento do objeto:" value={formData.cumprimento_objeto}>
                                <Textarea
                                    value={formData.cumprimento_objeto}
                                    onChange={e => setFormData({ ...formData, cumprimento_objeto: e.target.value })}
                                    readOnly={isFinalized}
                                    placeholder="Descreva o cumprimento do objeto..."
                                    className="print:hidden min-h-[100px] border-zinc-200"
                                />
                            </PrintTextArea>

                            <PrintTextArea isPrintView={isPrintView} label="b) Quanto aos benefícios e impactos da parceria:" value={formData.beneficios_impactos}>
                                <Textarea
                                    value={formData.beneficios_impactos}
                                    onChange={e => setFormData({ ...formData, beneficios_impactos: e.target.value })}
                                    readOnly={isFinalized}
                                    placeholder="Descreva os benefícios e impactos..."
                                    className="print:hidden min-h-[100px] border-zinc-200"
                                />
                            </PrintTextArea>
                        </div>
                    </section>

                    {/* Section 3: CONCLUSÃO */}
                    <section className="space-y-6 print:space-y-4 print:break-inside-avoid">
                        <div className="flex items-center gap-3 print:gap-2">
                            <div className="h-6 w-1 bg-blue-600 rounded-full print:bg-black" />
                            <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-tight print:text-sm">3. CONCLUSÃO</h2>
                        </div>
                        <PrintTextArea isPrintView={isPrintView} label="" value={formData.conclusao}>
                            <Textarea
                                value={formData.conclusao}
                                onChange={e => setFormData({ ...formData, conclusao: e.target.value })}
                                readOnly={isFinalized}
                                placeholder="Digite a conclusão final..."
                                className="print:hidden min-h-[150px] border-zinc-200"
                            />
                        </PrintTextArea>
                    </section>

                    {/* Footer - Date and Signatures */}
                    <div className="pt-8 space-y-12">
                        <div className="text-right">
                            {!isPrintView ? (
                                <input
                                    value={formData.local_data}
                                    onChange={e => setFormData({ ...formData, local_data: e.target.value })}
                                    readOnly={isFinalized}
                                    className="text-right border-none focus:ring-0 bg-transparent font-bold w-full print:text-right print:text-xs"
                                />
                            ) : (
                                <span className="text-right font-bold w-full text-zinc-900 block print:text-xs">{formData.local_data}</span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 max-w-3xl mx-auto print:grid-cols-2 print:gap-8 print:max-w-none print:break-inside-avoid">
                            <div className="flex flex-col items-center space-y-4 print:space-y-2 print:break-inside-avoid">
                                <div className={cn(
                                    "w-full border-b border-zinc-300 print:border-black min-h-[120px] relative",
                                    !formData.signature_tecnico && "print:border-dashed"
                                )}>
                                    <SignaturePad
                                        defaultValue={formData.signature_tecnico || undefined}
                                        onSave={(sig: string) => setFormData({ ...formData, signature_tecnico: sig })}
                                        readOnly={isFinalized || isPrintView}
                                    />
                                    {(isFinalized || isPrintView) && !formData.signature_tecnico && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="text-zinc-300 text-[10px] uppercase font-bold italic">Sem Assinatura</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-center w-full space-y-2 print:space-y-1">
                                    <h4 className={cn("text-[11px] font-black uppercase text-zinc-900", !isPrintView && "hidden print:block")}>
                                        {formData.tecnico_nome || "(NOME NÃO INFORMADO)"}
                                    </h4>
                                    {!isPrintView && (
                                        <Input
                                            placeholder="NOME DO TÉCNICO"
                                            value={formData.tecnico_nome}
                                            onChange={e => setFormData({ ...formData, tecnico_nome: e.target.value.toUpperCase() })}
                                            readOnly={isFinalized}
                                            className="print:hidden text-center font-bold text-xs border-none bg-zinc-50 h-8"
                                        />
                                    )}
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase print:text-black print:text-[8px]">Gestor da Parceria Técnico</p>
                                    {!isFinalized && !isPrintView && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSaveIndividualSignature('tecnico')}
                                            disabled={savingSignature === 'tecnico'}
                                            className="print:hidden text-[9px] h-7 gap-1 font-bold border-blue-200 text-blue-600 hover:text-white hover:bg-blue-600 px-3 uppercase transition-colors"
                                        >
                                            {savingSignature === 'tecnico' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                            Salvar Assinatura Técnico
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-center space-y-4 print:space-y-2 print:break-inside-avoid">
                                <div className={cn(
                                    "w-full border-b border-zinc-300 print:border-black min-h-[120px] relative",
                                    !formData.signature_financeiro && "print:border-dashed"
                                )}>
                                    <SignaturePad
                                        defaultValue={formData.signature_financeiro || undefined}
                                        onSave={(sig: string) => setFormData({ ...formData, signature_financeiro: sig })}
                                        readOnly={isFinalized || isPrintView}
                                    />
                                    {(isFinalized || isPrintView) && !formData.signature_financeiro && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="text-zinc-300 text-[10px] uppercase font-bold italic">Sem Assinatura</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-center w-full space-y-2 print:space-y-1">
                                    <h4 className={cn("text-[11px] font-black uppercase text-zinc-900", !isPrintView && "hidden print:block")}>
                                        {formData.financeiro_nome || "(NOME NÃO INFORMADO)"}
                                    </h4>
                                    {!isPrintView && (
                                        <Input
                                            placeholder="NOME DO FINANCEIRO"
                                            value={formData.financeiro_nome}
                                            onChange={e => setFormData({ ...formData, financeiro_nome: e.target.value.toUpperCase() })}
                                            readOnly={isFinalized}
                                            className="print:hidden text-center font-bold text-xs border-none bg-zinc-50 h-8"
                                        />
                                    )}
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase print:text-black print:text-[8px]">Gestor da Parceria Financeiro</p>
                                    {!isFinalized && !isPrintView && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSaveIndividualSignature('financeiro')}
                                            disabled={savingSignature === 'financeiro'}
                                            className="print:hidden text-[9px] h-7 gap-1 font-bold border-blue-200 text-blue-600 hover:text-white hover:bg-blue-600 px-3 uppercase transition-colors"
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
