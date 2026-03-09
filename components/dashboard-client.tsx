"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ActivityFeed } from "@/components/activity-feed"
import { DataProgress } from "@/components/data-progress"
import { cn } from "@/lib/utils"
import { LayoutDashboard, BarChart3 } from "lucide-react"

interface DashboardClientProps {
    directorates: any[]
}

export function DashboardClient({ directorates }: DashboardClientProps) {
    const [view, setView] = useState<"updates" | "progress">("updates")

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 w-fit rounded-xl border border-zinc-200 dark:border-zinc-800">
                <Button
                    variant={view === "updates" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setView("updates")}
                    className={cn(
                        "rounded-lg px-4 h-9 font-bold text-xs uppercase tracking-wider transition-all",
                        view === "updates" ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm hover:bg-white dark:hover:bg-zinc-800" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    )}
                >
                    <LayoutDashboard className="w-3.5 h-3.5 mr-2" />
                    Atualizações
                </Button>
                <Button
                    variant={view === "progress" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setView("progress")}
                    className={cn(
                        "rounded-lg px-4 h-9 font-bold text-xs uppercase tracking-wider transition-all",
                        view === "progress" ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm hover:bg-white dark:hover:bg-zinc-800" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    )}
                >
                    <BarChart3 className="w-3.5 h-3.5 mr-2" />
                    Progresso Dados
                </Button>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {view === "updates" ? (
                    <ActivityFeed />
                ) : (
                    <DataProgress directorates={directorates} />
                )}
            </div>
        </div>
    )
}
