'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, LogOut, ShieldCheck } from "lucide-react"

export function Sidebar({ role }: { role?: 'admin' | 'user' }) {
    const pathname = usePathname()

    return (
        <div className="flex w-72 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-card-foreground shadow-[1px_0_20px_0_rgba(0,0,0,0.05)] z-20">
            <div className="flex h-20 items-center px-8 border-b border-zinc-100 dark:border-zinc-800/50">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-tight text-foreground leading-none">Sistema Vigilância</span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">2026 Reporting</span>
                    </div>
                </div>
            </div>
            <div className="flex-1 py-8 px-4 space-y-1">
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
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/20">
                <form action="/auth/signout" method="post">
                    <Button variant="outline" className="w-full justify-start bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-zinc-600 dark:text-zinc-400 hover:text-destructive transition-colors">
                        <LogOut className="mr-3 h-4 w-4" />
                        Sair do Sistema
                    </Button>
                </form>
            </div>
        </div>
    )
}
