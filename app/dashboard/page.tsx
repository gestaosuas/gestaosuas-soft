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
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative">
                <div className="absolute -left-10 -top-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
                <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">
                    Painel Geral
                </h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
                    Bem-vindo ao seu painel de comando. Gerencie relatórios e visualize indicadores com agilidade.
                </p>
            </div>

            <DailyDashboard />

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
