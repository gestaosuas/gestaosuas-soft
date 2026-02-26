"use client"

import dynamic from "next/dynamic"

// Import the map client component dynamically with SSR disabled inside a Client Component
const MapClient = dynamic(
    () => import("./map-client").then((mod) => mod.MapClient),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-[600px] flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-col items-center gap-4 text-cyan-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                    <span className="text-sm font-semibold tracking-wider uppercase">Carregando Mapa...</span>
                </div>
            </div>
        )
    }
)

interface MapWrapperProps {
    units: any[]
    categories: any[]
}

export function MapWrapper({ units, categories }: MapWrapperProps) {
    return <MapClient units={units} categories={categories} />
}
