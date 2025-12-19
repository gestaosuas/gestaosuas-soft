
import { getCachedDirectorate } from "@/app/dashboard/cached-data"
import { notFound } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, FileText, BarChart3, PieChart, FilePlus, FolderOpen, Database, Settings } from "lucide-react"
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

    const normalizedName = directorate.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    const isSINE = normalizedName.includes('sine') || id === 'd9f66b00-4782-4fc3-a064-04029529054b'
    const isCP = normalizedName.includes('formacao') || normalizedName.includes('profissional') || normalizedName.includes('centro') || id === 'd9f66b00-4782-4fc3-a064-04029529054b'
    const isBeneficios = normalizedName.includes('beneficios') || id === 'efaf606a-53ae-4bbc-996c-79f4354ce0f9'

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

            {(isSINE || isCP) ? (
                // Layout específico para Formação Profissional e SINE
                <div className="space-y-12">
                    {/* Seção Relatório Diário (Novo) */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 border-l-4 border-indigo-500 pl-3">
                            Gestão Diária
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Link href={`/dashboard/relatorios/diario/novo?directorate_id=${directorate.id}`} className="group relative block w-full">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                                <Card className="relative h-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-indigo-100 dark:border-indigo-900/30 overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-indigo-500/20">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <FileText className="w-32 h-32 text-indigo-600 -rotate-12 translate-x-10 -translate-y-10" />
                                    </div>
                                    <CardHeader className="relative z-10">
                                        <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                                            <FileText className="h-7 w-7" />
                                        </div>
                                        <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                            Relatório Diário
                                        </CardTitle>
                                        <CardDescription className="text-sm mt-2">
                                            Preencher indicadores diários para o Painel Geral.
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
                        </div>
                    </div>

                    {/* Seção SINE */}
                    {isSINE && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 border-l-4 border-blue-500 pl-3">
                                SINE
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <Link href={`/dashboard/relatorios/novo?setor=sine&directorate_id=${directorate.id}`} className="group relative block w-full">
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
                                                Enviar Indicadores
                                            </CardTitle>
                                            <CardDescription className="text-sm mt-2">
                                                Indicadores numéricos do SINE.
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                </Link>

                                <Link href={`/dashboard/relatorios/mensal?setor=sine&directorate_id=${directorate.id}`} className="group relative block w-full">
                                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                                    <Card className="relative h-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-amber-100 dark:border-amber-900/30 overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-amber-500/20">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <FileText className="w-32 h-32 text-amber-600 -rotate-12 translate-x-10 -translate-y-10" />
                                        </div>
                                        <CardHeader className="relative z-10">
                                            <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                                                <FileText className="h-7 w-7" />
                                            </div>
                                            <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-amber-600 transition-colors">
                                                Criar Relatório Mensal
                                            </CardTitle>
                                            <CardDescription className="text-sm mt-2">
                                                Relatório descritivo com textos e tabelas.
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                </Link>

                                <Link href={`/dashboard/relatorios/lista?setor=sine&directorate_id=${directorate.id}`} className="group relative block w-full">
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                                    <Card className="relative h-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-emerald-100 dark:border-emerald-900/30 overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-emerald-500/20">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <FolderOpen className="w-32 h-32 text-emerald-600 -rotate-12 translate-x-10 -translate-y-10" />
                                        </div>
                                        <CardHeader className="relative z-10">
                                            <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                                                <FolderOpen className="h-7 w-7" />
                                            </div>
                                            <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                                Ver Relatórios
                                            </CardTitle>
                                            <CardDescription className="text-sm mt-2">
                                                Histórico de relatórios mensais enviados.
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                </Link>

                                <Link href={`/dashboard/dados?setor=sine&directorate_id=${directorate.id}`} className="group relative block w-full">
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

                                <Link href={`/dashboard/graficos?setor=sine&directorate_id=${directorate.id}`} className="group relative block w-full">
                                    <Card className="h-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-zinc-200 dark:border-zinc-800 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:border-indigo-500/30">
                                        <CardHeader>
                                            <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                                                <BarChart3 className="h-7 w-7" />
                                            </div>
                                            <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                                Dashboard SINE
                                            </CardTitle>
                                            <CardDescription className="text-sm mt-2">
                                                Gráficos e estatísticas visuais.
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            </div>
                        </div>
                    )}

                    {isCP && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 border-l-4 border-violet-500 pl-3">
                                Centros Profissionalizantes
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <Link href={`/dashboard/relatorios/novo?setor=centros&directorate_id=${directorate.id}`} className="group relative block w-full">
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

                                <Link href={`/dashboard/dados?setor=centros&directorate_id=${directorate.id}`} className="group relative block w-full">
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

                                <Link href={`/dashboard/graficos?setor=centros&directorate_id=${directorate.id}`} className="group relative block w-full">
                                    <Card className="h-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-zinc-200 dark:border-zinc-800 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:border-purple-500/30">
                                        <CardHeader>
                                            <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                                                <BarChart3 className="h-7 w-7" />
                                            </div>
                                            <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 transition-colors">
                                                Dashboard CP
                                            </CardTitle>
                                            <CardDescription className="text-sm mt-2">
                                                Gráficos e indicadores dos Centros.
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            ) : isBeneficios ? (
                // Layout específico para Benefícios
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1: Enviar Relatório */}
                    <Link href={`/dashboard/relatorios/novo?setor=beneficios&directorate_id=${directorate.id}`} className="group relative block w-full">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                        <Card className="relative h-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-pink-100 dark:border-pink-900/30 overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-pink-500/20">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <FileText className="w-32 h-32 text-pink-600 -rotate-12 translate-x-10 -translate-y-10" />
                            </div>
                            <CardHeader className="relative z-10">
                                <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform duration-300">
                                    <FileText className="h-7 w-7" />
                                </div>
                                <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-pink-600 transition-colors">
                                    Enviar Indicadores
                                </CardTitle>
                                <CardDescription className="text-sm mt-2">
                                    Preencher indicadores mensais de benefícios.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    {/* Card 2: Dados */}
                    <Link href={`/dashboard/dados?setor=beneficios&directorate_id=${directorate.id}`} className="group relative block w-full">
                        <Card className="h-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-zinc-200 dark:border-zinc-800 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:border-rose-500/30">
                            <CardHeader>
                                <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform duration-300">
                                    <BarChart3 className="h-7 w-7" />
                                </div>
                                <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-rose-600 transition-colors">
                                    Dados
                                </CardTitle>
                                <CardDescription className="text-sm mt-2">
                                    Tabela consolidada dos registros.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    {/* Card 3: Dashboard */}
                    <Link href={`/dashboard/graficos?setor=beneficios&directorate_id=${directorate.id}`} className="group relative block w-full">
                        <Card className="h-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-zinc-200 dark:border-zinc-800 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:border-orange-500/30">
                            <CardHeader>
                                <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300">
                                    <Settings className="h-7 w-7" />
                                </div>
                                <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-orange-600 transition-colors">
                                    Dashboard
                                </CardTitle>
                                <CardDescription className="text-sm mt-2">
                                    Gráficos e visualização de indicadores.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                </div>
            ) : (
                // Layout Padrão para outras diretorias
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1: Lançar Relatório */}
                    <Link href={`/dashboard/relatorios/novo?directorate_id=${directorate.id}`} className="group relative block w-full">
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
                    <Link href={`/dashboard/dados?directorate_id=${directorate.id}`} className="group relative block w-full">
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
                    <Link href={`/dashboard/graficos?directorate_id=${directorate.id}`} className="group relative block w-full">
                        <Card className="h-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-zinc-200 dark:border-zinc-800 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:border-indigo-500/30">
                            <CardHeader>
                                <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                                    <BarChart3 className="h-7 w-7" />
                                </div>
                                <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                    Dashboard Analítico
                                </CardTitle>
                                <CardDescription className="text-base mt-2">
                                    Gráficos de evolução exclusivos de {directorate.name}.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
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
