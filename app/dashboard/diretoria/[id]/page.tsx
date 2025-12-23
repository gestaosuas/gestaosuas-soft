
import { getCachedDirectorate } from "@/app/dashboard/cached-data"
import { notFound } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, FileText, BarChart3, PieChart, FilePlus, FolderOpen, Database, Settings, ClipboardList } from "lucide-react"
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
    const isSubvencao = normalizedName.includes('subvencao') || id === '63553b96-3771-4842-9f45-630c7558adac'

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-1000">
            <header className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-blue-900 dark:text-blue-50">
                    {directorate.name}
                </h1>
                <p className="text-[15px] text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl leading-relaxed">
                    Painel de Monitoramento e Indicadores. Gerencie as operações e visualize a performance institucional desta unidade.
                </p>
            </header>

            {(isSINE || isCP) ? (
                <div className="space-y-16">
                    {/* Seção Gestão Diária */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                            <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Gestão Diária</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Link href={`/dashboard/relatorios/diario/novo?directorate_id=${directorate.id}`} className="group h-full">
                                <Card className="h-full bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:border-blue-600 dark:hover:border-blue-400 transition-all duration-500 rounded-2xl group-hover:translate-y-[-4px]">
                                    <CardHeader className="p-8">
                                        <div className="p-3 w-fit bg-zinc-50 dark:bg-zinc-800 rounded-xl group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-colors mb-6 shadow-sm">
                                            <FilePlus className="w-6 h-6 text-zinc-500 group-hover:text-white" />
                                        </div>
                                        <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100 transition-colors flex items-center gap-2">
                                            Relatório Diário
                                        </CardTitle>
                                        <CardDescription className="text-[13px] font-medium leading-relaxed text-zinc-500 dark:text-zinc-400 mt-2">
                                            Preencher indicadores operacionais do dia para consolidação no Painel Geral.
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
                        </div>
                    </section>

                    {/* SINE */}
                    {isSINE && (
                        <section className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="h-1 w-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                                <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">SINE • Operações</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: "Enviar Indicadores", desc: "Indicadores numéricos de desempenho", href: `/dashboard/relatorios/novo?setor=sine&directorate_id=${directorate.id}`, icon: FilePlus },
                                    { label: "Relatório Mensal", desc: "Consolidado descritivo do período", href: `/dashboard/relatorios/mensal?setor=sine&directorate_id=${directorate.id}`, icon: FileText },
                                    { label: "Ver Relatórios", desc: "Histórico de envios mensais", href: `/dashboard/relatorios/lista?setor=sine&directorate_id=${directorate.id}`, icon: FolderOpen },
                                    { label: "Dados SINE", desc: "Consulta ao banco de registros", href: `/dashboard/dados?setor=sine&directorate_id=${directorate.id}`, icon: Database },
                                ].map((item, idx) => (
                                    <Link key={idx} href={item.href} className="group">
                                        <Card className="h-full bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none hover:border-blue-600 dark:hover:border-blue-400 transition-all rounded-2xl group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                                            <CardHeader className="p-6">
                                                <div className="p-2.5 w-fit bg-zinc-50 dark:bg-zinc-800 rounded-lg group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-colors mb-4">
                                                    <item.icon className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                                                </div>
                                                <CardTitle className="text-[15px] font-bold text-blue-900 dark:text-blue-100 transition-colors">{item.label}</CardTitle>
                                                <CardDescription className="text-[12px] text-zinc-500 mt-1">{item.desc}</CardDescription>
                                            </CardHeader>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* CP */}
                    {isCP && (
                        <section className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="h-1 w-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                                <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Formação Profissional</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {[
                                    { label: "Enviar Relatório CP", desc: "Performance dos Centros", href: `/dashboard/relatorios/novo?setor=centros&directorate_id=${directorate.id}`, icon: FilePlus },
                                    { label: "Consulta de Dados", desc: "Histórico de procedimentos", href: `/dashboard/dados?setor=centros&directorate_id=${directorate.id}`, icon: Database },
                                    { label: "Analytics CP", desc: "Gráficos e visualização", href: `/dashboard/graficos?setor=centros&directorate_id=${directorate.id}`, icon: BarChart3 },
                                ].map((item, idx) => (
                                    <Link key={idx} href={item.href} className="group">
                                        <Card className="h-full bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none hover:border-blue-600 dark:hover:border-blue-400 transition-all rounded-2xl group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                                            <CardHeader className="p-6">
                                                <div className="p-2.5 w-fit bg-zinc-50 dark:bg-zinc-800 rounded-lg group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-colors mb-4">
                                                    <item.icon className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                                                </div>
                                                <CardTitle className="text-[15px] font-bold text-blue-900 dark:text-blue-100 transition-colors">{item.label}</CardTitle>
                                                <CardDescription className="text-[12px] text-zinc-500 mt-1">{item.desc}</CardDescription>
                                            </CardHeader>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            ) : isBeneficios ? (
                <section className="space-y-12">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                        <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Benefícios Sociais</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { label: "Enviar Indicadores", desc: "Métricas mensais de benefícios", href: `/dashboard/relatorios/novo?setor=beneficios&directorate_id=${directorate.id}`, icon: FilePlus },
                            { label: "Relatório Mensal", desc: "Consolidado qualitativo", href: `/dashboard/relatorios/mensal?setor=beneficios&directorate_id=${directorate.id}`, icon: FileText },
                            { label: "Histórico de Envios", desc: "Relatórios mensais anteriores", href: `/dashboard/relatorios/lista?setor=beneficios&directorate_id=${directorate.id}`, icon: FolderOpen },
                            { label: "Banco de Conhecimento", desc: "Dados consolidados", href: `/dashboard/dados?setor=beneficios&directorate_id=${directorate.id}`, icon: Database },
                            { label: "Painel de Resultados", desc: "Analytics e KPIs", href: `/dashboard/graficos?setor=beneficios&directorate_id=${directorate.id}`, icon: BarChart3 },
                        ].map((item, idx) => (
                            <Link key={idx} href={item.href} className="group">
                                <Card className="h-full bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none hover:border-blue-600 dark:hover:border-blue-400 transition-all rounded-2xl group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                                    <CardHeader className="p-8">
                                        <div className="p-3 w-fit bg-zinc-50 dark:bg-zinc-800 rounded-xl group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-colors mb-6 shadow-sm">
                                            <item.icon className="w-5 h-5 text-zinc-500 group-hover:text-white" />
                                        </div>
                                        <CardTitle className="text-base font-bold text-blue-900 dark:text-blue-100 transition-colors">{item.label}</CardTitle>
                                        <CardDescription className="text-[13px] text-zinc-500 mt-1 font-medium">{item.desc}</CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>
            ) : isSubvencao ? (
                <section className="space-y-12">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                        <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Gestão de OSCs</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link href={`/dashboard/diretoria/${directorate.id}/subvencao/oscs/novo`} className="group">
                            <Card className="h-full bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none hover:border-blue-600 dark:hover:border-blue-400 transition-all rounded-2xl group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                                <CardHeader className="p-8">
                                    <div className="p-3 w-fit bg-zinc-50 dark:bg-zinc-800 rounded-xl group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-colors mb-6 shadow-sm">
                                        <FilePlus className="w-6 h-6 text-zinc-500 group-hover:text-white" />
                                    </div>
                                    <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100 transition-colors">Cadastrar OSC</CardTitle>
                                    <CardDescription className="text-[13px] text-zinc-500 mt-2 font-medium">Cadastrar nova Organização da Sociedade Civil no sistema.</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>

                        <Link href={`/dashboard/diretoria/${directorate.id}/subvencao/visitas`} className="group">
                            <Card className="h-full bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none hover:border-blue-600 dark:hover:border-blue-400 transition-all rounded-2xl group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                                <CardHeader className="p-8">
                                    <div className="p-3 w-fit bg-zinc-50 dark:bg-zinc-800 rounded-xl group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-colors mb-6 shadow-sm">
                                        <ClipboardList className="w-6 h-6 text-zinc-500 group-hover:text-white" />
                                    </div>
                                    <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100 transition-colors">Instrumental de Visita</CardTitle>
                                    <CardDescription className="text-[13px] text-zinc-500 mt-2 font-medium">Registrar e gerenciar visitas técnicas e monitoramento de OSCs.</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    </div>
                </section>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-50/30 dark:bg-zinc-900/20 rounded-[2.5rem] border border-dashed border-zinc-200 dark:border-zinc-800">
                    <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 mb-6">
                        <Settings className="w-8 h-8 text-blue-600 animate-spin-slow" />
                    </div>
                    <h2 className="text-xl font-bold text-blue-900 dark:text-blue-50">Módulo de Monitoramento</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 max-w-xs text-center font-medium">
                        As ferramentas e indicadores customizados para esta unidade estão em fase de implementação.
                    </p>
                </div>
            )}

            <footer className="pt-12 border-t border-zinc-100 dark:border-zinc-800/60">
                <div className="flex flex-col items-center justify-center p-10 bg-zinc-50/50 dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-inner">
                    <Database className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mb-4" />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest leading-none">Área Institucional Restrita</h3>
                    <p className="text-[12px] text-zinc-500 dark:text-zinc-500 font-bold uppercase tracking-widest mt-2">
                        {directorate.name}
                    </p>
                </div>
            </footer>
        </div>
    )
}
