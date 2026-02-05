'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Building2, Search } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface OSC {
    id: string
    name: string
    [key: string]: any
}

interface PlanoTrabalhoClientProps {
    directorateId: string
    oscs: OSC[]
    profile: any
    planCounts: Record<string, number>
    logoUrl?: string
}

import { WorkPlansManager } from "./work-plans-manager"
import { AlertCircle, FileCheck } from "lucide-react"

export function PlanoTrabalhoClient({ directorateId, oscs, profile, planCounts, logoUrl }: PlanoTrabalhoClientProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedOsc, setSelectedOsc] = useState<OSC | null>(null)

    const sortedOscs = [...oscs].sort((a, b) => a.name.localeCompare(b.name))

    const filteredOscs = sortedOscs.filter(osc =>
        osc.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <Link href={`/dashboard/diretoria/${directorateId}`}>
                        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">
                            <ArrowLeft className="h-5 w-5 text-zinc-500" />
                        </Button>
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-extrabold tracking-tight text-blue-900 dark:text-blue-50">
                            Plano de Trabalho
                        </h1>
                        <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400">
                            Selecione uma organização para gerenciar seu plano de trabalho.
                        </p>
                    </div>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        placeholder="Buscar por nome ou iniciais..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-11 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 rounded-xl transition-all"
                    />
                </div>
            </div>

            {/* OSC Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {oscs.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                        <Building2 className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mb-4" />
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Nenhuma OSC cadastrada</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 text-center">
                            Cadastre uma nova OSC na página anterior para vê-la listada aqui.
                        </p>
                    </div>
                ) : filteredOscs.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                        <Search className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mb-4" />
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Nenhum resultado encontrado</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 text-center">
                            Não encontramos nenhuma OSC com o termo "{searchTerm}".
                        </p>
                    </div>
                ) : (
                    filteredOscs.map((osc) => {
                        const count = planCounts[osc.id] || 0
                        return (
                            <Card
                                key={osc.id}
                                onClick={() => setSelectedOsc(osc)}
                                className="group bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-sm hover:border-blue-600 dark:hover:border-blue-400 transition-all rounded-xl cursor-pointer hover:shadow-md h-full flex flex-col justify-between"
                            >
                                <div className="p-4 flex items-start justify-between gap-3">
                                    <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100 leading-tight">
                                        {osc.name}
                                    </h3>
                                </div>
                                <div className="px-4 pb-4">
                                    {count > 0 ? (
                                        <div className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                                            <FileCheck className="h-3 w-3" />
                                            {count} {count === 1 ? 'Plano' : 'Planos'}
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-zinc-100 text-zinc-500 text-[10px] font-bold uppercase tracking-wider border border-zinc-200">
                                            <AlertCircle className="h-3 w-3" />
                                            Pendente
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )
                    })
                )}
            </div>

            <WorkPlansManager
                osc={selectedOsc}
                directorateId={directorateId}
                profile={profile}
                isOpen={!!selectedOsc}
                onOpenChange={(open) => !open && setSelectedOsc(null)}
                logoUrl={logoUrl}
            />
        </div>
    )
}
