'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Loader2, MapPin, Building2, Phone, ChevronDown } from "lucide-react"
import { submitOSC, updateOSC } from "@/app/dashboard/actions"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const ACTIVITY_TYPES = [
    "Serviço de Convivência e Fortalecimento de Vínculos – 6 a 15 anos",
    "Serviço de Promoção da Integração ao Mundo Trabalho",
    "Fortalecimento do trabalho com famílias em situação de vulnerabilidade",
    "Trabalho com famílias e gestantes em situação de vulnerabilidade social",
    "Assessoria",
    "Serviço Especializado para População em Situação de Rua",
    "Serviço de Habilitação e Reabilitação da Pessoa com Deficiência",
    "Serviço Acolhimento Residência Inclusiva",
    "Serviço de Acolhimento Institucional para Idoso",
    "Serviço de Acolhimento Institucional para Crianças e Adolescentes",
    "Serviço de Família Acolhedora para Crianças e Adolescentes e Apadrinhamento Afetivo",
    "Serviço de Defesa de Direitos da Criança e Adolescente/ Família",
    "Serviço de Atendimento Especializado à Mulher Vítima de Violência",
    "Serviço de Acolhimento Institucional para Mulher Vítima de Violência"
]

export function FormOSC({ directorateId, oscToEdit, onCancelEdit }: { directorateId: string, oscToEdit?: any, onCancelEdit?: () => void }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [cepLoading, setCepLoading] = useState(false)

    // Form data initialization
    const emptyForm = {
        name: "",
        activity_type: "",
        cep: "",
        address: "",
        number: "",
        neighborhood: "",
        phone: "",
        subsidized_count: 0
    }

    const [formData, setFormData] = useState(oscToEdit || emptyForm)

    // Sync form with oscToEdit when it changes
    useEffect(() => {
        if (oscToEdit) {
            setFormData(oscToEdit)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
            setFormData(emptyForm)
        }
    }, [oscToEdit])

    const handleCepBlur = async () => {
        const cep = formData.cep.replace(/\D/g, "")
        if (cep.length !== 8) return

        setCepLoading(true)
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
            const data = await response.json()

            if (!data.erro) {
                setFormData((prev: any) => ({
                    ...prev,
                    address: data.logradouro || "",
                    neighborhood: data.bairro || "",
                }))
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error)
        } finally {
            setCepLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            let result;
            if (oscToEdit?.id) {
                result = await updateOSC(oscToEdit.id, formData)
            } else {
                result = await submitOSC(formData)
            }

            if (result.success) {
                setFormData(emptyForm)
                alert(oscToEdit ? "OSC atualizada com sucesso!" : "OSC cadastrada com sucesso!")
                if (onCancelEdit) onCancelEdit()
                router.refresh()
            } else {
                alert(result.error)
            }
        } catch (error: any) {
            alert("Erro ao salvar: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="group flex items-center gap-2 text-zinc-500 hover:text-blue-900 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Voltar
                </Button>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="border-none shadow-2xl shadow-blue-900/5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-900 text-white rounded-2xl shadow-lg shadow-blue-900/20">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black text-blue-900 dark:text-blue-50 tracking-tight">
                                    {oscToEdit ? "Editar OSC" : "Cadastrar OSC"}
                                </CardTitle>
                                <CardDescription className="font-medium text-zinc-500">
                                    {oscToEdit ? `Editando: ${oscToEdit.name}` : "Organização da Sociedade Civil"}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[12px] font-bold uppercase tracking-widest text-zinc-400">Nome da Instituição</Label>
                            <Input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="h-12 bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-900/20 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[12px] font-bold uppercase tracking-widest text-zinc-400">Tipo de atividade</Label>
                            <Select
                                value={formData.activity_type}
                                onValueChange={value => setFormData({ ...formData, activity_type: value })}
                                required
                            >
                                <SelectTrigger className="h-12 bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-900/20 transition-all font-medium">
                                    <SelectValue placeholder="Selecione o tipo de atividade" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl">
                                    {ACTIVITY_TYPES.map((type) => (
                                        <SelectItem key={type} value={type} className="focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:text-blue-900 dark:focus:text-blue-100 cursor-pointer py-3">
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[12px] font-bold uppercase tracking-widest text-zinc-400">CEP</Label>
                                <div className="relative">
                                    <Input
                                        required
                                        value={formData.cep}
                                        onChange={e => setFormData({ ...formData, cep: e.target.value })}
                                        onBlur={handleCepBlur}
                                        className="h-12 bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-900/20 transition-all font-medium"
                                    />
                                    {cepLoading && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-bold uppercase tracking-widest text-zinc-400">Telefone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                    <Input
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="h-12 pl-10 bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-900/20 transition-all font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-bold uppercase tracking-widest text-zinc-400">Número Subvencionado</Label>
                                <Input
                                    type="number"
                                    value={formData.subsidized_count}
                                    onChange={e => setFormData({ ...formData, subsidized_count: Number(e.target.value) })}
                                    className="h-12 bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-900/20 transition-all font-medium text-center font-bold"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-[12px] font-bold uppercase tracking-widest text-zinc-400">Rua / Logradouro</Label>
                                <Input
                                    required
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="h-12 bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-900/20 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-bold uppercase tracking-widest text-zinc-400">Número</Label>
                                <Input
                                    required
                                    value={formData.number}
                                    onChange={e => setFormData({ ...formData, number: e.target.value })}
                                    className="h-12 bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-900/20 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[12px] font-bold uppercase tracking-widest text-zinc-400">Bairro</Label>
                            <Input
                                required
                                value={formData.neighborhood}
                                onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                                className="h-12 bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-900/20 transition-all font-medium"
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="p-8 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.back()}
                            className="h-12 px-6 rounded-xl font-bold uppercase tracking-widest text-[11px] text-zinc-500 hover:text-zinc-900 transition-all"
                        >
                            Cancelar
                        </Button>
                        {oscToEdit && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onCancelEdit}
                                className="h-12 px-6 rounded-xl font-bold uppercase tracking-widest text-[11px] text-zinc-500 hover:text-zinc-900 transition-all"
                            >
                                Cancelar Edição
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-12 px-8 rounded-xl bg-blue-900 dark:bg-blue-600 text-white hover:bg-blue-800 dark:hover:bg-blue-500 font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    {oscToEdit ? "Salvar Alterações" : "Finalizar Cadastro"}
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}
