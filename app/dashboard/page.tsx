import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { FilePlus, BarChart3, Database } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Carregando...</div>

    const { data: profile } = await supabase
        .from('profiles')
        .select('*, directorates(*)')
        .eq('id', user.id)
        .single()

    const directorateName = profile?.directorates?.name || "Sem Diretoria"

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative">
                <div className="absolute -left-10 -top-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
                <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                    {directorateName}
                </h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
                    Bem-vindo ao seu painel de comando. Gerencie relatórios e visualize indicadores com agilidade.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Card 1: Lançar Relatório (Destaque Principal) */}
                <Link href="/dashboard/relatorios/novo" className="group relative block w-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                    <Card className="relative h-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-indigo-100 dark:border-indigo-900/30 overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-indigo-500/20">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FilePlus className="w-32 h-32 text-indigo-600 -rotate-12 translate-x-10 -translate-y-10" />
                        </div>
                        <CardHeader className="relative z-10">
                            <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                                <FilePlus className="h-7 w-7" />
                            </div>
                            <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                Lançar Relatório
                            </CardTitle>
                            <CardDescription className="text-base mt-2">
                                Preencher e enviar os indicadores do mês corrente com validação inteligente.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                {/* Card 2: Meus Dados */}
                <Link href="/dashboard/dados" className="group relative block w-full">
                    <Card className="h-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-zinc-200 dark:border-zinc-800 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:border-emerald-500/30">
                        <CardHeader>
                            <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                                <Database className="h-7 w-7" />
                            </div>
                            <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                Meus Dados
                            </CardTitle>
                            <CardDescription className="text-base mt-2">
                                Tabela consolidada anual. Visualize seu histórico completo de lançamentos.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                {/* Card 3: Dashboard (Futuro) */}
                <div className="group relative block w-full cursor-not-allowed opacity-60">
                    <Card className="h-full bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 border-dashed">
                        <CardHeader>
                            <div className="mb-6 h-14 w-14 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                                <BarChart3 className="h-7 w-7" />
                            </div>
                            <CardTitle className="text-xl font-bold text-zinc-500">
                                Dashboard Analítico
                            </CardTitle>
                            <CardDescription className="text-base mt-2">
                                Gráficos de evolução e comparativos mensais.
                                <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-500 uppercase tracking-wider">Em Breve</span>
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>

            {/* Status Section Modernized */}
            <div className="mt-12 p-1 rounded-3xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800">
                <div className="bg-white dark:bg-zinc-950 rounded-[22px] p-6">
                    <h3 className="font-bold text-zinc-800 dark:text-zinc-200 mb-6 flex items-center gap-3">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        Status do Sistema
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                <span className="font-medium text-sm">Banco de Dados</span>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">Ativo</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                <span className="font-medium text-sm">Google Sheets</span>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">Conectado</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
