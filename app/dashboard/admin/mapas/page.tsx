"use server"

import { getMapUnits, getMapCategories } from "./actions"
import { MapAdminClient } from "./admin-client"
import { ShieldAlert } from "lucide-react"

export default async function AdminMapasPage() {
    try {
        const [units, categories] = await Promise.all([
            getMapUnits(),
            getMapCategories()
        ])

        return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 relative z-10 w-full overflow-hidden flex flex-col h-[calc(100vh-4rem)]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            Gerenciamento de Mapas
                        </h2>
                        <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400">
                            Cadastre e edite as unidades e categorias exibidas no mapa interativo
                        </p>
                    </div>
                </div>

                <div className="w-full flex-1 overflow-auto min-h-0 bg-white/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 p-4">
                    <MapAdminClient initialUnits={units || []} initialCategories={categories || []} />
                </div>
            </div>
        )
    } catch (error) {
        return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 relative z-10 flex flex-col items-center justify-center h-[calc(100vh-100px)]">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 mb-4">
                    <ShieldAlert className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Erro ao carregar o Painel de Mapas
                </h2>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 text-center max-w-md">
                    Não foi possível carregar os dados. Verifique a conexão com o banco de dados.
                </p>
            </div>
        )
    }
}
