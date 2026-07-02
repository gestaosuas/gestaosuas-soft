import { getMapUnits, getMapCategories } from "../../admin/mapas/actions"
import { ShieldAlert } from "lucide-react"
import { MapWrapper } from "./map-wrapper"

export default async function MapasPage() {
    try {
        const [units, categories] = await Promise.all([
            getMapUnits(),
            getMapCategories()
        ])

        return (
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            Unidades SMDES
                        </h2>
                        <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400">
                            Visualize a distribuição geográfica de todas as unidades da rede socioassistencial
                        </p>
                    </div>
                </div>

                <div className="w-full relative z-0">
                    <MapWrapper units={units || []} categories={categories || []} />
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
                    Erro ao carregar o Mapa
                </h2>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 text-center max-w-md">
                    Não foi possível conectar ao banco de dados ou as tabelas de mapa ainda não foram criadas. Por favor, contate um administrador.
                </p>
            </div>
        )
    }
}
