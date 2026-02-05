'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, Plus, Eye, Trash2, Calendar, FilePenLine, FilePen, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { WorkPlanEditor, Block } from "./work-plan-editor"
import { saveWorkPlan, getWorkPlans, deleteWorkPlan } from "@/app/dashboard/actions"
import { printWorkPlan } from "./print-utils"

interface OSC {
    id: string
    name: string
    [key: string]: any
}

interface WorkPlansManagerProps {
    osc: OSC | null
    directorateId: string
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function WorkPlansManager({ osc, directorateId, isOpen, onOpenChange }: WorkPlansManagerProps) {
    const [view, setView] = useState<'list' | 'editor'>('list')
    const [plans, setPlans] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [editingPlan, setEditingPlan] = useState<any>(null)

    useEffect(() => {
        if (isOpen && osc) {
            loadPlans()
            setView('list')
            setEditingPlan(null)
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

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-8">
                    <DialogTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {view === 'list'
                            ? 'Planos de Trabalho'
                            : editingPlan
                                ? 'Editar Plano de Trabalho'
                                : 'Novo Plano de Trabalho'}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        {view === 'list'
                            ? `Gerencie os planos de trabalho para ${osc?.name}`
                            : 'Utilize o editor abaixo para criar ou editar o documento.'
                        }
                    </DialogDescription>
                </DialogHeader>

                {view === 'list' ? (
                    <div className="space-y-6">
                        <Button onClick={handleCreateNew} className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 h-12 text-sm font-bold uppercase tracking-wide">
                            <Plus className="h-4 w-4" /> Criar Novo Plano
                        </Button>

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
                                                onClick={() => printWorkPlan(plan)}
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
                ) : (
                    <WorkPlanEditor
                        initialTitle={editingPlan?.title}
                        initialBlocks={editingPlan?.content}
                        onSave={handleSavePlan}
                        onCancel={() => setView('list')}
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}
