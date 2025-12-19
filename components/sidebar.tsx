'use client'

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, LogOut, ShieldCheck, Building2, ChevronLeft, ChevronRight, HandHeart } from "lucide-react"

export function Sidebar({ role, directorates = [], userName, logoUrl, systemName }: { role?: 'admin' | 'user', directorates?: any[], userName?: string, logoUrl?: string, systemName?: string }) {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <div className={cn(
            "hidden md:flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl text-card-foreground shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 relative transition-all duration-300 ease-in-out print:hidden",
            isCollapsed ? "w-20" : "w-72"
        )}>
            {/* Gradient Border Line */}
            <div className="absolute right-0 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-blue-500/10 to-transparent"></div>

            {/* Toggle Button - Floating on the border */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-9 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                title={isCollapsed ? "Expandir" : "Recolher"}
            >
                {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </button>

            <div className={cn(
                "flex flex-col items-center justify-center border-b border-zinc-100 dark:border-zinc-800/50 relative overflow-hidden group transition-all",
                isCollapsed ? "min-h-20 py-2 px-0" : "min-h-40 py-6 px-6"
            )}>
                {/* Logo Glow */}
                <div className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                <div className="flex flex-col items-center justify-center gap-1 relative z-10 w-full overflow-hidden text-center">
                    {!isCollapsed && (
                        logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={logoUrl} alt="Logo" className="h-20 w-auto max-w-[220px] object-contain mb-3 animate-in fade-in zoom-in-95 duration-300" />
                        ) : (
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30 transform transition-transform group-hover:scale-105 duration-300 mb-2">
                                <ShieldCheck className="h-10 w-10" />
                            </div>
                        )
                    )}

                    {!isCollapsed && (
                        <div className="flex flex-col animate-in fade-in duration-300 w-full px-2">
                            <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-none">
                                {systemName?.split(' ').slice(0, 2).join(' ') || "Sistema Vigilância"}
                            </span>
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider mt-1">
                                {systemName?.split(' ').slice(2).join(' ') || "Socioassistencial 2026"}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 py-8 px-3 space-y-6 overflow-y-auto custom-scrollbar overflow-x-hidden">
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
                    {!isCollapsed && (
                        <div className="px-4 mb-3 flex items-center gap-2 animate-in fade-in">
                            <div className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Dashboard</h3>
                        </div>
                    )}
                    <Link href="/dashboard">
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full h-12 text-sm font-medium transition-all duration-300 rounded-xl",
                                isCollapsed ? "justify-center px-0" : "justify-start px-4",
                                pathname === "/dashboard"
                                    ? "bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-200/50 dark:border-blue-800/30"
                                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                            )}
                            title="Painel Geral"
                        >
                            <LayoutDashboard className={cn("h-5 w-5 transition-colors", pathname === "/dashboard" ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 group-hover:text-zinc-600", !isCollapsed && "mr-3")} />
                            {!isCollapsed && <span>Painel Geral</span>}
                        </Button>
                    </Link>
                </div>

                {directorates.length > 0 && (
                    <div className="space-y-1">
                        {!isCollapsed && (
                            <div className="px-4 mb-3 flex items-center gap-2 mt-6 animate-in fade-in">
                                <div className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Diretorias</h3>
                            </div>
                        )}
                        {/* Divider if collapsed to separate sections visually */}
                        {isCollapsed && <div className="my-4 h-[1px] bg-zinc-100 dark:bg-zinc-800 mx-2"></div>}

                        {directorates.map((dir) => (
                            <Link key={dir.id} href={`/dashboard/diretoria/${dir.id}`}>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full h-12 text-sm font-medium transition-all duration-300 rounded-xl mb-1",
                                        isCollapsed ? "justify-center px-0" : "justify-start px-4 truncate",
                                        pathname === `/dashboard/diretoria/${dir.id}`
                                            ? "bg-gradient-to-r from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-900/10 text-cyan-700 dark:text-cyan-300 shadow-sm border border-cyan-200/50 dark:border-cyan-800/30"
                                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                                    )}
                                    title={dir.name}
                                >
                                    <Building2 className={cn("h-5 w-5 shrink-0 transition-colors", pathname === `/dashboard/diretoria/${dir.id}` ? "text-cyan-600 dark:text-cyan-400" : "text-zinc-400", !isCollapsed && "mr-3")} />
                                    {!isCollapsed && <span className="truncate">{dir.name}</span>}
                                </Button>
                            </Link>
                        ))}


                    </div>
                )}

                {role === 'admin' && (
                    <div className="space-y-1">
                        {!isCollapsed && (
                            <div className="px-4 mb-3 flex items-center gap-2 mt-6 animate-in fade-in">
                                <div className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Administração</h3>
                            </div>
                        )}
                        {isCollapsed && <div className="my-4 h-[1px] bg-zinc-100 dark:bg-zinc-800 mx-2"></div>}

                        <Link href="/dashboard/admin">
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full h-12 text-sm font-medium transition-all duration-300 rounded-xl",
                                    isCollapsed ? "justify-center px-0" : "justify-start px-4",
                                    pathname?.startsWith("/dashboard/admin")
                                        ? "bg-gradient-to-r from-violet-50 to-violet-100/50 dark:from-violet-900/20 dark:to-violet-900/10 text-violet-700 dark:text-violet-300 shadow-sm border border-violet-200/50 dark:border-violet-800/30"
                                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                                )}
                                title="Gestão de Usuários"
                            >
                                <Users className={cn("h-5 w-5 transition-colors", pathname?.startsWith("/dashboard/admin") ? "text-violet-600 dark:text-violet-400" : "text-zinc-400", !isCollapsed && "mr-3")} />
                                {!isCollapsed && <span>Gestão de Usuários</span>}
                            </Button>
                        </Link>
                        <Link href="/dashboard/configuracoes">
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full h-12 text-sm font-medium transition-all duration-300 rounded-xl mt-1",
                                    isCollapsed ? "justify-center px-0" : "justify-start px-4",
                                    pathname?.startsWith("/dashboard/configuracoes")
                                        ? "bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-900/20 dark:to-gray-900/10 text-gray-700 dark:text-gray-300 shadow-sm border border-gray-200/50 dark:border-gray-800/30"
                                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                                )}
                                title="Configurações"
                            >
                                <ShieldCheck className={cn("h-5 w-5 transition-colors", pathname?.startsWith("/dashboard/configuracoes") ? "text-gray-600 dark:text-gray-400" : "text-zinc-400", !isCollapsed && "mr-3")} />
                                {!isCollapsed && <span>Configurações</span>}
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/50 bg-gradient-to-t from-zinc-50/80 to-transparent dark:from-zinc-900/20">
                {userName && !isCollapsed && (
                    <div className="px-4 mb-4 animate-in fade-in slide-in-from-bottom-2">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Conectado como</p>
                        <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200 truncate" title={userName}>
                            {userName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                            <div className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                role === 'admin' ? "bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                            )}></div>
                            <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                {role === 'admin' ? 'Administrador' : 'Usuário'}
                            </p>
                        </div>
                    </div>
                )}
                <form action="/auth/signout" method="post">
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full h-12 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900/30 group",
                            isCollapsed ? "justify-center px-0" : "justify-start"
                        )}
                        title="Sair do Sistema"
                    >
                        <LogOut className={cn("h-5 w-5 group-hover:scale-110 transition-transform", !isCollapsed && "mr-3")} />
                        {!isCollapsed && <span>Sair do Sistema</span>}
                    </Button>
                </form>
            </div>
        </div>
    )
}
