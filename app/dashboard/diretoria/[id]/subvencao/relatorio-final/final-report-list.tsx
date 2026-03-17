'use client'

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, CheckCircle2, FileCheck, UserCheck, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { delegateVisit } from "@/app/dashboard/actions"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export function FinalReportList({
    visits,
    directorateId,
    isAdmin,
    role,
    availableUsers
}: {
    visits: any[],
    directorateId: string,
    isAdmin: boolean,
    role?: string,
    availableUsers: { id: string, full_name: string }[]
}) {
    const router = useRouter()
    const [delegatingVisit, setDelegatingVisit] = useState<any | null>(null)
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
    const [isDelegating, setIsDelegating] = useState(false)

    const toggleUser = (userId: string) => {
        setSelectedUserIds(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visits.length > 0 ? (
                visits.map((visit: any) => (
                    <Card key={visit.id} className="h-full bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none hover:border-green-600 dark:hover:border-green-400 transition-all rounded-3xl group hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 w-fit bg-zinc-50 dark:bg-zinc-800 rounded-xl group-hover:bg-green-600 dark:group-hover:bg-green-500 transition-colors shadow-sm">
                                    <FileCheck className="w-5 h-5 text-zinc-500 group-hover:text-white" />
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-full text-green-700 dark:text-green-400 uppercase tracking-tight font-black text-[10px]">
                                        Finalizado
                                    </div>
                                    {(isAdmin || role === 'diretor') && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setDelegatingVisit(visit)
                                                setSelectedUserIds(visit.delegated_to || [])
                                            }}
                                            className="h-7 px-2 text-[9px] font-bold uppercase tracking-wider text-blue-600 hover:bg-blue-50 rounded-lg gap-1.5"
                                        >
                                            <UserCheck className="h-3 w-3" />
                                            Delegar
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <CardTitle className="text-base font-bold text-blue-900 dark:text-blue-100 transition-colors truncate" title={visit.oscs?.name}>
                                {visit.oscs?.name}
                            </CardTitle>
                            <CardDescription className="text-[13px] text-zinc-500 mt-1 font-medium italic">
                                Visita em {new Date(visit.visit_date).toLocaleDateString('pt-BR')}
                            </CardDescription>

                            {visit.is_delegated && (
                                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md w-fit">
                                    <UserCheck className="h-3 w-3" />
                                    Atribuído a você
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="p-8 pt-4">
                            <div className="flex flex-col gap-3">
                                <Link href={`/dashboard/diretoria/${directorateId}/subvencao/visitas/${visit.id}/parecer`} className="w-full">
                                    <Button variant="outline" className="w-full h-10 gap-2 font-bold uppercase text-[10px] rounded-xl border-zinc-200 hover:bg-zinc-100 transition-all">
                                        <FileText className="h-4 w-4" />
                                        Instrumental da Visita
                                    </Button>
                                </Link>
                                <Link href={`/dashboard/diretoria/${directorateId}/subvencao/visitas/${visit.id}/relatorio-final`} className="w-full">
                                    <Button variant="outline" className="w-full h-10 gap-2 font-bold uppercase text-[10px] rounded-xl border-zinc-200 hover:bg-green-600 hover:text-white transition-all text-green-700 hover:text-white">
                                        <FileCheck className="h-4 w-4" />
                                        Relatório Final
                                    </Button>
                                </Link>
                                <Link href={`/dashboard/diretoria/${directorateId}/subvencao/visitas/${visit.id}/parecer-conclusivo`} className="w-full">
                                    <Button variant="outline" className="w-full h-10 gap-2 font-bold uppercase text-[10px] rounded-xl border-zinc-200 hover:bg-blue-900 hover:text-white transition-all text-blue-900 hover:text-white">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Parecer Conclusivo
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <Card className="col-span-full border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-2xl">
                    <CardContent className="p-12 text-center text-zinc-400 font-medium text-sm italic">
                        Nenhum relatório finalizado encontrado para esta diretoria.
                    </CardContent>
                </Card>
            )}

            {/* Delegation Dialog */}
            <Dialog open={!!delegatingVisit} onOpenChange={(open) => !open && setDelegatingVisit(null)}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800 shadow-2xl rounded-[2rem]">
                    <DialogHeader className="pt-6">
                        <DialogTitle className="text-xl font-bold text-blue-900 dark:text-blue-100 flex items-center gap-3">
                            <UserCheck className="h-6 w-6" />
                            Delegar Relatório (Múltiplos)
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium text-zinc-500 pt-2">
                            Selecione os técnicos que poderão acessar e editar os relatórios da <span className="text-blue-900 dark:text-blue-100 font-bold">{delegatingVisit?.oscs?.name}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-2 space-y-4">
                        <div className="bg-zinc-50/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest">Técnicos do Sistema</label>
                                <Button 
                                    variant="link" 
                                    className="h-auto p-0 text-[10px] font-bold text-blue-600"
                                    onClick={() => setSelectedUserIds([])}
                                >
                                    Limpar Seleção
                                </Button>
                            </div>
                            
                            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                {availableUsers?.length === 0 ? (
                                    <p className="text-xs text-zinc-400 py-4 text-center">Nenhum técnico encontrado.</p>
                                ) : (
                                    availableUsers?.map((u) => (
                                        <div key={u.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white dark:hover:bg-zinc-900 transition-colors">
                                            <Checkbox 
                                                id={`user-${u.id}`} 
                                                checked={selectedUserIds.includes(u.id)}
                                                onCheckedChange={() => toggleUser(u.id)}
                                                className="rounded-md border-zinc-300 data-[state=checked]:bg-blue-900"
                                            />
                                            <Label 
                                                htmlFor={`user-${u.id}`}
                                                className="text-sm font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer flex-1"
                                            >
                                                {u.full_name}
                                            </Label>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        <p className="text-[10px] text-zinc-400 italic pl-1 leading-snug">
                            Os usuários selecionados terão permissão para visualizar e salvar rascunhos em todos os instrumentais e relatórios relacionados a esta visita.
                        </p>
                    </div>

                    <DialogFooter className="gap-3 sm:gap-2 pb-6">
                        <Button 
                            variant="ghost" 
                            onClick={() => setDelegatingVisit(null)} 
                            disabled={isDelegating}
                            className="font-bold text-[11px] uppercase tracking-widest text-zinc-500 hover:text-blue-900 hover:bg-zinc-50"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            onClick={async () => {
                                if (!delegatingVisit) return
                                setIsDelegating(true)
                                try {
                                    await delegateVisit(delegatingVisit.id, selectedUserIds)
                                    setDelegatingVisit(null)
                                    router.refresh()
                                } catch (e: any) {
                                    alert(e.message || "Erro ao delegar visita")
                                } finally {
                                    setIsDelegating(false)
                                }
                            }} 
                            disabled={isDelegating}
                            className="bg-blue-900 dark:bg-blue-600 text-white font-bold px-8 rounded-2xl text-[11px] uppercase tracking-widest h-12 transition-all shadow-xl shadow-blue-900/10 hover:bg-blue-800 active:scale-95"
                        >
                            {isDelegating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processando</> : `Confirmar (${selectedUserIds.length})`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
