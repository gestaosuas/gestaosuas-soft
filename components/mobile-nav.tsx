'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, LogOut, ShieldCheck, Menu, X, Building2, Activity } from "lucide-react"

export function MobileNav({ role, directorates = [], logoUrl }: { role?: 'admin' | 'user', directorates?: any[], logoUrl?: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    // Separate directorates by category
    const mainNames = ['Benefícios Socioassistenciais', 'Qualificação Profissional e SINE', 'CRAS', 'CEAI', 'CREAS Idoso e Pessoa com Deficiência', 'População de Rua e Migrantes', 'NAICAs', 'Proteção Especial à Criança e Adolescente']
    const mainDirectorates = directorates.filter(d => mainNames.includes(d.name))
    const monitoringDirectorates = directorates.filter(d => !mainNames.includes(d.name))

    // Close sidebar when route changes
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }
        return () => { document.body.style.overflow = "unset" }
    }, [isOpen])

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-30">
                <div className="flex items-center gap-2">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
                    ) : (
                        <>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <span className="font-bold tracking-tight">Sistema Vigilância</span>
                        </>
                    )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
                    <Menu className="h-6 w-6" />
                </Button>
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-in fade-in"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Panel */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-950 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex h-20 items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-800/50">
                        <div className="flex items-center gap-3">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
                            ) : (
                                <>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <span className="font-bold tracking-tight">Menu</span>
                                </>
                            )}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Links */}
                    <div className="flex-1 py-8 px-4 space-y-1 overflow-y-auto">
                        <div className="px-4 mb-2">
                            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Menu Principal</h3>
                        </div>
                        <Link href="/dashboard">
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start h-11 px-4 text-sm font-medium transition-all duration-200",
                                    pathname === "/dashboard"
                                        ? "bg-zinc-50 dark:bg-zinc-900 text-primary shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800"
                                        : "text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                                )}
                            >
                                <LayoutDashboard className={cn("mr-3 h-4 w-4", pathname === "/dashboard" ? "text-primary" : "text-zinc-400")} />
                                Painel Geral
                            </Button>
                        </Link>

                        {mainDirectorates.length > 0 && (
                            <>
                                <div className="px-4 mt-6 mb-2">
                                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Diretorias</h3>
                                </div>
                                {mainDirectorates.map((dir) => (
                                    <Link key={dir.id} href={`/dashboard/diretoria/${dir.id}`}>
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                "w-full justify-start h-11 px-4 text-sm font-medium transition-all duration-200 truncate",
                                                pathname === `/dashboard/diretoria/${dir.id}`
                                                    ? "bg-zinc-50 dark:bg-zinc-900 text-primary shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                                            )}
                                        >
                                            <Building2 className={cn("mr-3 h-4 w-4 shrink-0", pathname === `/dashboard/diretoria/${dir.id}` ? "text-primary" : "text-zinc-400")} />
                                            <span className="truncate">{dir.name}</span>
                                        </Button>
                                    </Link>
                                ))}
                            </>
                        )}

                        {monitoringDirectorates.length > 0 && (
                            <>
                                <div className="px-4 mt-6 mb-2">
                                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Monitoramentos</h3>
                                </div>
                                {monitoringDirectorates.map((dir) => (
                                    <Link key={dir.id} href={`/dashboard/diretoria/${dir.id}`}>
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                "w-full justify-start h-11 px-4 text-sm font-medium transition-all duration-200 truncate",
                                                pathname === `/dashboard/diretoria/${dir.id}`
                                                    ? "bg-zinc-50 dark:bg-zinc-900 text-primary shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                                            )}
                                        >
                                            <Activity className={cn("mr-3 h-4 w-4 shrink-0", pathname === `/dashboard/diretoria/${dir.id}` ? "text-primary" : "text-zinc-400")} />
                                            <span className="truncate">{dir.name}</span>
                                        </Button>
                                    </Link>
                                ))}
                            </>
                        )}

                        {role === 'admin' && (
                            <Link href="/dashboard/admin">
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start h-11 px-4 text-sm font-medium transition-all duration-200",
                                        pathname?.startsWith("/dashboard/admin")
                                            ? "bg-zinc-50 dark:bg-zinc-900 text-primary shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800"
                                            : "text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                                    )}
                                >
                                    <Users className={cn("mr-3 h-4 w-4", pathname?.startsWith("/dashboard/admin") ? "text-primary" : "text-zinc-400")} />
                                    Gestão de Usuários
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/20">
                        <form action="/auth/signout" method="post">
                            <Button variant="outline" className="w-full justify-start bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-zinc-600 dark:text-zinc-400 hover:text-destructive transition-colors">
                                <LogOut className="mr-3 h-4 w-4" />
                                Sair do Sistema
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
