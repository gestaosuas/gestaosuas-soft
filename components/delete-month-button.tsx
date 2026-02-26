'use client'

import { useState, useTransition } from "react"
import { Trash2, Loader2, AlertCircle } from "lucide-react"
import { deleteMonthData } from "@/app/dashboard/actions"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DeleteMonthButtonProps {
    directorateId: string
    month: number
    year: number
    monthName: string
    unitName?: string
}

export function DeleteMonthButton({ directorateId, month, year, monthName, unitName }: DeleteMonthButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)

    const handleDelete = () => {
        startTransition(async () => {
            const res = await deleteMonthData(directorateId, month, year, unitName)
            if (res.success) {
                setOpen(false)
            } else {
                alert("Erro ao excluir dados.")
            }
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <button
                    className="group-hover/header:opacity-100 opacity-0 transition-opacity p-1 mt-0.5 text-zinc-300 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                    title={`Limpar dados de ${monthName}`}
                >
                    <Trash2 className="w-[14px] h-[14px]" />
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-5 h-5" /> Confirmar Exclusão
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Deseja realmente apagar todos os dados de **{monthName} / {year}**
                        {unitName ? ` para a unidade ${unitName}` : ` de todas as unidades`}?
                        <br /><br />
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">Esta ação não pode ser desfeita e os dados serão removidos do banco e dos dashboards.</span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Excluindo...</>
                        ) : (
                            "Sim, Limpar Dados"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
