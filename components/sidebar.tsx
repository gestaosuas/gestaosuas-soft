'use client'

import { useState } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    Users,
    LogOut,
    ShieldCheck,
    Building2,
    ChevronLeft,
    ChevronRight,
    HandHeart,
    Activity,
    ClipboardList,
    GraduationCap,
    Home,
    HeartPulse,
    MapPin,
    Coins,
    Briefcase
} from "lucide-react"

export function Sidebar({ role, directorates = [], userName, logoUrl, systemName }: { role?: 'admin' | 'user', directorates?: any[], userName?: string, logoUrl?: string, systemName?: string }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isCollapsed, setIsCollapsed] = useState(false)

    const getDirectorateIcon = (name: string) => {
        const lowerName = name.toLowerCase()
        if (lowerName.includes('benefícios')) return HandHeart
        if (lowerName.includes('formação') || lowerName.includes('sine')) return GraduationCap
        if (lowerName.includes('cras')) return Home
        if (lowerName.includes('ceai')) return Users
        if (lowerName.includes('creas')) return HeartPulse
        if (lowerName.includes('população') || lowerName.includes('rua') || lowerName.includes('migrantes')) return MapPin
        if (lowerName.includes('emendas') || lowerName.includes('fundos')) return Coins
        if (lowerName.includes('subvenção')) return ClipboardList
        return Building2
    }

    // Separate directorates by category
    const mainNames = ['Benefícios Socioassistenciais', 'Formação Profissional e SINE', 'CRAS', 'CEAI', 'CREAS Idoso e Pessoa com Deficiência', 'População de Rua e Migrantes']
    const mainDirectorates = directorates
        .filter(d => mainNames.includes(d.name))
        .sort((a, b) => mainNames.indexOf(a.name) - mainNames.indexOf(b.name))
    const monitoringDirectorates = directorates.filter(d => !mainNames.includes(d.name))

    return (
        <div className={cn(
            "hidden md:flex flex-col border-r border-cyan-900/20 bg-[#020617] text-card-foreground z-20 relative transition-all duration-300 ease-in-out print:hidden",
            isCollapsed ? "w-20" : "w-72"
        )}>
            {/* Toggle Button - Minimalist */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-10 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-400 hover:text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:text-zinc-100 transition-all touch-manipulation"
                title={isCollapsed ? "Expandir" : "Recolher"}
            >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
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
                                    ? "bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] border border-cyan-500/20"
                                    : "text-zinc-500 hover:text-cyan-400 hover:bg-zinc-900/50"
                            )}
                        >
                            <LayoutDashboard className={cn("h-[18px] w-[18px] transition-colors", pathname === "/dashboard" ? "text-cyan-400" : "text-zinc-500", !isCollapsed && "mr-3")} />
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
                                                    ? "bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] border border-cyan-500/20"
                                                    : "text-zinc-500 hover:text-cyan-400 hover:bg-zinc-900/50"
                                            )}
                                            title={dir.name}
                                        >
                                            {(() => {
                                                const Icon = getDirectorateIcon(dir.name)
                                                return <Icon className={cn("h-[18px] w-[18px] shrink-0 transition-colors", isActive ? "text-cyan-400" : "text-zinc-500", !isCollapsed && "mr-3")} />
                                            })()}
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
                                                    ? "bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] border border-cyan-500/20"
                                                    : "text-zinc-500 hover:text-cyan-400 hover:bg-zinc-900/50"
                                            )}
                                            title={dir.name}
                                        >
                                            {(() => {
                                                const Icon = getDirectorateIcon(dir.name)
                                                return <Icon className={cn("h-[18px] w-[18px] shrink-0 transition-colors", isActive ? "text-cyan-400" : "text-zinc-500", !isCollapsed && "mr-3")} />
                                            })()}
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
                                        ? "bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] border border-cyan-500/20"
                                        : "text-zinc-500 hover:text-cyan-400 hover:bg-zinc-900/50"
                                )}
                            >
                                <Users className={cn("h-[18px] w-[18px] transition-colors", pathname?.startsWith("/dashboard/admin") ? "text-cyan-400" : "text-zinc-500", !isCollapsed && "mr-3")} />
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
                                        ? "bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] border border-cyan-500/20"
                                        : "text-zinc-500 hover:text-cyan-400 hover:bg-zinc-900/50"
                                )}
                            >
                                <ShieldCheck className={cn("h-[18px] w-[18px] transition-colors", pathname?.startsWith("/dashboard/configuracoes") ? "text-cyan-400" : "text-zinc-500", !isCollapsed && "mr-3")} />
                                {!isCollapsed && <span>Configurações</span>}
                            </Button>
                        </Link>
                    </div>
                )}
            </nav>

            <div className="p-4 border-t border-cyan-900/20 transition-all bg-[#010409]">
                {userName && !isCollapsed && (
                    <div className="px-3 mb-6 animate-in fade-in">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-1.5">Sessão Ativa</p>
                        <p className="text-[13px] font-bold text-zinc-200 truncate pr-2" title={userName}>
                            {userName}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <div className={cn(
                                "h-1.5 w-1.5 rounded-full ring-2 ring-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.5)]",
                                "bg-cyan-400"
                            )}></div>
                            <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                                {role === 'admin' ? 'Administrador' : 'Agente'}
                            </p>
                        </div>
                    </div>
                )}
                <form action="/auth/signout" method="post">
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full h-11 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-colors group",
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
