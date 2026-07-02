'use client'

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Save, CheckCircle2, Loader2, Printer } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { SignaturePad } from "@/components/signature-pad"
import { saveRelatorioFinal, getVisitById } from "@/app/dashboard/actions"
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

    // New Fields
    objeto_relatorio: string
    referencias: string
    objetivos: string
    metas: string
    metas_quantitativas: string
    resultados: string
    execucao_financeira: string
    cumprimento_objeto_final: string
    texto_homologacao: string
    
    local_data: string
    homologacao_local_data: string

    // Signatures
    signature_tecnico: string | null
    tecnico_nome: string
    signature_financeiro: string | null
    financeiro_nome: string

    // Commission Signatures
    signature_comissao_tecnico: string | null
    comissao_tecnico_nome: string
    signature_comissao_financeiro: string | null
    comissao_financeiro_nome: string

    status: 'draft' | 'finalized'
}

import { useSearchParams } from "next/navigation"

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

export default function RelatorioFinalForm() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
            <RelatorioFinalContent />
        </Suspense>
    )
}

function RelatorioFinalContent() {
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

        objeto_relatorio: '',
        referencias: '',
        objetivos: '',
        metas: '',
        metas_quantitativas: '',
        resultados: '',
        execucao_financeira: '',
        cumprimento_objeto_final: '',
        texto_homologacao: '',
        
        local_data: `Uberlândia, ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`,
        homologacao_local_data: `Uberlândia, ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`,

        signature_tecnico: null,
        tecnico_nome: '',
        signature_financeiro: null,
        financeiro_nome: '',

        signature_comissao_tecnico: null,
        comissao_tecnico_nome: '',
        signature_comissao_financeiro: null,
        comissao_financeiro_nome: '',

        status: 'draft'
    })

    const isFinalized = formData.status === 'finalized'

    useEffect(() => {
        async function fetchData() {
            try {
                const supabase = createClient()
                const visit = await getVisitById(visitId)

                if (!visit) {
                    throw new Error("Visita não encontrada ou você não tem permissão.")
                }

                if (visit.relatorio_final) {
                    setFormData(prev => ({
                        ...prev,
                        ...visit.relatorio_final
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
                alert("O nome e a assinatura do Técnico Financeiro são obrigatórios para finalizar.")
                return
            }
            if (!confirm("Tem certeza que deseja finalizar este relatório? Após a finalização, não será possível editar.")) {
                return
            }
        }

        setSaving(status === 'draft')
        setFinalizing(status === 'finalized')

        try {
            await saveRelatorioFinal(visitId, formData, status, { logAction: status === 'draft' ? 'FORM_UPDATE' : undefined })
            setFormData(prev => ({ ...prev, status }))
            alert(status === 'finalized' ? "Relatório finalizado com sucesso!" : "Rascunho salvo com sucesso!")
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

    const handleSaveIndividualSignature = async (type: 'tecnico' | 'financeiro' | 'comissao_tecnico' | 'comissao_financeiro') => {
        let name = '';
        let label = '';

        switch (type) {
            case 'tecnico': name = formData.tecnico_nome; label = 'Técnico'; break;
            case 'financeiro': name = formData.financeiro_nome; label = 'Técnico Financeiro'; break;
            case 'comissao_tecnico': name = formData.comissao_tecnico_nome; label = 'Comissão Técnico'; break;
            case 'comissao_financeiro': name = formData.comissao_financeiro_nome; label = 'Comissão Financeiro'; break;
        }

        if (!name || name.trim() === '') {
            alert(`Por favor, preencha o nome do ${label} antes de salvar a assinatura.`);
            return;
        }

        setSavingSignature(type)
        try {
            await saveRelatorioFinal(visitId, formData, 'draft', { logAction: 'SIGNATURE', logDetail: label })
            alert("Assinatura e nome salvos com sucesso!")
        } catch (error: any) {
            alert("Erro ao salvar assinatura: " + error.message)
        } finally {
            setSavingSignature(null)
        }
    }

    const handlePrint = () => {
        window.open(`/print/relatorio-final/${id}/${visitId}`, '_blank')
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
                        background: white !important; 
                        padding: 0 !important; 
                        margin: 0 !important; 
                        overflow: visible !important;
                        font-family: inherit;
                        color: black !important;
                    }
                    div.container {
                        max-width: none !important;
                        width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        overflow: visible !important;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
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

                <div className="flex gap-5 items-center">
                    <Button variant="outline" onClick={handlePrint} className="gap-2 font-bold uppercase text-[10px] border-zinc-200 hover:bg-zinc-50 transition-colors">
                        <Printer className="h-4 w-4" /> Imprimir
                    </Button>
                    
                    {!isFinalized && (
                        <div className="flex gap-3 border-l pl-5 border-zinc-100">
                            <Button
                                variant="outline"
                                onClick={() => handleSave('draft')}
                                disabled={saving || finalizing}
                                className="gap-2 font-bold uppercase text-[10px] border-zinc-200"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Salvar Rascunho
                            </Button>
                            <Button
                                onClick={() => handleSave('finalized')}
                                disabled={saving || finalizing}
                                className="bg-green-600 hover:bg-green-700 text-white gap-2 font-bold uppercase text-[10px] px-6 shadow-lg shadow-green-100"
                            >
                                {finalizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                Finalizar Relatório
                            </Button>
                        </div>
                    )}
                    {isFinalized && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-100">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Relatório Finalizado e Bloqueado</span>
                        </div>
                    )}
                </div>
            </div>
            )}

            <Card className="border-none shadow-2xl print:shadow-none bg-white rounded-xl overflow-hidden max-w-[21cm] mx-auto min-h-[29.7cm]">
                <CardContent className="p-16 space-y-12 print:p-8">
                    {/* Header with Logo */}
                    <div className="flex flex-col items-center text-center space-y-6 border-b-2 border-zinc-100 pb-8 print:pb-6 print:border-zinc-200">
                        {logoUrl && (
                            <img src={logoUrl} alt="Logo" className="h-20 object-contain print:h-16" />
                        )}
                        <div className="space-y-1">
                            <h1 className="text-2xl font-black text-blue-900 uppercase tracking-tight max-w-3xl print:text-xl print:text-black">
                                RELATÓRIO TÉCNICO DE MONITORAMENTO E AVALIAÇÃO
                            </h1>
                            <p className="text-sm font-bold text-blue-800 uppercase print:text-black print:text-xs">
                                EXERCÍCIO DE 2026
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
                                    className="print:hidden border-zinc-200 font-bold"
                                />
                            </PrintField>
                            <PrintField isPrintView={isPrintView} label="Recurso" value={formData.emenda}>
                                <Input
                                    value={formData.emenda}
                                    onChange={e => setFormData({ ...formData, emenda: e.target.value })}
                                    readOnly={isFinalized}
                                    className="print:hidden border-zinc-200 font-bold"
                                />
                            </PrintField>
                            <PrintField isPrintView={isPrintView} label="Nº Termo" value={formData.termo_fomento}>
                                <Input
                                    value={formData.termo_fomento}
                                    onChange={e => setFormData({ ...formData, termo_fomento: e.target.value })}
                                    readOnly={isFinalized}
                                    className="print:hidden border-zinc-200 font-bold"
                                />
                            </PrintField>
                            <PrintField isPrintView={isPrintView} label="Vigência" value={formData.vigencia}>
                                <Input
                                    value={formData.vigencia}
                                    onChange={e => setFormData({ ...formData, vigencia: e.target.value })}
                                    readOnly={isFinalized}
                                    className="print:hidden border-zinc-200 font-bold"
                                />
                            </PrintField>
                            <PrintField isPrintView={isPrintView} label="Valor autorizado por lei e repassado" value={formData.valor_autorizado} className="md:col-span-2 print:col-span-1">
                                <Input
                                    value={formData.valor_autorizado}
                                    onChange={e => setFormData({ ...formData, valor_autorizado: e.target.value })}
                                    readOnly={isFinalized}
                                    className="print:hidden border-zinc-200 font-bold"
                                />
                            </PrintField>
                        </div>
                    </section>

                    {/* Section 2: OBJETO DO RELATÓRIO */}
                    <section className="space-y-6 print:space-y-4">
                        <div className="flex items-center gap-3 print:gap-2">
                            <div className="h-6 w-1 bg-blue-600 rounded-full print:bg-black" />
                            <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-tight print:text-sm">2. OBJETO DO RELATÓRIO</h2>
                        </div>
                        <PrintTextArea isPrintView={isPrintView} label="" value={formData.objeto_relatorio}>
                            <Textarea
                                value={formData.objeto_relatorio}
                                onChange={e => setFormData({ ...formData, objeto_relatorio: e.target.value })}
                                readOnly={isFinalized}
                                className="print:hidden min-h-[120px] border-zinc-200"
                            />
                        </PrintTextArea>
                    </section>

                    {/* Section 3: REFERÊNCIAS */}
                    <section className="space-y-6 print:space-y-4">
                        <div className="flex items-center gap-3 print:gap-2">
                            <div className="h-6 w-1 bg-blue-600 rounded-full print:bg-black" />
                            <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-tight print:text-sm">3. REFERÊNCIAS</h2>
                        </div>
                        <PrintTextArea isPrintView={isPrintView} label="" value={formData.referencias}>
                            <Textarea
                                value={formData.referencias}
                                onChange={e => setFormData({ ...formData, referencias: e.target.value })}
                                readOnly={isFinalized}
                                className="print:hidden min-h-[100px] border-zinc-200"
                            />
                        </PrintTextArea>
                    </section>

                    {/* Section 4: DESCRIÇÃO DOS OBJETIVOS, METAS PREVISTAS E EXECUÇÃO FINANCEIRA */}
                    <section className="space-y-8 print:space-y-6">
                        <div className="flex items-center gap-3 print:gap-2">
                            <div className="h-6 w-1 bg-blue-600 rounded-full print:bg-black" />
                            <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-tight print:text-sm">4. DESCRIÇÃO DOS OBJETIVOS, METAS PREVISTAS E EXECUÇÃO FINANCEIRA</h2>
                        </div>

                        <div className="space-y-4 print:space-y-2">
                            <PrintTextArea isPrintView={isPrintView} label="a) Dos objetivos:" value={formData.objetivos}>
                                <Textarea
                                    value={formData.objetivos}
                                    onChange={e => setFormData({ ...formData, objetivos: e.target.value })}
                                    readOnly={isFinalized}
                                    className="print:hidden min-h-[100px] border-zinc-200"
                                />
                            </PrintTextArea>

                            <PrintTextArea isPrintView={isPrintView} label="b) Das metas estabelecidas:" value={formData.metas}>
                                <Textarea
                                    value={formData.metas}
                                    onChange={e => setFormData({ ...formData, metas: e.target.value })}
                                    readOnly={isFinalized}
                                    className="print:hidden min-h-[100px] border-zinc-200"
                                />
                            </PrintTextArea>

                            <PrintTextArea isPrintView={isPrintView} label="Quantitativas:" value={formData.metas_quantitativas} className="ml-4 print:ml-2">
                                <Textarea
                                    value={formData.metas_quantitativas}
                                    onChange={e => setFormData({ ...formData, metas_quantitativas: e.target.value })}
                                    readOnly={isFinalized}
                                    className="print:hidden min-h-[80px] border-zinc-200"
                                />
                            </PrintTextArea>

                            <PrintTextArea isPrintView={isPrintView} label="c) Dos resultados:" value={formData.resultados}>
                                <Textarea
                                    value={formData.resultados}
                                    onChange={e => setFormData({ ...formData, resultados: e.target.value })}
                                    readOnly={isFinalized}
                                    className="print:hidden min-h-[100px] border-zinc-200"
                                />
                            </PrintTextArea>

                            <PrintTextArea isPrintView={isPrintView} label="e) Da execução financeira e análise dos documentos comprobatórios das despesas:" value={formData.execucao_financeira}>
                                <Textarea
                                    value={formData.execucao_financeira}
                                    onChange={e => setFormData({ ...formData, execucao_financeira: e.target.value })}
                                    readOnly={isFinalized}
                                    className="print:hidden min-h-[150px] border-zinc-200"
                                />
                            </PrintTextArea>
                        </div>
                    </section>

                    {/* Section 5: CUMPRIMENTO DO OBJETO */}
                    <section className="space-y-6 print:space-y-4 print:break-inside-avoid">
                        <div className="flex items-center gap-3 print:gap-2">
                            <div className="h-6 w-1 bg-blue-600 rounded-full print:bg-black" />
                            <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-tight print:text-sm">5. CUMPRIMENTO DO OBJETO</h2>
                        </div>
                        <PrintTextArea isPrintView={isPrintView} label="" value={formData.cumprimento_objeto_final}>
                            <Textarea
                                value={formData.cumprimento_objeto_final}
                                onChange={e => setFormData({ ...formData, cumprimento_objeto_final: e.target.value })}
                                readOnly={isFinalized}
                                className="print:hidden min-h-[120px] border-zinc-200"
                            />
                        </PrintTextArea>
                    </section>

                    {/* Footer - Date and Main Signatures */}
                    <div className="pt-8 space-y-12">
                        <div className="text-right">
                            {!isPrintView ? (
                                <input
                                    value={formData.local_data}
                                    onChange={e => setFormData({ ...formData, local_data: e.target.value })}
                                    readOnly={isFinalized}
                                    className="text-right border-none focus:ring-0 bg-transparent font-bold w-full print:text-xs"
                                />
                            ) : (
                                <span className="text-right font-bold w-full text-zinc-900 block">{formData.local_data}</span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 max-w-4xl mx-auto print:grid-cols-2 print:gap-8 print:max-w-none print:break-inside-avoid">
                            <div className="flex flex-col items-center space-y-4 print:space-y-2 print:break-inside-avoid">
                                <div className={cn(
                                    "w-full border-b-2 border-zinc-300 print:border-black min-h-[120px] relative",
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
                                <div className="text-center w-full space-y-3 print:space-y-1">
                                    <h4 className={cn("text-xs font-black uppercase text-zinc-900 pt-1", !isPrintView && "hidden print:block")}>
                                        {formData.tecnico_nome || "(NOME NÃO INFORMADO)"}
                                    </h4>
                                    {!isPrintView && (
                                        <Input
                                            value={formData.tecnico_nome}
                                            onChange={e => setFormData({ ...formData, tecnico_nome: e.target.value.toUpperCase() })}
                                            readOnly={isFinalized}
                                            className="print:hidden text-center font-bold text-xs border-none bg-zinc-50 h-8 uppercase"
                                        />
                                    )}
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter print:text-black print:text-[8px]">Assinatura do Técnico</p>
                                    {!isFinalized && !isPrintView && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSaveIndividualSignature('tecnico')}
                                            disabled={savingSignature === 'tecnico'}
                                            className="print:hidden text-[9px] h-7 gap-1 font-bold border-blue-200 text-blue-600 hover:text-white hover:bg-blue-600 px-3 uppercase transition-colors"
                                        >
                                            {savingSignature === 'tecnico' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                            Salvar Assinatura
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-center space-y-4 print:space-y-2 print:break-inside-avoid">
                                <div className={cn(
                                    "w-full border-b-2 border-zinc-300 print:border-black min-h-[120px] relative",
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
                                <div className="text-center w-full space-y-3 print:space-y-1">
                                    <h4 className="hidden print:block text-xs font-black uppercase text-zinc-900 pt-1">
                                        {formData.financeiro_nome || "(NOME NÃO INFORMADO)"}
                                    </h4>
                                    <Input
                                        value={formData.financeiro_nome}
                                        onChange={e => setFormData({ ...formData, financeiro_nome: e.target.value.toUpperCase() })}
                                        readOnly={isFinalized}
                                        className="print:hidden text-center font-bold text-xs border-none bg-zinc-50 h-8 uppercase"
                                    />
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter print:text-black print:text-[8px]">Assinatura do Técnico Financeiro</p>
                                    {!isFinalized && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSaveIndividualSignature('financeiro')}
                                            disabled={savingSignature === 'financeiro'}
                                            className="print:hidden text-[9px] h-7 gap-1 font-bold border-blue-200 text-blue-600 hover:text-white hover:bg-blue-600 px-3 uppercase transition-colors"
                                        >
                                            {savingSignature === 'financeiro' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                            Salvar Assinatura
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: HOMOLOGAÇÃO */}
                    <section className="pt-8 space-y-12 border-t-4 border-double border-zinc-100 mt-20 break-before-page print:mt-10 print:break-before-auto print:border-zinc-200">
                        <div className="space-y-6 text-center max-w-3xl mx-auto print:space-y-4 print:break-inside-avoid">
                            <h2 className="text-lg font-black text-blue-900 uppercase underline underline-offset-8 print:text-black print:text-sm">Homologação da Comissão de Monitoramento e Avaliação</h2>
                            <PrintTextArea label="" value={formData.texto_homologacao}>
                                <Textarea 
                                    value={formData.texto_homologacao}
                                    onChange={e => setFormData({ ...formData, texto_homologacao: e.target.value })}
                                    readOnly={isFinalized}
                                    className="print:hidden min-h-[100px] border-zinc-200 text-center italic text-zinc-600 bg-transparent"
                                />
                            </PrintTextArea>
                        </div>

                        <div className="text-right print:break-inside-avoid">
                            <input
                                value={formData.homologacao_local_data}
                                onChange={e => setFormData({ ...formData, homologacao_local_data: e.target.value })}
                                readOnly={isFinalized}
                                className="text-right border-none focus:ring-0 bg-transparent font-bold w-full print:text-xs"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 max-w-4xl mx-auto print:grid-cols-2 print:gap-8 print:max-w-none print:break-inside-avoid">
                            <div className="flex flex-col items-center space-y-4 print:space-y-2 print:break-inside-avoid">
                                <div className={cn(
                                    "w-full border-b-2 border-zinc-300 print:border-black min-h-[120px] relative",
                                    !formData.signature_comissao_tecnico && "print:border-dashed"
                                )}>
                                    <SignaturePad
                                        defaultValue={formData.signature_comissao_tecnico || undefined}
                                        onSave={(sig: string) => setFormData({ ...formData, signature_comissao_tecnico: sig })}
                                        readOnly={isFinalized}
                                    />
                                    {isFinalized && !formData.signature_comissao_tecnico && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="text-zinc-300 text-[10px] uppercase font-bold italic">Sem Assinatura</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-center w-full space-y-3 print:space-y-1">
                                    <h4 className="hidden print:block text-xs font-black uppercase text-zinc-900 pt-1">
                                        {formData.comissao_tecnico_nome || "(NOME NÃO INFORMADO)"}
                                    </h4>
                                    <Input
                                        value={formData.comissao_tecnico_nome}
                                        onChange={e => setFormData({ ...formData, comissao_tecnico_nome: e.target.value.toUpperCase() })}
                                        readOnly={isFinalized}
                                        className="print:hidden text-center font-bold text-xs border-none bg-zinc-50 h-8 uppercase"
                                    />
                                    <div className="flex flex-col -space-y-1">
                                        <p className="text-[10px] text-zinc-800 font-black uppercase tracking-tighter print:text-black print:text-[8px]">Comissão de Monitoramento e Avaliação</p>
                                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest italic print:text-black print:text-[8px]">Técnico</p>
                                    </div>
                                    {!isFinalized && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSaveIndividualSignature('comissao_tecnico')}
                                            disabled={savingSignature === 'comissao_tecnico'}
                                            className="print:hidden text-[9px] h-7 gap-1 font-bold border-blue-200 text-blue-600 hover:text-white hover:bg-blue-600 px-3 uppercase transition-colors"
                                        >
                                            {savingSignature === 'comissao_tecnico' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                            Salvar Assinatura
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-center space-y-4 print:space-y-2 print:break-inside-avoid">
                                <div className={cn(
                                    "w-full border-b-2 border-zinc-300 print:border-black min-h-[120px] relative",
                                    !formData.signature_comissao_financeiro && "print:border-dashed"
                                )}>
                                    <SignaturePad
                                        defaultValue={formData.signature_comissao_financeiro || undefined}
                                        onSave={(sig: string) => setFormData({ ...formData, signature_comissao_financeiro: sig })}
                                        readOnly={isFinalized}
                                    />
                                    {isFinalized && !formData.signature_comissao_financeiro && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="text-zinc-300 text-[10px] uppercase font-bold italic">Sem Assinatura</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-center w-full space-y-3 print:space-y-1">
                                    <h4 className="hidden print:block text-xs font-black uppercase text-zinc-900 pt-1">
                                        {formData.comissao_financeiro_nome || "(NOME NÃO INFORMADO)"}
                                    </h4>
                                    <Input
                                        value={formData.comissao_financeiro_nome}
                                        onChange={e => setFormData({ ...formData, comissao_financeiro_nome: e.target.value.toUpperCase() })}
                                        readOnly={isFinalized}
                                        className="print:hidden text-center font-bold text-xs border-none bg-zinc-50 h-8 uppercase"
                                    />
                                    <div className="flex flex-col -space-y-1">
                                        <p className="text-[10px] text-zinc-800 font-black uppercase tracking-tighter print:text-black print:text-[8px]">Comissão de Monitoramento e Avaliação</p>
                                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest italic print:text-black print:text-[8px]">Financeiro</p>
                                    </div>
                                    {!isFinalized && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSaveIndividualSignature('comissao_financeiro')}
                                            disabled={savingSignature === 'comissao_financeiro'}
                                            className="print:hidden text-[9px] h-7 gap-1 font-bold border-blue-200 text-blue-600 hover:text-white hover:bg-blue-600 px-3 uppercase transition-colors"
                                        >
                                            {savingSignature === 'comissao_financeiro' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                            Salvar Assinatura
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </CardContent>
            </Card>
        </div>
    )
}
