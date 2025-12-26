import { getCachedDirectorate, getCachedSubmissionsForUser, getCachedProfile } from "@/app/dashboard/cached-data"
import { notFound, redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, FileText, BarChart3, PieChart, FilePlus, FolderOpen, Database, Settings, ClipboardList, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { CRAS_UNITS } from "@/app/dashboard/cras-config"
import { createClient } from "@/utils/supabase/server"

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
    const isCRAS = normalizedName.includes('cras')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const cachedProfile = await getCachedProfile(user.id)
    const isAdmin = cachedProfile?.role === 'admin'

    const submissions = await getCachedSubmissionsForUser(user.id, directorate.id)

    const getMonthName = (month: number) => {
        return new Date(0, month - 1).toLocaleString('pt-BR', { month: 'long' })
    }

    const latestSubmission = submissions?.[0]
    const latestMonthSINE_CP = latestSubmission ? getMonthName(latestSubmission.month) : null

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
                                    { label: "Atualizar Dados SINE", desc: "Indicadores numéricos de desempenho", href: `/dashboard/relatorios/novo?setor=sine&directorate_id=${directorate.id}`, icon: FilePlus },
                                    { label: "Dashboard SINE", desc: "Gráficos e performance", href: `/dashboard/graficos?setor=sine&directorate_id=${directorate.id}`, icon: BarChart3 },
                                    { label: "Relatório Mensal", desc: "Consolidado descritivo do período", href: `/dashboard/relatorios/mensal?setor=sine&directorate_id=${directorate.id}`, icon: FileText },
                                    { label: "Ver Relatórios", desc: "Histórico de envios mensais", href: `/dashboard/relatorios/lista?setor=sine&directorate_id=${directorate.id}`, icon: FolderOpen },
                                    { label: "Dados SINE", desc: "Consulta ao banco de registros", href: `/dashboard/dados?setor=sine&directorate_id=${directorate.id}`, icon: Database },
                                ].map((item, idx) => (
                                    <Link key={idx} href={item.href} className="group">
                                        <Card className="h-full bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none hover:border-blue-600 dark:hover:border-blue-400 transition-all rounded-2xl group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                                            <CardHeader className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="p-2.5 w-fit bg-zinc-50 dark:bg-zinc-800 rounded-lg group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-colors">
                                                        <item.icon className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                                                    </div>
                                                    {item.label === "Atualizar Dados SINE" && latestMonthSINE_CP && (
                                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-md">
                                                            <CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400" />
                                                            <span className="text-[9px] font-black text-green-700 dark:text-green-400 uppercase tracking-tight">Mês Atualizado: {latestMonthSINE_CP}</span>
                                                        </div>
                                                    )}
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
                                    { label: "Atualizar Dados CP", desc: "Performance dos Centros", href: `/dashboard/relatorios/novo?setor=centros&directorate_id=${directorate.id}`, icon: FilePlus },
                                    { label: "Dados CP", desc: "Histórico de procedimentos", href: `/dashboard/dados?setor=centros&directorate_id=${directorate.id}`, icon: Database },
                                    { label: "Dashboard CP", desc: "Gráficos e visualização", href: `/dashboard/graficos?setor=centros&directorate_id=${directorate.id}`, icon: BarChart3 },
                                ].map((item, idx) => (
                                    <Link key={idx} href={item.href} className="group">
                                        <Card className="h-full bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none hover:border-blue-600 dark:hover:border-blue-400 transition-all rounded-2xl group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                                            <CardHeader className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="p-2.5 w-fit bg-zinc-50 dark:bg-zinc-800 rounded-lg group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-colors">
                                                        <item.icon className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                                                    </div>
                                                    {item.label === "Atualizar Dados CP" && latestMonthSINE_CP && (
                                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-md">
                                                            <CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400" />
                                                            <span className="text-[9px] font-black text-green-700 dark:text-green-400 uppercase tracking-tight">Mês Atualizado: {latestMonthSINE_CP}</span>
                                                        </div>
                                                    )}
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
                            { label: "Atualizar Dados", desc: "Métricas mensais de benefícios", href: `/dashboard/relatorios/novo?setor=beneficios&directorate_id=${directorate.id}`, icon: FilePlus },
                            { label: "Relatório Mensal", desc: "Consolidado qualitativo", href: `/dashboard/relatorios/mensal?setor=beneficios&directorate_id=${directorate.id}`, icon: FileText },
                            { label: "Ver Relatórios", desc: "Relatórios mensais anteriores", href: `/dashboard/relatorios/lista?setor=beneficios&directorate_id=${directorate.id}`, icon: FolderOpen },
                            { label: "Dados Benefícios", desc: "Dados consolidados", href: `/dashboard/dados?setor=beneficios&directorate_id=${directorate.id}`, icon: Database },
                            { label: "Dashboard Benefícios", desc: "Analytics e KPIs", href: `/dashboard/graficos?setor=beneficios&directorate_id=${directorate.id}`, icon: BarChart3 },
                        ].map((item, idx) => (
                            <Link key={idx} href={item.href} className="group">
                                <Card className="h-full bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none hover:border-blue-600 dark:hover:border-blue-400 transition-all rounded-2xl group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                                    <CardHeader className="p-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 w-fit bg-zinc-50 dark:bg-zinc-800 rounded-xl group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-colors shadow-sm">
                                                <item.icon className="w-5 h-5 text-zinc-500 group-hover:text-white" />
                                            </div>
                                            {item.label === "Atualizar Dados" && latestMonthSINE_CP && (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-full">
                                                    <CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400" />
                                                    <span className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-tight">Mês Atualizado: {latestMonthSINE_CP}</span>
                                                </div>
                                            )}
                                        </div>
                                        <CardTitle className="text-base font-bold text-blue-900 dark:text-blue-100 transition-colors">{item.label}</CardTitle>
                                        <CardDescription className="text-[13px] text-zinc-500 mt-1 font-medium">{item.desc}</CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>
            ) : isCRAS ? (
                <div className="space-y-16">
                    {/* Top Cards for CRAS */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                            <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Consolidado CRAS</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { label: "Ver Dados CRAS", desc: "Histórico consolidado de todas as unidades", href: `/dashboard/dados?setor=cras&directorate_id=${directorate.id}`, icon: Database },
                                { label: "Dashboard CRAS", desc: "Resultados e metas institucionais", href: `/dashboard/graficos?setor=cras&directorate_id=${directorate.id}`, icon: BarChart3 },
                                { label: "Relatório Mensal", desc: "Consolidado descritivo do período", href: `/dashboard/relatorios/mensal?setor=cras&directorate_id=${directorate.id}`, icon: FileText },
                                { label: "Ver Relatórios", desc: "Histórico de envios mensais", href: `/dashboard/relatorios/lista?setor=cras&directorate_id=${directorate.id}`, icon: FolderOpen },
                            ].map((item, idx) => (
                                <Link key={idx} href={item.href} className="group">
                                    <Card className="h-full bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none hover:border-blue-600 dark:hover:border-blue-400 transition-all rounded-2xl group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                                        <CardHeader className="p-8">
                                            <div className="p-3 w-fit bg-zinc-50 dark:bg-zinc-800 rounded-xl group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-colors mb-6 shadow-sm">
                                                <item.icon className="w-6 h-6 text-zinc-500 group-hover:text-white" />
                                            </div>
                                            <CardTitle className="text-base font-bold text-blue-900 dark:text-blue-100 transition-colors">{item.label}</CardTitle>
                                            <CardDescription className="text-[13px] text-zinc-500 mt-1 font-medium">{item.desc}</CardDescription>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Unit Cards */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-6 bg-green-600 dark:bg-green-400 rounded-full"></div>
                            <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Unidades Territoriais</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {CRAS_UNITS.map((unit, idx) => {
                                // Find latest month for THIS unit
                                const unitLatestSub = submissions?.find(s => {
                                    if (s.data._is_multi_unit && s.data.units) {
                                        return !!s.data.units[unit]
                                    }
                                    return s.data._unit === unit
                                })
                                const latestUnitMonth = unitLatestSub ? getMonthName(unitLatestSub.month) : null

                                return (
                                    <Link key={idx} href={`/dashboard/relatorios/novo?setor=cras&directorate_id=${directorate.id}&unit=${encodeURIComponent(unit)}`} className="group">
                                        <Card className="h-full bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none hover:border-blue-600 dark:hover:border-blue-400 transition-all rounded-2xl group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                                            <CardHeader className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="p-2.5 w-fit bg-zinc-50 dark:bg-zinc-800 rounded-lg group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-colors">
                                                        <FilePlus className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                                                    </div>
                                                    {latestUnitMonth && (
                                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-md">
                                                            <CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400" />
                                                            <span className="text-[9px] font-black text-green-700 dark:text-green-400 uppercase tracking-tight">Mês Atualizado: {latestUnitMonth}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <CardTitle className="text-[15px] font-bold text-blue-900 dark:text-blue-100 transition-colors">Atualizar Dados</CardTitle>
                                                <CardDescription className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-1 font-semibold">{unit}</CardDescription>
                                            </CardHeader>
                                        </Card>
                                    </Link>
                                )
                            })}
                        </div>
                    </section>
                </div>
            ) : isSubvencao ? (
                <section className="space-y-12">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                        <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Gestão de OSCs</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {isAdmin ? (
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
                        ) : (
                            <div className="group cursor-not-allowed opacity-60 grayscale select-none">
                                <Card className="h-full bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/50 shadow-none rounded-2xl">
                                    <CardHeader className="p-8">
                                        <div className="p-3 w-fit bg-zinc-200 dark:bg-zinc-800/50 rounded-xl mb-6 shadow-sm">
                                            <FilePlus className="w-6 h-6 text-zinc-400" />
                                        </div>
                                        <CardTitle className="text-lg font-bold text-zinc-500 dark:text-zinc-500">Cadastrar OSC</CardTitle>
                                        <CardDescription className="text-[13px] text-zinc-400 mt-2 font-medium">Acesso restrito a administradores.</CardDescription>
                                    </CardHeader>
                                </Card>
                            </div>
                        )}

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
