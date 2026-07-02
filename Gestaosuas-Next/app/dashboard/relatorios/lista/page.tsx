"use client"

import { useEffect, useState, Suspense } from "react"
import { notFound, redirect, useSearchParams } from "next/navigation"
import { listMonthlyNarratives, deleteMonthlyNarrative, getDirectorateSimple, getUserRole } from "@/app/dashboard/actions-narrative"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, ArrowLeft, History, Trash2, Loader2, Search } from "lucide-react"
import Link from "next/link"

function HistoryList() {
    const searchParams = useSearchParams()
    const directorate_id = searchParams.get('directorate_id')
    const sector = searchParams.get('setor')

    const [reports, setReports] = useState<any[]>([])
    const [directorate, setDirectorate] = useState<any>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            if (!directorate_id || !sector) return

            // Use server action to check role (bypasses RLS)
            const userInfo = await getUserRole()
            if (!userInfo) {
                redirect('/login')
                return
            }
            setIsAdmin(userInfo.role === 'admin')

            const dir = await getDirectorateSimple(directorate_id)
            setDirectorate(dir)

            const data = await listMonthlyNarratives(directorate_id, sector)
            setReports(data || [])
            setLoading(false)
        }
        fetchData()
    }, [directorate_id, sector])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Carregando Histórico...</p>
            </div>
        )
    }

    if (!directorate || !sector) return notFound()

    const monthName = (m: number) => {
        return new Date(0, m - 1).toLocaleString('pt-BR', { month: 'long' })
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm("Deseja realmente excluir este relatório? Esta ação é irreversível.")) return

        setDeletingId(id)
        const result = await deleteMonthlyNarrative(id)

        if (result.success) {
            setReports(reports.filter(r => r.id !== id))
        } else {
            alert(result.error || "Erro ao excluir")
        }
        setDeletingId(null)
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-zinc-500 text-sm font-bold uppercase tracking-wider">
                        <History className="w-4 h-4" /> Histórico de Documentos
                    </div>
                    <h1 className="text-4xl font-black text-blue-900 dark:text-blue-50 tracking-tighter uppercase leading-none">
                        {directorate.name}
                    </h1>
                    <p className="text-zinc-500 font-medium font-bold uppercase tracking-tight">
                        Setor: <span className="text-blue-600">{sector.replace(/_/g, ' ')}</span>
                        {isAdmin && <span className="ml-3 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">Modo Admin</span>}
                    </p>
                </div>
                <Button variant="outline" asChild className="h-12 border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl">
                    <Link href={`/dashboard/diretoria/${directorate_id}`}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Painel da Diretoria
                    </Link>
                </Button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.length === 0 ? (
                    <Card className="col-span-full py-20 border-dashed border-2 border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10">
                        <div className="w-16 h-16 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center shadow-sm mb-4">
                            <Search className="w-8 h-8 text-zinc-300" />
                        </div>
                        <p className="font-bold uppercase tracking-widest text-[10px]">Nenhum relatório encontrado para este setor</p>
                    </Card>
                ) : (
                    reports.map((report) => (
                        <Card key={report.id} className="group border-none bg-white dark:bg-zinc-950 overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-800 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isAdmin && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 font-bold px-3 text-[10px] tracking-tight transition-colors"
                                                onClick={() => handleDelete(report.id)}
                                                disabled={deletingId === report.id}
                                            >
                                                {deletingId === report.id
                                                    ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                                                    : <Trash2 className="w-3 h-3 mr-1.5" />
                                                }
                                                EXCLUIR
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                                            <Link href={`/dashboard/relatorios/visualizar/${report.id}`}>
                                                <FileText className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-black text-blue-900 dark:text-blue-50 capitalize">{monthName(report.month)}</h3>
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-tighter mt-0.5">Relatório Mensal</p>
                                </div>
                                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">
                                        Efetivado em {new Date(report.created_at).toLocaleDateString('pt-BR')}
                                    </span>
                                    <Link href={`/dashboard/relatorios/visualizar/${report.id}`} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                                        VER →
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}

export default function HistoryPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
            <HistoryList />
        </Suspense>
    )
}
