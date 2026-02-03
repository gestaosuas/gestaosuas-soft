'use client'

import { useState } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, LogOut, ShieldCheck, Building2, ChevronLeft, ChevronRight, HandHeart, Activity, ClipboardList } from "lucide-react"

export function Sidebar({ role, directorates = [], userName, logoUrl, systemName }: { role?: 'admin' | 'user', directorates?: any[], userName?: string, logoUrl?: string, systemName?: string }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isCollapsed, setIsCollapsed] = useState(false)

    // Separate directorates by category
    const mainNames = ['Benefícios Socioassistenciais', 'Formação Profissional e SINE', 'CRAS', 'CEAI', 'CREAS Idoso e Pessoa com Deficiência']
    const mainDirectorates = directorates
        .filter(d => mainNames.includes(d.name))
        .sort((a, b) => mainNames.indexOf(a.name) - mainNames.indexOf(b.name))
    const monitoringDirectorates = directorates.filter(d => !mainNames.includes(d.name))

    return (
        <div className={cn(
            "hidden md:flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-card-foreground z-20 relative transition-all duration-300 ease-in-out print:hidden",
            isCollapsed ? "w-20" : "w-72"
        )}>
            {/* Toggle Button - Minimalist */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-10 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-400 hover:text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:text-zinc-100 transition-all"
                title={isCollapsed ? "Expandir" : "Recolher"}
            >
                {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            </button>

            <div className={cn(
                "flex flex-col items-center justify-center border-b border-zinc-100 dark:border-zinc-800/60 transition-all",
                isCollapsed ? "min-h-20 py-2 px-0" : "min-h-[120px] py-8 px-6"
            )}>
                <div className="flex flex-col items-center justify-center gap-2 relative z-10 w-full overflow-hidden text-center">
                    {!isCollapsed && (
                        logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={logoUrl} alt="Logo" className="h-16 w-auto max-w-[200px] object-contain mb-2 animate-in fade-in duration-500" />
                        ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-white transition-all mb-1 shadow-lg shadow-blue-900/10">
                                <ShieldCheck className="h-7 w-7" />
                            </div>
                        )
                    )}

                    {!isCollapsed && (
                        <div className="flex flex-col animate-in fade-in duration-500 w-full">
                            <span className="text-[15px] font-bold tracking-tight text-blue-950 dark:text-blue-50 leading-tight">
                                {systemName || "Sistema de Vigilância"}
                            </span>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-[0.15em] mt-1.5 translate-y-[1px]">
                                Socioassistencial • 2026
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <nav className="flex-1 pt-8 px-4 space-y-8 overflow-y-auto custom-scrollbar overflow-x-hidden">
                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(0, 0, 0, 0.05);
                        border-radius: 10px;
                    }
                    .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                        background: rgba(0, 0, 0, 0.1);
                    }
                `}</style>
                <div className="space-y-1">
                    {!isCollapsed && (
                        <h3 className="px-3 mb-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em]">Principal</h3>
                    )}
                    <Link href="/dashboard">
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full h-11 text-[13px] font-semibold transition-all duration-200 rounded-lg",
                                isCollapsed ? "justify-center px-0" : "justify-start px-3",
                                pathname === "/dashboard"
                                    ? "bg-blue-50/50 dark:bg-blue-900/10 text-blue-900 dark:text-blue-50 shadow-none border border-blue-100/50 dark:border-blue-800/20"
                                    : "text-zinc-500 dark:text-zinc-400 hover:text-blue-900 dark:hover:text-blue-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/30"
                            )}
                        >
                            <LayoutDashboard className={cn("h-[18px] w-[18px] transition-colors", pathname === "/dashboard" ? "text-blue-900 dark:text-blue-400" : "text-zinc-400", !isCollapsed && "mr-3")} />
                            {!isCollapsed && <span>Painel Geral</span>}
                        </Button>
                    </Link>
                </div>

                {mainDirectorates.length > 0 && (
                    <div className="space-y-1">
                        {!isCollapsed && (
                            <h3 className="px-3 mb-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em]">Diretorias</h3>
                        )}
                        {mainDirectorates.map((dir) => {
                            const isPathActive = pathname?.includes(`/dashboard/diretoria/${dir.id}`)
                            // Verifique se o parametro 'directorate_id' bate com o id da diretoria
                            const isParamActive = searchParams?.get('directorate_id') === dir.id
                            const isActive = isPathActive || isParamActive

                            return (
                                <Link key={dir.id} href={`/dashboard/diretoria/${dir.id}`}>
                                    <div className="relative">
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-blue-600 rounded-r-full"></div>
                                        )}
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                "w-full h-11 text-[13px] font-semibold transition-all duration-200 rounded-lg mb-0.5",
                                                isCollapsed ? "justify-center px-0" : "justify-start px-3 truncate",
                                                isActive
                                                    ? "bg-blue-50/50 dark:bg-blue-900/10 text-blue-900 dark:text-blue-50 shadow-none border border-blue-100/50 dark:border-blue-800/20"
                                                    : "text-zinc-500 dark:text-zinc-400 hover:text-blue-900 dark:hover:text-blue-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/30"
                                            )}
                                            title={dir.name}
                                        >
                                            <Building2 className={cn("h-[18px] w-[18px] shrink-0 transition-colors", isActive ? "text-blue-900 dark:text-blue-400" : "text-zinc-400", !isCollapsed && "mr-3")} />
                                            {!isCollapsed && <span className="truncate">{dir.name}</span>}
                                        </Button>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}

                {monitoringDirectorates.length > 0 && (
                    <div className="space-y-1">
                        {!isCollapsed && (
                            <h3 className="px-3 mb-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] mt-2">Monitoramentos</h3>
                        )}
                        {monitoringDirectorates.map((dir) => {
                            const isPathActive = pathname?.includes(`/dashboard/diretoria/${dir.id}`)
                            const isParamActive = searchParams?.get('directorate_id') === dir.id
                            const isActive = isPathActive || isParamActive

                            return (
                                <Link key={dir.id} href={`/dashboard/diretoria/${dir.id}`}>
                                    <div className="relative">
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-blue-600 rounded-r-full"></div>
                                        )}
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                "w-full h-11 text-[13px] font-semibold transition-all duration-200 rounded-lg mb-0.5",
                                                isCollapsed ? "justify-center px-0" : "justify-start px-3 truncate",
                                                isActive
                                                    ? "bg-blue-50/50 dark:bg-blue-900/10 text-blue-900 dark:text-blue-50 shadow-none border border-blue-100/50 dark:border-blue-800/20"
                                                    : "text-zinc-500 dark:text-zinc-400 hover:text-blue-900 dark:hover:text-blue-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/30"
                                            )}
                                            title={dir.name}
                                        >
                                            <Activity className={cn("h-[18px] w-[18px] shrink-0 transition-colors", isActive ? "text-blue-900 dark:text-blue-400" : "text-zinc-400", !isCollapsed && "mr-3")} />
                                            {!isCollapsed && <span className="truncate">{dir.name}</span>}
                                        </Button>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}

                {role === 'admin' && (
                    <div className="space-y-1">
                        {!isCollapsed && (
                            <h3 className="px-3 mb-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em]">Gestão</h3>
                        )}
                        <Link href="/dashboard/admin">
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full h-11 text-[13px] font-semibold transition-all duration-200 rounded-lg",
                                    isCollapsed ? "justify-center px-0" : "justify-start px-3",
                                    pathname?.startsWith("/dashboard/admin")
                                        ? "bg-blue-50/50 dark:bg-blue-900/10 text-blue-900 dark:text-blue-50 shadow-none border border-blue-100/50 dark:border-blue-800/20"
                                        : "text-zinc-500 dark:text-zinc-400 hover:text-blue-900 dark:hover:text-blue-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/30"
                                )}
                            >
                                <Users className={cn("h-[18px] w-[18px] transition-colors", pathname?.startsWith("/dashboard/admin") ? "text-blue-900 dark:text-blue-400" : "text-zinc-400", !isCollapsed && "mr-3")} />
                                {!isCollapsed && <span>Usuários</span>}
                            </Button>
                        </Link>
                        <Link href="/dashboard/configuracoes">
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full h-11 text-[13px] font-semibold transition-all duration-200 rounded-lg mt-1",
                                    isCollapsed ? "justify-center px-0" : "justify-start px-3",
                                    pathname?.startsWith("/dashboard/configuracoes")
                                        ? "bg-blue-50/50 dark:bg-blue-900/10 text-blue-900 dark:text-blue-50 shadow-none border border-blue-100/50 dark:border-blue-800/20"
                                        : "text-zinc-500 dark:text-zinc-400 hover:text-blue-900 dark:hover:text-blue-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/30"
                                )}
                            >
                                <ShieldCheck className={cn("h-[18px] w-[18px] transition-colors", pathname?.startsWith("/dashboard/configuracoes") ? "text-blue-900 dark:text-blue-400" : "text-zinc-400", !isCollapsed && "mr-3")} />
                                {!isCollapsed && <span>Configurações</span>}
                            </Button>
                        </Link>
                    </div>
                )}
            </nav>

            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/60 transition-all bg-white dark:bg-zinc-950">
                {userName && !isCollapsed && (
                    <div className="px-3 mb-6 animate-in fade-in">
                        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.15em] mb-1.5">Sessão Ativa</p>
                        <p className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200 truncate pr-2" title={userName}>
                            {userName}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <div className={cn(
                                "h-1.5 w-1.5 rounded-full ring-2 ring-blue-50 dark:ring-blue-900/20",
                                role === 'admin' ? "bg-blue-600" : "bg-blue-400"
                            )}></div>
                            <p className="text-[10px] font-bold text-blue-900 dark:text-blue-400 uppercase tracking-widest">
                                {role === 'admin' ? 'Administrador' : 'Agente'}
                            </p>
                        </div>
                    </div>
                )}
                <form action="/auth/signout" method="post">
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full h-11 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors group",
                            isCollapsed ? "justify-center px-0" : "justify-start px-3"
                        )}
                    >
                        <LogOut className={cn("h-[18px] w-[18px] transition-transform", !isCollapsed && "mr-3")} />
                        {!isCollapsed && <span className="text-[13px] font-semibold">Sair</span>}
                    </Button>
                </form>
            </div>
        </div>
    )
}
