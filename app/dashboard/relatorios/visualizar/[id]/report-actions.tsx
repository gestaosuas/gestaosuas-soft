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
        <div className="flex items-center justify-between mb-8 print:hidden">
            <div className="flex gap-2">
                <Button variant="ghost" asChild>
                    <Link href={`/dashboard/relatorios/lista?directorate_id=${directorateId}`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                    </Link>
                </Button>
            </div>

            <div className="flex gap-2">
                {isAdmin && (
                    <Button
                        onClick={handleDelete}
                        variant="destructive"
                        disabled={deleting}
                        className="bg-red-500 hover:bg-red-600 text-white"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                    </Button>
                )}
                <Button onClick={handlePrint} variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir (Ctrl+P)
                </Button>
            </div>
        </div>
    )
}
