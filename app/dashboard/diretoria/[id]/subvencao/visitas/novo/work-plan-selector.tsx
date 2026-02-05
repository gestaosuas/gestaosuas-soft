'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { FileText, Download, Calendar, Loader2 } from "lucide-react"
import { getWorkPlans } from "@/app/dashboard/actions"
import { printWorkPlan } from "../../plano-de-trabalho/print-utils"

interface WorkPlanSelectorProps {
    oscId: string
    oscName?: string
}

export function WorkPlanSelector({ oscId, oscName }: WorkPlanSelectorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [plans, setPlans] = useState<any[]>([])

    const handleOpen = async () => {
        if (!oscId) {
            alert("Selecione uma Organização (OSC) primeiro.")
            return
        }

        setIsOpen(true)
        setLoading(true)
        try {
            const data = await getWorkPlans(oscId)
            setPlans(data)
        } catch (error) {
            console.error(error)
            alert("Erro ao buscar planos de trabalho.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Button
                variant="outline"
                onClick={handleOpen}
                className="h-11 px-6 rounded-xl border-zinc-200 font-bold text-xs uppercase tracking-widest gap-2 hover:bg-zinc-50"
            >
                <FileText className="h-4 w-4" />
                Plano de Trabalho
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Planos de Trabalho</DialogTitle>
                        <DialogDescription>
                            Selecione um plano de trabalho de {oscName || "OSC selecionada"} para visualizar/imprimir.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2 max-h-[60vh] overflow-y-auto mt-4">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                            </div>
                        ) : plans.length === 0 ? (
                            <div className="text-center py-8 border border-dashed border-zinc-200 rounded-lg">
                                <p className="text-sm text-zinc-500">Nenhum plano de trabalho encontrado.</p>
                            </div>
                        ) : (
                            plans.map((plan) => (
                                <Button
                                    key={plan.id}
                                    variant="outline"
                                    onClick={() => {
                                        printWorkPlan(plan)
                                        setIsOpen(false)
                                    }}
                                    className="w-full justify-between h-auto py-3 px-4 hover:border-blue-500 group"
                                >
                                    <div className="flex flex-col items-start gap-1">
                                        <span className="font-bold text-zinc-800 group-hover:text-blue-700">{plan.title}</span>
                                        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                                        </div>
                                    </div>
                                    <Download className="h-4 w-4 text-zinc-400 group-hover:text-blue-600" />
                                </Button>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
