import { createClient } from "@/utils/supabase/server"
import { DailyDashboard } from "./daily-dashboard"
import { getCachedProfile } from "./cached-data"
import { LayoutDashboard, Building2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Carregando...</div>

    const profile = await getCachedProfile(user.id)
    const isAdmin = profile?.role === 'admin'

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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-1000">
            <header className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Painel Geral
                </h1>
                <p className="text-[15px] text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl leading-relaxed">
                    Bem-vindo ao centro de operações. Visualize indicadores consolidados e gerencie relatórios institucionais com precisão.
                </p>
            </header>

            <section className="relative">
                <DailyDashboard />
            </section>

            {/* Status Section - Refined & Minimalist */}
            <div className="pt-12 border-t border-zinc-100 dark:border-zinc-800/60">
                <div className="bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl p-8 border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </div>
                        <h3 className="text-[12px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">
                            Status da Infraestrutura
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-5 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.01)]">
                            <span className="text-[13px] font-bold text-zinc-700 dark:text-zinc-300">Banco de Dados Principal</span>
                            <div className="flex items-center gap-2">
                                <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
                                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Operacional</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-5 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.01)]">
                            <span className="text-[13px] font-bold text-zinc-700 dark:text-zinc-300">Sincronização Google Sheets</span>
                            <div className="flex items-center gap-2">
                                <span className="h-1 w-1 rounded-full bg-blue-500"></span>
                                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Conectado</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
