'use client'

import { useState, useEffect } from "react"
import { ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { PopRuaForm } from "./pop-rua-form"
import { getPopRuaReport, deletePopRuaReport } from "@/app/dashboard/diretoria/[id]/pop-rua-actions"

export function PopRuaReportWrapper({
    directorateId,
    directorateName,
    isAdmin
}: {
    directorateId: string,
    directorateName: string,
    isAdmin: boolean
}) {
    const [month, setMonth] = useState<string>(String(new Date().getMonth() + 1))
    const [year, setYear] = useState<string>(String(new Date().getFullYear()))
    const [loading, setLoading] = useState(false)
    const [initialData, setInitialData] = useState<any>(null)
    const [alreadySubmitted, setAlreadySubmitted] = useState(false)

    useEffect(() => {
        let isMounted = true

        async function loadData() {
            setLoading(true)
            try {
                const data = await getPopRuaReport(directorateId, Number(month), Number(year))
                if (isMounted) {
                    setInitialData(data)
                    // If it has id, or inherited legacy id, it's submitted unless it's draft
                    setAlreadySubmitted(!!(data.id && data.status !== 'draft'))
                }
            } catch (err) {
                console.error("Error loading Pop Rua data", err)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        loadData()

        return () => { isMounted = false }
    }, [directorateId, month, year])

    const handleUnlock = async () => {
        if (!confirm("Isso irá apagar os dados atuais para permitir um novo preenchimento pelo usuário. Confirmar?")) {
            return
        }
        setLoading(true)
        try {
            const result = await deletePopRuaReport(directorateId, Number(month), Number(year))
            if (result.success) {
                setAlreadySubmitted(false)
                setInitialData({})
                alert("Preenchimento liberado com sucesso!")
            } else {
                alert("Erro ao liberar preenchimento.")
            }
        } catch (e) {
            console.error(e)
            alert("Erro ao liberar preenchimento.")
        } finally {
            setLoading(false)
        }
    }

    const monthName = new Date(0, Number(month) - 1).toLocaleString('pt-BR', { month: 'long' })

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-start gap-6">
                    <Link href={`/dashboard/diretoria/${directorateId}`}>
                        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all mt-1">
                            <ArrowLeft className="h-5 w-5 text-zinc-500" />
                        </Button>
                    </Link>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-extrabold tracking-tight text-blue-900 dark:text-blue-50">
                                Entrada de Dados
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                                    {directorateName}
                                </span>
                                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">População de Rua e Migrantes</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
                            <div className="flex items-center gap-3 pr-4 border-r border-zinc-100 dark:border-zinc-800/60">
                                <Calendar className="w-4 h-4 text-blue-900 dark:text-blue-400" />
                                <span className="text-[11px] font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Referência</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider hidden sm:block">Mês:</Label>
                                    <Select value={month} onValueChange={setMonth} disabled={loading}>
                                        <SelectTrigger className="h-9 w-[140px] bg-zinc-50/50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold uppercase tracking-tight">
                                            <SelectValue placeholder="Mês" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
                                                const currentDate = new Date()
                                                const currentMonth = currentDate.getMonth() + 1
                                                const currentYear = currentDate.getFullYear()
                                                let isDisabled = false
                                                if (!isAdmin) {
                                                    if (parseInt(year) > currentYear) isDisabled = true
                                                    else if (parseInt(year) === currentYear && m > currentMonth) isDisabled = true
                                                }
                                                return (
                                                    <SelectItem key={m} value={String(m)} disabled={isDisabled} className="uppercase text-[11px] font-bold py-2">
                                                        {new Date(0, m - 1).toLocaleString('pt-BR', { month: 'short' })}
                                                    </SelectItem>
                                                )
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider hidden sm:block">Ano:</Label>
                                    <Select value={year} onValueChange={setYear} disabled={loading}>
                                        <SelectTrigger className="h-9 w-[100px] bg-zinc-50/50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold tracking-tight">
                                            <SelectValue placeholder="Ano" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 3 }, (_, i) => 2024 + i).map(y => (
                                                <SelectItem key={y} value={String(y)} className="text-[11px] font-bold py-2">{y}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full">
                {loading ? (
                    <div className="flex justify-center p-12"><span className="text-zinc-500 font-bold uppercase text-xs">Carregando dados...</span></div>
                ) : (
                    <>
                        {alreadySubmitted && !isAdmin && (
                            <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4 text-amber-800">
                                <p className="text-[13px] leading-relaxed opacity-90">
                                    Os dados para <strong>{monthName} de {year}</strong> já foram enviados para este período e não podem ser editados.
                                </p>
                            </div>
                        )}

                        {alreadySubmitted && isAdmin && (
                            <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-blue-800">
                                <div>
                                    <p className="font-bold text-[15px] mb-1">Registro Existente (Modo Admin)</p>
                                    <p className="text-[13px] leading-relaxed opacity-90">
                                        Já existe um envio para este período. Você pode editar os dados abaixo ou liberar para um novo preenchimento.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleUnlock}
                                    disabled={loading}
                                    className="shrink-0 border-blue-200 hover:bg-blue-100 text-blue-700 font-bold text-[10px] uppercase tracking-wider h-10 px-4"
                                >
                                    Liberar Novo Preenchimento
                                </Button>
                            </div>
                        )}

                        {(!alreadySubmitted || isAdmin) && (
                            <PopRuaForm
                                key={`${month}-${year}`}
                                directorateId={directorateId}
                                month={Number(month)}
                                year={Number(year)}
                                initialData={initialData || {}}
                                isAdmin={isAdmin}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
