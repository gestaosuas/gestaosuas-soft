'use client'

import { useState, useTransition } from "react"
import { Trash2, Loader2, AlertCircle } from "lucide-react"
import { deleteReport } from "@/app/dashboard/actions"
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

interface DeleteReportButtonProps {
    reportId: string
    monthName: string
    year: number
}

export function DeleteReportButton({ reportId, monthName, year }: DeleteReportButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)

    const handleDelete = () => {
        startTransition(async () => {
            try {
                const res = await deleteReport(reportId)
                if (res && res.success) {
                    setOpen(false)
                    window.location.reload()
                } else {
                    alert(res?.error || "Erro ao excluir relatório.")
                }
            } catch (err) {
                console.error("Delete transition error:", err)
                alert("Erro de conexão ou erro interno ao excluir.")
            }
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <button
                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    title="Excluir relatório"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-5 h-5" /> Confirmar Exclusão
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Deseja realmente apagar o relatório de **{monthName} / {year}**?
                        <br /><br />
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 italic">
                            Esta ação excluirá permanentemente a narrativa e os dados associados a este registro.
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Excluindo...</>
                        ) : (
                            "Sim, Excluir Registro"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
