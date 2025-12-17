'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, LogOut, ShieldCheck, Building2 } from "lucide-react"

export function Sidebar({ role, directorates = [] }: { role?: 'admin' | 'user', directorates?: any[] }) {
    const pathname = usePathname()

    return (
        <div className="hidden md:flex w-72 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl text-card-foreground shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 relative">
            {/* Gradient Border Line */}
            <div className="absolute right-0 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-blue-500/10 to-transparent"></div>

            <div className="flex h-24 items-center px-6 border-b border-zinc-100 dark:border-zinc-800/50 relative overflow-hidden group">
                {/* Logo Glow */}
                <div className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                <div className="flex items-center gap-3 relative z-10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30 transform transition-transform group-hover:scale-105 duration-300">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-none">Sistema Vigilância</span>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider mt-1">Socioassistencial 2026</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 py-8 px-4 space-y-6 overflow-y-auto custom-scrollbar">
                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(0, 0, 0, 0.1);
                        border-radius: 10px;
                    }
                    .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                        background: rgba(0, 0, 0, 0.2);
                    }
                `}</style>
                <div className="space-y-1">
                    <div className="px-4 mb-3 flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Dashboard</h3>
                    </div>
                    <Link href="/dashboard">
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start h-12 px-4 text-sm font-medium transition-all duration-300 rounded-xl",
                                pathname === "/dashboard"
                                    ? "bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-200/50 dark:border-blue-800/30"
                                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                            )}
                        >
                            <LayoutDashboard className={cn("mr-3 h-5 w-5 transition-colors", pathname === "/dashboard" ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 group-hover:text-zinc-600")} />
                            Painel Geral
                        </Button>
                    </Link>
                </div>

                {directorates.length > 0 && (
                    <div className="space-y-1">
                        <div className="px-4 mb-3 flex items-center gap-2 mt-6">
                            <div className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Diretorias</h3>
                        </div>
                        {directorates.map((dir) => (
                            <Link key={dir.id} href={`/dashboard/diretoria/${dir.id}`}>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start h-12 px-4 text-sm font-medium transition-all duration-300 rounded-xl mb-1 truncate",
                                        pathname === `/dashboard/diretoria/${dir.id}`
                                            ? "bg-gradient-to-r from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-900/10 text-cyan-700 dark:text-cyan-300 shadow-sm border border-cyan-200/50 dark:border-cyan-800/30"
                                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                                    )}
                                    title={dir.name}
                                >
                                    <Building2 className={cn("mr-3 h-5 w-5 shrink-0 transition-colors", pathname === `/dashboard/diretoria/${dir.id}` ? "text-cyan-600 dark:text-cyan-400" : "text-zinc-400")} />
                                    <span className="truncate">{dir.name}</span>
                                </Button>
                            </Link>
                        ))}
                    </div>
                )}

                {role === 'admin' && (
                    <div className="space-y-1">
                        <div className="px-4 mb-3 flex items-center gap-2 mt-6">
                            <div className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Administração</h3>
                        </div>
                        <Link href="/dashboard/admin">
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start h-12 px-4 text-sm font-medium transition-all duration-300 rounded-xl",
                                    pathname?.startsWith("/dashboard/admin")
                                        ? "bg-gradient-to-r from-violet-50 to-violet-100/50 dark:from-violet-900/20 dark:to-violet-900/10 text-violet-700 dark:text-violet-300 shadow-sm border border-violet-200/50 dark:border-violet-800/30"
                                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                                )}
                            >
                                <Users className={cn("mr-3 h-5 w-5 transition-colors", pathname?.startsWith("/dashboard/admin") ? "text-violet-600 dark:text-violet-400" : "text-zinc-400")} />
                                Gestão de Usuários
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/50 bg-gradient-to-t from-zinc-50/80 to-transparent dark:from-zinc-900/20">
                <form action="/auth/signout" method="post">
                    <Button variant="ghost" className="w-full justify-start h-12 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900/30 group">
                        <LogOut className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                        Sair do Sistema
                    </Button>
                </form>
            </div>
        </div>
    )
}
