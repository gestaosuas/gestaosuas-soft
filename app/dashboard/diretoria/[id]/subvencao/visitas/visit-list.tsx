'use client'

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
    Calendar, 
    Building, 
    FileText, 
    Eye, 
    Edit2, 
    Trash2, 
    Loader2, 
    CheckCircle2, 
    UserCheck, 
    Search, 
    Filter, 
    FilterX, 
    X 
} from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { deleteVisit, revertVisitToDraft, delegateVisit } from "@/app/dashboard/actions"
import { cn } from "@/lib/utils"

export function VisitList({ 
    visits, 
    directorateId, 
    isAdmin, 
    isEmendas,
    role,
    currentUserId,
    availableUsers,
    availableDirectorates = []
}: { 
    visits: any[], 
    directorateId: string, 
    isAdmin?: boolean, 
    isEmendas?: boolean,
    role?: string,
    currentUserId?: string,
    availableUsers?: { id: string, full_name: string }[],
    availableDirectorates?: { id: string, name: string }[]
}) {
    const router = useRouter()
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [revertingId, setRevertingId] = useState<string | null>(null)
    const [delegatingVisit, setDelegatingVisit] = useState<any | null>(null)
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
    const [selectedDirIds, setSelectedDirIds] = useState<string[]>([])
    const [isDelegating, setIsDelegating] = useState(false)
    const [delegationTab, setDelegationTab] = useState<'users' | 'directorates'>('users')
    
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const initialBimester = Math.ceil(currentMonth / 2).toString()

    const getBimesterRange = (bim: string, yr: number) => {
        const bInt = parseInt(bim)
        const startM = (bInt - 1) * 2
        const endM = bInt * 2 - 1
        return {
            start: new Date(yr, startM, 1).toISOString().split('T')[0],
            end: new Date(yr, endM + 1, 0).toISOString().split('T')[0]
        }
    }

    const initialRange = initialBimester !== "0" ? getBimesterRange(initialBimester, currentYear) : { start: "", end: "" }

    // Filter states
    const [oscSearch, setOscSearch] = useState("")
    const [userSearch, setUserSearch] = useState("all")
    const [dateStart, setDateStart] = useState(initialRange.start)
    const [dateEnd, setDateEnd] = useState(initialRange.end)
    const [bimestre, setBimestre] = useState(initialBimester)

    const clearFilters = () => {
        setOscSearch("")
        setUserSearch("all")
        setDateStart("")
        setDateEnd("")
        setBimestre("all")
    }

    const handleBimesterChange = (value: string) => {
        setBimestre(value)
        if (value === "all") {
            setDateStart("")
            setDateEnd("")
            return
        }

        const range = getBimesterRange(value, currentYear)
        setDateStart(range.start)
        setDateEnd(range.end)
    }

    const handleCurrentYear = () => {
        setBimestre("all")
        setDateStart(`${currentYear}-01-01`)
        setDateEnd(`${currentYear}-12-31`)
    }

    const filteredVisits = (visits || []).filter(visit => {
        const matchesOsc = (!oscSearch || visit.oscs?.name?.toLowerCase().includes(oscSearch.toLowerCase()))
        const matchesUser = (userSearch === "all" || visit.user_id === userSearch)
        
        // Date handling: normalize to YYYY-MM-DD for simple comparison
        const visitDateStr = visit.visit_date?.split('T')[0]
        const matchesStart = !dateStart || (visitDateStr && visitDateStr >= dateStart)
        const matchesEnd = !dateEnd || (visitDateStr && visitDateStr <= dateEnd)
        
        return matchesOsc && matchesUser && matchesStart && matchesEnd
    })

    const toggleUser = (userId: string) => {
        setSelectedUserIds(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        )
    }

    const toggleDirSelection = (dirId: string) => {
        setSelectedDirIds(prev => 
            prev.includes(dirId) 
                ? prev.filter(id => id !== dirId)
                : [...prev, dirId]
        )
    }

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

    const handleRevert = async (id: string, oscName: string) => {
        if (!window.confirm(`Deseja realmente reverter a visita da OSC "${oscName}" para status de Rascunho? Isso permitirá edições novamente.`)) return

        setRevertingId(id)
        try {
            const result = await revertVisitToDraft(id)
            if (result.success) {
                router.refresh()
            }
        } catch (error: any) {
            alert("Erro ao reverter status: " + error.message)
        } finally {
            setRevertingId(null)
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
            <CardHeader className="p-8 pb-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
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

                    <div className="flex flex-wrap items-center gap-3 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        {/* OSC Filter */}
                        <div className="relative min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                            <Input 
                                placeholder="Filtrar por OSC..." 
                                value={oscSearch}
                                onChange={(e) => setOscSearch(e.target.value)}
                                className="h-9 pl-9 pr-8 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-[11px] font-bold rounded-xl w-full"
                            />
                            {oscSearch && (
                                <button 
                                    onClick={() => setOscSearch("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>

                        {/* User Filter */}
                        <div className="min-w-[150px]">
                            <Select value={userSearch} onValueChange={setUserSearch}>
                                <SelectTrigger className="h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-[11px] font-bold rounded-xl">
                                    <SelectValue placeholder="Por Usuário" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                    <SelectItem value="all" className="text-[11px] font-bold">Todos Usuários</SelectItem>
                                    {availableUsers?.map(u => (
                                        <SelectItem key={u.id} value={u.id} className="text-[11px] font-bold">{u.full_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Bimester Filter */}
                        <div className="min-w-[150px]">
                            <Select value={bimestre} onValueChange={handleBimesterChange}>
                                <SelectTrigger className="h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-[11px] font-bold rounded-xl">
                                    <SelectValue placeholder="Bimestre" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                    <SelectItem value="all" className="text-[11px] font-bold italic">Todos os Bimestres</SelectItem>
                                    <SelectItem value="1" className="text-[11px] font-bold">1º Bimestre (Jan-Fev)</SelectItem>
                                    <SelectItem value="2" className="text-[11px] font-bold">2º Bimestre (Mar-Abr)</SelectItem>
                                    <SelectItem value="3" className="text-[11px] font-bold">3º Bimestre (Mai-Jun)</SelectItem>
                                    <SelectItem value="4" className="text-[11px] font-bold">4º Bimestre (Jul-Ago)</SelectItem>
                                    <SelectItem value="5" className="text-[11px] font-bold">5º Bimestre (Set-Out)</SelectItem>
                                    <SelectItem value="6" className="text-[11px] font-bold">6º Bimestre (Nov-Dez)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Period Filter */}
                        <div className="flex items-center gap-2">
                            <Input 
                                type="date"
                                title="Data Inicial"
                                value={dateStart}
                                onChange={(e) => setDateStart(e.target.value)}
                                className="h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-[10px] font-bold rounded-xl uppercase"
                            />
                            <span className="text-zinc-400 text-xs text font-bold">até</span>
                            <Input 
                                type="date"
                                title="Data Final"
                                value={dateEnd}
                                onChange={(e) => setDateEnd(e.target.value)}
                                className="h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-[10px] font-bold rounded-xl uppercase"
                            />
                        </div>

                        {/* Year Current Button */}
                        <Button 
                            variant="outline"
                            onClick={handleCurrentYear}
                            className={cn(
                                "h-9 px-3 text-[10px] font-black uppercase rounded-xl transition-all border",
                                dateStart === `${currentYear}-01-01` && dateEnd === `${currentYear}-12-31` 
                                    ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
                                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-blue-600 hover:border-blue-200"
                            )}
                        >
                            Ver {currentYear} Inteiro
                        </Button>

                        {(oscSearch || userSearch !== "all" || dateStart || dateEnd) && (
                            <Button 
                                variant="ghost" 
                                onClick={clearFilters}
                                className="h-9 px-3 text-[10px] font-black uppercase text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                            >
                                <FilterX className="h-3.5 w-3.5 mr-2" />
                                Limpar
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-100 dark:border-zinc-800 hover:bg-transparent text-[11px] font-black uppercase tracking-widest text-zinc-400/80">
                                <TableHead className="px-8 py-4">Data e OSC</TableHead>
                                {isEmendas && (
                                    <TableHead className="py-4 font-black">Identificador</TableHead>
                                )}
                                <TableHead className="py-4 font-black">Técnicos</TableHead>
                                <TableHead className="py-4 font-black">Status</TableHead>
                                <TableHead className="py-4 font-black">Registrado por</TableHead>
                                <TableHead className="px-8 py-4 text-right font-black">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredVisits.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-zinc-500 font-medium">
                                        Nenhuma visita encontrada para os filtros aplicados.
                                    </TableCell>
                                </TableRow>
                            ) : filteredVisits.map((visit) => (
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
                                        <div className="flex flex-col gap-1.5">
                                            {visit.status === 'finalized' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 uppercase tracking-wider w-fit">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Finalizado
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 uppercase tracking-wider w-fit">
                                                    <Edit2 className="h-3 w-3" />
                                                    Rascunho
                                                </span>
                                            )}
                                            {visit.is_delegated && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 uppercase tracking-wider w-fit">
                                                    <UserCheck className="h-3 w-3" />
                                                    Atribuído a você
                                                </span>
                                            )}
                                        </div>
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
                                                {visit.parecer_tecnico?.status === 'finalized' ? 'Relatório de Visita' :
                                                    visit.parecer_tecnico?.status === 'draft' ? 'Relatório de Visita (Rascunho)' : 'Relatório de Visita'}
                                            </Button>

                                            {(isAdmin || role === 'diretor') && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setDelegatingVisit(visit)
                                                        setSelectedUserIds(visit.delegated_to || [])
                                                        setSelectedDirIds(visit.delegated_directorates || [])
                                                    }}
                                                    title="Delegar Visita"
                                                    className="h-9 w-9 rounded-xl text-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
                                                >
                                                    <UserCheck className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {(isAdmin || role === 'diretor') && visit.status === 'finalized' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRevert(visit.id, visit.oscs?.name)}
                                                    disabled={revertingId === visit.id}
                                                    title="Reverter para Rascunho"
                                                    className="h-9 w-9 rounded-xl text-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-all border border-transparent hover:border-amber-100"
                                                >
                                                    {revertingId === visit.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Edit2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            )}
                                            {isAdmin && (
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

            <Dialog open={!!delegatingVisit} onOpenChange={(open) => !open && setDelegatingVisit(null)}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800 shadow-2xl rounded-[2rem]">
                    <DialogHeader className="pt-6">
                        <DialogTitle className="text-xl font-bold text-blue-900 dark:text-blue-100 flex items-center gap-3">
                            <UserCheck className="h-6 w-6" />
                            Delegar Visita (Múltiplos)
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium text-zinc-500 pt-2">
                            Selecione os usuários que poderão editar e assinar a visita à <span className="text-blue-900 dark:text-blue-100 font-bold">{delegatingVisit?.oscs?.name}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-2 space-y-4">
                        <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                            <button
                                onClick={() => setDelegationTab('users')}
                                className={cn(
                                    "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                    delegationTab === 'users' ? "bg-white dark:bg-zinc-900 text-blue-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                                )}
                            >Técnicos ({selectedUserIds.length})</button>
                            <button
                                onClick={() => setDelegationTab('directorates')}
                                className={cn(
                                    "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                    delegationTab === 'directorates' ? "bg-white dark:bg-zinc-900 text-blue-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                                )}
                            >Diretorias ({selectedDirIds.length})</button>
                        </div>

                        <div className="bg-zinc-50/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest">
                                    {delegationTab === 'users' ? 'Selecionar Técnicos' : 'Selecionar Diretorias'}
                                </label>
                                <Button 
                                    variant="link" 
                                    className="h-auto p-0 text-[10px] font-bold text-blue-600"
                                    onClick={() => delegationTab === 'users' ? setSelectedUserIds([]) : setSelectedDirIds([])}
                                >
                                    Limpar
                                </Button>
                            </div>
                            
                            <div className="max-h-[250px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                {delegationTab === 'users' ? (
                                    availableUsers?.length === 0 ? (
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
                                    )
                                ) : (
                                    availableDirectorates?.length === 0 ? (
                                        <p className="text-xs text-zinc-400 py-4 text-center">Nenhuma diretoria encontrada.</p>
                                    ) : (
                                        availableDirectorates?.map((d) => (
                                            <div key={d.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white dark:hover:bg-zinc-900 transition-colors">
                                                <Checkbox 
                                                    id={`dir-${d.id}`} 
                                                    checked={selectedDirIds.includes(d.id)}
                                                    onCheckedChange={() => toggleDirSelection(d.id)}
                                                    className="rounded-md border-zinc-300 data-[state=checked]:bg-blue-600"
                                                />
                                                <Label 
                                                    htmlFor={`dir-${d.id}`}
                                                    className="text-sm font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer flex-1"
                                                >
                                                    {d.name}
                                                </Label>
                                            </div>
                                        ))
                                    )
                                )}
                            </div>
                        </div>
                        <p className="text-[10px] text-zinc-400 italic pl-1 leading-snug">
                            {delegationTab === 'users' 
                                ? "Técnicos selecionados poderão editar e assinar a visita."
                                : "Todos os membros da diretoria selecionada terão acesso a esta visita."}
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
                                    await delegateVisit(delegatingVisit.id, selectedUserIds, selectedDirIds)
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
                            {isDelegating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processando</> : `Confirmar (${selectedUserIds.length + selectedDirIds.length})`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
