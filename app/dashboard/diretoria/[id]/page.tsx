import { getCachedDirectorate } from "@/app/dashboard/cached-data"
import { notFound } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FilePlus, BarChart3, Database } from "lucide-react"
import Link from "next/link"

export default async function DirectoratePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const directorate = await getCachedDirectorate(id)

    if (!directorate) {
        return notFound()
    }

    const isSineFormation = directorate.name.toLowerCase().includes('formação profissional') && directorate.name.toLowerCase().includes('sine')

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative">
                <div className="absolute -left-10 -top-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
                <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">
                    {directorate.name}
                </h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
                    Painel de Monitoramento e Indicadores. Gerencie as informações desta diretoria.
                </p>
            </div>

            {isSineFormation ? (
                // Layout específico para Formação Profissional e SINE
                <div className="space-y-12">
                    {/* Seção SINE */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 border-l-4 border-blue-500 pl-3">
                            SINE
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Link href="/dashboard/relatorios/novo?setor=sine" className="group relative block w-full">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                                <Card className="relative h-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-blue-100 dark:border-blue-900/30 overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-blue-500/20">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <FilePlus className="w-32 h-32 text-blue-600 -rotate-12 translate-x-10 -translate-y-10" />
                                    </div>
                                    <CardHeader className="relative z-10">
                                        <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                                            <FilePlus className="h-7 w-7" />
                                        </div>
                                        <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                            Enviar Relatório SINE
                                        </CardTitle>
                                        <CardDescription className="text-sm mt-2">
                                            Indicadores do Sistema Nacional de Emprego.
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>

                            <Link href="/dashboard/dados?setor=sine" className="group relative block w-full">
                                <Card className="h-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-zinc-200 dark:border-zinc-800 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:border-cyan-500/30">
                                    <CardHeader>
                                        <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
                                            <Database className="h-7 w-7" />
                                        </div>
                                        <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-cyan-600 transition-colors">
                                            Dados SINE
                                        </CardTitle>
                                        <CardDescription className="text-sm mt-2">
                                            Histórico de lançamentos do SINE.
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>

                            <div className="group relative block w-full cursor-not-allowed opacity-60">
                                <Card className="h-full bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 border-dashed">
                                    <CardHeader>
                                        <div className="mb-6 h-14 w-14 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                                            <BarChart3 className="h-7 w-7" />
                                        </div>
                                        <CardTitle className="text-xl font-bold text-zinc-500">
                                            Dashboard SINE
                                        </CardTitle>
                                        <CardDescription className="text-sm mt-2">
                                            Gráficos e estatísticas.
                                            <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-500 uppercase tracking-wider">Em Breve</span>
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* Seção Centros Profissionalizantes */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 border-l-4 border-violet-500 pl-3">
                            Centros Profissionalizantes
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Link href="/dashboard/relatorios/novo?setor=centros" className="group relative block w-full">
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                                <Card className="relative h-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-violet-100 dark:border-violet-900/30 overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-violet-500/20">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <FilePlus className="w-32 h-32 text-violet-600 -rotate-12 translate-x-10 -translate-y-10" />
                                    </div>
                                    <CardHeader className="relative z-10">
                                        <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform duration-300">
                                            <FilePlus className="h-7 w-7" />
                                        </div>
                                        <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-violet-600 transition-colors">
                                            Enviar Relatório CP
                                        </CardTitle>
                                        <CardDescription className="text-sm mt-2">
                                            Indicadores dos Centros Profissionalizantes.
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>

                            <Link href="/dashboard/dados?setor=centros" className="group relative block w-full">
                                <Card className="h-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-zinc-200 dark:border-zinc-800 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:border-purple-500/30">
                                    <CardHeader>
                                        <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                                            <Database className="h-7 w-7" />
                                        </div>
                                        <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 transition-colors">
                                            Dados CP
                                        </CardTitle>
                                        <CardDescription className="text-sm mt-2">
                                            Histórico dos Centros.
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>

                            <div className="group relative block w-full cursor-not-allowed opacity-60">
                                <Card className="h-full bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 border-dashed">
                                    <CardHeader>
                                        <div className="mb-6 h-14 w-14 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                                            <BarChart3 className="h-7 w-7" />
                                        </div>
                                        <CardTitle className="text-xl font-bold text-zinc-500">
                                            Dashboard CP
                                        </CardTitle>
                                        <CardDescription className="text-sm mt-2">
                                            Gráficos dos Centros.
                                            <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-500 uppercase tracking-wider">Em Breve</span>
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Layout Padrão para outras diretorias
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1: Lançar Relatório */}
                    <Link href="/dashboard/relatorios/novo" className="group relative block w-full">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                        <Card className="relative h-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-blue-100 dark:border-blue-900/30 overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-blue-500/20">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <FilePlus className="w-32 h-32 text-blue-600 -rotate-12 translate-x-10 -translate-y-10" />
                            </div>
                            <CardHeader className="relative z-10">
                                <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                                    <FilePlus className="h-7 w-7" />
                                </div>
                                <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                    Lançar Relatório
                                </CardTitle>
                                <CardDescription className="text-base mt-2">
                                    Preencher e enviar os indicadores do mês corrente para {directorate.name}.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    {/* Card 2: Meus Dados */}
                    <Link href="/dashboard/dados" className="group relative block w-full">
                        <Card className="h-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-zinc-200 dark:border-zinc-800 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:border-cyan-500/30">
                            <CardHeader>
                                <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
                                    <Database className="h-7 w-7" />
                                </div>
                                <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-cyan-600 transition-colors">
                                    Meus Dados
                                </CardTitle>
                                <CardDescription className="text-base mt-2">
                                    Tabela consolidada anual da diretoria.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    {/* Card 3: Dashboard Analítico */}
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
                                    Gráficos de evolução exclusivos de {directorate.name}.
                                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-500 uppercase tracking-wider">Em Breve</span>
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-8 border border-blue-100 dark:border-blue-800 border-dashed text-center">
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Área Exclusiva</h3>
                <p className="text-zinc-500 max-w-lg mx-auto mt-2">
                    Ferramentas de gestão para <strong>{directorate.name}</strong>.
                </p>
            </div>
        </div>
    )
}
