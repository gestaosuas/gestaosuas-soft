'use client'

import { Button } from "@/components/ui/button"
import { ArrowLeft, Printer, Trash2 } from "lucide-react"
import Link from "next/link"
import { deleteReport } from "@/app/dashboard/actions"
import { useState } from "react"

interface ReportActionsProps {
    reportId: string
    directorateId: string
    isAdmin: boolean
}

export default function ReportActions({ reportId, directorateId, isAdmin }: ReportActionsProps) {
    const [deleting, setDeleting] = useState(false)

    const handlePrint = () => {
        window.print()
    }

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja EXCLUIR este relatório permanentemente?")) return

        setDeleting(true)
        try {
            const result = await deleteReport(reportId)
            if (result?.error) {
                console.error('Falha ao excluir:', result.error)
                alert(`Erro: ${result.error}`)
            } else {
                alert("Relatório excluído com sucesso!")
                window.location.href = `/dashboard/relatorios/lista?directorate_id=${directorateId}`
            }
        } catch (e: any) {
            console.error('Erro de rede ou exceção:', e)
            alert(`Erro inesperado: ${e.message || 'Desconhecido'}`)
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="flex items-center justify-between mb-10 px-2 print:hidden animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="flex gap-4">
                <Link href={`/dashboard/relatorios/lista?directorate_id=${directorateId}`}>
                    <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 transition-all shadow-sm">
                        <ArrowLeft className="h-5 w-5 text-zinc-500" />
                    </Button>
                </Link>
                <div className="hidden sm:flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Ações do Relatório</span>
                    <span className="text-[13px] font-bold text-blue-900 dark:text-blue-100 uppercase tracking-tight">Modo Visualização Profissional</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {isAdmin && (
                    <Button
                        onClick={handleDelete}
                        variant="ghost"
                        disabled={deleting}
                        className="h-11 px-6 rounded-xl text-red-500 hover:text-white hover:bg-red-500 border border-transparent hover:border-red-500 transition-all font-bold text-[11px] uppercase tracking-widest"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                    </Button>
                )}
                <Button
                    onClick={handlePrint}
                    className="h-11 px-8 rounded-xl bg-blue-900 dark:bg-blue-600 text-white hover:bg-blue-800 dark:hover:bg-blue-500 font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-blue-900/10 transition-all active:scale-[0.98]"
                >
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir Documento
                </Button>
            </div>
        </div>
    )
}
