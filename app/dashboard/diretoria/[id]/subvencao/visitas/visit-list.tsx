'use client'

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Building, FileText, Eye, Edit2, Trash2, Loader2, CheckCircle2 } from "lucide-react"
import { deleteVisit } from "@/app/dashboard/actions"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function VisitList({ visits, directorateId, isAdmin, isEmendas }: { visits: any[], directorateId: string, isAdmin?: boolean, isEmendas?: boolean }) {
    const router = useRouter()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (id: string, status: string) => {
        const message = status === 'finalized'
            ? "ATENÇÃO: Este relatório está FINALIZADO. Deseja realmente excluí-lo? Esta ação não pode ser desfeita."
            : "Tem certeza que deseja excluir este rascunho de visita?"

        if (!window.confirm(message)) return

        setDeletingId(id)
        try {
            const result = await deleteVisit(id)
            if (result.success) {
                router.refresh()
            }
        } catch (error: any) {
            alert("Erro ao excluir: " + error.message)
        } finally {
            setDeletingId(null)
        }
    }

    if (!visits || visits.length === 0) {
        return (
            <Card className="border-none shadow-2xl shadow-blue-900/5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <CardContent className="p-12 text-center text-zinc-500 font-medium">
                    Nenhum instrumental de visita registrado até o momento.
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-none shadow-2xl shadow-blue-900/5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            <CardHeader className="p-8 pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-400 rounded-2xl">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-50 tracking-tight">
                            Últimas Visitas Realizadas
                        </CardTitle>
                        <p className="text-sm font-medium text-zinc-500">
                            Registro de monitoramento e avaliação
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-100 dark:border-zinc-800 hover:bg-transparent">
                                <TableHead className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-zinc-400">Data e OSC</TableHead>
                                {isEmendas && (
                                    <TableHead className="py-5 text-[11px] font-bold uppercase tracking-widest text-zinc-400">Identificador</TableHead>
                                )}
                                <TableHead className="py-5 text-[11px] font-bold uppercase tracking-widest text-zinc-400">Técnicos Responsáveis</TableHead>
                                <TableHead className="py-5 text-[11px] font-bold uppercase tracking-widest text-zinc-400">Status</TableHead>
                                <TableHead className="py-5 text-[11px] font-bold uppercase tracking-widest text-zinc-400">Registrado por</TableHead>
                                <TableHead className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-zinc-400 text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visits.map((visit) => (
                                <TableRow key={visit.id} className="border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                                    <TableCell className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-blue-950 dark:text-blue-50 font-bold text-[14px]">
                                                <Building className="h-3.5 w-3.5 text-blue-600/50" />
                                                {visit.oscs?.name}
                                            </div>
                                            <div className="flex flex-col gap-0.5 ml-5">
                                                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-500 text-xs font-medium">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {new Date(visit.visit_date).toLocaleDateString('pt-BR')}
                                                </div>
                                                <div className="text-[10px] text-zinc-400 font-medium italic">
                                                    Salvo às: {new Date(visit.updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    {isEmendas && (
                                        <TableCell className="py-6">
                                            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded w-fit">
                                                {visit.identificacao?.identifier || "—"}
                                            </div>
                                        </TableCell>
                                    )}
                                    <TableCell className="py-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                                {visit.assinaturas?.tecnico1_nome || "—"}
                                            </div>
                                            <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                                {visit.assinaturas?.tecnico2_nome || "—"}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6">
                                        {visit.status === 'finalized' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 uppercase tracking-wider">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Finalizado
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                                                <Edit2 className="h-3 w-3" />
                                                Rascunho
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="py-6">
                                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                                            <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] text-blue-900 dark:text-blue-400">
                                                {(visit.profiles?.full_name || "U")[0]}
                                            </div>
                                            {visit.profiles?.full_name || "Desconhecido"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.push(`/dashboard/diretoria/${directorateId}/subvencao/visitas/${visit.id}`)}
                                                className="h-9 px-4 rounded-xl border-zinc-200 dark:border-zinc-800 hover:bg-blue-900 hover:text-white transition-all gap-2 font-bold text-[10px] uppercase tracking-widest"
                                            >
                                                {visit.status === 'finalized' ? (
                                                    <><Eye className="h-3.5 w-3.5" /> Visualizar</>
                                                ) : (
                                                    <><Edit2 className="h-3.5 w-3.5" /> Editar</>
                                                )}
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={visit.status !== 'finalized'}
                                                onClick={() => router.push(`/dashboard/diretoria/${directorateId}/subvencao/visitas/${visit.id}/parecer`)}
                                                className={cn(
                                                    "h-9 px-4 rounded-xl transition-all gap-2 font-bold text-[10px] uppercase tracking-widest border",
                                                    !visit.parecer_tecnico?.status && "border-zinc-200 dark:border-zinc-800 hover:bg-blue-900 hover:text-white",
                                                    visit.parecer_tecnico?.status === 'draft' && "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-600 hover:text-white dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400",
                                                    visit.parecer_tecnico?.status === 'finalized' && "bg-green-50 border-green-200 text-green-700 hover:bg-green-600 hover:text-white dark:bg-green-900/20 dark:border-green-800 dark:text-green-400",
                                                    "disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit"
                                                )}
                                            >
                                                <FileText className="h-3.5 w-3.5" />
                                                {visit.parecer_tecnico?.status === 'finalized' ? 'Relatório Final' :
                                                    visit.parecer_tecnico?.status === 'draft' ? 'Relatório (Rascunho)' : 'Relatório'}
                                            </Button>
                                            {(visit.status === 'draft' || isAdmin) && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(visit.id, visit.status)}
                                                    disabled={deletingId === visit.id}
                                                    className="h-9 w-9 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                                                >
                                                    {deletingId === visit.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
