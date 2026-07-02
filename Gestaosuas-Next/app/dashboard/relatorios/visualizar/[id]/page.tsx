"use client"

import { notFound, redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { getMonthlyNarrativeById } from "@/app/dashboard/actions-narrative"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, ArrowLeft, Printer, History, User } from "lucide-react"
import Link from "next/link"
import React, { useEffect, useState } from "react"

export default function ViewReportPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const [report, setReport] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReport = async () => {
            const { id } = await params
            const data = await getMonthlyNarrativeById(id)
            if (!data) {
                setLoading(false)
                return
            }
            setReport(data)
            setLoading(false)
        }
        fetchReport()
    }, [params])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Preparando Relatório...</p>
            </div>
        )
    }

    if (!report) {
        return notFound()
    }

    const monthName = (m: number) => {
        return new Date(0, m - 1).toLocaleString('pt-BR', { month: 'long' })
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-8 pb-32">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-3">
                    <Button variant="outline" asChild>
                        <Link href={`/dashboard/relatorios/lista?setor=${report.setor}&directorate_id=${report.directorate_id}`}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar Histórico
                        </Link>
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold" onClick={() => window.print()}>
                        <Printer className="w-4 h-4 mr-2" /> Gerar PDF / Imprimir
                    </Button>
                </div>
            </div>

            {/* Document Content */}
            <Card className="border-none shadow-none print:shadow-none bg-white dark:bg-zinc-950 overflow-hidden">
                <CardContent className="p-4 md:p-12 space-y-8">
                    {/* Simplified Header */}
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl md:text-5xl font-black text-blue-900 dark:text-blue-50 tracking-tighter uppercase">
                            Relatório Mensal
                        </h1>
                        
                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-bold uppercase tracking-tight text-zinc-500">
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {monthName(report.month)} / {report.year}
                            </span>
                            <span className="text-zinc-400">
                                Enviado por: <span className="text-zinc-700 dark:text-zinc-300 ml-1 font-black">{report.profiles?.full_name || 'Usuário'}</span>
                            </span>
                        </div>
                    </div>

                    <div className="h-px bg-zinc-200 dark:bg-zinc-800 report-divider" />

                    {/* Report Content Only */}
                    <div className="mt-10 prose prose-zinc dark:prose-invert max-w-none prose-lg prose-blue">
                        <div 
                          className="report-content"
                          dangerouslySetInnerHTML={{ __html: report.content?.html || report.content || '' }} 
                        />
                    </div>
                </CardContent>
            </Card>

            <style dangerouslySetInnerHTML={{ __html: `
                .report-content table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 2rem;
                }
                .report-content th, .report-content td {
                    border: 1px solid #e5e7eb;
                    padding: 12px;
                    text-align: left;
                }
                .report-content th {
                    background-color: #f9fafb;
                    font-weight: 800;
                    text-transform: uppercase;
                    font-size: 0.75rem;
                    color: #111827;
                }
                .dark .report-content th {
                    background-color: #1f2937;
                    color: #f9fafb;
                    border-color: #374151;
                }
                .dark .report-content td {
                    border-color: #374151;
                }
                @media print {
                    body { background: white !important; }
                    .print\\:hidden { display: none !important; }
                    @page { margin: 1cm; size: A4 landscape; }
                    .report-content th { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; }
                    .report-divider { border-bottom: 2px solid #e5e7eb !important; -webkit-print-color-adjust: exact; }
                }
            ` }} />
        </div>
    )
}
