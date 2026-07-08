'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ClipboardList, Check, Loader2, Calendar, X } from "lucide-react"
import { getWorkPlans } from "@/app/dashboard/actions"
import { cn } from "@/lib/utils"

interface WorkPlanAssignProps {
    oscId: string
    value: string
    onChange: (planId: string) => void
    disabled?: boolean
}

export function WorkPlanAssign({ oscId, value, onChange, disabled }: WorkPlanAssignProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [plans, setPlans] = useState<any[]>([])

    useEffect(() => {
        if (!oscId) {
            setPlans([])
            return
        }
        setLoading(true)
        getWorkPlans(oscId)
            .then(setPlans)
            .catch(() => setPlans([]))
            .finally(() => setLoading(false))
    }, [oscId])

    if (!oscId) return null

    const selectedPlan = plans.find((p) => p.id === value)

    return (
        <>
            <Button
                type="button"
                variant="outline"
                disabled={disabled}
                onClick={() => setIsOpen(true)}
                className={cn(
                    "w-full h-11 rounded-xl justify-between px-4 font-bold text-xs uppercase tracking-widest gap-2",
                    selectedPlan
                        ? "border-2 border-blue-200 bg-blue-50/50 text-blue-900 hover:bg-blue-50"
                        : "border-2 border-dashed border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                )}
            >
                <span className="flex items-center gap-2 truncate normal-case tracking-normal text-left">
                    <ClipboardList className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                        {loading
                            ? "Carregando planos..."
                            : selectedPlan
                                ? selectedPlan.title
                                : "Vincular Plano de Trabalho"}
                    </span>
                </span>
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Vincular Plano de Trabalho</DialogTitle>
                        <DialogDescription>
                            Selecione a qual plano de trabalho esta visita se refere. Útil quando a OSC possui mais de um plano ativo.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2 max-h-[60vh] overflow-y-auto mt-4">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                            </div>
                        ) : plans.length === 0 ? (
                            <div className="text-center py-8 border border-dashed border-zinc-200 rounded-lg">
                                <p className="text-sm text-zinc-500">Nenhum plano de trabalho encontrado para esta OSC.</p>
                            </div>
                        ) : (
                            plans.map((plan) => (
                                <button
                                    key={plan.id}
                                    type="button"
                                    onClick={() => {
                                        onChange(plan.id)
                                        setIsOpen(false)
                                    }}
                                    className={cn(
                                        "w-full text-left p-4 rounded-2xl transition-all border-2 flex items-center justify-between group",
                                        value === plan.id
                                            ? "bg-blue-50 border-blue-200 shadow-sm"
                                            : "bg-white border-transparent hover:border-zinc-100 hover:bg-zinc-50"
                                    )}
                                >
                                    <div className="flex flex-col items-start gap-1 overflow-hidden">
                                        <span className={cn(
                                            "font-bold truncate w-full",
                                            value === plan.id ? "text-blue-900" : "text-blue-950"
                                        )}>
                                            {plan.title}
                                        </span>
                                        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                                        </div>
                                    </div>
                                    {value === plan.id && <Check className="h-5 w-5 text-blue-900 shrink-0" />}
                                </button>
                            ))
                        )}

                        {value && (
                            <button
                                type="button"
                                onClick={() => {
                                    onChange("")
                                    setIsOpen(false)
                                }}
                                className="w-full flex items-center justify-center gap-2 p-2 text-[11px] font-bold text-red-500 hover:text-red-700 uppercase tracking-wide"
                            >
                                <X className="h-3.5 w-3.5" />
                                Remover vínculo
                            </button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
