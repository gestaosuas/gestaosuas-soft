'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, Plus, Eye, Trash2, Calendar, FilePenLine, FilePen, AlertCircle, Save, ArrowLeft, Loader2, ClipboardCheck } from "lucide-react"
import { useState, useEffect } from "react"
import { WorkPlanEditor, Block } from "./work-plan-editor"
import { saveWorkPlan, getWorkPlans, deleteWorkPlan, saveOSCPartnershipDetails } from "@/app/dashboard/actions"
import { printWorkPlan } from "./print-utils"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface OSC {
    id: string
    name: string
    objeto?: string
    objetivos?: string
    metas?: string
    atividades?: string
    [key: string]: any
}

interface WorkPlansManagerProps {
    osc: OSC | null
    directorateId: string
    profile: any
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    logoUrl?: string
}

export function WorkPlansManager({ osc, directorateId, profile, isOpen, onOpenChange, logoUrl }: WorkPlansManagerProps) {
    const [view, setView] = useState<'list' | 'editor' | 'partnership'>('list')
    const [plans, setPlans] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [editingPlan, setEditingPlan] = useState<any>(null)
    const [savingPartnership, setSavingPartnership] = useState(false)

    // Partnership Details State
    const [partnershipData, setPartnershipData] = useState({
        objeto: "",
        objetivos: "",
        metas: "",
        atividades: ""
    })

    useEffect(() => {
        if (isOpen && osc) {
            loadPlans()
            setView('list')
            setEditingPlan(null)
            setPartnershipData({
                objeto: osc.objeto || "",
                objetivos: osc.objetivos || "",
                metas: osc.metas || "",
                atividades: osc.atividades || ""
            })
        }
    }, [isOpen, osc])

    const loadPlans = async () => {
        if (!osc) return
        setLoading(true)
        try {
            const data = await getWorkPlans(osc.id)
            setPlans(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSavePlan = async (title: string, blocks: Block[]) => {
        if (!osc) return

        await saveWorkPlan({
            id: editingPlan?.id,
            osc_id: osc.id,
            directorate_id: directorateId,
            title,
            content: blocks
        })

        await loadPlans()
        setEditingPlan(null)
        setView('list')
    }

    const handleSavePartnership = async () => {
        if (!osc) return
        setSavingPartnership(true)
        try {
            await saveOSCPartnershipDetails(osc.id, partnershipData)
            alert("Descrições salvas com sucesso!")
            setView('list')
            // Update local state if needed, but the page refresh/revalidate handles it
        } catch (error: any) {
            alert(error.message)
        } finally {
            setSavingPartnership(false)
        }
    }

    const handleEditPlan = (plan: any) => {
        setEditingPlan(plan)
        setView('editor')
    }

    const handleDeletePlan = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este plano?")) return
        await deleteWorkPlan(id)
        await loadPlans()
    }

    const handleCreateNew = () => {
        setEditingPlan(null)
        setView('editor')
    }

    const isAdmin = profile?.role === 'admin'

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-8">
                    <DialogTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100 uppercase flex items-center gap-3">
                        {view === 'list' ? (
                            <>
                                <FileText className="h-6 w-6" /> Planos de Trabalho
                            </>
                        ) : view === 'partnership' ? (
                            <>
                                <ClipboardCheck className="h-6 w-6" /> Descrição do Plano de Trabalho
                            </>
                        ) : editingPlan ? (
                            'Editar Plano de Trabalho'
                        ) : (
                            'Novo Plano de Trabalho'
                        )}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        {view === 'list'
                            ? `Gerencie os planos de trabalho para ${osc?.name}`
                            : view === 'partnership'
                                ? 'Cadastre e edite as informações principais do Termo de Colaboração.'
                                : 'Utilize o editor abaixo para criar ou editar o documento.'
                        }
                    </DialogDescription>
                </DialogHeader>

                {view === 'list' ? (
                    <div className="space-y-6">
                        <div className="flex flex-col gap-3">
                            {isAdmin && (
                                <Button
                                    onClick={() => setView('partnership')}
                                    variant="outline"
                                    className="w-full border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-700 gap-2 h-12 text-sm font-bold uppercase tracking-wide border-2 border-dashed"
                                >
                                    <ClipboardCheck className="h-4 w-4" /> Cadastrar Descrição dos objetivos, metas e atividades previstas
                                </Button>
                            )}
                            <Button onClick={handleCreateNew} className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 h-12 text-sm font-bold uppercase tracking-wide shadow-md">
                                <Plus className="h-4 w-4" /> Criar Novo Plano
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {loading ? (
                                <p className="text-center text-sm text-zinc-400 py-8">Carregando planos...</p>
                            ) : plans.length === 0 ? (
                                <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                                    <FileText className="h-10 w-10 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
                                    <p className="text-zinc-500 font-medium">Nenhum plano criado</p>
                                </div>
                            ) : (
                                plans.map(plan => (
                                    <div key={plan.id} className="group p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-between hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                                <FilePenLine className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{plan.title}</h4>
                                                    {(!plan.content || (Array.isArray(plan.content) && plan.content.length === 0)) && (
                                                        <span className="inline-flex items-center gap-1 py-0.5 px-2 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-200">
                                                            <AlertCircle className="h-3 w-3" />
                                                            Vazio
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{new Date(plan.created_at).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => printWorkPlan(plan, logoUrl)}
                                                title="Visualizar"
                                                className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditPlan(plan)}
                                                className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                                                title="Editar"
                                            >
                                                <FilePen className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeletePlan(plan.id)}
                                                className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                                title="Excluir"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : view === 'editor' ? (
                    <WorkPlanEditor
                        initialTitle={editingPlan?.title}
                        initialBlocks={editingPlan?.content}
                        onSave={handleSavePlan}
                        onCancel={() => setView('list')}
                    />
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-zinc-500">Objeto</Label>
                                <Textarea
                                    className="min-h-[100px] bg-zinc-50 dark:bg-zinc-950/50"
                                    value={partnershipData.objeto}
                                    onChange={e => setPartnershipData({ ...partnershipData, objeto: e.target.value })}
                                    placeholder="Digite o objeto do plano de trabalho..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-zinc-500">Objetivos</Label>
                                <Textarea
                                    className="min-h-[100px] bg-zinc-50 dark:bg-zinc-950/50"
                                    value={partnershipData.objetivos}
                                    onChange={e => setPartnershipData({ ...partnershipData, objetivos: e.target.value })}
                                    placeholder="Digite os objetivos..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-zinc-500">Metas Estabelecidas</Label>
                                <Textarea
                                    className="min-h-[100px] bg-zinc-50 dark:bg-zinc-950/50"
                                    value={partnershipData.metas}
                                    onChange={e => setPartnershipData({ ...partnershipData, metas: e.target.value })}
                                    placeholder="Digite as metas..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-zinc-500">Atividades</Label>
                                <Textarea
                                    className="min-h-[100px] bg-zinc-50 dark:bg-zinc-950/50"
                                    value={partnershipData.atividades}
                                    onChange={e => setPartnershipData({ ...partnershipData, atividades: e.target.value })}
                                    placeholder="Digite as atividades..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            <Button variant="ghost" onClick={() => setView('list')} className="gap-2 uppercase text-xs font-bold text-zinc-500">
                                <ArrowLeft className="h-4 w-4" /> Cancelar
                            </Button>
                            <Button onClick={handleSavePartnership} disabled={savingPartnership} className="gap-2 bg-blue-900 hover:bg-black text-white px-8 uppercase text-xs font-bold">
                                {savingPartnership ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Salvar Descrições
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
