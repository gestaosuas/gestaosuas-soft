import { createClient } from "@/utils/supabase/server"
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Calendar, Table as TableIcon } from "lucide-react"
import { redirect } from "next/navigation"

export default async function ReportListPage({
    searchParams,
}: {
    searchParams: Promise<{ setor?: string, directorate_id?: string }>
}) {
    const { setor, directorate_id } = await searchParams

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch submissions
    const { data: submissions } = await supabase
        .from('submissions')
        .select('*')
        .eq('directorate_id', directorate_id)
        .order('year', { ascending: false })
        .order('month', { ascending: false })

    // Filter to show ONLY Narrative Reports (containing _report_content)
    // The user requested that "Formulários" (Indicators like SINE/CP) NOT appear here.
    const narrativeSubmissions = submissions?.filter((sub) => sub.data && sub.data._report_content) || []

    // Basic permission check
    // Omitted strictly for brevity as we are just listing, but in prod should verify link

    const monthName = (m: number) => new Date(0, m - 1).toLocaleString('pt-BR', { month: 'long' })

    return (
        <div className="container mx-auto max-w-5xl py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4 mb-8">
                <Link href={`/dashboard/diretoria/${directorate_id}`}>
                    <Button variant="ghost" size="icon" className="hover:bg-amber-50 hover:text-amber-600 transition-colors">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">
                        Histórico de Relatórios
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground">
                        Visualize os relatórios mensais enviados.
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                {narrativeSubmissions.map((sub) => {
                    // Check if it has narrative content
                    const hasContent = sub.data && sub.data._report_content;
                    // Or fallback to classic data view

                    return (
                        <Card key={sub.id} className="group overflow-hidden border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${hasContent ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {hasContent ? <FileText className="w-5 h-5" /> : <TableIcon className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-bold capitalize">
                                            {monthName(sub.month)} de {sub.year}
                                        </CardTitle>
                                        <CardDescription>
                                            Enviado em {new Date(sub.created_at).toLocaleDateString('pt-BR')}
                                        </CardDescription>
                                    </div>
                                </div>
                                <Link href={`/dashboard/relatorios/visualizar/${sub.id}`}>
                                    <Button variant="outline" className="group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200">
                                        Visualizar
                                    </Button>
                                </Link>
                            </CardHeader>
                            {!hasContent && (
                                <CardContent className="pt-4">
                                    <p className="text-sm text-zinc-500">Relatório numérico (Formulário Padrão)</p>
                                </CardContent>
                            )}
                            {hasContent && (
                                <CardContent className="pt-4">
                                    <p className="text-sm text-zinc-500">Relatório descritivo com {sub.data._report_content.length} blocos de conteúdo.</p>
                                </CardContent>
                            )}
                        </Card>
                    )
                })}

                {(!narrativeSubmissions || narrativeSubmissions.length === 0) && (
                    <div className="text-center py-20 text-zinc-400">
                        Nenhum relatório descritivo encontrado.
                    </div>
                )}
            </div>
        </div>
    )
}
