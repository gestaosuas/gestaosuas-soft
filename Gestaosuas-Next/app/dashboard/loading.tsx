import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="flex h-full min-h-[60vh] w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full"></div>
                    <Loader2 className="relative h-12 w-12 animate-spin text-indigo-600" />
                </div>
                <p className="text-sm font-medium text-zinc-500 animate-pulse">Carregando dados...</p>
            </div>
        </div>
    )
}
