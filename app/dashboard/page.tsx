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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{directorateName}</h1>
                <p className="text-muted-foreground mt-1">Bem-vindo ao painel de gestão.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/dashboard/relatorios/novo" className="group">
                    <Card className="h-full border-zinc-200 dark:border-zinc-800 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer bg-white dark:bg-zinc-950">
                        <CardHeader>
                            <div className="mb-4 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                                <FilePlus className="h-6 w-6" />
                            </div>
                            <CardTitle className="group-hover:text-primary transition-colors">Lançar Relatório</CardTitle>
                            <CardDescription>
                                Preencher e enviar os indicadores do mês corrente ou anteriores.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/dashboard/dados" className="group">
                    <Card className="h-full border-zinc-200 dark:border-zinc-800 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer bg-white dark:bg-zinc-950">
                        <CardHeader>
                            <div className="mb-4 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                                <Database className="h-6 w-6" />
                            </div>
                            <CardTitle className="group-hover:text-primary transition-colors">Meus Dados</CardTitle>
                            <CardDescription>
                                Visualizar tabela consolidada anual de indicadores.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <div className="group opacity-50 cursor-not-allowed">
                    <Card className="h-full border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                        <CardHeader>
                            <div className="mb-4 h-12 w-12 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                                <BarChart3 className="h-6 w-6" />
                            </div>
                            <CardTitle className="text-zinc-500">Dashboard</CardTitle>
                            <CardDescription>
                                Indicadores visuais e gráficos de acompanhamento.
                                <span className="block mt-2 text-xs font-semibold uppercase tracking-wider text-primary">Em Breve</span>
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    Status do Sistema
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex justify-between p-3 bg-white dark:bg-zinc-950 rounded border border-zinc-100 dark:border-zinc-800">
                        <span>Conexão Supabase</span>
                        <span className="text-emerald-600 font-medium">Ativa</span>
                    </div>
                    <div className="flex justify-between p-3 bg-white dark:bg-zinc-950 rounded border border-zinc-100 dark:border-zinc-800">
                        <span>Integração Google Sheets</span>
                        <span className="text-emerald-600 font-medium">Configurada</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
