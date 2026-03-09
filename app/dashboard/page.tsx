export const dynamic = 'force-dynamic'
import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { DailyDashboard } from "./daily-dashboard"
import { getCachedProfile } from "./cached-data"
import { LayoutDashboard, Building2, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ActivityFeed } from "@/components/activity-feed"
import { DashboardClient } from "@/components/dashboard-client"

export default async function DashboardPage({
    searchParams
}: {
    searchParams: Promise<{ view?: string }>
}) {
    const { view } = await searchParams
    const isDailyView = view === 'daily'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Carregando...</div>

    const profile = await getCachedProfile(user.id)
    const isAdmin = profile?.role === 'admin'

    // Fetch all directorates for the progress list using admin client to bypass RLS
    const adminSupabase = createAdminClient()
    const { data: allDirectorates, error: dirError } = await adminSupabase.from('directorates').select('id, name').order('name')

    if (dirError) console.error("Error fetching directorates for progress:", dirError)

    // Filter out monitoring directorates as requested
    const directorates = allDirectorates?.filter(dir =>
        !['Subvenção', 'Emendas e Fundos', 'Outros'].includes(dir.name)
    ) || []

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in duration-700">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                    <LayoutDashboard className="w-12 h-12 text-blue-500" />
                </div>
                <div className="max-w-md">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 italic">Acesso Restrito ao Painel Geral</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                        O Painel Geral com consolidados diários é restrito a administradores.
                        Por favor, utilize o menu lateral para acessar os dados da sua diretoria.
                    </p>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                    {profile?.directorates?.map((dir: any) => (
                        <Link key={dir.id} href={`/dashboard/diretoria/${dir.id}`}>
                            <Button variant="outline" className="rounded-xl border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold">
                                <Building2 className="w-4 h-4 mr-2" />
                                {dir.name}
                            </Button>
                        </Link>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className={cn(
            "animate-in fade-in slide-in-from-bottom-2 duration-1000",
            isDailyView ? "space-y-3 w-full max-w-none flex flex-col h-full min-h-0" : "space-y-12 max-w-7xl mx-auto"
        )}>
            {!isDailyView && (
                <header className="flex flex-col md:flex-row md:items-start justify-between gap-8 pb-8 border-b border-zinc-100 dark:border-zinc-800/60">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-600 dark:bg-blue-500 rounded-2xl shadow-xl shadow-blue-500/20 mt-1">
                            <LayoutDashboard className="w-7 h-7 text-white" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                                Painel Geral
                            </h1>
                            <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">Operações Estratégicas</p>
                        </div>
                    </div>

                    {/* Infrastructure Status - Compact and Left-aligned in its container */}
                    <div className="flex flex-col gap-3 min-w-[280px]">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </div>
                            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                                Infraestrutura Online
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl shadow-sm gap-4">
                                <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 whitespace-nowrap">Banco Principal</span>
                                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase">Operacional</span>
                            </div>
                            <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl shadow-sm gap-4">
                                <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 whitespace-nowrap">Google Sync</span>
                                <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase">Conectado</span>
                            </div>
                        </div>
                    </div>
                </header>
            )}

            {isDailyView ? (
                <section className="relative flex-1 flex flex-col min-h-0">
                    <DailyDashboard />
                </section>
            ) : (
                <div className="w-full">
                    <DashboardClient directorates={directorates || []} />
                </div>
            )}
        </div>
    )
}
