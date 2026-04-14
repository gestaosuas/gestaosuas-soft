import { getCachedDirectorate, getCachedSubmissionsForUser, getCachedProfile } from "@/app/dashboard/cached-data"
import { notFound, redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, BarChart3, PieChart, FilePlus, FolderOpen, Database, Settings, ClipboardList, CheckCircle2, FileCheck } from "lucide-react"
import { getVisits } from "@/app/dashboard/actions"
import Link from "next/link"
import { CRAS_UNITS } from "@/app/dashboard/cras-config"
import { CEAI_UNITS } from "@/app/dashboard/ceai-config"
import { createClient } from "@/utils/supabase/server"
import { NAICA_UNITS } from "@/app/dashboard/naica-config"
import { cn } from "@/lib/utils"
import { CEAIOficinasModals } from "./ceai-oficinas-modals"
import { createAdminClient } from "@/utils/supabase/admin"
import { SubvencaoDashboardCharts } from "@/components/subvencao-dashboard-charts"
import { SubvencaoIndicatorCards } from "@/components/subvencao-indicator-cards"

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
    const isSubvencao = (normalizedName.includes('subvencao') || normalizedName.includes('emendas') || id === '63553b96-3771-4842-9f45-630c7558adac') && !normalizedName.includes('outros')
    const isOutros = normalizedName.includes('outros') || id === '82471122-9b28-4d9a-90d4-f5e437d15761'
    const isCRAS = normalizedName.includes('cras')
    const isCREAS = normalizedName.includes('creas') // CREAS Idoso e Pessoa com Deficiência
    const isCEAI = normalizedName.includes('ceai')
    const isPopRua = normalizedName.includes('populacao') && normalizedName.includes('rua')
    const isNAICA = normalizedName.includes('naica')
    const isProtecaoEspecial = normalizedName.includes('protecao especial') || normalizedName.includes('crianca') || normalizedName.includes('adolescente')
    const isCasaDaMulher = normalizedName.includes('casa da mulher')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const cachedProfile = await getCachedProfile(user.id)
    const isAdmin = cachedProfile?.role === 'admin'

    const { getUserAllowedUnits } = await import("@/lib/auth-utils")
    const allowedUnits = await getUserAllowedUnits(user.id, directorate.id)

    const canSeeDailyReport = !allowedUnits || allowedUnits.includes('Relatório Diário')
    const canSeeSINE = !allowedUnits || allowedUnits.includes('SINE')
    const canSeeCP = !allowedUnits || allowedUnits.includes('Centro Profissionalizante')

    const getFilteredUnits = (units: string[]) => {
        if (!allowedUnits) return units // null means 'all access'
        return units.filter(u => allowedUnits.includes(u))
    }

    const filteredCRAS = getFilteredUnits(CRAS_UNITS)
    const filteredCEAI = getFilteredUnits(CEAI_UNITS)
    const filteredNAICA = getFilteredUnits(NAICA_UNITS)

    const submissions = await getCachedSubmissionsForUser(user.id, directorate.id)
    const isMonitoramento = isSubvencao || isOutros

    const getMonthName = (month: number) => {
        return new Date(0, month - 1).toLocaleString('pt-BR', { month: 'long' })
    }

    const latestSubmission = submissions?.[0]
    const latestMonthSINE_CP = latestSubmission ? getMonthName(latestSubmission.month) : null

    // Subvenção Admin Stats
    let subvencaoStats = { totalOSCs: 0, totalVisits: 0, finalizedVisits: 0, draftReports: 0, finalizedReports: 0 }
    let allVisitsData: any[] | null = null
    if (isSubvencao && isAdmin) {
        const adminSupabase = createAdminClient()
        const [{ count: totalOSCs }, { data: fetchedVisits }] = await Promise.all([
            adminSupabase.from('oscs').select('*', { count: 'exact', head: true }).eq('directorate_id', directorate.id),
            adminSupabase.from('visits').select('id, status, visit_date, assinaturas, parecer_tecnico, oscs(name)').eq('directorate_id', directorate.id)
        ])

        allVisitsData = fetchedVisits
        subvencaoStats = {
            totalOSCs: totalOSCs || 0,
            totalVisits: allVisitsData?.length || 0,
            finalizedVisits: allVisitsData?.filter((v: any) => v.status === 'finalized').length || 0,
            draftReports: allVisitsData?.filter((v: any) => v.parecer_tecnico?.status === 'draft').length || 0,
            finalizedReports: allVisitsData?.filter((v: any) => v.parecer_tecnico?.status === 'finalized').length || 0
        }
    }

    const getCardTheme = (label: string) => {
        if (label.includes("Atualizar")) return { base: "indigo", border: "hover:border-indigo-500", iconBg: "bg-indigo-50 dark:bg-indigo-900/20", iconActive: "group-hover:bg-indigo-600", iconText: "text-indigo-600 dark:text-indigo-400" };
        if (label.includes("Ver Dados") || label.includes("Dados")) return { base: "emerald", border: "hover:border-emerald-500", iconBg: "bg-emerald-50 dark:bg-emerald-900/20", iconActive: "group-hover:bg-emerald-600", iconText: "text-emerald-600 dark:text-emerald-400" };
        if (label.includes("Dashboard") || label.includes("Gráficos")) return { base: "amber", border: "hover:border-amber-500", iconBg: "bg-amber-50 dark:bg-amber-900/20", iconActive: "group-hover:bg-amber-600", iconText: "text-amber-600 dark:text-amber-400" };
        if (label.includes("Mensal")) return { base: "violet", border: "hover:border-violet-500", iconBg: "bg-violet-50 dark:bg-violet-900/20", iconActive: "group-hover:bg-violet-600", iconText: "text-violet-600 dark:text-violet-400" };
        if (label.includes("Ver Relatórios") || label.includes("Histórico")) return { base: "sky", border: "hover:border-sky-500", iconBg: "bg-sky-50 dark:bg-sky-900/20", iconActive: "group-hover:bg-sky-600", iconText: "text-sky-600 dark:text-sky-400" };
        if (label.includes("Diário") || label.includes("OSC")) return { base: "blue", border: "hover:border-blue-500", iconBg: "bg-blue-50 dark:bg-blue-900/20", iconActive: "group-hover:bg-blue-600", iconText: "text-blue-600 dark:text-blue-400" };
        if (label.includes("Visita")) return { base: "orange", border: "hover:border-orange-500", iconBg: "bg-orange-50 dark:bg-orange-900/20", iconActive: "group-hover:bg-orange-600", iconText: "text-orange-600 dark:text-orange-400" };
        if (label.includes("Plano")) return { base: "purple", border: "hover:border-purple-500", iconBg: "bg-purple-50 dark:bg-purple-900/20", iconActive: "group-hover:bg-purple-600", iconText: "text-purple-600 dark:text-purple-400" };
        if (label.includes("Pareceres") || label.includes("Final")) return { base: "emerald", border: "hover:border-emerald-500", iconBg: "bg-emerald-50 dark:bg-emerald-900/20", iconActive: "group-hover:bg-emerald-600", iconText: "text-emerald-600 dark:text-emerald-400" };
        return { base: "zinc", border: "hover:border-zinc-500", iconBg: "bg-zinc-50 dark:bg-zinc-800", iconActive: "group-hover:bg-zinc-600", iconText: "text-zinc-500" };
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-1000">
            <header className="space-y-1">
                <h1 className="text-3xl font-extrabold tracking-tight text-[#1e3a8a] dark:text-blue-50">
                    {directorate.name}
                </h1>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl leading-tight">
                    Painel de Monitoramento e Indicadores. Gerencie as operações e visualize a performance institucional desta unidade.
                </p>
            </header>

            {/* Gestão Diária - Oculto temporariamente até implementação completa */}
            {false && canSeeDailyReport && !isMonitoramento && (
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                        <h2 className="text-[11px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.15em]">Gestão Diária</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
                        <Link href={`/dashboard/relatorios/diario/novo?directorate_id=${directorate.id}`} className="group">
                            <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${getCardTheme('Relatório Diário').border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center`}>
                                <div className={`p-2 ${getCardTheme('Relatório Diário').iconBg} rounded-lg ${getCardTheme('Relatório Diário').iconActive} transition-all duration-300 mb-2 shadow-sm`}>
                                    <FilePlus className={`w-4 h-4 ${getCardTheme('Relatório Diário').iconText} group-hover:text-white transition-colors`} />
                                </div>
                                <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1">
                                    Relatório Diário
                                </CardTitle>
                            </Card>
                        </Link>
                    </div>
                </section>
            )}

            {isProtecaoEspecial && (
                <section className="space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-6 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                        <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Proteção Especial • Consolidado</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {[
                            { label: "Relatório Mensal", href: `/dashboard/relatorios/mensal?setor=protecao_especial&directorate_id=${directorate.id}`, icon: FileText },
                            { label: "Ver Relatórios", href: `/dashboard/relatorios/lista?setor=protecao_especial&directorate_id=${directorate.id}`, icon: FolderOpen },
                        ].map((item, idx) => {
                            const theme = getCardTheme(item.label);
                            return (
                                <Link key={idx} href={item.href} className="group">
                                    <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${theme.border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden`}>
                                        <div className={`p-2.5 ${theme.iconBg} rounded-lg ${theme.iconActive} transition-all duration-300 mb-2 shadow-sm relative z-10`}>
                                            <item.icon className={`w-5 h-5 ${theme.iconText} group-hover:text-white transition-colors`} />
                                        </div>
                                        <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">{item.label}</CardTitle>
                                    </Card>
                                </Link>
                            )
                        })}
                    </div>
                </section>
            )}

            {(isSINE || isCP) ? (
                <div className="space-y-6">
                    {/* SINE */}
                    {isSINE && canSeeSINE && (
                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-1 w-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                                <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">SINE • Operações</h2>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                {[
                                    { label: "Atualizar Dados", href: `/dashboard/relatorios/novo?setor=sine&directorate_id=${directorate.id}`, icon: FilePlus },
                                    { label: "Ver Dados", href: `/dashboard/dados?setor=sine&directorate_id=${directorate.id}`, icon: Database },
                                    { label: "Dashboard", href: `/dashboard/graficos?setor=sine&directorate_id=${directorate.id}`, icon: BarChart3 },
                                    { label: "Relatório Mensal", href: `/dashboard/relatorios/mensal?setor=sine&directorate_id=${directorate.id}`, icon: FileText },
                                    { label: "Ver Relatórios", href: `/dashboard/relatorios/lista?setor=sine&directorate_id=${directorate.id}`, icon: FolderOpen },
                                ].map((item, idx) => {
                                    const theme = getCardTheme(item.label);
                                    const isDisabled = false;

                                    if (isDisabled) {
                                        return (
                                            <div key={idx} className="group opacity-60 grayscale cursor-not-allowed select-none">
                                                <Card className="h-full min-h-[90px] bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/50 shadow-none rounded-xl flex flex-col items-center justify-center p-2.5 text-center">
                                                    <div className="p-2 bg-zinc-200 dark:bg-zinc-800/50 rounded-lg shadow-sm mb-2">
                                                        <item.icon className="w-4 h-4 text-zinc-400" />
                                                    </div>
                                                    <CardTitle className="text-[11px] font-bold text-zinc-500 dark:text-zinc-500">{item.label}</CardTitle>
                                                </Card>
                                            </div>
                                        )
                                    }

                                    return (
                                        <Link key={idx} href={item.href} className="group">
                                            <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${theme.border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden`}>
                                                <div className={`p-2 ${theme.iconBg} rounded-lg ${theme.iconActive} transition-all duration-300 mb-1.5 shadow-sm relative z-10`}>
                                                    <item.icon className={`w-4 h-4 ${theme.iconText} group-hover:text-white transition-colors`} />
                                                </div>
                                                {item.label === "Atualizar Dados" && latestMonthSINE_CP && (
                                                    <div className="mb-2 flex items-center justify-center gap-1 px-1.5 py-0.5 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-full w-fit relative z-10">
                                                        <CheckCircle2 className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                                                        <span className="text-[8px] font-black text-green-700 dark:text-green-400 uppercase tracking-tight">Vigência: {latestMonthSINE_CP}</span>
                                                    </div>
                                                )}
                                                <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">{item.label}</CardTitle>
                                            </Card>
                                        </Link>
                                    )
                                })}
                            </div>
                        </section>
                    )}

                    {/* CP */}
                    {isCP && canSeeCP && (
                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-1 w-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                                <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Qualificação Profissional</h2>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                {[
                                    { label: "Atualizar Dados", href: `/dashboard/relatorios/novo?setor=centros&directorate_id=${directorate.id}`, icon: FilePlus },
                                    { label: "Ver Dados", href: `/dashboard/dados?setor=centros&directorate_id=${directorate.id}`, icon: Database },
                                    { label: "Dashboard", href: `/dashboard/graficos?setor=centros&directorate_id=${directorate.id}`, icon: BarChart3 },
                                    { label: "Relatório Mensal", href: `/dashboard/relatorios/mensal?setor=centros&directorate_id=${directorate.id}`, icon: FileText },
                                    { label: "Ver Relatórios", href: `/dashboard/relatorios/lista?setor=centros&directorate_id=${directorate.id}`, icon: FolderOpen },
                                ].map((item, idx) => {
                                    const theme = getCardTheme(item.label);
                                    
                                    return (
                                        <Link key={idx} href={item.href} className="group">
                                            <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${theme.border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden`}>
                                                <div className={`p-2 ${theme.iconBg} rounded-lg ${theme.iconActive} transition-all duration-300 mb-1.5 shadow-sm relative z-10`}>
                                                    <item.icon className={`w-4 h-4 ${theme.iconText} group-hover:text-white transition-colors`} />
                                                </div>
                                                {item.label === "Atualizar Dados" && latestMonthSINE_CP && (
                                                    <div className="mb-2 flex items-center justify-center gap-1 px-1.5 py-0.5 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-full w-fit relative z-10">
                                                        <CheckCircle2 className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                                                        <span className="text-[8px] font-black text-green-700 dark:text-green-400 uppercase tracking-tight">Vigência: {latestMonthSINE_CP}</span>
                                                    </div>
                                                )}
                                                <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">{item.label}</CardTitle>
                                            </Card>
                                        </Link>
                                    )
                                })}
                            </div>
                        </section>
                    )}
                </div>
            ) : isBeneficios ? (
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                        <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Benefícios Sociais</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {[
                            { label: "Atualizar Dados", href: `/dashboard/relatorios/novo?setor=beneficios&directorate_id=${directorate.id}`, icon: FilePlus },
                            { label: "Ver Dados", href: `/dashboard/dados?setor=beneficios&directorate_id=${directorate.id}`, icon: Database },
                            { label: "Dashboard", href: `/dashboard/graficos?setor=beneficios&directorate_id=${directorate.id}`, icon: BarChart3 },
                            { label: "Relatório Mensal", href: `/dashboard/relatorios/mensal?setor=beneficios&directorate_id=${directorate.id}`, icon: FileText },
                            { label: "Ver Relatórios", href: `/dashboard/relatorios/lista?setor=beneficios&directorate_id=${directorate.id}`, icon: FolderOpen },
                        ].map((item, idx) => {
                            const theme = getCardTheme(item.label);
                            const isDisabled = false;

                            if (isDisabled) {
                                return (
                                    <div key={idx} className="group opacity-60 grayscale cursor-not-allowed select-none">
                                        <Card className="h-full min-h-[90px] bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/50 shadow-none rounded-xl flex flex-col items-center justify-center p-2.5 text-center">
                                            <div className="p-2 bg-zinc-200 dark:bg-zinc-800/50 rounded-lg shadow-sm mb-2">
                                                <item.icon className="w-4 h-4 text-zinc-400" />
                                            </div>
                                            <CardTitle className="text-[11px] font-bold text-zinc-500 dark:text-zinc-500">{item.label}</CardTitle>
                                        </Card>
                                    </div>
                                )
                            }

                            return (
                                <Link key={idx} href={item.href} className="group">
                                    <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${theme.border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden`}>
                                        <div className={`p-2 ${theme.iconBg} rounded-lg ${theme.iconActive} transition-all duration-300 mb-1.5 shadow-sm relative z-10`}>
                                            <item.icon className={`w-4 h-4 ${theme.iconText} group-hover:text-white transition-colors`} />
                                        </div>
                                        {item.label === "Atualizar Dados" && latestMonthSINE_CP && (
                                            <div className="mb-2 flex items-center justify-center gap-1 px-1.5 py-0.5 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-full w-fit relative z-10">
                                                <CheckCircle2 className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                                                <span className="text-[8px] font-black text-green-700 dark:text-green-400 uppercase tracking-tight">Vigência: {latestMonthSINE_CP}</span>
                                            </div>
                                        )}
                                        <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">{item.label}</CardTitle>
                                    </Card>
                                </Link>
                            )
                        })}
                    </div>
                </section>
            ) : isCRAS ? (
                <div className="space-y-6">
                    {/* Top Cards for CRAS */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                            <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Consolidado CRAS</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {[
                                { label: "Ver Dados", href: `/dashboard/dados?setor=cras&directorate_id=${directorate.id}`, icon: Database },
                                { label: "Dashboard", href: `/dashboard/graficos?setor=cras&directorate_id=${directorate.id}`, icon: BarChart3 },
                                { label: "Relatório Mensal", href: `/dashboard/relatorios/mensal?setor=cras&directorate_id=${directorate.id}`, icon: FileText },
                                { label: "Ver Relatórios", href: `/dashboard/relatorios/lista?setor=cras&directorate_id=${directorate.id}`, icon: FolderOpen },
                            ].map((item, idx) => {
                                const theme = getCardTheme(item.label);
                                const isDisabled = false;

                                if (isDisabled) {
                                    return (
                                        <div key={idx} className="group opacity-60 grayscale cursor-not-allowed select-none">
                                            <Card className="h-full min-h-[90px] bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/50 shadow-none rounded-xl flex flex-col items-center justify-center p-2.5 text-center">
                                                <div className="p-2 bg-zinc-200 dark:bg-zinc-800/50 rounded-lg shadow-sm mb-2">
                                                    <item.icon className="w-4 h-4 text-zinc-400" />
                                                </div>
                                                <CardTitle className="text-[11px] font-bold text-zinc-500 dark:text-zinc-500">{item.label}</CardTitle>
                                            </Card>
                                        </div>
                                    )
                                }

                                return (
                                    <Link key={idx} href={item.href} className="group">
                                        <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${theme.border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden`}>
                                            <div className={`p-2.5 ${theme.iconBg} rounded-lg ${theme.iconActive} transition-all duration-300 mb-2 shadow-sm relative z-10`}>
                                                <item.icon className={`w-5 h-5 ${theme.iconText} group-hover:text-white transition-colors`} />
                                            </div>
                                            <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">{item.label}</CardTitle>
                                        </Card>
                                    </Link>
                                )
                            })}
                        </div>
                    </section>

                    {/* Unit Cards */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-6 bg-green-600 dark:bg-green-400 rounded-full"></div>
                            <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Unidades Territoriais</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {filteredCRAS.map((unit, idx) => {
                                // Find latest month for THIS unit
                                const unitLatestSub = submissions?.find(s => {
                                    if (s.data._is_multi_unit && s.data.units) {
                                        return !!s.data.units[unit]
                                    }
                                    return s.data._unit === unit
                                })
                                const latestUnitMonth = unitLatestSub ? getMonthName(unitLatestSub.month) : null
                                const theme = getCardTheme("Atualizar");

                                return (
                                    <Link key={idx} href={`/dashboard/relatorios/novo?setor=cras&directorate_id=${directorate.id}&unit=${encodeURIComponent(unit)}`} className="group">
                                    <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${theme.border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden`}>
                                            <div className={`p-2 ${theme.iconBg} rounded-lg ${theme.iconActive} transition-all duration-300 mb-1.5 shadow-sm relative z-10`}>
                                                <FilePlus className={`w-4 h-4 ${theme.iconText} group-hover:text-white transition-colors`} />
                                            </div>
                                            <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 mb-0.5 relative z-10">{unit}</CardTitle>
                                            <div className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 relative z-10">Atualizar</div>
                                            {latestUnitMonth && (
                                                <div className="flex items-center justify-center gap-1 px-1.5 py-0.5 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-full w-fit relative z-10">
                                                    <CheckCircle2 className="w-2 h-2 text-green-600 dark:text-green-400" />
                                                    <span className="text-[7.5px] font-black text-green-700 dark:text-green-400 uppercase tracking-tight">Mês: {latestUnitMonth}</span>
                                                </div>
                                            )}
                                        </Card>
                                    </Link>
                                )
                            })}
                        </div>
                    </section>
                </div>
            ) : isCREAS ? (
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                        <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">CREAS • Operações</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {[
                            { label: "Atualizar Dados", href: `/dashboard/relatorios/novo?setor=creas&directorate_id=${directorate.id}`, icon: FilePlus },
                            { label: "Ver Dados", href: `/dashboard/dados?setor=creas&directorate_id=${directorate.id}`, icon: Database },
                            { label: "Dashboard", href: `/dashboard/graficos?setor=creas&directorate_id=${directorate.id}`, icon: BarChart3 },
                            { label: "Relatório Mensal", href: `/dashboard/relatorios/mensal?setor=creas&directorate_id=${directorate.id}`, icon: FileText },
                            { label: "Ver Relatórios", href: `/dashboard/relatorios/lista?setor=creas&directorate_id=${directorate.id}`, icon: FolderOpen },
                        ].map((item, idx) => {
                            const theme = getCardTheme(item.label);
                            const isDisabled = false;

                            if (isDisabled) {
                                return (
                                    <div key={idx} className="group opacity-60 grayscale cursor-not-allowed select-none">
                                        <Card className="h-full min-h-[90px] bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/50 shadow-none rounded-xl flex flex-col items-center justify-center p-2.5 text-center">
                                            <div className="p-2 bg-zinc-200 dark:bg-zinc-800/50 rounded-lg shadow-sm mb-2">
                                                <item.icon className="w-4 h-4 text-zinc-400" />
                                            </div>
                                            <CardTitle className="text-[11px] font-bold text-zinc-500 dark:text-zinc-500">{item.label}</CardTitle>
                                        </Card>
                                    </div>
                                )
                            }

                            return (
                                <Link key={idx} href={item.href} className="group">
                                    <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${theme.border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden`}>
                                        <div className={`p-2 ${theme.iconBg} rounded-lg ${theme.iconActive} transition-all duration-300 mb-1.5 shadow-sm relative z-10`}>
                                            <item.icon className={`w-4 h-4 ${theme.iconText} group-hover:text-white transition-colors`} />
                                        </div>
                                        {item.label === "Atualizar Dados" && latestMonthSINE_CP && (
                                            <div className="mb-2 flex items-center justify-center gap-1 px-1.5 py-0.5 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-full w-fit relative z-10">
                                                <CheckCircle2 className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                                                <span className="text-[8px] font-black text-green-700 dark:text-green-400 uppercase tracking-tight">Vigência: {latestMonthSINE_CP}</span>
                                            </div>
                                        )}
                                        <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">{item.label}</CardTitle>
                                    </Card>
                                </Link>
                            )
                        })}
                    </div>
                </section>
            ) : isSubvencao ? (
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                        <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Gestão de OSCs</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
                        {/* Cadastrar OSC */}
                        {isAdmin ? (
                            <Link href={`/dashboard/diretoria/${directorate.id}/subvencao/oscs/novo`} className="group">
                                <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${getCardTheme('Cadastrar OSC').border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden`}>
                                    <div className={`p-2 ${getCardTheme('Cadastrar OSC').iconBg} rounded-lg ${getCardTheme('Cadastrar OSC').iconActive} transition-all duration-300 mb-1.5 shadow-sm relative z-10`}>
                                        <FilePlus className={`w-4 h-4 ${getCardTheme('Cadastrar OSC').iconText} group-hover:text-white transition-colors`} />
                                    </div>
                                    <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">Cadastrar OSC</CardTitle>
                                </Card>
                            </Link>
                        ) : (
                            <div className="group opacity-60 grayscale cursor-not-allowed select-none">
                                <Card className="h-full min-h-[90px] bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/50 shadow-none rounded-xl flex flex-col items-center justify-center p-2.5 text-center">
                                    <div className="p-2 bg-zinc-200 dark:bg-zinc-800/50 rounded-lg shadow-sm mb-2">
                                        <FilePlus className="w-4 h-4 text-zinc-400" />
                                    </div>
                                    <CardTitle className="text-[11px] font-bold text-zinc-500 dark:text-zinc-500">Cadastrar OSC</CardTitle>
                                </Card>
                            </div>
                        )}

                        {/* Instrumental de Visita */}
                        <Link href={`/dashboard/diretoria/${directorate.id}/subvencao/visitas`} className="group">
                            <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${getCardTheme('Instrumental de Visita').border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden`}>
                                <div className={`p-2 ${getCardTheme('Instrumental de Visita').iconBg} rounded-lg ${getCardTheme('Instrumental de Visita').iconActive} transition-all duration-300 mb-1.5 shadow-sm relative z-10`}>
                                    <ClipboardList className={`w-4 h-4 ${getCardTheme('Instrumental de Visita').iconText} group-hover:text-white transition-colors`} />
                                </div>
                                <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">Instrumental de Visita</CardTitle>
                            </Card>
                        </Link>

                        {/* Plano de Trabalho */}
                        {isAdmin ? (
                            <Link href={`/dashboard/diretoria/${directorate.id}/subvencao/plano-de-trabalho`} className="group">
                                <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${getCardTheme('Plano de Trabalho').border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden`}>
                                    <div className={`p-2 ${getCardTheme('Plano de Trabalho').iconBg} rounded-lg ${getCardTheme('Plano de Trabalho').iconActive} transition-all duration-300 mb-1.5 shadow-sm relative z-10`}>
                                        <FolderOpen className={`w-4 h-4 ${getCardTheme('Plano de Trabalho').iconText} group-hover:text-white transition-colors`} />
                                    </div>
                                    <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">Plano de Trabalho</CardTitle>
                                </Card>
                            </Link>
                        ) : (
                            <div className="group opacity-60 grayscale cursor-not-allowed select-none">
                                <Card className="h-full min-h-[90px] bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/50 shadow-none rounded-xl flex flex-col items-center justify-center p-2.5 text-center">
                                    <div className="p-2 bg-zinc-200 dark:bg-zinc-800/50 rounded-lg shadow-sm mb-2">
                                        <FolderOpen className="w-4 h-4 text-zinc-400" />
                                    </div>
                                    <CardTitle className="text-[11px] font-bold text-zinc-500 dark:text-zinc-500">Plano de Trabalho</CardTitle>
                                </Card>
                            </div>
                        )}

                        {/* Relatórios Finais e Pareceres */}
                        <Link href={`/dashboard/diretoria/${directorate.id}/subvencao/relatorio-final`} className="group">
                            <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${getCardTheme('Relatórios Finais e Pareceres').border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden`}>
                                <div className={`p-2 ${getCardTheme('Relatórios Finais e Pareceres').iconBg} rounded-lg ${getCardTheme('Relatórios Finais e Pareceres').iconActive} transition-all duration-300 mb-1.5 shadow-sm relative z-10`}>
                                    <FileCheck className={`w-4 h-4 ${getCardTheme('Relatórios Finais e Pareceres').iconText} group-hover:text-white transition-colors`} />
                                </div>
                                <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">Relatórios e Pareceres</CardTitle>
                            </Card>
                        </Link>
                    </div>

                    {isAdmin && (
                        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/50 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-1 w-6 bg-cyan-600 dark:bg-cyan-400 rounded-full"></div>
                                <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Indicadores de Monitoramento</h2>
                            </div>
                            
                            <SubvencaoIndicatorCards 
                                visits={allVisitsData || []} 
                                totalOSCs={subvencaoStats.totalOSCs} 
                            />

                            <SubvencaoDashboardCharts stats={subvencaoStats} />
                        </div>
                    )}
                </section>
            ) : isCEAI ? (
                <div className="space-y-6">
                    {/* Top Cards for CEAI */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                            <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Consolidado CEAI</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {[
                                { label: "Ver Dados", href: `/dashboard/dados?setor=ceai&directorate_id=${directorate.id}`, icon: Database },
                                { label: "Dashboard", href: `/dashboard/graficos?setor=ceai&directorate_id=${directorate.id}`, icon: BarChart3 },
                                { label: "Relatório Mensal", href: `/dashboard/relatorios/mensal?setor=ceai&directorate_id=${directorate.id}`, icon: FileText },
                                { label: "Ver Relatórios", href: `/dashboard/relatorios/lista?setor=ceai&directorate_id=${directorate.id}`, icon: FolderOpen },
                            ].map((item, idx) => {
                                const theme = getCardTheme(item.label);
                                const isDisabled = false;

                                if (isDisabled) {
                                    return (
                                        <div key={idx} className="group opacity-60 grayscale cursor-not-allowed select-none">
                                            <Card className="h-full min-h-[90px] bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/50 shadow-none rounded-xl flex flex-col items-center justify-center p-2.5 text-center">
                                                <div className="p-2 bg-zinc-200 dark:bg-zinc-800/50 rounded-lg shadow-sm mb-2">
                                                    <item.icon className="w-4 h-4 text-zinc-400" />
                                                </div>
                                                <CardTitle className="text-[11px] font-bold text-zinc-500 dark:text-zinc-500">{item.label}</CardTitle>
                                            </Card>
                                        </div>
                                    )
                                }

                                return (
                                    <Link key={idx} href={item.href} className="group">
                                        <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${theme.border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden`}>
                                            <div className={`p-2.5 ${theme.iconBg} rounded-lg ${theme.iconActive} transition-all duration-300 mb-2 shadow-sm relative z-10`}>
                                                <item.icon className={`w-5 h-5 ${theme.iconText} group-hover:text-white transition-colors`} />
                                            </div>
                                            {item.label === "Atualizar Dados" && latestMonthSINE_CP && (
                                                <div className="mb-2 flex items-center justify-center gap-1 px-1.5 py-0.5 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-full w-fit relative z-10">
                                                    <CheckCircle2 className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                                                    <span className="text-[8px] font-black text-green-700 dark:text-green-400 uppercase tracking-tight">Vigência: {latestMonthSINE_CP}</span>
                                                </div>
                                            )}
                                            <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">{item.label}</CardTitle>
                                        </Card>
                                    </Link>
                                )
                            })}
                        </div>
                    </section>

                    {/* Condomínio do Idoso Section */}
                    {(!allowedUnits) && (
                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-1 w-6 bg-orange-600 dark:bg-orange-400 rounded-full"></div>
                                <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Condomínio do Idoso</h2>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                {[
                                    {
                                        label: "Atualizar Dados",
                                        href: `/dashboard/relatorios/novo?setor=ceai&directorate_id=${directorate.id}&subcategory=condominio`,
                                        icon: FilePlus
                                    },
                                    {
                                        label: "Ver Dados",
                                        href: `/dashboard/dados?setor=ceai&directorate_id=${directorate.id}&subcategory=condominio`,
                                        icon: Database
                                    }
                                ].map((item, idx) => {
                                    const theme = getCardTheme(item.label);

                                    return (
                                        <Link key={idx} href={item.href} className="group">
                                            <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${theme.border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden`}>
                                                <div className={`p-2 ${theme.iconBg} rounded-lg ${theme.iconActive} transition-all duration-300 mb-1.5 shadow-sm relative z-10`}>
                                                    <item.icon className={`w-4 h-4 ${theme.iconText} group-hover:text-white transition-colors`} />
                                                </div>
                                                {item.label === "Atualizar Dados" && latestMonthSINE_CP && (
                                                    <div className="mb-2 flex items-center justify-center gap-1 px-1.5 py-0.5 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-full w-fit relative z-10">
                                                        <CheckCircle2 className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                                                        <span className="text-[8px] font-black text-green-700 dark:text-green-400 uppercase tracking-tight">Vigência: {latestMonthSINE_CP}</span>
                                                    </div>
                                                )}
                                                <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">{item.label}</CardTitle>
                                            </Card>
                                        </Link>
                                    )
                                })}
                            </div>
                        </section>
                    )}

                    {/* Unit Cards */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-6 bg-green-600 dark:bg-green-400 rounded-full"></div>
                            <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Unidades Territoriais</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {filteredCEAI.map((unit, idx) => {
                                // Find latest month for THIS unit
                                const unitLatestSub = submissions?.find(s => {
                                    if (s.data._is_multi_unit && s.data.units) {
                                        return !!s.data.units[unit]
                                    }
                                    return s.data._unit === unit
                                })
                                const latestUnitMonth = unitLatestSub ? getMonthName(unitLatestSub.month) : null
                                const theme = getCardTheme("Atualizar");

                                return (
                                    <Card key={idx} className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none hover:border-blue-600 dark:hover:border-blue-400 transition-all duration-300 rounded-xl group-hover:shadow-lg relative overflow-hidden">
                                        <CardHeader className="p-2.5 pb-1.5 text-center flex flex-col items-center">
                                            <div className={`p-2 ${theme.iconBg} rounded-lg ${theme.iconActive} transition-all duration-300 mb-2 shadow-sm relative z-10`}>
                                                <FilePlus className={`w-4 h-4 ${theme.iconText} group-hover:text-white transition-colors`} />
                                            </div>
                                            <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 mb-1 truncate w-full" title={unit}>{unit}</CardTitle>
                                            {latestUnitMonth && (
                                                <div className="flex items-center justify-center gap-1 px-1.5 py-0.5 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-full w-fit relative z-10">
                                                    <CheckCircle2 className="w-2 h-2 text-green-600 dark:text-green-400" />
                                                    <span className="text-[7.5px] font-black text-green-700 dark:text-green-400 uppercase tracking-tight">Mês: {latestUnitMonth}</span>
                                                </div>
                                            )}
                                        </CardHeader>
                                        <div className="p-2 pt-1 flex flex-col gap-1 mt-auto relative z-10">
                                            <Link href={`/dashboard/relatorios/novo?setor=ceai&directorate_id=${directorate.id}&unit=${encodeURIComponent(unit)}`} className="w-full">
                                                <div className="flex items-center justify-center w-full px-2 py-1 text-[9px] border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-md font-bold text-zinc-600 dark:text-zinc-400 transition-colors uppercase tracking-wider">
                                                    <FilePlus className="w-3 h-3 mr-1 opacity-60" />
                                                    Atualizar
                                                </div>
                                            </Link>
                                            <CEAIOficinasModals unit={unit} directorateId={directorate.id} />
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    </section>
                </div>
            ) : isOutros ? (
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                        <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Monitoramento • Outros</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {[
                            { label: "Cadastrar OSC", href: `/dashboard/diretoria/${directorate.id}/subvencao/oscs/novo`, icon: FilePlus, restricted: true },
                            { label: "Instrumental de Visita", href: `/dashboard/diretoria/${directorate.id}/subvencao/visitas`, icon: ClipboardList, restricted: false },
                        ].map((item, idx) => {
                            const theme = getCardTheme(item.label);
                            const isAllowed = !item.restricted || isAdmin;

                            if (!isAllowed) {
                                return (
                                    <div key={idx} className="group opacity-60 grayscale cursor-not-allowed select-none">
                                        <Card className="h-full min-h-[90px] bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/50 shadow-none rounded-xl flex flex-col items-center justify-center p-2.5 text-center">
                                            <div className="p-2 bg-zinc-200 dark:bg-zinc-800/50 rounded-lg shadow-sm mb-2">
                                                <item.icon className="w-4 h-4 text-zinc-400" />
                                            </div>
                                            <CardTitle className="text-[11px] font-bold text-zinc-500 dark:text-zinc-500">{item.label}</CardTitle>
                                        </Card>
                                    </div>
                                )
                            }

                            return (
                                <Link key={idx} href={item.href} className="group">
                                    <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${theme.border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden`}>
                                        <div className={`p-2 ${theme.iconBg} rounded-lg ${theme.iconActive} transition-all duration-300 mb-1.5 shadow-sm relative z-10`}>
                                            <item.icon className={`w-4 h-4 ${theme.iconText} group-hover:text-white transition-colors`} />
                                        </div>
                                        <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">{item.label}</CardTitle>
                                    </Card>
                                </Link>
                            )
                        })}
                    </div>
                </section>
            ) : isNAICA ? (
                <div className="space-y-6">
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                            <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Consolidado NAICA</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {[
                                { label: "Ver Dados", href: `/dashboard/dados?setor=naica&directorate_id=${directorate.id}`, icon: Database },
                                { label: "Dashboard", href: `/dashboard/graficos?setor=naica&directorate_id=${directorate.id}`, icon: BarChart3 },
                                { label: "Relatório Mensal", href: `/dashboard/relatorios/mensal?setor=naica&directorate_id=${directorate.id}`, icon: FileText },
                                { label: "Ver Relatórios", href: `/dashboard/relatorios/lista?setor=naica&directorate_id=${directorate.id}`, icon: FolderOpen },
                            ].map((item, idx) => {
                                const theme = getCardTheme(item.label);
                                return (
                                    <Link key={idx} href={item.href} className="group">
                                        <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${theme.border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden`}>
                                            <div className={`p-2.5 ${theme.iconBg} rounded-lg ${theme.iconActive} transition-all duration-300 mb-2 shadow-sm relative z-10`}>
                                                <item.icon className={`w-5 h-5 ${theme.iconText} group-hover:text-white transition-colors`} />
                                            </div>
                                            <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">{item.label}</CardTitle>
                                        </Card>
                                    </Link>
                                )
                            })}
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-6 bg-green-600 dark:bg-green-400 rounded-full"></div>
                            <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Unidades NAICA</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {filteredNAICA.map((unit, idx) => {
                                const unitSubmissions = submissions?.filter(s => {
                                    if (s.data._is_multi_unit && s.data.units) {
                                        return !!s.data.units[unit]
                                    }
                                    return s.data._unit === unit
                                })
                                const unitLatestSub = unitSubmissions?.[0]
                                const latestUnitMonth = unitLatestSub ? getMonthName(unitLatestSub.month) : null
                                const theme = getCardTheme("Atualizar Dados");

                                return (
                                    <Link key={idx} href={`/dashboard/relatorios/novo?setor=naica&directorate_id=${directorate.id}&unit=${encodeURIComponent(unit)}`} className="group">
                                    <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${theme.border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden`}>
                                            <div className={`p-2 ${theme.iconBg} rounded-lg ${theme.iconActive} transition-all duration-300 mb-1.5 shadow-sm relative z-10`}>
                                                <FilePlus className={`w-4 h-4 ${theme.iconText} group-hover:text-white transition-colors`} />
                                            </div>
                                            <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 mb-0.5 relative z-10">{unit}</CardTitle>
                                            <div className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 relative z-10">Atualizar</div>
                                            {latestUnitMonth && (
                                                <div className="flex items-center justify-center gap-1 px-1.5 py-0.5 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-full w-fit relative z-10">
                                                    <CheckCircle2 className="w-2 h-2 text-green-600 dark:text-green-400" />
                                                    <span className="text-[7.5px] font-black text-green-700 dark:text-green-400 uppercase tracking-tight">Mês: {latestUnitMonth}</span>
                                                </div>
                                            )}
                                        </Card>
                                    </Link>
                                )
                            })}
                        </div>
                    </section>
                </div>
            ) : isPopRua ? (
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                        <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">População de Rua e Migrantes</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {[
                            { label: "Atualizar Dados", href: `/dashboard/relatorios/novo?setor=pop_rua&directorate_id=${directorate.id}`, icon: FilePlus },
                            { label: "Ver Dados", href: `/dashboard/dados?setor=pop_rua&directorate_id=${directorate.id}`, icon: Database },
                            { label: "Dashboard", href: `/dashboard/graficos?setor=pop_rua&directorate_id=${directorate.id}`, icon: BarChart3 },
                            { label: "Relatório Mensal", href: `/dashboard/relatorios/mensal?setor=pop_rua&directorate_id=${directorate.id}`, icon: FileText },
                            { label: "Ver Relatórios", href: `/dashboard/relatorios/lista?setor=pop_rua&directorate_id=${directorate.id}`, icon: FolderOpen },
                        ].map((item, idx) => {
                            const theme = getCardTheme(item.label);

                            return (
                                <Link key={idx} href={item.href} className="group">
                                    <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${theme.border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden`}>
                                        <div className={`p-2 ${theme.iconBg} rounded-lg ${theme.iconActive} transition-all duration-300 mb-1.5 shadow-sm relative z-10`}>
                                            <item.icon className={`w-4 h-4 ${theme.iconText} group-hover:text-white transition-colors`} />
                                        </div>
                                        {item.label === "Atualizar Dados" && latestMonthSINE_CP && (
                                            <div className="mb-2 flex items-center justify-center gap-1 px-1.5 py-0.5 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-full w-fit relative z-10">
                                                <CheckCircle2 className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                                                <span className="text-[8px] font-black text-green-700 dark:text-green-400 uppercase tracking-tight">Vigência: {latestMonthSINE_CP}</span>
                                            </div>
                                        )}
                                        <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">{item.label}</CardTitle>
                                    </Card>
                                </Link>
                            )
                        })}
                    </div>
                </section>
            ) : isProtecaoEspecial ? (
                <div className="space-y-6">
                    {/* Medida Protetiva */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                            <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Proteção Especial • Medida Protetiva</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {[
                                { label: "Atualizar Protetivo", href: `/dashboard/relatorios/novo?setor=creas_protetivo&directorate_id=${directorate.id}`, icon: FilePlus },
                                { label: "Dados Protetivo", href: `/dashboard/dados?setor=creas_protetivo&directorate_id=${directorate.id}`, icon: Database },
                                { label: "Dashboard Protetivo", href: `/dashboard/graficos?setor=creas_protetivo&directorate_id=${directorate.id}`, icon: BarChart3 },
                            ].map((item, idx) => {
                                const theme = getCardTheme(item.label);
                                return (
                                    <Link key={idx} href={item.href} className="group">
                                        <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${theme.border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden`}>
                                            <div className={`p-2.5 ${theme.iconBg} rounded-lg ${theme.iconActive} transition-all duration-300 mb-2 shadow-sm relative z-10`}>
                                                <item.icon className={`w-5 h-5 ${theme.iconText} group-hover:text-white transition-colors`} />
                                            </div>
                                            <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">{item.label}</CardTitle>
                                        </Card>
                                    </Link>
                                )
                            })}
                        </div>
                    </section>

                    {/* Medida Socioeducativa */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-6 bg-orange-600 dark:bg-orange-400 rounded-full"></div>
                            <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Proteção Especial • Medida Socioeducativa</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {[
                                { label: "Atualizar Socioeducativo", href: `/dashboard/relatorios/novo?setor=creas_socioeducativo&directorate_id=${directorate.id}`, icon: FilePlus },
                                { label: "Dados Socioeducativo", href: `/dashboard/dados?setor=creas_socioeducativo&directorate_id=${directorate.id}`, icon: Database },
                                { label: "Dashboard Socioeducativo", href: `/dashboard/graficos?setor=creas_socioeducativo&directorate_id=${directorate.id}`, icon: BarChart3 },
                            ].map((item, idx) => {
                                const theme = getCardTheme(item.label);
                                return (
                                    <Link key={idx} href={item.href} className="group">
                                        <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${theme.border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden`}>
                                            <div className={`p-2.5 ${theme.iconBg} rounded-lg ${theme.iconActive} transition-all duration-300 mb-2 shadow-sm relative z-10`}>
                                                <item.icon className={`w-5 h-5 ${theme.iconText} group-hover:text-white transition-colors`} />
                                            </div>
                                            <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">{item.label}</CardTitle>
                                        </Card>
                                    </Link>
                                )
                            })}
                        </div>
                    </section>
                </div>
            ) : isCasaDaMulher ? (
                <div className="space-y-6">
                    {(() => {
                        const getCardTheme = (label: string) => {
                            if (label.includes("Atualizar")) return { base: "indigo", border: "hover:border-indigo-500", iconBg: "bg-indigo-50 dark:bg-indigo-900/20", iconActive: "group-hover:bg-indigo-600", iconText: "text-indigo-600 dark:text-indigo-400" };
                            if (label.includes("Ver Dados") || label.includes("Dados")) return { base: "emerald", border: "hover:border-emerald-500", iconBg: "bg-emerald-50 dark:bg-emerald-900/20", iconActive: "group-hover:bg-emerald-600", iconText: "text-emerald-600 dark:text-emerald-400" };
                            if (label.includes("Dashboard") || label.includes("Gráficos")) return { base: "amber", border: "hover:border-amber-500", iconBg: "bg-amber-50 dark:bg-amber-900/20", iconActive: "group-hover:bg-amber-600", iconText: "text-amber-600 dark:text-amber-400" };
                            if (label.includes("Mensal")) return { base: "violet", border: "hover:border-violet-500", iconBg: "bg-violet-50 dark:bg-violet-900/20", iconActive: "group-hover:bg-violet-600", iconText: "text-violet-600 dark:text-violet-400" };
                            if (label.includes("Ver Relatórios") || label.includes("Histórico")) return { base: "sky", border: "hover:border-sky-500", iconBg: "bg-sky-50 dark:bg-sky-900/20", iconActive: "group-hover:bg-sky-600", iconText: "text-sky-600 dark:text-sky-400" };
                            return { base: "zinc", border: "hover:border-zinc-500", iconBg: "bg-zinc-50 dark:bg-zinc-800", iconActive: "group-hover:bg-zinc-600", iconText: "text-zinc-500" };
                        };

                        return (
                            <>
                                {/* Casa da Mulher */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-1 w-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                                        <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Casa da Mulher - Violência Doméstica</h2>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                        {[
                                            { label: "Atualizar Dados", href: `/dashboard/relatorios/novo?setor=casa_da_mulher&directorate_id=${directorate.id}`, icon: FilePlus },
                                            { label: "Ver Dados", href: `/dashboard/dados?setor=casa_da_mulher&directorate_id=${directorate.id}`, icon: Database },
                                            { label: "Dashboard", href: `/dashboard/graficos?setor=casa_da_mulher&directorate_id=${directorate.id}`, icon: BarChart3 },
                                            { label: "Relatório Mensal", href: `/dashboard/relatorios/mensal?setor=casa_da_mulher&directorate_id=${directorate.id}`, icon: FileText },
                                            { label: "Ver Relatórios", href: `/dashboard/relatorios/lista?setor=casa_da_mulher&directorate_id=${directorate.id}`, icon: FolderOpen },
                                        ].map((item, idx) => {
                                            const theme = getCardTheme(item.label);
                                            return (
                                                <Link key={idx} href={item.href} className="group">
                                                    <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${theme.border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden`}>
                                                        <div className={`p-2.5 ${theme.iconBg} rounded-lg ${theme.iconActive} transition-all duration-300 mb-2 shadow-sm relative z-10`}>
                                                            <item.icon className={`w-5 h-5 ${theme.iconText} group-hover:text-white transition-colors`} />
                                                        </div>
                                                        <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">{item.label}</CardTitle>
                                                    </Card>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </section>

                                {/* Diversidade */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-1 w-6 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                                        <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Casa da Mulher - Atendimentos Diversos</h2>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                        {[
                                            { label: "Atualizar Dados", href: `/dashboard/relatorios/novo?setor=diversidade&directorate_id=${directorate.id}`, icon: FilePlus },
                                            { label: "Ver Dados", href: `/dashboard/dados?setor=diversidade&directorate_id=${directorate.id}`, icon: Database },
                                        ].map((item, idx) => {
                                            const theme = getCardTheme(item.label);
                                            return (
                                                <Link key={idx} href={item.href} className="group">
                                                    <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${theme.border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden`}>
                                                        <div className={`p-2.5 ${theme.iconBg} rounded-lg ${theme.iconActive} transition-all duration-300 mb-2 shadow-sm relative z-10`}>
                                                            <item.icon className={`w-5 h-5 ${theme.iconText} group-hover:text-white transition-colors`} />
                                                        </div>
                                                        <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">{item.label}</CardTitle>
                                                    </Card>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </section>

                                {/* Núcleo de Diversidade */}
                                <section className="space-y-8">
                                    <div className="flex items-center gap-3">
                                        <div className="h-1 w-6 bg-pink-600 dark:bg-pink-400 rounded-full"></div>
                                        <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Núcleo de Diversidade</h2>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                        {[
                                            { label: "Atualizar Dados", href: `/dashboard/relatorios/novo?setor=nucleo_diversidade&directorate_id=${directorate.id}`, icon: FilePlus },
                                            { label: "Ver Dados", href: `/dashboard/dados?setor=nucleo_diversidade&directorate_id=${directorate.id}`, icon: Database },
                                        ].map((item, idx) => {
                                            const theme = getCardTheme(item.label);
                                            return (
                                                <Link key={idx} href={item.href} className="group">
                                                    <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${theme.border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden`}>
                                                        <div className={`p-2.5 ${theme.iconBg} rounded-lg ${theme.iconActive} transition-all duration-300 mb-2 shadow-sm relative z-10`}>
                                                            <item.icon className={`w-5 h-5 ${theme.iconText} group-hover:text-white transition-colors`} />
                                                        </div>
                                                        <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">{item.label}</CardTitle>
                                                    </Card>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </section>
                            </>
                        )
                    })()}
                </div>
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
    </div>
    )
}
