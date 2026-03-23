'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Save, Printer, Loader2, CheckCircle } from "lucide-react"
import { SignaturePad } from "@/components/signature-pad"
import { saveOpinionReport, finalizeOpinionReport } from "@/app/dashboard/actions"
import { cn } from "@/lib/utils"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"

interface ParecerFormProps {
    visit: any
    directorateId: string
    directorateName?: string
    logoUrl?: string
}

export function OpinionReportForm({ visit, directorateId, directorateName = "", logoUrl }: ParecerFormProps) {
    const router = useRouter()
    const [isSaving, setIsSaving] = useState(false)
    const [isFinalizing, setIsFinalizing] = useState(false)
    const [savingSignature, setSavingSignature] = useState<string | null>(null)
    const [isPreview, setIsPreview] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (isMounted && typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.get('print') === 'true') {
                setTimeout(() => {
                    window.print();
                    const url = new URL(window.location.href);
                    url.searchParams.delete('print');
                    window.history.replaceState({}, '', url.toString());
                }, 1000);
            }
        }
    }, [isMounted])
    const [saveConfirmation, setSaveConfirmation] = useState<{ isOpen: boolean; finalize: boolean }>({
        isOpen: false,
        finalize: false
    })
    const [report, setReport] = useState(() => {
        const defaultReport = {
            objeto_relatorio: visit.oscs?.objeto || "",
            item2_a_objetivos: visit.oscs?.objetivos || "",
            item2_b_metas: visit.oscs?.metas || "",
            item2_c_atividades: visit.oscs?.atividades || "",
            item3_resultados: "",
            item4_type: "fully",
            item4_custom: "",
            item5_enabled: false,
            item5_periodo: "",
            item5_qualitativos: [
                { data: "", situacao: "", recomendacoes: "", observacao: "" },
                { data: "", situacao: "", recomendacoes: "", observacao: "" },
                { data: "", situacao: "", recomendacoes: "", observacao: "" },
                { data: "", situacao: "", recomendacoes: "", observacao: "" },
            ],
            item5_quantitativos: {
                total_1dia: { jan: "", fev: "", mar: "", abr: "", mai: "", jun: "", jul: "", ago: "", set: "", out: "", nov: "", dez: "" },
                inseridos: { jan: "", fev: "", mar: "", abr: "", mai: "", jun: "", jul: "", ago: "", set: "", out: "", nov: "", dez: "" },
                desligados: { jan: "", fev: "", mar: "", abr: "", mai: "", jun: "", jul: "", ago: "", set: "", out: "", nov: "", dez: "" },
                total_ultimo: { jan: "", fev: "", mar: "", abr: "", mai: "", jun: "", jul: "", ago: "", set: "", out: "", nov: "", dez: "" },
            },
            assinaturas: {
                tecnico1: "",
                tecnico1_nome: "",
                tecnico2: "",
                tecnico2_nome: ""
            },
            date: new Date().toISOString().split('T')[0],
            status: 'draft',
            term_type: 'colaboracao'
        }

        if (!visit.parecer_tecnico) return defaultReport

        return {
            ...defaultReport,
            ...visit.parecer_tecnico,
            item5_qualitativos: visit.parecer_tecnico.item5_qualitativos || defaultReport.item5_qualitativos,
            item5_quantitativos: visit.parecer_tecnico.item5_quantitativos || defaultReport.item5_quantitativos,
            status: visit.parecer_tecnico.status || 'draft',
            term_type: visit.parecer_tecnico.term_type || 'colaboracao'
        }
    })

    const isFinalized = report.status === 'finalized'

    const finalLogoUrl = logoUrl || "https://ovfpxrepxlrspsjbtpnd.supabase.co/storage/v1/object/public/system/logo-pm-uberlandia.png"
    const oscName = visit.oscs?.name || "Entidade não identificada"
    const [today, setToday] = useState("")

    useEffect(() => {
        setToday(new Date().toLocaleDateString('pt-BR'))
    }, [])

    const normalizedDirName = directorateName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    const isEmendas = normalizedDirName.includes('emendas') || normalizedDirName.includes('fundos')
    const isSubvencao = normalizedDirName.includes('subvencao')

    const getOptionText = (type: string) => {
        const termText = report.term_type === 'fomento' ? "Termo de Fomento" : "Termo de Colaboração"
        const executionVerb = isEmendas ? "foi executada" : "está sendo executada"
        const dateSuffix = (isSubvencao || isEmendas) ? "" : " até a presente data"

        if (type === 'fully') {
            return `constatou-se que a parceria com a entidade ${oscName} ${executionVerb} de maneira coerente com o Plano de Trabalho – Anexo I parte integrante do ${termText}, desenvolvendo as atividades e atingindo tanto os objetivos quanto as metas qualitativas e quantitativas estabelecidas, logo, cumprindo o objeto pactuado.`
        }
        if (type === 'partially' || type === 'partially_quant') {
            return `constatou-se que a parceria com a entidade ${oscName} ${executionVerb} de maneira coerente com o Plano de Trabalho – Anexo I parte integrante do ${termText} no que se refere ao desenvolvimento das atividades, alcance dos objetivos e metas qualitativas. Entretanto, a meta quantitativa não foi alcançada plenamente, logo, cumprindo parcialmente o objeto pactuado${dateSuffix}.`
        }
        if (type === 'partially_qual') {
            return `constatou-se que a parceria com a entidade ${oscName} ${executionVerb} de maneira coerente com o Plano de Trabalho – Anexo I parte integrante do ${termText} no que se refere ao desenvolvimento das atividades, alcance dos objetivos e metas quantitativas. Entretanto, a meta qualitativa não foi alcançada plenamente, logo, cumprindo parcialmente o objeto pactuado${dateSuffix}.`
        }
        if (type === 'custom') {
            return `constatou-se que a parceria com a entidade ${oscName} ${report.item4_custom}`
        }
        return report.item4_custom
    }

    const handleSaveDraft = async () => {
        setIsSaving(true)
        try {
            const result = await saveOpinionReport(visit.id, report, 'draft', { logAction: 'FORM_UPDATE' })
            if (result.success) {
                alert("Rascunho do parecer salvo!")
                router.refresh()
            }
        } catch (error: any) {
            alert("Erro ao salvar: " + error.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleSaveIndividualSignature = async (type: 'tecnico1' | 'tecnico2') => {
        const name = type === 'tecnico1' ? report.assinaturas.tecnico1_nome :
            report.assinaturas.tecnico2_nome;

        if (!name || name.trim() === '') {
            alert(`Por favor, preencha o nome do ${type === 'tecnico1' ? 'Técnico 1' : 'Técnico 2'} antes de salvar a assinatura.`);
            return;
        }

        setSavingSignature(type)
        try {
            const logLabel = type === 'tecnico1' ? 'Técnico 1' : 'Técnico 2'
            await saveOpinionReport(visit.id, report, 'draft', { logAction: 'SIGNATURE', logDetail: logLabel })
            alert("Assinatura e nome salvos com sucesso!")
        } catch (error: any) {
            alert("Erro ao salvar assinatura: " + error.message)
        } finally {
            setSavingSignature(null)
        }
    }

    const handleFinalize = async () => {
        setIsFinalizing(true)
        try {
            // First save current state as draft
            await saveOpinionReport(visit.id, report, 'draft') // No specific label needed for finalize-prep save
            // Then finalize
            const result = await finalizeOpinionReport(visit.id)
            if (result.success) {
                alert("Parecer finalizado e bloqueado com sucesso!")
                setReport((prev: any) => ({ ...prev, status: 'finalized' }))
                router.refresh()
            }
        } catch (error: any) {
            alert("Erro ao finalizar: " + error.message)
        } finally {
            setIsFinalizing(false)
        }
    }

    return (
        <div className={cn(
            "max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700 report-print-root report-print-root-wrapper",
            isPreview && "fixed inset-0 z-[100] bg-zinc-900/90 overflow-y-auto pb-20 max-w-none px-4 pt-4 print:static print:bg-white print:p-0 print:overflow-visible"
        )}>
            <style>{`
                @media print {
                    @page { 
                        margin: 1.5cm;
                        size: A4;
                    }
                    
                    .no-print { display: none !important; }

                    /* Reset for all parent containers to ensure visibility */
                    html, body, main, .report-print-root-wrapper {
                        height: auto !important;
                        overflow: visible !important;
                        display: block !important;
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }

                    .report-container-flat {
                        position: static !important;
                        display: block !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                    }

                    /* Fix for potential blank page issue */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        animation: none !important;
                    }
                }
            `}</style>
            {/* Toolbar */}
            <div className={cn(
                "flex items-center justify-between no-print sticky top-4 z-[101] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg",
                isPreview && "max-w-4xl mx-auto mb-8"
            )}>
                <Button variant="ghost" onClick={() => isPreview ? setIsPreview(false) : router.back()} className="gap-2 font-bold uppercase text-[10px] text-zinc-500">
                    <ArrowLeft className="h-4 w-4" /> {isPreview ? "Voltar para Edição" : "Voltar"}
                </Button>
                <div className="flex gap-3 items-center">
                    {!isPreview ? (
                        <>
                            <Button variant="outline" onClick={() => setIsPreview(true)} className="gap-2 font-bold uppercase text-[10px] border-blue-100 text-blue-700 bg-blue-50/50 hover:bg-blue-100">
                                <Printer className="h-4 w-4" /> Visualizar
                            </Button>
                            <Button variant="outline" onClick={() => window.print()} className="gap-2 font-bold uppercase text-[10px] border-zinc-200">
                                <Printer className="h-4 w-4" /> Imprimir
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setIsPreview(false)} className="gap-2 font-bold uppercase text-[10px] border-zinc-200">
                                <ArrowLeft className="h-4 w-4" /> Editar
                            </Button>
                            <Button variant="outline" onClick={() => window.print()} className="gap-2 font-bold uppercase text-[10px] border-green-200 text-green-700 bg-green-50/50 hover:bg-green-100">
                                <Printer className="h-4 w-4" /> Imprimir
                            </Button>
                        </>
                    )}
                    {!isFinalized && (
                        <>
                            <Button onClick={() => setSaveConfirmation({ isOpen: true, finalize: false })} variant="outline" disabled={isSaving} className="gap-2 border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:text-blue-900 font-bold uppercase text-[10px] px-6">
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Salvar Rascunho
                            </Button>
                            {/* Finalize only appears if the report has been saved as draft at least once */}
                            {(visit.parecer_tecnico || report.status === 'draft') && !visit.parecer_tecnico?.status && (
                                <div className="text-[9px] text-zinc-400 font-bold uppercase italic px-2">
                                    Salve como rascunho primeiro para habilitar a finalização
                                </div>
                            )}
                            {visit.parecer_tecnico && (
                                <Button onClick={() => setSaveConfirmation({ isOpen: true, finalize: true })} disabled={isSaving || isFinalizing} className="gap-2 bg-blue-900 text-white hover:bg-black font-bold uppercase text-[10px] px-8">
                                    {(isSaving || isFinalizing) ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                    Finalizar e Bloquear
                                </Button>
                            )}
                        </>
                    )}
                    {isFinalized && (
                        <div className="flex items-center gap-2 px-6 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl border border-green-100 dark:border-green-900/30">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Relatório Finalizado e Bloqueado</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Document Content */}
            <div className={cn(
                "bg-white dark:bg-zinc-900 shadow-xl rounded-[2rem] p-12 border border-zinc-100 dark:border-zinc-800 print:shadow-none print:border-none print:p-0 report-container-flat",
                isPreview && "max-w-4xl mx-auto shadow-none rounded-none border-none p-16 print:p-0 bg-white text-black dark:bg-white dark:text-black"
            )}>
                {/* Header Section */}
                <div className="flex flex-col items-center text-center mb-8 border-b-2 border-black pb-8">
                    <img
                        src={finalLogoUrl}
                        alt="Logo"
                        className="h-20 w-auto object-contain mb-4"
                    />
                    <div className="space-y-1">
                        <p className="text-xs font-black uppercase text-zinc-400">Secretaria Municipal de Desenvolvimento Social</p>
                        <h1 className={cn(
                            "text-2xl font-black uppercase text-blue-900 dark:text-blue-50 print:text-black",
                            isPreview && "text-black"
                        )}>Relatório do monitoramento</h1>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">SISTEMA VIGILÂNCIA SOCIOASSISTENCIAL 2026</p>
                    </div>
                </div>

                {/* Identification Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 mb-8 text-[12px] border-zinc-100 pb-6 print:border-none">
                    <div className="space-y-3">
                        <p className="flex justify-between items-end border-b border-dotted border-zinc-300 pb-1">
                            <strong className="uppercase">OSC:</strong> 
                            <span className="text-right flex-1 ml-2 truncate font-bold">{oscName}</span>
                        </p>
                        <p className="flex justify-between items-end border-b border-dotted border-zinc-300 pb-1">
                            <strong className="uppercase">CNPJ:</strong> 
                            <span className="text-right flex-1 ml-2 font-bold">{visit.relatorio_final?.cnpj || "---"}</span>
                        </p>
                        <p className="flex justify-between items-end border-b border-dotted border-zinc-300 pb-1">
                            <strong className="uppercase">Recurso:</strong> 
                            <span className="text-right flex-1 ml-2 font-bold">{visit.relatorio_final?.emenda || "---"}</span>
                        </p>
                        <p className="flex justify-between items-end border-b border-dotted border-zinc-300 pb-1">
                            <strong className="uppercase">Nº Termo:</strong> 
                            <span className="text-right flex-1 ml-2 font-bold">{visit.relatorio_final?.termo_fomento || "---"}</span>
                        </p>
                    </div>
                    <div className="space-y-3">
                        <p className="flex justify-between items-end border-b border-dotted border-zinc-300 pb-1">
                            <strong className="uppercase">Vigência:</strong> 
                            <span className="text-right flex-1 ml-2 font-bold">{visit.relatorio_final?.vigencia || "---"}</span>
                        </p>
                        <p className="flex justify-between items-end border-b border-dotted border-zinc-300 pb-1">
                            <strong className="uppercase">Valor por lei e repassado:</strong> 
                            <span className="text-right flex-1 ml-2 font-bold">{visit.relatorio_final?.valor_autorizado || "---"}</span>
                        </p>
                        <p className="flex justify-between items-end border-b border-dotted border-zinc-300 pb-1">
                            <strong className="uppercase">Data Preenchimento:</strong> 
                            <span className="text-right flex-1 ml-2 font-bold">{isMounted ? today : "---"}</span>
                        </p>
                    </div>
                </div>

                <div className="space-y-10 text-justify leading-relaxed text-sm">
                    <section className="space-y-4 break-inside-avoid print:break-inside-avoid">
                        <div className="flex flex-col gap-1">
                            <h2 className={cn(
                                "font-black border-b border-black pb-1 uppercase text-blue-900 dark:text-blue-400 print:text-black",
                                isPreview && "text-black"
                            )}>1. Objeto do relatório</h2>
                            <p className="text-[10px] text-zinc-500 italic">Colocar o mesmo objeto do Plano de Trabalho (Objetivo e especificação do nome do projeto)</p>
                        </div>
                        {!isFinalized && !isPreview && (
                            <div className="no-print">
                                <Textarea autoResize
                                    readOnly={true}
                                    placeholder="Digite aqui o objeto do relatório..."
                                    value={report.objeto_relatorio}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReport({ ...report, objeto_relatorio: e.target.value })}
                                    className="min-h-[100px] bg-zinc-100 dark:bg-zinc-900 border-zinc-200 focus:ring-blue-900 cursor-not-allowed opacity-80"
                                />
                            </div>
                        )}
                        {(isPreview || isFinalized || isMounted) && (
                            <div className={cn(
                                "whitespace-pre-wrap min-h-[60px] border-b border-dotted border-zinc-300 font-bold",
                                (isPreview || isFinalized) ? "block" : "hidden print:block"
                            )}>
                                {report.objeto_relatorio || "________________________________________________________________________________________________________________________________________________________________"}
                            </div>
                        )}
                    </section>

                    <section className="space-y-6 break-inside-avoid print:break-inside-avoid">
                        <h2 className={cn(
                            "font-black border-b border-black pb-1 uppercase text-blue-900 print:text-black",
                            isPreview && "text-black"
                        )}>2. Descrição dos objetivos, metas, atividades previstas</h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase underline underline-offset-4 decoration-zinc-200">a) - Dos objetivos</Label>
                                {!isPreview && !isFinalized && (
                                    <div className="no-print">
                                        <Textarea autoResize
                                            readOnly={true}
                                            value={report.item2_a_objetivos}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReport({ ...report, item2_a_objetivos: e.target.value })}
                                            className="bg-zinc-100 dark:bg-zinc-900 cursor-not-allowed opacity-80"
                                        />
                                    </div>
                                )}
                                {(isPreview || isFinalized || isMounted) && (
                                    <div className={cn(
                                        "whitespace-pre-wrap min-h-[40px] border-b border-dotted border-zinc-300",
                                        (isPreview || isFinalized) ? "block" : "hidden print:block"
                                    )}>
                                        {report.item2_a_objetivos || "________________________________________________________________________________________________________________________________________________________________"}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase underline underline-offset-4 decoration-zinc-200">b) - Das metas estabelecidas</Label>
                                {!isPreview && !isFinalized && (
                                    <div className="no-print">
                                        <Textarea autoResize
                                            readOnly={true}
                                            value={report.item2_b_metas}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReport({ ...report, item2_b_metas: e.target.value })}
                                            className="bg-zinc-100 dark:bg-zinc-900 cursor-not-allowed opacity-80"
                                        />
                                    </div>
                                )}
                                {(isPreview || isFinalized || isMounted) && (
                                    <div className={cn(
                                        "whitespace-pre-wrap min-h-[40px] border-b border-dotted border-zinc-300",
                                        (isPreview || isFinalized) ? "block" : "hidden print:block"
                                    )}>
                                        {report.item2_b_metas || "________________________________________________________________________________________________________________________________________________________________"}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase underline underline-offset-4 decoration-zinc-200">c) - Das atividades</Label>
                                {!isPreview && !isFinalized && (
                                    <div className="no-print">
                                        <Textarea autoResize
                                            readOnly={true}
                                            value={report.item2_c_atividades}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReport({ ...report, item2_c_atividades: e.target.value })}
                                            className="bg-zinc-100 dark:bg-zinc-900 cursor-not-allowed opacity-80"
                                        />
                                    </div>
                                )}
                                {(isPreview || isFinalized || isMounted) && (
                                    <div className={cn(
                                        "whitespace-pre-wrap min-h-[40px] border-b border-dotted border-zinc-300",
                                        (isPreview || isFinalized) ? "block" : "hidden print:block"
                                    )}>
                                        {report.item2_c_atividades || "________________________________________________________________________________________________________________________________________________________________"}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4 break-inside-avoid print:break-inside-avoid">
                        <div className="flex flex-col gap-1">
                            <h2 className={cn(
                                "font-black border-b border-black pb-1 uppercase text-blue-900 print:text-black",
                                isPreview && "text-black"
                            )}>3. Resultados</h2>
                            <p className="text-[10px] text-zinc-500 italic">explicitar os resultados detectados na visita em relação aos objetivos, metas e atividades</p>
                        </div>
                        {!isPreview && !isFinalized && (
                            <div className="no-print">
                                <Textarea autoResize
                                    placeholder="Relate as análises realizadas durante o monitoramento..."
                                    value={report.item3_resultados}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReport({ ...report, item3_resultados: e.target.value })}
                                    className="min-h-[150px] bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 focus:ring-blue-900"
                                />
                            </div>
                        )}
                        {(isPreview || isFinalized || isMounted) && (
                            <div className={cn(
                                "whitespace-pre-wrap min-h-[100px] border-b border-dotted border-zinc-300 font-bold",
                                (isPreview || isFinalized) ? "block" : "hidden print:block"
                            )}>
                                {report.item3_resultados || "____________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________"}
                            </div>
                        )}
                    </section>

                    {!isPreview && !isFinalized && (
                        <div className="no-print pt-6 border-t border-dashed border-zinc-200">
                            <Button
                                variant={report.item5_enabled ? "destructive" : "outline"}
                                onClick={() => setReport({ ...report, item5_enabled: !report.item5_enabled })}
                                className="w-full gap-2 font-bold uppercase text-[10px]"
                            >
                                {report.item5_enabled ? "Remover PSE" : "Habilitar PSE"}
                            </Button>
                        </div>
                    )}

                    {report.item5_enabled && (
                        <section className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 break-inside-avoid print:break-inside-avoid">
                            <div className="space-y-4">
                                <h2 className={cn(
                                    "font-black border-b border-black pb-1 uppercase text-blue-900 print:text-black",
                                    isPreview && "text-black"
                                )}>4. Dados</h2>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-sm">a) Qualitativos (preencher referente ao trimestre)</h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-bold text-sm shrink-0">Período:</span>
                                        {!isPreview && !isFinalized && (
                                            <div className="grow no-print">
                                                <Input
                                                    value={report.item5_periodo}
                                                    onChange={e => setReport({ ...report, item5_periodo: e.target.value })}
                                                    className="h-8 border-zinc-200 font-bold"
                                                />
                                            </div>
                                        )}
                                        <span className={cn("hidden print:inline grow border-b border-black", (isPreview || isFinalized) && "inline")}>
                                            {report.item5_periodo || "________________________________________________________________________________"}
                                        </span>
                                    </div>

                                    {/* Qualitative Table */}
                                    <div className="overflow-hidden border border-black mt-4">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className={cn(
                                                    "bg-blue-900 hover:bg-blue-900 border-b border-black",
                                                    isPreview && "bg-black hover:bg-black"
                                                )}>
                                                    <TableHead className="text-white font-bold uppercase text-center border-r border-black h-8 text-[11px] px-1">DATA</TableHead>
                                                    <TableHead className="text-white font-bold uppercase text-center border-r border-black h-8 text-[11px] px-1">SITUAÇÃO ENCONTRADA</TableHead>
                                                    <TableHead className="text-white font-bold uppercase text-center border-r border-black h-8 text-[11px] px-1">RECOMENDAÇÕES</TableHead>
                                                    <TableHead className="text-white font-bold uppercase text-center h-8 text-[11px] px-1">OBSERVAÇÃO</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {report.item5_qualitativos.map((row: any, idx: number) => (
                                                    <TableRow key={idx} className="border-b border-black hover:bg-transparent h-10">
                                                        <TableCell className="p-0 border-r border-black w-24">
                                                            <div className="print:hidden">
                                                                {!isPreview && !isFinalized ? (
                                                                    <Input
                                                                        className="border-none text-center text-xs h-10 w-full rounded-none focus-visible:ring-0"
                                                                        value={row.data}
                                                                        onChange={e => {
                                                                            const newQ = [...report.item5_qualitativos]
                                                                            newQ[idx].data = e.target.value
                                                                            setReport({ ...report, item5_qualitativos: newQ })
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="text-center text-xs px-1 font-bold">{row.data}</div>
                                                                )}
                                                            </div>
                                                            <div className="hidden print:block text-center text-xs px-1 font-bold">
                                                                {row.data || "---"}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="p-0 border-r border-black">
                                                            <div className="print:hidden">
                                                                {!isPreview && !isFinalized ? (
                                                                    <Textarea
                                                                        autoResize
                                                                        className="border-none text-xs min-h-[40px] w-full rounded-none focus-visible:ring-0 resize-none py-2 px-1"
                                                                        value={row.situacao}
                                                                        onChange={e => {
                                                                            const newQ = [...report.item5_qualitativos]
                                                                            newQ[idx].situacao = e.target.value
                                                                            setReport({ ...report, item5_qualitativos: newQ })
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="text-xs py-2 px-1 whitespace-pre-wrap font-bold">{row.situacao}</div>
                                                                )}
                                                            </div>
                                                            <div className="hidden print:block text-xs py-2 px-1 whitespace-pre-wrap font-bold">
                                                                {row.situacao || "---"}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="p-0 border-r border-black">
                                                            <div className="print:hidden">
                                                                {!isPreview && !isFinalized ? (
                                                                    <Textarea
                                                                        autoResize
                                                                        className="border-none text-xs min-h-[40px] w-full rounded-none focus-visible:ring-0 resize-none py-2 px-1"
                                                                        value={row.recomendacoes}
                                                                        onChange={e => {
                                                                            const newQ = [...report.item5_qualitativos]
                                                                            newQ[idx].recomendacoes = e.target.value
                                                                            setReport({ ...report, item5_qualitativos: newQ })
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="text-xs py-2 px-1 whitespace-pre-wrap font-bold">{row.recomendacoes}</div>
                                                                )}
                                                            </div>
                                                            <div className="hidden print:block text-xs py-2 px-1 whitespace-pre-wrap font-bold">
                                                                {row.recomendacoes || "---"}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="p-0">
                                                            <div className="print:hidden">
                                                                {!isPreview && !isFinalized ? (
                                                                    <Textarea
                                                                        autoResize
                                                                        className="border-none text-xs min-h-[40px] w-full rounded-none focus-visible:ring-0 resize-none py-2 px-1"
                                                                        value={row.observacao}
                                                                        onChange={e => {
                                                                            const newQ = [...report.item5_qualitativos]
                                                                            newQ[idx].observacao = e.target.value
                                                                            setReport({ ...report, item5_qualitativos: newQ })
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="text-xs py-2 px-1 whitespace-pre-wrap font-bold">{row.observacao}</div>
                                                                )}
                                                            </div>
                                                            <div className="hidden print:block text-xs py-2 px-1 whitespace-pre-wrap font-bold">
                                                                {row.observacao || "---"}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-10 break-before-page">
                                    {/* Page header for print above quantitative section */}
                                    <div className="hidden print:flex flex-col items-center text-center mb-8">
                                        <div className="flex items-center justify-center gap-6 mb-2">
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold uppercase leading-tight">Secretaria Municipal de</p>
                                                <p className="text-[12px] font-black uppercase leading-tight">Desenvolvimento Social</p>
                                            </div>
                                            <div className="h-12 w-[2px] bg-black"></div>
                                            <div className="text-left flex flex-col items-start leading-none">
                                                <p className="text-[10px] font-bold uppercase tracking-widest">Prefeitura de</p>
                                                <p className="text-[18px] font-black uppercase tracking-tighter">Uberlândia</p>
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-sm">b) Quantitativos:</h3>

                                    <div className="overflow-hidden border border-black">
                                        <Table className="w-full text-[9px] border-collapse">
                                            <TableHeader>
                                                <TableRow className={cn(
                                                    "bg-blue-900 hover:bg-blue-900 border-b border-black print:bg-blue-900",
                                                    isPreview && "bg-black hover:bg-black"
                                                )}>
                                                    <TableHead colSpan={13} className="text-white font-black text-center h-10 uppercase border-b border-black px-4 text-[11px] leading-tight">
                                                        Acompanhamento do número de (crianças/adolescentes, idosos ou mulheres acolhidas)
                                                    </TableHead>
                                                </TableRow>
                                                <TableRow className="border-b border-black hover:bg-transparent">
                                                    <TableHead className="border-r border-black h-8 shrink-0 w-[180px] p-0"></TableHead>
                                                    {['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'].map(m => (
                                                        <TableHead key={m} className="border-r border-black h-8 text-black font-bold text-center p-0 w-[45px] text-[10px]">{m}</TableHead>
                                                    ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {[
                                                    { label: 'Total no 1º dia do mês', key: 'total_1dia' },
                                                    { label: 'Usuários inseridos', key: 'inseridos' },
                                                    { label: 'Usuários desligados', key: 'desligados' },
                                                    { label: 'Total no último dia do mês', key: 'total_ultimo' }
                                                ].map((row) => (
                                                    <TableRow key={row.key} className="border-b border-black hover:bg-transparent h-8">
                                                        <TableCell className="border-r border-black font-medium bg-zinc-50/10 p-2 text-[10px] leading-tight">
                                                            {row.label}
                                                        </TableCell>
                                                        {['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].map(month => (
                                                            <TableCell key={month} className="border-r border-black p-0">
                                                                {!isPreview && !isFinalized ? (
                                                                    <Input
                                                                        className="border-none text-center h-8 w-full rounded-none focus-visible:ring-0 text-[11px] p-0 font-bold"
                                                                        value={(report.item5_quantitativos as any)[row.key][month]}
                                                                        onChange={e => {
                                                                            const newQuant = { ...report.item5_quantitativos }
                                                                            // @ts-ignore
                                                                            newQuant[row.key][month] = e.target.value
                                                                            setReport({ ...report, item5_quantitativos: newQuant })
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="text-center text-[11px] font-bold">
                                                                        {(report.item5_quantitativos as any)[row.key][month]}
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    <p className="text-[10px] text-justify leading-relaxed">
                                        <span className="font-bold">Obs.:</span> Para <span className="underline decoration-dotted font-bold">Instituições</span> de acolhimento para população em situação de rua o quadro acima não deve ser preenchido. Continuar com a planilha que é enviada mensalmente à Vigilância Socioassistencial.
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}

                    <section className="space-y-4 break-inside-avoid print:break-inside-avoid">
                        <h2 className={cn(
                            "font-black border-b border-black pb-1 uppercase text-blue-900 print:text-black",
                            isPreview && "text-black"
                        )}>5. CUMPRIMENTO DO OBJETO{isEmendas ? "" : " ATÉ A PRESENTE DATA"}</h2>

                        {!isPreview && !isFinalized && (
                            <div className="no-print space-y-6 bg-zinc-50 dark:bg-zinc-950/30 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                {isEmendas && (
                                    <div className="flex gap-4 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-4 items-center justify-center">
                                        <span className="text-[10px] font-black uppercase text-zinc-500 mr-2">Tipo de Termo:</span>
                                        <Button
                                            size="sm"
                                            variant={report.term_type === 'fomento' ? 'default' : 'outline'}
                                            onClick={() => setReport({ ...report, term_type: 'fomento' })}
                                            className={cn(
                                                "text-[10px] font-bold uppercase",
                                                report.term_type === 'fomento' ? "bg-blue-900 text-white hover:bg-blue-800" : "text-zinc-500 bg-transparent border-zinc-300"
                                            )}
                                        >
                                            Termo de Fomento
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={report.term_type === 'colaboracao' ? 'default' : 'outline'}
                                            onClick={() => setReport({ ...report, term_type: 'colaboracao' })}
                                            className={cn(
                                                "text-[10px] font-bold uppercase",
                                                report.term_type === 'colaboracao' ? "bg-blue-900 text-white hover:bg-blue-800" : "text-zinc-500 bg-transparent border-zinc-300"
                                            )}
                                        >
                                            Termo de Colaboração
                                        </Button>
                                    </div>
                                )}

                                <RadioGroup value={report.item4_type} onValueChange={val => setReport({ ...report, item4_type: val })}>
                                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-zinc-900 transition-colors">
                                        <RadioGroupItem value="fully" id="fully" className="mt-1" />
                                        <Label htmlFor="fully" className="cursor-pointer leading-normal">
                                            <span className="font-bold text-blue-900 dark:text-blue-400 block mb-1 uppercase text-xs">Cumprimento Integral</span>
                                            <span className="text-[11px] text-zinc-500">Conforme Plano de Trabalho, atividades coerentes e metas atingidas.</span>
                                        </Label>
                                    </div>
                                    
                                    {(isSubvencao || isEmendas) ? (
                                        <>
                                            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-zinc-900 transition-colors">
                                                <RadioGroupItem value="partially" id="partially" className="mt-1" />
                                                <Label htmlFor="partially" className="cursor-pointer leading-normal">
                                                    <span className="font-bold text-amber-600 block mb-1 uppercase text-xs">Cumprimento Parcial – meta quantitativa</span>
                                                    <span className="text-[11px] text-zinc-500">Coerente nas atividades, mas meta quantitativa não alcançada.</span>
                                                </Label>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-zinc-900 transition-colors">
                                                <RadioGroupItem value="partially_qual" id="partially_qual" className="mt-1" />
                                                <Label htmlFor="partially_qual" className="cursor-pointer leading-normal">
                                                    <span className="font-bold text-amber-600 block mb-1 uppercase text-xs">Cumprimento Parcial – meta qualitativa</span>
                                                    <span className="text-[11px] text-zinc-500">Coerente nas atividades, mas meta qualitativa não alcançada.</span>
                                                </Label>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-zinc-900 transition-colors">
                                            <RadioGroupItem value="partially" id="partially" className="mt-1" />
                                            <Label htmlFor="partially" className="cursor-pointer leading-normal">
                                                <span className="font-bold text-amber-600 block mb-1 uppercase text-xs">Cumprimento Parcial</span>
                                                <span className="text-[11px] text-zinc-500">Coerente nas atividades, mas meta quantitativa não alcançada.</span>
                                            </Label>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-zinc-900 transition-colors">
                                        <RadioGroupItem value="custom" id="custom" className="mt-1" />
                                        <Label htmlFor="custom" className="cursor-pointer leading-normal">
                                            <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1 uppercase text-xs">Outro / Ressalvas</span>
                                            <span className="text-[11px] text-zinc-500">Houve problemas ou desvios em relação ao objeto pactuado.</span>
                                        </Label>
                                    </div>
                                </RadioGroup>

                                {report.item4_type === 'custom' && (
                                    <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                                        <Label className="text-[10px] font-bold uppercase mb-2 block">Descreva a situação:</Label>
                                        <Textarea autoResize
                                            value={report.item4_custom}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReport({ ...report, item4_custom: e.target.value })}
                                            className="bg-white dark:bg-zinc-900 font-bold"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="italic text-justify">
                            <p className="bg-blue-50/10 p-2 rounded print:bg-transparent print:p-0">
                                Com base nas descrições relatadas e análises realizadas do monitoramento e avaliação desenvolvido por meio de Visita Técnica in loco, {getOptionText(report.item4_type)}
                            </p>
                        </div>
                    </section>


                    <section className="pt-8 break-inside-avoid print:break-inside-avoid">
                        <div className="grid grid-cols-2 gap-12 max-w-4xl mx-auto">
                            <div className="space-y-4 flex flex-col items-center">
                                {!isPreview && !isFinalized && (
                                    <div className="no-print w-full space-y-2">
                                        <div className="border-b border-zinc-200 pb-2">
                                            <SignaturePad
                                                label=""
                                                defaultValue={report.assinaturas.tecnico1}
                                                onSave={data => setReport({ ...report, assinaturas: { ...report.assinaturas, tecnico1: data } })}
                                            />
                                        </div>
                                        <Input
                                            placeholder="Nome do Técnico 1"
                                            value={report.assinaturas.tecnico1_nome}
                                            onChange={e => setReport({ ...report, assinaturas: { ...report.assinaturas, tecnico1_nome: e.target.value.toUpperCase() } })}
                                            className="text-center font-bold text-xs border-none bg-zinc-50"
                                        />
                                        <div className="flex justify-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSaveIndividualSignature('tecnico1')}
                                                disabled={savingSignature === 'tecnico1'}
                                                className="text-[9px] h-7 gap-1 font-bold border-blue-200 text-blue-600 hover:text-white hover:bg-blue-600 px-3 uppercase transition-colors"
                                            >
                                                {savingSignature === 'tecnico1' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                                Salvar Assinatura Técnico 1
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                {(isPreview || isFinalized || isMounted) && (
                                    <div className={cn(
                                        "space-y-2",
                                        (isPreview || isFinalized) ? "block" : "hidden print:block"
                                    )}>
                                        {report.assinaturas.tecnico1 && (
                                            <div className="flex justify-center border-b border-black w-full pb-1 mb-1">
                                                <img src={report.assinaturas.tecnico1} alt="Assinatura" className="h-16 object-contain" />
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="text-center">
                                    <p className="text-[11px] font-bold border-t border-black pt-1 md:border-none">{report.assinaturas.tecnico1_nome || "_________________________"}</p>
                                    <p className="text-[9px] font-black uppercase text-zinc-400">Técnico SMDS</p>
                                </div>
                            </div>

                            <div className="space-y-4 flex flex-col items-center">
                                {!isPreview && !isFinalized && (
                                    <div className="no-print w-full space-y-2">
                                        <div className="border-b border-zinc-200 pb-2">
                                            <SignaturePad
                                                label=""
                                                defaultValue={report.assinaturas.tecnico2}
                                                onSave={data => setReport({ ...report, assinaturas: { ...report.assinaturas, tecnico2: data } })}
                                            />
                                        </div>
                                        <Input
                                            placeholder="Nome do Técnico 2"
                                            value={report.assinaturas.tecnico2_nome}
                                            onChange={e => setReport({ ...report, assinaturas: { ...report.assinaturas, tecnico2_nome: e.target.value.toUpperCase() } })}
                                            className="text-center font-bold text-xs border-none bg-zinc-50"
                                        />
                                        <div className="flex justify-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSaveIndividualSignature('tecnico2')}
                                                disabled={savingSignature === 'tecnico2'}
                                                className="text-[9px] h-7 gap-1 font-bold border-blue-200 text-blue-600 hover:text-white hover:bg-blue-600 px-3 uppercase transition-colors"
                                            >
                                                {savingSignature === 'tecnico2' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                                Salvar Assinatura Técnico 2
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                {(isPreview || isFinalized || isMounted) && (
                                    <div className={cn(
                                        "space-y-2",
                                        (isPreview || isFinalized) ? "block" : "hidden print:block"
                                    )}>
                                        {report.assinaturas.tecnico2 && (
                                            <div className="flex justify-center border-b border-black w-full pb-1 mb-1">
                                                <img src={report.assinaturas.tecnico2} alt="Assinatura" className="h-16 object-contain" />
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="text-center">
                                    <p className="text-[11px] font-bold border-t border-black pt-1 md:border-none">{report.assinaturas.tecnico2_nome || "_________________________"}</p>
                                    <p className="text-[9px] font-black uppercase text-zinc-400">Técnico SMDS</p>
                                </div>
                            </div>


                        </div>
                    </section>
                </div>

                {/* Print Footer */}
                <div className="hidden print:block mt-8 text-[9px] text-center text-zinc-400 border-t pt-2 italic">
                    Documento gerado eletronicamente em {isMounted ? today : "---"} • Sistema de Vigilância Socioassistencial
                </div>
            </div>

            <Dialog open={saveConfirmation.isOpen} onOpenChange={(open) => setSaveConfirmation(prev => ({ ...prev, isOpen: open }))}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                            Confirmação do Parecer
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-sm text-zinc-600 space-y-3">
                        <p className="font-bold text-zinc-900">
                            {saveConfirmation.finalize
                                ? "Você está prestes a FINALIZAR e BLOQUEAR o relatório de visita."
                                : "Você está salvando um rascunho deste relatório."}
                        </p>
                        <p>
                            Certifique-se de que preenchu todos os campos obrigatórios corretamente, inclusive as **assinaturas e nomes** dos técnicos, se disponíveis no momento.
                        </p>
                        <p className="text-xs italic bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-800">
                            Obs: Se faltar alguma assinatura, você poderá voltar depois para editar o rascunho. Porém, após <strong>Finalizar</strong>, o documento não poderá mais ser alterado.
                        </p>
                    </div>
                    <div className="flex justify-between gap-3 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={() => setSaveConfirmation({ isOpen: false, finalize: false })}
                            className="flex-1 font-bold uppercase text-[10px]"
                        >
                            Voltar e Revisar
                        </Button>
                        <Button
                            onClick={() => {
                                if (saveConfirmation.finalize) {
                                    handleFinalize()
                                } else {
                                    handleSaveDraft()
                                }
                                setSaveConfirmation({ isOpen: false, finalize: false })
                            }}
                            className="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-bold uppercase text-[10px]"
                        >
                            {saveConfirmation.finalize ? "Sim, Finalizar Agora" : "Sim, Salvar Rascunho"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
