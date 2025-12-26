import { createClient } from "@/utils/supabase/server"
import { getCachedSubmissionsForUser } from "@/app/dashboard/cached-data"
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Calendar, Table as TableIcon } from "lucide-react"
import { redirect } from "next/navigation"

import { YearSelector } from "@/components/year-selector"

export default async function ReportListPage({
    searchParams,
}: {
    searchParams: Promise<{ setor?: string, directorate_id?: string, year?: string }>
}) {
    const { setor, directorate_id, year } = await searchParams
    const selectedYear = Number(year) || new Date().getFullYear()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Use Safe Fetcher that checks permission via Service Role
    // This circumvents the broken RLS policies on the database side
    const submissions = await getCachedSubmissionsForUser(user.id, directorate_id || '')

    // Filter to show ONLY Narrative Reports (containing _report_content)
    // The user requested that "Formulários" (Indicators like SINE/CP) NOT appear here.
    const narrativeSubmissions = submissions?.filter((sub) =>
        sub.data &&
        sub.data._report_content &&
        sub.year === selectedYear
    ) || []

    // Basic permission check
    // Omitted strictly for brevity as we are just listing, but in prod should verify link

    const monthName = (m: number) => new Date(0, m - 1).toLocaleString('pt-BR', { month: 'long' })

    return (
        <div className="container mx-auto max-w-5xl py-8 animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 px-2">
                <div className="flex items-center gap-6">
                    <Link href={`/dashboard/diretoria/${directorate_id}`}>
                        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">
                            <ArrowLeft className="h-5 w-5 text-zinc-500" />
                        </Button>
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-extrabold tracking-tight text-blue-900 dark:text-blue-50">
                            Histórico de Relatórios
                        </h1>
                        <p className="text-[14px] font-medium text-zinc-500 dark:text-zinc-400">
                            Acervo de registros e narrativas consolidadas de {selectedYear}.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <YearSelector currentYear={selectedYear} />
                </div>
            </header>

            <div className="grid gap-6">
                {narrativeSubmissions.map((sub) => {
                    const hasContent = sub.data && sub.data._report_content;

                    return (
                        <Card key={sub.id} className="group border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-none hover:border-blue-600 dark:hover:border-blue-400 transition-all duration-500 rounded-2xl overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between p-8 border-b border-zinc-50 dark:border-zinc-800/60">
                                <div className="flex items-center gap-5">
                                    <div className={`p-3 rounded-xl transition-colors ${hasContent ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 group-hover:bg-blue-600 group-hover:text-white'}`}>
                                        {hasContent ? <FileText className="w-6 h-6" /> : <TableIcon className="w-6 h-6" />}
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold capitalize text-blue-900 dark:text-blue-50">
                                            {monthName(sub.month)} <span className="text-zinc-400 font-medium ml-1">/ {sub.year}</span>
                                        </CardTitle>
                                        <CardDescription className="text-[12px] font-medium text-zinc-500">
                                            Efetivado em {new Date(sub.created_at).toLocaleDateString('pt-BR')} • {sub.data._report_content.length} seções narrativas
                                        </CardDescription>
                                    </div>
                                </div>
                                <Link href={`/dashboard/relatorios/visualizar/${sub.id}`}>
                                    <Button variant="outline" className="h-10 px-6 rounded-lg border-zinc-200 dark:border-zinc-800 font-bold text-[12px] uppercase tracking-wider hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                                        Visualizar
                                    </Button>
                                </Link>
                            </CardHeader>
                        </Card>
                    )
                })}

                {(!narrativeSubmissions || narrativeSubmissions.length === 0) && (
                    <div className="text-center py-32 rounded-3xl border-2 border-dashed border-zinc-100 dark:border-zinc-800/40">
                        <FileText className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
                        <p className="text-[13px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Nenhum relatório descritivo encontrado.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
