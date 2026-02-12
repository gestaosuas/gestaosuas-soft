'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SignaturePad } from "@/components/signature-pad"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    ArrowLeft,
    Save,
    CheckCircle,
    Building2,
    Clock,
    Users,
    Users2,
    Plus,
    Trash2,
    AlertCircle,
    Loader2,
    Check,
    Camera,
    X,
    FileText
} from "lucide-react"
import { cn } from "@/lib/utils"
import { saveVisit, finalizeVisit } from "@/app/dashboard/actions"
import { WorkPlanSelector } from "./work-plan-selector"

export function VisitForm({
    directorateId,
    directorateName,
    oscs,
    initialVisit,
    logoUrl
}: {
    directorateId: string,
    directorateName: string,
    oscs: any[],
    initialVisit?: any,
    logoUrl?: string
}) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const isEmendas = directorateName.toLowerCase().includes('emendas')
    const isOutros = directorateName.toLowerCase().includes('outros') || directorateId === '82471122-9b28-4d9a-90d4-f5e437d15761'

    // Form State
    const [formData, setFormData] = useState({
        osc_id: initialVisit?.osc_id || initialVisit?.identificacao?.osc_id || "",
        email: initialVisit?.identificacao?.email || "",
        visit_date: initialVisit?.visit_date || initialVisit?.identificacao?.visit_date || new Date().toISOString().split('T')[0],
        visit_date_1: initialVisit?.identificacao?.visit_date_1 || initialVisit?.visit_date || new Date().toISOString().split('T')[0],
        visit_shift_1: initialVisit?.identificacao?.visit_shift_1 || "",
        has_second_visit: initialVisit?.identificacao?.has_second_visit || false,
        visit_date_2: initialVisit?.identificacao?.visit_date_2 || "",
        visit_shift_2: initialVisit?.identificacao?.visit_shift_2 || "",
        identifier: initialVisit?.identificacao?.identifier || "",
        photos: initialVisit?.identificacao?.photos || [],
        ...(initialVisit?.identificacao || {})
    })

    const [atendimento, setAtendimento] = useState({
        tipo_horario: initialVisit?.atendimento?.tipo_horario || "periodo",
        horario_inicio: initialVisit?.atendimento?.horario_inicio || "",
        horario_fim: initialVisit?.atendimento?.horario_fim || "",
        total_atendidos: initialVisit?.atendimento?.total_atendidos || 0,
        subvencionados: initialVisit?.atendimento?.subvencionados || 0,
        presentes: initialVisit?.atendimento?.presentes || { manha: 0, tarde: 0 },
        lista_espera: initialVisit?.atendimento?.lista_espera || "nao",
        lista_espera_qtd: initialVisit?.atendimento?.lista_espera_qtd || 0,
        atividades: initialVisit?.atendimento?.atividades || "",
        atividades_momento: initialVisit?.atendimento?.atividades_momento || "",
        aplicacao_recurso: initialVisit?.atendimento?.aplicacao_recurso || "",
        resultados_aplicacao: initialVisit?.atendimento?.resultados_aplicacao || "",
        itens_identificados: initialVisit?.atendimento?.itens_identificados || "",
        itens_nao_identificados: initialVisit?.atendimento?.itens_nao_identificados || ""
    })

    const [formaAcesso, setFormaAcesso] = useState(initialVisit?.forma_acesso || {
        demanda_espontanea: false,
        busca_ativa: false,
        encaminhamento: false,
        outros: false,
        quem_encaminha: ""
    })

    const [rhData, setRhData] = useState(initialVisit?.rh_data || [
        { cargo: "Coordenador", voluntario: false, subvencao: false, quantidade: "", outros: "" },
        { cargo: "Assistente Social", voluntario: false, subvencao: false, quantidade: "", outros: "" },
        { cargo: "Psicólogo", voluntario: false, subvencao: false, quantidade: "", outros: "" },
        { cargo: "Instrutor", voluntario: false, subvencao: false, quantidade: "", outros: "" },
        { cargo: "Educador Físico", voluntario: false, subvencao: false, quantidade: "", outros: "" },
        { cargo: "Auxiliar Administrativo", voluntario: false, subvencao: false, quantidade: "", outros: "" },
        { cargo: "Monitor", voluntario: false, subvencao: false, quantidade: "", outros: "" },
        { cargo: "Serviço Geral", voluntario: false, subvencao: false, quantidade: "", outros: "" },
        { cargo: "Cozinheiro", voluntario: false, subvencao: false, quantidade: "", outros: "" },
    ])

    const [observacoes, setObservacoes] = useState(initialVisit?.observacoes || "")
    const [recomendacoes, setRecomendacoes] = useState(initialVisit?.recomendacoes || "")
    const [assinaturas, setAssinaturas] = useState(initialVisit?.assinaturas || {
        tecnico1: "",
        tecnico1_nome: "",
        tecnico2: "",
        tecnico2_nome: "",
        responsavel: "",
        responsavel_nome: ""
    })
    const [documents, setDocuments] = useState(initialVisit?.documents || [])

    // Selected OSC Data
    const selectedOSC = oscs.find(o => o.id === formData.osc_id)
    const isLocked = initialVisit?.status === 'finalized'

    // Auto-fill subsidized count from selected OSC
    useEffect(() => {
        if (formData.osc_id && !isLocked) {
            const osc = oscs.find(o => o.id === formData.osc_id)
            if (osc && osc.subsidized_count !== undefined) {
                setAtendimento((prev: any) => ({
                    ...prev,
                    subvencionados: osc.subsidized_count
                }))
            }
        }
    }, [formData.osc_id, oscs, isLocked])

    const [oscSearch, setOscSearch] = useState("")
    const [isOscSelectOpen, setIsOscSelectOpen] = useState(false)

    // Filtered OSCs based on search
    const filteredOSCs = (oscs || []).filter(osc =>
        osc.name.toLowerCase().includes(oscSearch.toLowerCase())
    )

    const handleSave = async (finalize = false) => {
        if (!formData.osc_id) {
            alert("Por favor, selecione uma OSC.")
            return
        }

        setIsSaving(true)
        try {
            const payload = {
                id: initialVisit?.id,
                osc_id: formData.osc_id,
                directorate_id: directorateId,
                visit_date: formData.visit_date_1,
                identificacao: formData,
                atendimento,
                forma_acesso: formaAcesso,
                rh_data: rhData,
                observacoes,
                recomendacoes,
                assinaturas,
                documents
            }

            const result = await saveVisit(payload)
            if (result.success) {
                if (finalize) {
                    const finalResult = await finalizeVisit(result.id || initialVisit.id)
                    if (finalResult.success) {
                        alert("Visita finalizada com sucesso! O relatório agora é imutável.")
                        router.push(`/dashboard/diretoria/${directorateId}/subvencao/visitas`)
                    }
                } else {
                    alert("Rascunho salvo com sucesso!")
                    router.push(`/dashboard/diretoria/${directorateId}/subvencao/visitas`)
                }
            }
        } catch (error: any) {
            alert("Erro ao salvar: " + error.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            alert("Por favor, selecione apenas imagens.")
            return
        }

        // Optimistic update or waiting? Let's wait for upload
        const uploadFormData = new FormData()
        uploadFormData.append('file', file)

        try {
            setLoading(true)
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Erro no upload')
            }

            setFormData((prev: any) => ({
                ...prev,
                photos: [...(prev.photos || []), data.url]
            }))

        } catch (error: any) {
            console.error("Upload error:", error)
            alert("Erro ao fazer upload da imagem: " + error.message)
        } finally {
            setLoading(false)
            // Reset input
            e.target.value = ''
        }
    }

    const removePhoto = (index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            photos: prev.photos.filter((_: string, i: number) => i !== index)
        }))
    }

    const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.type !== 'application/pdf') {
            alert("Por favor, selecione apenas arquivos PDF.")
            return
        }

        const uploadFormData = new FormData()
        uploadFormData.append('file', file)

        try {
            setLoading(true)
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Erro no upload')
            }

            setDocuments((prev: any) => [...(prev || []), { name: file.name, url: data.url }])

        } catch (error: any) {
            console.error("Upload error:", error)
            alert("Erro ao fazer upload do documento: " + error.message)
        } finally {
            setLoading(false)
            e.target.value = ''
        }
    }

    const removeDocument = (index: number) => {
        setDocuments((prev: any) => prev.filter((_: any, i: number) => i !== index))
    }


    const addRhRow = () => {
        setRhData([...rhData, { cargo: "", voluntario: false, subvencao: false, quantidade: "", outros: "" }])
    }

    const removeRhRow = (index: number) => {
        setRhData(rhData.filter((_: any, i: number) => i !== index))
    }

    const totalPresentes = (Number(atendimento.presentes.manha) || 0) + (Number(atendimento.presentes.tarde) || 0)

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700 print:max-w-full print:p-0 print:m-0 print:space-y-4 print:min-h-screen print:flex print:flex-col">

            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; padding: 0 !important; margin: 0 !important; font-family: 'Inter', sans-serif !important; }
                    .print-section { 
                        break-inside: avoid !important; 
                        page-break-inside: avoid !important;
                        margin-bottom: 20px !important;
                        padding: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    .report-container {
                        max-width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .report-field {
                        display: flex;
                        align-items: baseline;
                        gap: 4px;
                        margin-bottom: 4px;
                        font-size: 11px;
                    }
                    .report-label {
                        font-weight: 700;
                        color: #000;
                        flex-shrink: 0;
                    }
                    .report-value {
                        flex-grow: 1;
                        border-bottom: 0.5px solid #ccc;
                        padding-bottom: 1px;
                        min-height: 14px;
                    }
                    .print-checkbox {
                        border: 1px solid black !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        min-width: 12px;
                        min-height: 12px;
                    }
                    .print-checkbox-checked {
                        background-color: #000 !important;
                        color: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .report-container {
                        color: #000 !important;
                    }
                    table { 
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    th, td { 
                        border: 0.5px solid #000 !important;
                        padding: 4px 8px !important;
                        font-size: 10px !important;
                    }
                    thead th {
                        background-color: #f9f9f9 !important;
                        -webkit-print-color-adjust: exact !important;
                    }
                }
                .locked-report h2, .locked-report h3 {
                    border-bottom: 2px solid #000;
                    padding-bottom: 2px;
                    margin-bottom: 12px;
                    text-transform: uppercase;
                    font-weight: 900;
                    letter-spacing: -0.02em;
                    color: black;
                }
                .locked-report .grid {
                    gap-y: 6px !important;
                }
                @media print {
                    .print-footer {
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        text-align: center;
                        font-size: 8px;
                        color: #666;
                        padding-bottom: 10px;
                        border-top: 0.5px solid #eee;
                        padding-top: 5px;
                    }
                    .signatures-wrapper {
                        margin-top: auto !important;
                        padding-top: 20px !important;
                        padding-bottom: 40px !important;
                    }
                }
            `}</style>

            {/* Report Header for Print/Locked View */}
            <div className={cn(
                "hidden print:flex flex-col items-center text-center mb-8 border-b-2 border-black pb-4",
                isLocked && "flex"
            )}>
                <div className="flex items-center justify-between w-full max-w-4xl mb-4 px-4">
                    <img
                        suppressHydrationWarning
                        src={logoUrl || "https://ovfpxrepxlrspsjbtpnd.supabase.co/storage/v1/object/public/system/logo-pm-uberlandia.png"}
                        alt="Logo"
                        className="h-16 w-auto object-contain"
                    />
                    <div className="text-right flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase text-zinc-400 leading-none">Secretaria Municipal de</span>
                        <span className="text-sm font-black uppercase text-blue-900 leading-none">Desenvolvimento Social</span>
                    </div>
                </div>
                <h1 className="text-xl font-black uppercase tracking-tight text-black border-t border-zinc-100 pt-4 w-full">INSTRUMENTAL DE MONITORAMENTO E AVALIAÇÃO</h1>
                <p className="text-[9px] font-bold text-zinc-500 mt-1 uppercase tracking-widest">SISTEMA VIGILÂNCIA SOCIOASSISTENCIAL 2026</p>
            </div>
            {/* Header Actions */}
            <div className="flex items-center justify-between no-print">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="group flex items-center gap-2 text-zinc-500 hover:text-blue-900 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Voltar
                </Button>

                <div className="flex gap-3">
                    <WorkPlanSelector
                        oscId={formData.osc_id}
                        oscName={selectedOSC?.name}
                        logoUrl={logoUrl}
                    />

                    <Button
                        variant="outline"
                        onClick={() => window.print()}
                        className="h-11 px-6 rounded-xl border-zinc-200 font-bold text-xs uppercase tracking-widest gap-2"
                    >
                        Imprimir Relatório
                    </Button>
                    {!isLocked && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => handleSave(false)}
                                disabled={isSaving}
                                className="h-11 px-6 rounded-xl border-zinc-200 font-bold text-xs uppercase tracking-widest gap-2"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Salvar Rascunho
                            </Button>
                            <Button
                                onClick={() => {
                                    if (window.confirm("Deseja finalizar a visita? Após a finalização, o relatório não poderá ser editado.")) {
                                        handleSave(true)
                                    }
                                }}
                                disabled={isSaving}
                                className="h-11 px-6 rounded-xl bg-blue-900 text-white hover:bg-black font-bold text-xs uppercase tracking-widest gap-2 shadow-lg shadow-blue-900/20"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Finalizar Visita
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Helper for Read-Only Corporate Look */}
            {isLocked && (
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl mb-6 no-print flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-900 text-white rounded-lg">
                            <CheckCircle className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-blue-900 uppercase">Documento Finalizado</p>
                            <p className="text-[10px] text-blue-700 font-medium">Este relatório está em modo de visualização e não pode ser editado.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Content Wrapper to push signatures down */}
            <div className="print:flex-1">
                {/* I. IDENTIFICAÇÃO */}
                <div className={cn(
                    "print-section locked-report",
                    !isLocked && "bg-white p-6 rounded-3xl shadow-xl shadow-blue-900/5 space-y-6"
                )}>
                    <h2 className={cn(
                        "text-lg font-black tracking-tight mb-4",
                        !isLocked ? "text-blue-900 border-none pb-0" : "text-black border-b-2 border-black"
                    )}>IDENTIFICAÇÃO</h2>

                    <div className={cn(
                        "space-y-6"
                    )}>
                        {/* Print/Read-only View (Always shows on print) */}
                        <div className={cn(
                            "hidden print:block",
                            isLocked && "block"
                        )}>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-1.5 px-2">
                                <div className="md:col-span-8 flex items-baseline gap-2">
                                    <span className="text-[11px] font-bold uppercase shrink-0">OSC:</span>
                                    <span className="text-[11px] font-bold border-b border-dotted border-zinc-300 grow pb-px">{selectedOSC?.name || "-"}</span>
                                </div>
                                <div className="md:col-span-4 flex flex-col gap-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-[11px] font-bold uppercase shrink-0">1ª Visita:</span>
                                        <span className="text-[11px] font-bold border-b border-dotted border-zinc-300 grow pb-px">
                                            {formData.visit_date_1 ? new Date(formData.visit_date_1 + 'T12:00:00').toLocaleDateString('pt-BR') : "-"}
                                            {formData.visit_shift_1 ? ` (${formData.visit_shift_1})` : ""}
                                        </span>
                                    </div>
                                    {formData.has_second_visit && (
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-[11px] font-bold uppercase shrink-0">2ª Visita:</span>
                                            <span className="text-[11px] font-bold border-b border-dotted border-zinc-300 grow pb-px">
                                                {formData.visit_date_2 ? new Date(formData.visit_date_2 + 'T12:00:00').toLocaleDateString('pt-BR') : "-"}
                                                {formData.visit_shift_2 ? ` (${formData.visit_shift_2})` : ""}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="md:col-span-6 flex items-baseline gap-2">
                                    <span className="text-[11px] font-bold uppercase shrink-0">Tipo de atividade:</span>
                                    <span className="text-[11px] font-medium border-b border-dotted border-zinc-300 grow pb-px">{selectedOSC?.activity_type || "-"}</span>
                                </div>
                                <div className="md:col-span-3 flex items-baseline gap-2">
                                    <span className="text-[11px] font-bold uppercase shrink-0">Telefone:</span>
                                    <span className="text-[11px] font-medium border-b border-dotted border-zinc-300 grow pb-px">{selectedOSC?.phone || "-"}</span>
                                </div>
                                <div className="md:col-span-3 flex items-baseline gap-2">
                                    <span className="text-[11px] font-bold uppercase shrink-0">E-mail:</span>
                                    <span className="text-[11px] font-medium border-b border-dotted border-zinc-300 grow pb-px">{formData.email || "-"}</span>
                                </div>
                                <div className="md:col-span-12 flex items-baseline gap-2">
                                    <span className="text-[11px] font-bold uppercase shrink-0">Endereço:</span>
                                    <span className="text-[11px] font-medium border-b border-dotted border-zinc-300 grow pb-px">
                                        {selectedOSC?.address ? `${selectedOSC.address}, ${selectedOSC.number} - ${selectedOSC.neighborhood}` : "-"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Edit View (Hidden on print) */}
                        {!isLocked && (
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 print:hidden">
                                <div className={cn("space-y-2", isEmendas ? "md:col-span-6" : "md:col-span-8")}>
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-blue-900/40">Selecione a Organização Social Civil (OSC)</Label>
                                    <Dialog open={isOscSelectOpen} onOpenChange={setIsOscSelectOpen}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full h-14 bg-zinc-50 border-zinc-200/60 rounded-xl justify-between px-4 text-blue-950 font-bold hover:bg-zinc-100 transition-all border-2 border-transparent hover:border-blue-900/10 shadow-sm"
                                            >
                                                {selectedOSC ? (
                                                    <div className="flex flex-col items-start overflow-hidden">
                                                        <span className="truncate w-full">{selectedOSC.name}</span>
                                                        <span className="text-[10px] text-zinc-500 font-medium">{selectedOSC.activity_type}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-zinc-400">Escolha uma instituição cadastrada</span>
                                                )}
                                                <Building2 className="h-4 w-4 opacity-30 shrink-0 ml-2" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[500px] p-0 overflow-hidden rounded-3xl border border-zinc-200/50 shadow-2xl bg-white focus:outline-none">
                                            <DialogHeader className="p-6 pb-0">
                                                <DialogTitle className="text-xl font-black text-blue-900 uppercase tracking-tight">Selecionar Organização</DialogTitle>
                                            </DialogHeader>
                                            <div className="p-6 space-y-4">
                                                <div className="relative">
                                                    <Input
                                                        placeholder="Digite o nome da OSC para filtrar..."
                                                        value={oscSearch}
                                                        onChange={(e) => setOscSearch(e.target.value)}
                                                        className="h-12 pl-4 rounded-2xl border-zinc-200 focus:ring-4 focus:ring-blue-900/5 transition-all font-medium"
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                                    {filteredOSCs.length === 0 ? (
                                                        <div className="py-12 text-center text-zinc-500 font-medium bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-100">
                                                            Nenhuma OSC encontrada
                                                        </div>
                                                    ) : (
                                                        filteredOSCs.map((osc) => (
                                                            <button
                                                                key={osc.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormData({ ...formData, osc_id: osc.id })
                                                                    setIsOscSelectOpen(false)
                                                                    setOscSearch("")
                                                                }}
                                                                className={cn(
                                                                    "w-full text-left p-4 rounded-2xl transition-all border-2 flex items-center justify-between group",
                                                                    formData.osc_id === osc.id
                                                                        ? "bg-blue-50 border-blue-200 shadow-sm"
                                                                        : "bg-white border-transparent hover:border-zinc-100 hover:bg-zinc-50"
                                                                )}
                                                            >
                                                                <div className="flex flex-col flex-1 overflow-hidden pr-4">
                                                                    <span className={cn(
                                                                        "font-bold transition-colors truncate",
                                                                        formData.osc_id === osc.id ? "text-blue-900" : "text-blue-950"
                                                                    )}>{osc.name}</span>
                                                                    <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">{osc.activity_type}</span>
                                                                </div>
                                                                {formData.osc_id === osc.id && (
                                                                    <CheckCircle className="h-5 w-5 text-blue-900 shrink-0" />
                                                                )}
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>



                                {/* Identifier Field - Only for Emendas */}
                                {isEmendas && (
                                    <div className="md:col-span-3 space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-400">Identificador</Label>
                                        <Input
                                            placeholder="Ex: 2024.001"
                                            value={formData.identifier}
                                            onChange={e => setFormData({ ...formData, identifier: e.target.value })}
                                            className="h-14 bg-zinc-50/50 rounded-xl font-bold text-blue-900 border-zinc-200/60"
                                        />
                                    </div>
                                )}

                                <div className={cn("space-y-4", isEmendas ? "md:col-span-3" : "md:col-span-4")}>
                                    {/* 1st Visit */}
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-400">
                                            {isEmendas ? "1ª Visita" : "1ª Visita (Obrigatória)"}
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="date"
                                                value={formData.visit_date_1}
                                                onChange={e => setFormData({ ...formData, visit_date_1: e.target.value, visit_date: e.target.value })}
                                                disabled={isLocked || (!isEmendas && !!initialVisit?.id)}
                                                className="h-12 bg-zinc-50/50 rounded-lg font-bold text-xs"
                                            />
                                            <Select
                                                value={formData.visit_shift_1}
                                                onValueChange={val => setFormData({ ...formData, visit_shift_1: val })}
                                                disabled={isLocked || (!isEmendas && !!initialVisit?.id)}
                                            >
                                                <SelectTrigger className="h-12 w-[120px] bg-zinc-50/50 text-xs font-bold">
                                                    <SelectValue placeholder="Turno" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    <SelectItem value="Manhã">Manhã</SelectItem>
                                                    <SelectItem value="Tarde">Tarde</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* 2nd Visit Toggle & Fields */}
                                    <div className="space-y-2">
                                        {!formData.has_second_visit ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setFormData({ ...formData, has_second_visit: true })}
                                                className="w-full h-8 text-[10px] font-bold uppercase tracking-wide text-blue-900 border-blue-200 hover:bg-blue-50"
                                            >
                                                <Plus className="h-3 w-3 mr-2" />
                                                Adicionar 2ª Visita
                                            </Button>
                                        ) : (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-400">2ª Visita</Label>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setFormData({ ...formData, has_second_visit: false, visit_date_2: "", visit_shift_2: "" })}
                                                        className="h-5 px-2 text-[9px] text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        Remover
                                                    </Button>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="date"
                                                        value={formData.visit_date_2}
                                                        onChange={e => setFormData({ ...formData, visit_date_2: e.target.value })}
                                                        disabled={isLocked}
                                                        className="h-12 bg-zinc-50/50 rounded-lg font-bold text-xs"
                                                    />
                                                    <Select
                                                        value={formData.visit_shift_2}
                                                        onValueChange={val => setFormData({ ...formData, visit_shift_2: val })}
                                                        disabled={isLocked}
                                                    >
                                                        <SelectTrigger className="h-12 w-[120px] bg-zinc-50/50 text-xs font-bold">
                                                            <SelectValue placeholder="Turno" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Manhã">Manhã</SelectItem>
                                                            <SelectItem value="Tarde">Tarde</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* II. ATENDIMENTO */}
                <div className={cn(
                    "print-section locked-report",
                    !isLocked && "bg-white p-6 rounded-3xl shadow-xl shadow-blue-900/5 space-y-6 print:shadow-none print:p-0"
                )}>
                    <h2 className={cn(
                        "text-lg font-black tracking-tight mb-4",
                        !isLocked ? "text-blue-900 border-none pb-0 print:text-black print:border-b-2 print:border-black print:pb-0" : "text-black border-b-2 border-black"
                    )}>ATENDIMENTO</h2>

                    <div className={cn(isLocked ? "space-y-2 px-2" : "space-y-6")}>

                        {/* REPORT/PRINT VIEW */}
                        <div className={cn("space-y-3", !isLocked && "hidden print:block")}>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-2">
                                <div className="flex items-baseline gap-2 md:col-span-2">
                                    <span className="text-[11px] font-bold uppercase shrink-0">Horário de Funcionamento:</span>
                                    <span className="text-[11px] font-bold border-b border-dotted border-zinc-300 grow pb-px">
                                        {atendimento.tipo_horario === '24hrs' ? 'Atendimento 24 horas' : `${atendimento.horario_inicio || '-'} às ${atendimento.horario_fim || '-'}`}
                                    </span>
                                </div>
                                {!isOutros && (
                                    <>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-[11px] font-bold uppercase shrink-0">Total / Mês:</span>
                                            <span className="text-[11px] font-black border-b border-dotted border-zinc-300 grow pb-px text-center">{atendimento.total_atendidos}</span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-[11px] font-bold uppercase shrink-0">Subvencionados:</span>
                                            <span className="text-[11px] font-black border-b border-dotted border-zinc-300 grow pb-px text-center">{Number(atendimento.subvencionados) === -1 ? "Conforme Demanda" : atendimento.subvencionados}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {!isOutros && (
                                <Table className="border border-zinc-200">
                                    <TableHeader className="bg-zinc-50">
                                        <TableRow className="hover:bg-transparent h-7">
                                            <TableHead colSpan={3} className="text-[9px] font-black uppercase text-center h-7 text-zinc-900 border-b">
                                                Usuários presentes no momento da visita (Conferência)
                                            </TableHead>
                                        </TableRow>
                                        <TableRow className="hover:bg-transparent h-7">
                                            <TableHead className="text-[9px] font-bold uppercase text-center h-7 border-r w-1/3">Manhã</TableHead>
                                            <TableHead className="text-[9px] font-bold uppercase text-center h-7 border-r w-1/3">Tarde</TableHead>
                                            <TableHead className="text-[9px] font-bold uppercase text-center h-7 w-1/3 text-blue-900">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow className="hover:bg-transparent h-8">
                                            <TableCell className="text-center font-black h-8 py-0 border-r">{atendimento.presentes.manha}</TableCell>
                                            <TableCell className="text-center font-black h-8 py-0 border-r">{atendimento.presentes.tarde}</TableCell>
                                            <TableCell className="text-center font-black h-8 py-0 text-blue-900 text-base">{Number(atendimento.presentes.manha || 0) + Number(atendimento.presentes.tarde || 0)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            )}

                            {!isOutros && (
                                <div className="flex items-center gap-4 py-1 border-b border-zinc-100">
                                    <span className="text-[11px] font-bold uppercase shrink-0">Há lista de espera?</span>
                                    <div className="flex gap-8 grow">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-3 h-3 rounded-full border border-black print-checkbox", atendimento.lista_espera === 'sim' && "bg-black print-checkbox-checked")}>
                                                {atendimento.lista_espera === 'sim' && <Check className="h-2 w-2 text-white print:text-black" />}
                                            </div>
                                            <span className="text-[10px] font-bold">Sim {atendimento.lista_espera === 'sim' && <span className="underline ml-1">({atendimento.lista_espera_qtd} pessoas)</span>}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-3 h-3 rounded-full border border-black print-checkbox", atendimento.lista_espera === 'nao' && "bg-black print-checkbox-checked")}>
                                                {atendimento.lista_espera === 'nao' && <Check className="h-2 w-2 text-white print:text-black" />}
                                            </div>
                                            <span className="text-[10px] font-bold">Não</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isEmendas ? (
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-blue-900/60">Aplicação do recurso, conforme objeto estabelecido e prestação de contas: (Contribuições)</p>
                                        <div className="text-[11px] font-medium leading-[1.3] text-zinc-800 border-l border-blue-200 pl-3 italic">
                                            {atendimento.aplicacao_recurso || "Não detalhado"}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-blue-900/60">Resultados da aplicação dos recursos no atendimento: (Contribuições)</p>
                                        <div className="text-[11px] font-medium leading-[1.3] text-zinc-800 border-l border-blue-200 pl-3 italic">
                                            {atendimento.resultados_aplicacao || "Não detalhado"}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-blue-900/60">Itens identificados no momento da visita técnica na OSC, conforme objeto estabelecido e prestação de contas. (anexar foto) (Auxílios)</p>
                                        <div className="text-[11px] font-medium leading-[1.3] text-zinc-800 border-l border-blue-200 pl-3 italic">
                                            {atendimento.itens_identificados || "Não detalhado"}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-blue-900/60">Itens não identificados na OSC no momento da visita técnica (se houver): (Auxílios)</p>
                                        <div className="text-[11px] font-medium leading-[1.3] text-zinc-800 border-l border-blue-200 pl-3 italic">
                                            {atendimento.itens_nao_identificados || "Não detalhado"}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-zinc-900">{isOutros ? 'Discriminação do Serviço:' : 'Tipos de atividades desenvolvidas (descritivo):'}</p>
                                        <div className="text-[11px] font-medium leading-[1.3] text-zinc-800 border-l border-zinc-300 pl-3 italic">
                                            {atendimento.atividades || "Não detalhado"}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-zinc-900">{isOutros ? 'Observações:' : 'Atividades em execução no momento da visita:'}</p>
                                        <div className="text-[11px] font-medium leading-[1.3] text-zinc-800 border-l border-zinc-300 pl-3 italic">
                                            {atendimento.atividades_momento || "Não detalhado"}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* EDIT VIEW */}
                        {!isLocked && (
                            <div className="space-y-6 print:hidden">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                                    <div className="md:col-span-1 space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-tight text-zinc-400">Tipo de Horário</Label>
                                        <RadioGroup
                                            value={atendimento.tipo_horario}
                                            onValueChange={val => setAtendimento({ ...atendimento, tipo_horario: val })}
                                            className="flex gap-4 h-10 items-center"
                                        >
                                            <div className="flex items-center space-x-1.5">
                                                <RadioGroupItem value="periodo" label="Período" id="h-periodo" />
                                            </div>
                                            <div className="flex items-center space-x-1.5">
                                                <RadioGroupItem value="24hrs" label="24hrs" id="h-24hrs" />
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    {atendimento.tipo_horario === 'periodo' ? (
                                        <>
                                            <div className="md:col-span-1 space-y-1.5">
                                                <Label className="text-[10px] font-black uppercase tracking-tight text-zinc-400">Horário Início</Label>
                                                <Input
                                                    type="time"
                                                    value={atendimento.horario_inicio}
                                                    onChange={e => setAtendimento({ ...atendimento, horario_inicio: e.target.value })}
                                                    className="h-12 bg-zinc-50/50 rounded-lg text-sm"
                                                />
                                            </div>
                                            <div className="md:col-span-1 space-y-1.5">
                                                <Label className="text-[10px] font-black uppercase tracking-tight text-zinc-400">Horário Fim</Label>
                                                <Input
                                                    type="time"
                                                    value={atendimento.horario_fim}
                                                    onChange={e => setAtendimento({ ...atendimento, horario_fim: e.target.value })}
                                                    className="h-12 bg-zinc-50/50 rounded-lg text-sm"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="md:col-span-2 bg-zinc-50 dark:bg-zinc-900/50 h-10 flex items-center px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                                            <span className="text-[11px] font-bold text-zinc-500 uppercase">Atendimento 24 horas</span>
                                        </div>
                                    )}

                                    {!isOutros && (
                                        <>
                                            <div className="md:col-span-1 space-y-1.5">
                                                <Label className="text-[10px] font-black uppercase tracking-tight text-zinc-400">Total / Mês</Label>
                                                <Input
                                                    type="number"
                                                    value={atendimento.total_atendidos}
                                                    onChange={e => setAtendimento({ ...atendimento, total_atendidos: Number(e.target.value) })}
                                                    className="h-12 text-center font-bold"
                                                />
                                            </div>

                                            <div className="md:col-span-1 space-y-1.5">
                                                <Label className="text-[10px] font-black uppercase tracking-tight text-zinc-400">Subvencionados</Label>
                                                <Input
                                                    type="text"
                                                    value={Number(atendimento.subvencionados) === -1 ? "Conforme Demanda" : atendimento.subvencionados}
                                                    readOnly
                                                    className="h-12 text-center font-bold bg-zinc-100 text-zinc-500 cursor-not-allowed"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                {!isOutros && (
                                    <>
                                        <div className="p-6 border border-blue-100 dark:border-blue-900/20 rounded-2xl space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.1em] text-blue-900/60 pb-2 border-b border-blue-50 block">
                                                Usuários presentes no momento da visita
                                            </Label>
                                            <div className="grid grid-cols-3 gap-6">
                                                <div className="text-center space-y-1">
                                                    <Label className="text-[9px] font-bold text-zinc-400 capitalize">Manhã</Label>
                                                    <Input
                                                        type="number"
                                                        value={atendimento.presentes.manha}
                                                        onChange={e => setAtendimento({ ...atendimento, presentes: { ...atendimento.presentes, manha: Number(e.target.value) } })}
                                                        className="h-10 text-center font-bold"
                                                    />
                                                </div>
                                                <div className="text-center space-y-1">
                                                    <Label className="text-[9px] font-bold text-zinc-400 capitalize">Tarde</Label>
                                                    <Input
                                                        type="number"
                                                        value={atendimento.presentes.tarde}
                                                        onChange={e => setAtendimento({ ...atendimento, presentes: { ...atendimento.presentes, tarde: Number(e.target.value) } })}
                                                        className="h-10 text-center font-bold"
                                                    />
                                                </div>
                                                <div className="text-center space-y-1 bg-zinc-900/5 rounded-lg p-1">
                                                    <Label className="text-[9px] font-bold text-zinc-600 capitalize">Total</Label>
                                                    <div className="text-lg font-black text-zinc-900">{totalPresentes}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-10">
                                            <div className="flex items-center gap-4">
                                                <Label className="text-[10px] font-black uppercase text-zinc-400">Lista de Espera:</Label>
                                                <div className="flex items-center gap-6">
                                                    <RadioGroup
                                                        value={atendimento.lista_espera}
                                                        onValueChange={val => setAtendimento({ ...atendimento, lista_espera: val })}
                                                        className="flex gap-4"
                                                    >
                                                        <div className="flex items-center space-x-1.5">
                                                            <RadioGroupItem value="sim" label="Sim" id="espera-sim" />
                                                        </div>
                                                        <div className="flex items-center space-x-1.5">
                                                            <RadioGroupItem value="nao" label="Não" id="espera-nao" />
                                                        </div>
                                                    </RadioGroup>
                                                    {atendimento.lista_espera === 'sim' && (
                                                        <Input
                                                            type="number"
                                                            placeholder="Qtd"
                                                            value={atendimento.lista_espera_qtd}
                                                            onChange={e => setAtendimento({ ...atendimento, lista_espera_qtd: Number(e.target.value) })}
                                                            className="h-8 w-20 text-xs"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {isEmendas && (
                                    <div className="space-y-8 pt-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="space-y-3">
                                            <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-900/60">Aplicação do recurso, conforme objeto estabelecido e prestação de contas: (Contribuições)</Label>
                                            <Textarea autoResize
                                                value={atendimento.aplicacao_recurso}
                                                onChange={e => setAtendimento({ ...atendimento, aplicacao_recurso: e.target.value })}
                                                disabled={isLocked}
                                                placeholder="Descreva a aplicação do recurso..."
                                                className="min-h-[100px] bg-white border-blue-100 rounded-2xl p-5 focus:ring-4 focus:ring-blue-900/10 font-medium"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-900/60">Resultados da aplicação dos recursos no atendimento: (Contribuições)</Label>
                                            <Textarea autoResize
                                                value={atendimento.resultados_aplicacao}
                                                onChange={e => setAtendimento({ ...atendimento, resultados_aplicacao: e.target.value })}
                                                disabled={isLocked}
                                                placeholder="Descreva os resultados..."
                                                className="min-h-[100px] bg-white border-blue-100 rounded-2xl p-5 focus:ring-4 focus:ring-blue-900/10 font-medium"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-900/60 flex items-center gap-2">
                                                Itens identificados no momento da visita técnica na OSC, conforme objeto estabelecido e prestação de contas. (anexar foto) (Auxílios)
                                                <Camera className="h-3 w-3 text-zinc-400" />
                                            </Label>
                                            <Textarea autoResize
                                                value={atendimento.itens_identificados}
                                                onChange={e => setAtendimento({ ...atendimento, itens_identificados: e.target.value })}
                                                disabled={isLocked}
                                                placeholder="Liste os itens identificados..."
                                                className="min-h-[100px] bg-white border-blue-100 rounded-2xl p-5 focus:ring-4 focus:ring-blue-900/10 font-medium"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-900/60">Itens não identificados na OSC no momento da visita técnica (se houver): (Auxílios)</Label>
                                            <Textarea autoResize
                                                value={atendimento.itens_nao_identificados}
                                                onChange={e => setAtendimento({ ...atendimento, itens_nao_identificados: e.target.value })}
                                                disabled={isLocked}
                                                placeholder="Liste os itens não identificados, se houver..."
                                                className="min-h-[100px] bg-white border-blue-100 rounded-2xl p-5 focus:ring-4 focus:ring-blue-900/10 font-medium"
                                            />
                                        </div>
                                    </div>
                                )}

                                {!isEmendas && (
                                    <div className="space-y-8 pt-4">
                                        <div className="space-y-3">
                                            <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">{isOutros ? 'Discriminação do Serviço' : 'Tipos de atividades desenvolvidas (descritivo)'}</Label>
                                            <Textarea autoResize
                                                value={atendimento.atividades}
                                                onChange={e => setAtendimento({ ...atendimento, atividades: e.target.value })}
                                                disabled={isLocked}
                                                className="min-h-[120px] bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 focus:ring-4 focus:ring-blue-900/10 font-medium leading-relaxed"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">{isOutros ? 'Observações' : 'Atividades em execução no momento da visita'}</Label>
                                            <Textarea autoResize
                                                value={atendimento.atividades_momento}
                                                onChange={e => setAtendimento({ ...atendimento, atividades_momento: e.target.value })}
                                                disabled={isLocked}
                                                className="min-h-[120px] bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 focus:ring-4 focus:ring-blue-900/10 font-medium leading-relaxed"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {!isEmendas && !isOutros && (
                    <div className={cn(
                        "print-section locked-report",
                        !isLocked && "bg-white p-6 rounded-3xl shadow-xl shadow-blue-900/5 space-y-6 print:shadow-none print:p-0"
                    )}>
                        <h2 className={cn(
                            "text-lg font-black tracking-tight mb-4",
                            !isLocked ? "text-blue-900 border-none pb-0 print:text-black print:border-b-2 print:border-black print:pb-0" : "text-black border-b-2 border-black"
                        )}>FORMA DE ACESSO DO USUÁRIO</h2>

                        <div className={cn(isLocked ? "space-y-1.5 px-2" : "space-y-6")}>
                            {/* REPORT/PRINT VIEW */}
                            <div className={cn("flex flex-col gap-2", !isLocked && "hidden print:flex")}>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-3 h-3 rounded border border-black print-checkbox", formaAcesso.demanda_espontanea && "bg-black print-checkbox-checked")}>
                                            {formaAcesso.demanda_espontanea && <Check className="h-2 w-2 text-white print:text-black" />}
                                        </div>
                                        <span className="text-[10px] font-bold">Demanda Espontânea</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-3 h-3 rounded border border-black print-checkbox", formaAcesso.busca_ativa && "bg-black print-checkbox-checked")}>
                                            {formaAcesso.busca_ativa && <Check className="h-2 w-2 text-white print:text-black" />}
                                        </div>
                                        <span className="text-[10px] font-bold">Busca Ativa</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-3 h-3 rounded border border-black print-checkbox", formaAcesso.encaminhamento && "bg-black print-checkbox-checked")}>
                                            {formaAcesso.encaminhamento && <Check className="h-2 w-2 text-white print:text-black" />}
                                        </div>
                                        <span className="text-[10px] font-bold">Encaminhamento</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-3 h-3 rounded border border-black print-checkbox", formaAcesso.outros && "bg-black print-checkbox-checked")}>
                                            {formaAcesso.outros && <Check className="h-2 w-2 text-white print:text-black" />}
                                        </div>
                                        <span className="text-[10px] font-bold">Outros</span>
                                    </div>
                                </div>
                                {formaAcesso.encaminhamento && (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-[10px] font-black uppercase shrink-0">Quem encaminha?</span>
                                        <span className="text-[11px] font-medium border-b border-dotted border-zinc-300 grow pb-px italic">{formaAcesso.quem_encaminha || "-"}</span>
                                    </div>
                                )}
                            </div>

                            {/* EDIT VIEW */}
                            {!isLocked && (
                                <div className="space-y-6 print:hidden">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="demanda_espontanea"
                                                checked={formaAcesso.demanda_espontanea}
                                                onCheckedChange={(checked) => setFormaAcesso({ ...formaAcesso, demanda_espontanea: !!checked })}
                                                className="h-5 w-5"
                                            />
                                            <Label htmlFor="demanda_espontanea" className="text-[11px] font-bold text-zinc-700 cursor-pointer">Demanda Espontânea</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="busca_ativa"
                                                checked={formaAcesso.busca_ativa}
                                                onCheckedChange={(checked) => setFormaAcesso({ ...formaAcesso, busca_ativa: !!checked })}
                                                className="h-5 w-5"
                                            />
                                            <Label htmlFor="busca_ativa" className="text-[11px] font-bold text-zinc-700 cursor-pointer">Busca Ativa</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="encaminhamento"
                                                checked={formaAcesso.encaminhamento}
                                                onCheckedChange={(checked) => setFormaAcesso({ ...formaAcesso, encaminhamento: !!checked })}
                                                className="h-5 w-5"
                                            />
                                            <Label htmlFor="encaminhamento" className="text-[11px] font-bold text-zinc-700 cursor-pointer">Encaminhamento pela rede</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="outros"
                                                checked={formaAcesso.outros}
                                                onCheckedChange={(checked) => setFormaAcesso({ ...formaAcesso, outros: !!checked })}
                                                className="h-5 w-5"
                                            />
                                            <Label htmlFor="outros" className="text-[11px] font-bold text-zinc-700 cursor-pointer">Outros</Label>
                                        </div>
                                    </div>
                                    {formaAcesso.encaminhamento && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                            <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Quem encaminha?</Label>
                                            <Input
                                                placeholder="Especifique o órgão ou entidade"
                                                value={formaAcesso.quem_encaminha}
                                                onChange={e => setFormaAcesso({ ...formaAcesso, quem_encaminha: e.target.value })}
                                                className="h-12 bg-zinc-50/50 dark:bg-zinc-950/50 border-blue-100 dark:border-blue-900/30 rounded-xl focus:ring-4 focus:ring-blue-900/10 font-medium"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!isEmendas && !isOutros && (
                    <div className={cn(
                        "print-section locked-report",
                        !isLocked && "bg-white p-6 rounded-3xl shadow-xl shadow-blue-900/5 space-y-6 print:shadow-none print:p-0"
                    )}>
                        <div className={cn(
                            "flex items-center justify-between mb-4",
                            !isLocked ? "border-b border-zinc-200 pb-2 print:border-b-2 print:border-black" : "border-b-2 border-black"
                        )}>
                            <h2 className={cn(
                                "text-lg font-black tracking-tight",
                                !isLocked ? "text-blue-900 print:text-black" : "text-black"
                            )}>RECURSOS HUMANOS</h2>
                            {!isLocked && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addRhRow}
                                    className="h-8 rounded-lg border-blue-200 text-blue-900 font-bold text-[9px] uppercase tracking-widest gap-2 print:hidden"
                                >
                                    <Plus className="h-3 w-3" />
                                    Adicionar Cargo
                                </Button>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <Table className={cn(isLocked && "border border-zinc-200")}>
                                <TableHeader className={cn(isLocked ? "bg-zinc-50" : "bg-zinc-50/50")}>
                                    <TableRow className="hover:bg-transparent h-8">
                                        <TableHead className="px-4 text-[10px] font-black uppercase text-zinc-900 h-8">Cargo / Função</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase text-zinc-900 h-8 text-center w-[80px]">Voluntário</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase text-zinc-900 h-8 text-center w-[80px]">Subvenção</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase text-zinc-900 h-8 text-center w-[80px]">Quantidade</TableHead>
                                        <TableHead className="px-4 text-[10px] font-black uppercase text-zinc-900 h-8">Outros / Observações</TableHead>
                                        {!isLocked && <TableHead className="w-[40px]"></TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rhData.map((row: any, index: number) => (
                                        <TableRow key={index} className={cn("hover:bg-zinc-50/20 transition-colors h-8", isLocked && "border-zinc-100")}>
                                            <TableCell className="px-4 py-1 font-bold text-zinc-700 h-8">
                                                {index < 9 ? (
                                                    <span className="text-[11px]">{row.cargo}</span>
                                                ) : (
                                                    <>
                                                        <span className={cn("text-[11px] text-zinc-900", !isLocked && "hidden print:inline")}>{row.cargo}</span>
                                                        {!isLocked && <Input
                                                            placeholder="Cargo"
                                                            value={row.cargo}
                                                            onChange={e => {
                                                                const newData = [...rhData]
                                                                newData[index].cargo = e.target.value
                                                                setRhData(newData)
                                                            }}
                                                            className="h-9 text-[11px] print:hidden"
                                                        />}
                                                    </>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-1 text-center h-8">
                                                <div
                                                    onClick={() => {
                                                        if (!isLocked) {
                                                            const newData = [...rhData]
                                                            newData[index].voluntario = !newData[index].voluntario
                                                            setRhData(newData)
                                                        }
                                                    }}
                                                    className={cn(
                                                        "w-6 h-6 rounded border border-black flex items-center justify-center print-checkbox transition-colors cursor-pointer",
                                                        !isLocked && "hover:border-blue-900",
                                                        row.voluntario && "bg-black print-checkbox-checked"
                                                    )}
                                                >
                                                    {row.voluntario && <Check className="h-2.5 w-2.5 text-white print:text-black" />}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-1 text-center h-8">
                                                <div
                                                    onClick={() => {
                                                        if (!isLocked) {
                                                            const newData = [...rhData]
                                                            newData[index].subvencao = !newData[index].subvencao
                                                            setRhData(newData)
                                                        }
                                                    }}
                                                    className={cn(
                                                        "w-6 h-6 rounded border border-black flex items-center justify-center print-checkbox transition-colors cursor-pointer mx-auto",
                                                        !isLocked && "hover:border-blue-900",
                                                        row.subvencao && "bg-black print-checkbox-checked"
                                                    )}
                                                >
                                                    {row.subvencao && <Check className="h-2.5 w-2.5 text-white print:text-black" />}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-1 px-4 h-8 text-center">
                                                <span className={cn("text-[11px] font-bold text-zinc-900", !isLocked && "hidden print:inline")}>{row.quantidade || "-"}</span>
                                                {!isLocked && (
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        value={row.quantidade}
                                                        onChange={e => {
                                                            const newData = [...rhData]
                                                            newData[index].quantidade = e.target.value
                                                            setRhData(newData)
                                                        }}
                                                        className="h-9 text-[11px] text-center print:hidden"
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell className="px-4 py-1 h-8">
                                                <span className={cn("text-[10px] text-zinc-600 italic leading-none", !isLocked && "hidden print:inline")}>{row.outros || "-"}</span>
                                                {!isLocked && (
                                                    <Input
                                                        placeholder="..."
                                                        value={row.outros}
                                                        onChange={e => {
                                                            const newData = [...rhData]
                                                            newData[index].outros = e.target.value
                                                            setRhData(newData)
                                                        }}
                                                        className="h-9 text-[11px] print:hidden"
                                                    />
                                                )}
                                            </TableCell>
                                            {!isLocked && (
                                                <TableCell className="px-2 text-right h-8">
                                                    {index >= 9 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeRhRow(index)}
                                                            className="h-6 w-6 text-zinc-300 hover:text-red-500"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {/* VI & VII. OBSERVAÇÕES E RECOMENDAÇÕES */}
                {!isOutros && (
                    <div className={cn(
                        "print-section locked-report",
                        !isLocked && "grid grid-cols-1 md:grid-cols-2 gap-4"
                    )}>
                        {/* REPORT/PRINT VIEW */}
                        <div className={cn("space-y-4", !isLocked && "hidden print:block")}>
                            <div className="space-y-1">
                                <h2 className="text-lg font-black tracking-tight text-black border-b-2 border-black mb-2 uppercase">OBSERVAÇÕES</h2>
                                <div className="text-[11px] font-medium leading-[1.4] text-zinc-800 bg-zinc-50/50 p-3 italic border-l-2 border-zinc-200">
                                    {observacoes || "Nenhuma observação registrada."}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-lg font-black tracking-tight text-black border-b-2 border-black mb-2 uppercase">RECOMENDAÇÕES</h2>
                                <div className="text-[11px] font-medium leading-[1.4] text-zinc-800 bg-zinc-50/50 p-3 italic border-l-2 border-zinc-200">
                                    {recomendacoes || "Nenhuma recomendação registrada."}
                                </div>
                            </div>
                        </div>

                        {/* EDIT VIEW */}
                        {!isLocked && (
                            <>
                                <Card className="overflow-hidden border-none shadow-2xl bg-white rounded-2xl print:hidden">
                                    <CardHeader className="p-4 pb-1">
                                        <Label className="text-[10px] font-black uppercase text-blue-900/60 tracking-widest">OBSERVAÇÕES</Label>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <Textarea autoResize
                                            value={observacoes}
                                            onChange={e => setObservacoes(e.target.value)}
                                            className="min-h-[100px] text-xs"
                                        />
                                    </CardContent>
                                </Card>
                                <Card className="overflow-hidden border-none shadow-2xl bg-white rounded-2xl print:hidden">
                                    <CardHeader className="p-4 pb-1">
                                        <Label className="text-[10px] font-black uppercase text-blue-900/60 tracking-widest">RECOMENDAÇÕES</Label>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <Textarea autoResize
                                            value={recomendacoes}
                                            onChange={e => setRecomendacoes(e.target.value)}
                                            className="min-h-[100px] text-xs"
                                        />
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>
                )}
            </div> {/* This closes the main content wrapper for sections I-VII */}

            {/* PDF DOCUMENTS (Only for Emendas e Fundos) */}
            {
                isEmendas && (
                    <div className={cn(
                        "print-section locked-report",
                        !isLocked && "bg-white p-6 rounded-3xl shadow-xl shadow-blue-900/5 space-y-6 print:shadow-none print:p-0"
                    )}>
                        <h2 className={cn(
                            "text-lg font-black tracking-tight mb-4",
                            !isLocked ? "text-blue-900 border-none pb-0 print:text-black print:border-b-2 print:border-black print:pb-0" : "text-black border-b-2 border-black"
                        )}>BALANÇO FINANCEIRO</h2>

                        {(documents.length === 0) && isLocked ? (
                            <div className="text-[11px] font-medium leading-[1.4] text-zinc-800 bg-zinc-50/50 p-3 italic border-l-2 border-zinc-200">
                                Nenhum documento anexado.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {documents?.map((doc: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 group hover:border-blue-900/20 transition-all">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="text-xs font-bold text-zinc-900 truncate">{doc.name}</span>
                                                    <a
                                                        href={doc.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] font-bold text-blue-600 hover:text-blue-900 uppercase tracking-tight"
                                                    >
                                                        Visualizar Documento
                                                    </a>
                                                </div>
                                            </div>
                                            {!isLocked && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeDocument(index)}
                                                    className="h-8 w-8 text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {!isLocked && (
                                    <label className="flex items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-zinc-200 hover:border-blue-900/30 hover:bg-blue-50/50 cursor-pointer transition-all group">
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            className="hidden"
                                            onChange={handleDocumentUpload}
                                            disabled={loading}
                                        />
                                        <div className={cn(
                                            "p-4 rounded-full bg-zinc-50 group-hover:bg-blue-100 transition-colors",
                                            loading && "animate-pulse"
                                        )}>
                                            {loading ? (
                                                <Loader2 className="h-6 w-6 text-zinc-400 animate-spin" />
                                            ) : (
                                                <Plus className="h-6 w-6 text-zinc-400 group-hover:text-blue-600" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-zinc-900 group-hover:text-blue-900">
                                                {loading ? "Enviando Balanço..." : "Fazer Upload de Balanço Financeiro"}
                                            </span>
                                            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Apenas arquivos .pdf</span>
                                        </div>
                                    </label>
                                )}
                            </div>
                        )}
                    </div>
                )
            }

            {/* FOTOS / EVIDÊNCIAS */}
            <div className={cn(
                "print-section locked-report",
                !isLocked && "bg-white p-6 rounded-3xl shadow-xl shadow-blue-900/5 space-y-6 print:shadow-none print:p-0"
            )}>
                <h2 className={cn(
                    "text-lg font-black tracking-tight mb-4",
                    !isLocked ? "text-blue-900 border-none pb-0 print:text-black print:border-b-2 print:border-black print:pb-0" : "text-black border-b-2 border-black"
                )}>FOTOS / EVIDÊNCIAS</h2>

                {(!formData.photos || formData.photos.length === 0) && isLocked ? (
                    <div className="text-[11px] font-medium leading-[1.4] text-zinc-800 bg-zinc-50/50 p-3 italic border-l-2 border-zinc-200">
                        Nenhuma foto anexada.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {formData.photos?.map((photo: string, index: number) => (
                            <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50">
                                <img
                                    src={photo}
                                    alt={`Evidência ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                {!isLocked && (
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(index)}
                                        className="absolute top-2 right-2 bg-red-500/90 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 print:hidden"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        ))}

                        {!isLocked && (
                            <label className="flex flex-col items-center justify-center gap-2 aspect-square rounded-xl border-2 border-dashed border-zinc-300 hover:border-blue-900/50 hover:bg-blue-50/50 cursor-pointer transition-all group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={handlePhotoUpload}
                                    disabled={loading}
                                />
                                <div className={cn(
                                    "p-3 rounded-full bg-zinc-100 group-hover:bg-blue-100 transition-colors",
                                    loading && "animate-pulse"
                                )}>
                                    {loading ? (
                                        <Loader2 className="h-6 w-6 text-zinc-400 animate-spin" />
                                    ) : (
                                        <Camera className="h-6 w-6 text-zinc-400 group-hover:text-blue-600" />
                                    )}
                                </div>
                                <span className="text-[10px] font-bold uppercase text-zinc-400 group-hover:text-blue-900">
                                    {loading ? "Enviando..." : "Adicionar Foto"}
                                </span>
                            </label>
                        )}
                    </div>
                )}
            </div>


            {/* VIII. ASSINATURAS */}
            <div className={cn(
                "print-section locked-report signatures-wrapper",
                !isLocked && "bg-white p-6 rounded-3xl shadow-xl shadow-blue-900/5 space-y-6"
            )}>
                <h2 className={cn(
                    "text-lg font-black tracking-tight mb-4",
                    !isLocked ? "text-blue-900 border-none pb-0" : "text-black border-b-2 border-black"
                )}>ASSINATURAS</h2>

                <div className={cn(
                    "grid grid-cols-1 md:grid-cols-3 gap-8",
                    isLocked && "pt-4"
                )}>
                    <div className="space-y-2">
                        <SignaturePad
                            label=""
                            defaultValue={assinaturas.tecnico1}
                            onSave={data => setAssinaturas({ ...assinaturas, tecnico1: data })}
                            readOnly={isLocked}
                        />
                        {!isLocked && (
                            <Input
                                placeholder="Nome do Técnico 1"
                                value={assinaturas.tecnico1_nome}
                                onChange={e => setAssinaturas({ ...assinaturas, tecnico1_nome: e.target.value })}
                                className="h-8 text-xs text-center border-none bg-zinc-50 print:hidden"
                            />
                        )}
                        <div className="text-center">
                            <p className="text-[11px] font-bold border-t border-zinc-300 pt-1">{assinaturas.tecnico1_nome || "Nome do Técnico 1"}</p>
                            <p className="text-[9px] font-black uppercase text-zinc-400">Técnico SMDS</p>
                        </div>
                    </div>

                    {!isOutros && (
                        <div className="space-y-2">
                            <SignaturePad
                                label=""
                                defaultValue={assinaturas.tecnico2}
                                onSave={data => setAssinaturas({ ...assinaturas, tecnico2: data })}
                                readOnly={isLocked}
                            />
                            {!isLocked && (
                                <Input
                                    placeholder="Nome do Técnico 2"
                                    value={assinaturas.tecnico2_nome}
                                    onChange={e => setAssinaturas({ ...assinaturas, tecnico2_nome: e.target.value })}
                                    className="h-8 text-xs text-center border-none bg-zinc-50 print:hidden"
                                />
                            )}
                            <div className="text-center">
                                <p className="text-[11px] font-bold border-t border-zinc-300 pt-1">{assinaturas.tecnico2_nome || "Nome do Técnico 2"}</p>
                                <p className="text-[9px] font-black uppercase text-zinc-400">Técnico SMDS</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <SignaturePad
                            label=""
                            defaultValue={assinaturas.responsavel}
                            onSave={data => setAssinaturas({ ...assinaturas, responsavel: data })}
                            readOnly={isLocked}
                        />
                        {!isLocked && (
                            <Input
                                placeholder="Nome do Responsável"
                                value={assinaturas.responsavel_nome}
                                onChange={e => setAssinaturas({ ...assinaturas, responsavel_nome: e.target.value })}
                                className="h-8 text-xs text-center border-none bg-zinc-50 print:hidden"
                            />
                        )}
                        <div className="text-center">
                            <p className="text-[11px] font-bold border-t border-zinc-300 pt-1">{assinaturas.responsavel_nome || "Nome do Responsável"}</p>
                            <p className="text-[9px] font-black uppercase text-zinc-400">Responsável pela OSC</p>
                        </div>
                    </div>
                </div>
            </div>

            {
                !isLocked && (
                    <div className="flex justify-end gap-4 pt-10 border-t border-zinc-100">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.back()}
                            className="h-12 px-6 rounded-xl font-bold uppercase text-[10px] text-zinc-400 hover:text-zinc-900"
                        >
                            Sair sem salvar
                        </Button>
                        <Button
                            type="button"
                            onClick={() => handleSave(false)}
                            disabled={isSaving}
                            className="h-12 px-8 rounded-xl border-2 border-blue-900 bg-transparent text-blue-900 hover:bg-blue-50 font-bold uppercase text-[10px]"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Rascunho"}
                        </Button>
                        <Button
                            onClick={() => {
                                if (window.confirm("Deseja finalizar a visita? Após a finalização, o relatório não poderá ser editado.")) {
                                    handleSave(true)
                                }
                            }}
                            disabled={isSaving}
                            className="h-12 px-10 rounded-xl bg-blue-900 text-white hover:bg-black font-bold uppercase text-[10px] shadow-lg shadow-blue-900/20"
                        >
                            Finalizar e Bloquear
                        </Button>
                    </div>
                )
            }

            {/* Print Only Footer */}
            <div className="hidden print:block print-footer">
                Documento gerado eletronicamente pelo Sistema Vigilância Socioassistencial 2026
                {mounted && (
                    <> em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</>
                )}
            </div>
        </div >
    )
}
