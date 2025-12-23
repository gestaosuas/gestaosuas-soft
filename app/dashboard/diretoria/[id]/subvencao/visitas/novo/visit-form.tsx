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
    Loader2
} from "lucide-react"
import { saveVisit, finalizeVisit } from "@/app/dashboard/actions"

export function VisitForm({
    directorateId,
    oscs,
    initialVisit
}: {
    directorateId: string,
    oscs: any[],
    initialVisit?: any
}) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Form State
    const [formData, setFormData] = useState(initialVisit?.identificacao || {
        osc_id: initialVisit?.osc_id || "",
        email: initialVisit?.identificacao?.email || "",
        visit_date: initialVisit?.visit_date || new Date().toISOString().split('T')[0],
    })

    const [atendimento, setAtendimento] = useState(initialVisit?.atendimento || {
        horario: "",
        turnos: { manha: false, tarde: false },
        total_atendidos: 0,
        subvencionados: 0,
        presentes: { manha: 0, tarde: 0 },
        lista_espera: "nao",
        lista_espera_qtd: 0,
        atividades: "",
        atividades_momento: ""
    })

    const [formaAcesso, setFormaAcesso] = useState(initialVisit?.forma_acesso || {
        demanda_espontanea: false,
        busca_ativa: false,
        encaminhamento: false,
        quem_encaminha: ""
    })

    const [rhData, setRhData] = useState(initialVisit?.rh_data || [
        { cargo: "Coordenador", voluntario: false, subvencao: false, outros: "" },
        { cargo: "Assistente Social", voluntario: false, subvencao: false, outros: "" },
        { cargo: "Psicólogo", voluntario: false, subvencao: false, outros: "" },
        { cargo: "Instrutor", voluntario: false, subvencao: false, outros: "" },
        { cargo: "Educador Físico", voluntario: false, subvencao: false, outros: "" },
        { cargo: "Auxiliar Administrativo", voluntario: false, subvencao: false, outros: "" },
        { cargo: "Monitor", voluntario: false, subvencao: false, outros: "" },
        { cargo: "Serviço Geral", voluntario: false, subvencao: false, outros: "" },
        { cargo: "Cozinheiro", voluntario: false, subvencao: false, outros: "" },
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

    // Selected OSC Data
    const selectedOSC = oscs.find(o => o.id === formData.osc_id)
    const isLocked = initialVisit?.status === 'finalized'

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
                visit_date: formData.visit_date,
                identificacao: formData,
                atendimento,
                forma_acesso: formaAcesso,
                rh_data: rhData,
                observacoes,
                recomendacoes,
                assinaturas
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

    const addRhRow = () => {
        setRhData([...rhData, { cargo: "", voluntario: false, subvencao: false, outros: "" }])
    }

    const removeRhRow = (index: number) => {
        setRhData(rhData.filter((_: any, i: number) => i !== index))
    }

    const totalPresentes = (Number(atendimento.presentes.manha) || 0) + (Number(atendimento.presentes.tarde) || 0)

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
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

            {/* I. IDENTIFICAÇÃO */}
            <Card className="border-none shadow-2xl shadow-blue-900/5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-10 pb-6 border-b border-zinc-100/50 dark:border-zinc-800/50">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-blue-900 text-white rounded-2xl shadow-xl shadow-blue-900/20">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black text-blue-900 dark:text-blue-50 tracking-tight lowercase first-letter:uppercase">I. IDENTIFICAÇÃO</CardTitle>
                            <CardDescription className="text-zinc-500 font-medium italic">Dados oficiais da Organização da Sociedade Civil</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">OSC (Seleção Obrigatória)</Label>
                            <Select
                                value={formData.osc_id}
                                onValueChange={val => setFormData({ ...formData, osc_id: val })}
                                disabled={isLocked}
                            >
                                <SelectTrigger className="h-14 bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-blue-900/10 transition-all text-[15px] font-semibold">
                                    <SelectValue placeholder="Escolha uma OSC cadastrada" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-2xl">
                                    {oscs.map(osc => (
                                        <SelectItem key={osc.id} value={osc.id} className="py-3 font-medium focus:bg-blue-50 focus:text-blue-900 cursor-pointer">
                                            {osc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {!formData.osc_id && (
                                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-[11px] font-bold mt-1">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    OSC não encontrada. Cadastre a OSC antes de criar a visita.
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Data da Visita</Label>
                            <Input
                                type="date"
                                value={formData.visit_date}
                                onChange={e => setFormData({ ...formData, visit_date: e.target.value })}
                                disabled={isLocked}
                                className="h-14 bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-blue-900/10 transition-all font-semibold"
                            />
                        </div>
                    </div>

                    {selectedOSC && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-blue-50/30 dark:bg-blue-900/5 rounded-3xl border border-blue-100/50 dark:border-blue-900/20 animate-in zoom-in-95 duration-500">
                            <div className="col-span-1 md:col-span-3 pb-2 border-b border-blue-100/50 dark:border-blue-900/20">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-900/40">Dados Carregados do Sistema</span>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tipo de Atividade</Label>
                                <p className="font-bold text-blue-950 dark:text-blue-100 text-[14px] leading-tight">{selectedOSC.activity_type}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Telefone</Label>
                                <p className="font-bold text-blue-950 dark:text-blue-100 text-[14px]">{selectedOSC.phone || "Não informado"}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Logradouro</Label>
                                <p className="font-bold text-blue-950 dark:text-blue-100 text-[14px]">{selectedOSC.address}, {selectedOSC.number}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Bairro / CEP</Label>
                                <p className="font-bold text-blue-950 dark:text-blue-100 text-[14px]">{selectedOSC.neighborhood} — {selectedOSC.cep}</p>
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-3 pt-2">
                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-900/60">E-mail da OSC (Editável)</Label>
                                <Input
                                    placeholder="Ex: contato@entidade.org.br"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    disabled={isLocked}
                                    className="h-12 bg-white dark:bg-zinc-950 border-blue-200 dark:border-blue-900/30 rounded-xl focus:ring-4 focus:ring-blue-900/10 font-medium"
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* II. ATENDIMENTO */}
            <Card className="border-none shadow-2xl shadow-blue-900/5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-10 pb-6 border-b border-zinc-100/50 dark:border-zinc-800/50">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-blue-900 text-white rounded-2xl shadow-xl shadow-blue-900/20">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black text-blue-900 dark:text-blue-50 tracking-tight lowercase first-letter:uppercase">II. ATENDIMENTO</CardTitle>
                            <CardDescription className="text-zinc-500 font-medium italic">Monitoramento quantitativo e operacional dos serviços</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Horário de Funcionamento</Label>
                                <Input
                                    placeholder="Ex: 08:00 às 18:00"
                                    value={atendimento.horario}
                                    onChange={e => setAtendimento({ ...atendimento, horario: e.target.value })}
                                    disabled={isLocked}
                                    className="h-12 bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-4 focus:ring-blue-900/10 font-medium"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Turnos de Atendimento</Label>
                                <div className="flex gap-8 p-4 bg-zinc-50/50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl">
                                    <Checkbox
                                        label="Manhã"
                                        checked={atendimento.turnos.manha}
                                        onCheckedChange={checked => setAtendimento({ ...atendimento, turnos: { ...atendimento.turnos, manha: !!checked } })}
                                        disabled={isLocked}
                                    />
                                    <Checkbox
                                        label="Tarde"
                                        checked={atendimento.turnos.tarde}
                                        onCheckedChange={checked => setAtendimento({ ...atendimento, turnos: { ...atendimento.turnos, tarde: !!checked } })}
                                        disabled={isLocked}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Total Atendidos / Mês</Label>
                                <Input
                                    type="number"
                                    value={atendimento.total_atendidos}
                                    onChange={e => setAtendimento({ ...atendimento, total_atendidos: Number(e.target.value) })}
                                    disabled={isLocked}
                                    className="h-12 bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-4 focus:ring-blue-900/10 font-bold"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Subvencionados SMDES</Label>
                                <Input
                                    type="number"
                                    value={atendimento.subvencionados}
                                    onChange={e => setAtendimento({ ...atendimento, subvencionados: Number(e.target.value) })}
                                    disabled={isLocked}
                                    className="h-12 bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-4 focus:ring-blue-900/10 font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 border-2 border-dashed border-blue-100 dark:border-blue-900/20 rounded-[2rem] space-y-6">
                        <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-900/60 flex items-center gap-2">
                            Usuários presentes no momento da visita
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center block">Período Manhã</Label>
                                <Input
                                    type="number"
                                    value={atendimento.presentes.manha}
                                    onChange={e => setAtendimento({ ...atendimento, presentes: { ...atendimento.presentes, manha: Number(e.target.value) } })}
                                    disabled={isLocked}
                                    className="h-14 text-center text-lg bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-blue-900/10 font-black text-blue-900"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center block">Período Tarde</Label>
                                <Input
                                    type="number"
                                    value={atendimento.presentes.tarde}
                                    onChange={e => setAtendimento({ ...atendimento, presentes: { ...atendimento.presentes, tarde: Number(e.target.value) } })}
                                    disabled={isLocked}
                                    className="h-14 text-center text-lg bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-blue-900/10 font-black text-blue-900"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center block">Total Calculado</Label>
                                <div className="h-14 flex items-center justify-center bg-blue-900 text-white rounded-2xl text-xl font-black shadow-xl shadow-blue-900/20">
                                    {totalPresentes}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Existe Lista de Espera?</Label>
                            <RadioGroup
                                value={atendimento.lista_espera}
                                onValueChange={val => setAtendimento({ ...atendimento, lista_espera: val })}
                                className="flex gap-8"
                                disabled={isLocked}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="sim" label="Sim" disabled={isLocked} />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="nao" label="Não" disabled={isLocked} />
                                </div>
                            </RadioGroup>
                            {atendimento.lista_espera === 'sim' && (
                                <div className="pt-2 animate-in slide-in-from-left-2">
                                    <Label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Quantidade em Espera</Label>
                                    <Input
                                        type="number"
                                        value={atendimento.lista_espera_qtd}
                                        onChange={e => setAtendimento({ ...atendimento, lista_espera_qtd: Number(e.target.value) })}
                                        disabled={isLocked}
                                        className="h-10 w-32 bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 rounded-xl"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8 pt-4">
                        <div className="space-y-3">
                            <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Tipos de atividades desenvolvidas (descritivo)</Label>
                            <Textarea
                                value={atendimento.atividades}
                                onChange={e => setAtendimento({ ...atendimento, atividades: e.target.value })}
                                disabled={isLocked}
                                className="min-h-[120px] bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 focus:ring-4 focus:ring-blue-900/10 font-medium leading-relaxed"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Atividades em execução no momento da visita</Label>
                            <Textarea
                                value={atendimento.atividades_momento}
                                onChange={e => setAtendimento({ ...atendimento, atividades_momento: e.target.value })}
                                disabled={isLocked}
                                className="min-h-[100px] bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 focus:ring-4 focus:ring-blue-900/10 font-medium leading-relaxed"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* III. FORMA DE ACESSO */}
            <Card className="border-none shadow-2xl shadow-blue-900/5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-10 pb-6 border-b border-zinc-100/50 dark:border-zinc-800/50">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-blue-900 text-white rounded-2xl shadow-xl shadow-blue-900/20">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black text-blue-900 dark:text-blue-50 tracking-tight lowercase first-letter:uppercase">III. FORMA DE ACESSO DO USUÁRIO</CardTitle>
                            <CardDescription className="text-zinc-500 font-medium italic">Como o usuário chega até o serviço ofertado</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-zinc-50/50 dark:bg-zinc-950/50 rounded-3xl border border-zinc-100 dark:border-zinc-800/50">
                        <Checkbox
                            label="Demanda Espontânea"
                            checked={formaAcesso.demanda_espontanea}
                            onCheckedChange={checked => setFormaAcesso({ ...formaAcesso, demanda_espontanea: !!checked })}
                            disabled={isLocked}
                        />
                        <Checkbox
                            label="Busca Ativa"
                            checked={formaAcesso.busca_ativa}
                            onCheckedChange={checked => setFormaAcesso({ ...formaAcesso, busca_ativa: !!checked })}
                            disabled={isLocked}
                        />
                        <Checkbox
                            label="Encaminhamento"
                            checked={formaAcesso.encaminhamento}
                            onCheckedChange={checked => setFormaAcesso({ ...formaAcesso, encaminhamento: !!checked })}
                            disabled={isLocked}
                        />
                    </div>

                    {formaAcesso.encaminhamento && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                            <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Quem encaminha?</Label>
                            <Input
                                placeholder="Especifique o órgão ou entidade"
                                value={formaAcesso.quem_encaminha}
                                onChange={e => setFormaAcesso({ ...formaAcesso, quem_encaminha: e.target.value })}
                                disabled={isLocked}
                                className="h-12 bg-zinc-50/50 dark:bg-zinc-950/50 border-blue-100 dark:border-blue-900/30 rounded-xl focus:ring-4 focus:ring-blue-900/10 font-medium"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* V. RECURSOS HUMANOS */}
            <Card className="border-none shadow-2xl shadow-blue-900/5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-10 pb-6 border-b border-zinc-100/50 dark:border-zinc-800/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-blue-900 text-white rounded-2xl shadow-xl shadow-blue-900/20">
                                <Users2 className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black text-blue-900 dark:text-blue-50 tracking-tight lowercase first-letter:uppercase">V. RECURSOS HUMANOS</CardTitle>
                                <CardDescription className="text-zinc-500 font-medium italic">Quadro funcional e equipe multidisciplinar</CardDescription>
                            </div>
                        </div>
                        {!isLocked && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addRhRow}
                                className="h-10 rounded-xl border-blue-200 text-blue-900 font-bold text-[10px] uppercase tracking-widest gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Adicionar Cargo
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-100 dark:border-zinc-800 hover:bg-transparent bg-zinc-50/50 dark:bg-zinc-950/50">
                                    <TableHead className="px-10 py-5 text-[11px] font-black uppercase tracking-widest text-zinc-400">Cargo / Função</TableHead>
                                    <TableHead className="py-5 text-[11px] font-black uppercase tracking-widest text-zinc-400 text-center">Voluntário</TableHead>
                                    <TableHead className="py-5 text-[11px] font-black uppercase tracking-widest text-zinc-400 text-center">Subvenção</TableHead>
                                    <TableHead className="py-5 text-[11px] font-black uppercase tracking-widest text-zinc-400">Outros / Observações</TableHead>
                                    {!isLocked && <TableHead className="px-10 py-5 text-right w-[50px]"></TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rhData.map((row: any, index: number) => (
                                    <TableRow key={index} className="border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/20 transition-colors">
                                        <TableCell className="px-10 font-bold text-zinc-700 dark:text-zinc-300">
                                            {index < 9 ? (
                                                <span className="text-[13px]">{row.cargo}</span>
                                            ) : (
                                                <Input
                                                    placeholder="Digite o cargo"
                                                    value={row.cargo}
                                                    onChange={e => {
                                                        const newData = [...rhData]
                                                        newData[index].cargo = e.target.value
                                                        setRhData(newData)
                                                    }}
                                                    disabled={isLocked}
                                                    className="h-9 bg-transparent border-zinc-200 dark:border-zinc-800 rounded-lg text-xs"
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center">
                                                <Checkbox
                                                    checked={row.voluntario}
                                                    onCheckedChange={val => {
                                                        const newData = [...rhData]
                                                        newData[index].voluntario = !!val
                                                        setRhData(newData)
                                                    }}
                                                    disabled={isLocked}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center">
                                                <Checkbox
                                                    checked={row.subvencao}
                                                    onCheckedChange={val => {
                                                        const newData = [...rhData]
                                                        newData[index].subvencao = !!val
                                                        setRhData(newData)
                                                    }}
                                                    disabled={isLocked}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                placeholder="..."
                                                value={row.outros}
                                                onChange={e => {
                                                    const newData = [...rhData]
                                                    newData[index].outros = e.target.value
                                                    setRhData(newData)
                                                }}
                                                disabled={isLocked}
                                                className="h-9 bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-lg text-xs"
                                            />
                                        </TableCell>
                                        {!isLocked && (
                                            <TableCell className="px-10 text-right">
                                                {index >= 9 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeRhRow(index)}
                                                        className="h-8 w-8 text-zinc-300 hover:text-red-500 rounded-lg"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* VI & VII. OBSERVAÇÕES E RECOMENDAÇÕES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-none shadow-2xl shadow-blue-900/5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-10 pb-4">
                        <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-900/60">VI. OBSERVAÇÕES</Label>
                    </CardHeader>
                    <CardContent className="p-10 pt-0">
                        <Textarea
                            value={observacoes}
                            onChange={e => setObservacoes(e.target.value)}
                            placeholder="Descreva as principais observações da visita..."
                            disabled={isLocked}
                            className="min-h-[200px] bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 rounded-2xl p-6 font-medium"
                        />
                    </CardContent>
                </Card>
                <Card className="border-none shadow-2xl shadow-blue-900/5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-10 pb-4">
                        <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-900/60">VII. RECOMENDAÇÕES</Label>
                    </CardHeader>
                    <CardContent className="p-10 pt-0">
                        <Textarea
                            value={recomendacoes}
                            onChange={e => setRecomendacoes(e.target.value)}
                            placeholder="Registre as recomendações técnicas..."
                            disabled={isLocked}
                            className="min-h-[200px] bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 rounded-2xl p-6 font-medium"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* VIII. ASSINATURAS */}
            <Card className="border-none shadow-2xl shadow-blue-900/5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-10 pb-6 border-b border-zinc-100/50 dark:border-zinc-800/50">
                    <CardTitle className="text-2xl font-black text-blue-900 dark:text-blue-50 tracking-tight lowercase first-letter:uppercase">VIII. ASSINATURAS DIGITAIS</CardTitle>
                    <CardDescription className="text-zinc-500 font-medium italic">Assinaturas manuscritas para validação institucional</CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <SignaturePad
                                label="Assinatura do Técnico SMDES 1"
                                defaultValue={assinaturas.tecnico1}
                                onSave={data => setAssinaturas({ ...assinaturas, tecnico1: data })}
                                readOnly={isLocked}
                            />
                            <div className="space-y-3">
                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Nome do Técnico SMDES 1</Label>
                                <Input
                                    value={assinaturas.tecnico1_nome}
                                    onChange={e => setAssinaturas({ ...assinaturas, tecnico1_nome: e.target.value })}
                                    disabled={isLocked}
                                    placeholder="Nome completo do técnico"
                                    className="h-12 bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 rounded-xl font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <SignaturePad
                                label="Assinatura do Técnico SMDES 2"
                                defaultValue={assinaturas.tecnico2}
                                onSave={data => setAssinaturas({ ...assinaturas, tecnico2: data })}
                                readOnly={isLocked}
                            />
                            <div className="space-y-3">
                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Nome do Técnico SMDES 2</Label>
                                <Input
                                    value={assinaturas.tecnico2_nome}
                                    onChange={e => setAssinaturas({ ...assinaturas, tecnico2_nome: e.target.value })}
                                    disabled={isLocked}
                                    placeholder="Nome completo do técnico"
                                    className="h-12 bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 rounded-xl font-bold"
                                />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Nome do Responsável pela Entidade</Label>
                                <Input
                                    value={assinaturas.responsavel_nome}
                                    onChange={e => setAssinaturas({ ...assinaturas, responsavel_nome: e.target.value })}
                                    disabled={isLocked}
                                    placeholder="Nome completo do representante"
                                    className="h-12 bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 rounded-xl font-bold"
                                />
                            </div>
                            <SignaturePad
                                label="Assinatura do Responsável"
                                defaultValue={assinaturas.responsavel}
                                onSave={data => setAssinaturas({ ...assinaturas, responsavel: data })}
                                readOnly={isLocked}
                            />
                        </div>
                    </div>
                </CardContent>
                {!isLocked && (
                    <CardFooter className="p-10 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-5">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.back()}
                            className="h-14 truncate px-10 rounded-2xl font-black uppercase tracking-widest text-[11px] text-zinc-400 hover:text-zinc-900 transition-all"
                        >
                            Sair sem salvar
                        </Button>
                        <Button
                            type="button"
                            onClick={() => handleSave(false)}
                            disabled={isSaving}
                            className="h-14 px-10 rounded-2xl border-2 border-blue-950 dark:border-blue-700 bg-transparent text-blue-950 dark:text-blue-100 hover:bg-blue-50 dark:hover:bg-blue-900/10 font-black uppercase tracking-widest text-[11px] transition-all"
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
                            className="h-14 px-12 rounded-2xl bg-blue-900 dark:bg-blue-600 text-white hover:bg-black dark:hover:bg-blue-500 font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-900/20 transition-all active:scale-[0.98]"
                        >
                            Finalizar e Bloquear
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    )
}
