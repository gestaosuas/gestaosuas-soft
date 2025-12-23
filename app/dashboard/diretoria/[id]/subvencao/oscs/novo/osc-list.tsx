'use client'

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, MapPin, Phone, Calendar, Printer, Edit2, Trash2, Loader2 } from "lucide-react"
import { deleteOSC } from "@/app/dashboard/actions"
import { useRouter } from "next/navigation"

export function OSCList({ oscs, onEdit }: { oscs: any[], onEdit?: (osc: any) => void }) {
    const router = useRouter()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handlePrint = () => {
        window.print()
    }

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Tem certeza que deseja excluir a OSC "${name}"?`)) return

        setDeletingId(id)
        try {
            const result = await deleteOSC(id)
            if (result.success) {
                router.refresh()
            } else {
                alert(result.error)
            }
        } catch (error: any) {
            alert("Erro ao excluir: " + error.message)
        } finally {
            setDeletingId(null)
        }
    }

    if (!oscs || oscs.length === 0) {
        return (
            <Card className="border-none shadow-2xl shadow-blue-900/5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <CardContent className="p-12 text-center text-zinc-500 font-medium">
                    Nenhuma OSC cadastrada até o momento.
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .print-area { 
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        box-shadow: none !important;
                        border: none !important;
                        background: white !important;
                    }
                    .print-area table { border: 1px solid #e5e7eb !important; }
                    .print-area th, .print-area td { border-bottom: 1px solid #e5e7eb !important; }
                }
            `}</style>

            <Card className="border-none shadow-2xl shadow-blue-900/5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 print-area">
                <CardHeader className="p-8 pb-6 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-400 rounded-xl">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-50 tracking-tight">
                                OSCs Cadastradas
                            </CardTitle>
                            <p className="text-[12px] font-medium text-zinc-500">
                                Total: {oscs.length} instituições
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handlePrint}
                        variant="outline"
                        className="no-print h-10 px-4 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 hover:bg-blue-900 hover:text-white transition-all gap-2 font-bold text-[11px] uppercase tracking-widest"
                    >
                        <Printer className="h-4 w-4" />
                        Imprimir Lista
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-100 dark:border-zinc-800 hover:bg-transparent">
                                    <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Instituição</TableHead>
                                    <TableHead className="py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Atividade</TableHead>
                                    <TableHead className="py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Contatos / Endereço</TableHead>
                                    <TableHead className="py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Bairro</TableHead>
                                    <TableHead className="no-print px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {oscs.map((osc) => (
                                    <TableRow key={osc.id} className="border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                                        <TableCell className="px-6 py-4">
                                            <div className="font-bold text-[13px] text-blue-900 dark:text-blue-50 group-hover:text-blue-600 transition-colors">
                                                {osc.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 max-w-[200px] truncate" title={osc.activity_type}>
                                                {osc.activity_type}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col gap-0.5">
                                                {osc.phone && (
                                                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-[11px] font-semibold">
                                                        <Phone className="h-3 w-3 text-blue-600/50" />
                                                        {osc.phone}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-500 text-[11px]">
                                                    <MapPin className="h-3 w-3 text-zinc-300" />
                                                    {osc.address}, {osc.number}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase tracking-tight">
                                                {osc.neighborhood}
                                            </span>
                                        </TableCell>
                                        <TableCell className="no-print px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onEdit?.(osc)}
                                                    className="h-8 w-8 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(osc.id, osc.name)}
                                                    disabled={deletingId === osc.id}
                                                    className="h-8 w-8 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                                    title="Excluir"
                                                >
                                                    {deletingId === osc.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
