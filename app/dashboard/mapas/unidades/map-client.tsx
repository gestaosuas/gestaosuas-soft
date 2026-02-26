"use client"

import { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, FilterX } from "lucide-react"

interface MapCategory {
    id: string
    name: string
    color: string
}

interface MapUnit {
    id: string
    name: string
    category_id: string | null
    region: string | null
    address: string | null
    phone: string | null
    latitude: number
    longitude: number
    map_categories: MapCategory | null
}

interface MapClientProps {
    units: MapUnit[]
    categories: MapCategory[]
}

// Leaflet icon fix for Next.js
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Create custom colored icons based on category color
const createCustomIcon = (color: string) => {
    // We will use the default icon if color is not valid, or we could use custom SVG icons.
    // For simplicity and matching the python script, we can tint the icon or use a colored pin marker API
    // A quick way for colored pins is using an external service or generating SVGs on the fly.
    // Here we use a free colored markers API:

    const validColors = ['blue', 'gold', 'red', 'green', 'orange', 'yellow', 'violet', 'grey', 'black']
    // Leaflet's awesome markers or similar could be used, but this is a quick native-like approach 
    // Fallback to blue if color not in list
    let markerColor = 'blue'

    // Simple color mapping from Python TIPO_CORES to available marker colors
    if (color === 'pink' || color === 'purple') markerColor = 'violet'
    else if (color === 'lightgreen') markerColor = 'green'
    else if (color === 'darkblue' || color === 'lightblue' || color === 'cadetblue') markerColor = 'blue'
    else if (color === 'darkred' || color === 'brown') markerColor = 'red'
    else if (color === 'lightgray') markerColor = 'grey'
    else if (validColors.includes(color)) markerColor = color

    return L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${markerColor}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
}

export function MapClient({ units, categories }: MapClientProps) {
    const [selectedTypes, setSelectedTypes] = useState<string[]>([])
    const [selectedRegions, setSelectedRegions] = useState<string[]>([])
    const [isTypeOpen, setIsTypeOpen] = useState(false)
    const [isRegionOpen, setIsRegionOpen] = useState(false)
    const typeRef = useRef<HTMLDivElement>(null)
    const regionRef = useRef<HTMLDivElement>(null)

    // This is needed to prevent SSR issues with Leaflet
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)

        function handleClickOutside(event: MouseEvent) {
            if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
                setIsTypeOpen(false)
            }
            if (regionRef.current && !regionRef.current.contains(event.target as Node)) {
                setIsRegionOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    if (!mounted) return (
        <div className="w-full h-[600px] flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        </div>
    )

    // Extract unique regions, treating nulls as 'Não informada'
    const regions = Array.from(new Set(units.map(u => u.region || "Não informada"))).sort()

    // Filter units
    const filteredUnits = units.filter(unit => {
        const typeMatch = selectedTypes.length === 0 || (unit.map_categories && selectedTypes.includes(unit.map_categories.name))
        const unitRegion = unit.region || "Não informada"
        const regionMatch = selectedRegions.length === 0 || selectedRegions.includes(unitRegion)

        return typeMatch && regionMatch
    })

    const toggleType = (name: string) => {
        setSelectedTypes(prev => prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name])
    }

    const toggleRegion = (reg: string) => {
        setSelectedRegions(prev => prev.includes(reg) ? prev.filter(r => r !== reg) : [...prev, reg])
    }

    const clearFilters = () => {
        setSelectedTypes([])
        setSelectedRegions([])
        setIsTypeOpen(false)
        setIsRegionOpen(false)
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative z-50">
                <div className="flex-1 relative" ref={typeRef}>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                        Tipo de Unidade
                    </label>
                    <button
                        onClick={() => setIsTypeOpen(!isTypeOpen)}
                        className="w-full h-10 px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 flex items-center justify-between text-left hover:border-blue-400 transition-colors"
                    >
                        <span className="truncate pr-2">
                            {selectedTypes.length === 0 ? "Todos as Categorias" : `${selectedTypes.length} selecionada(s)`}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                    </button>

                    {isTypeOpen && (
                        <div className="absolute top-[70px] left-0 w-full min-w-[250px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl p-3 z-[60] max-h-[300px] overflow-y-auto custom-scrollbar">
                            <div className="space-y-3">
                                {categories.map((cat) => (
                                    <div key={cat.id} className="flex items-center gap-2">
                                        <Checkbox
                                            id={`type-${cat.id}`}
                                            checked={selectedTypes.includes(cat.name)}
                                            onCheckedChange={() => toggleType(cat.name)}
                                        />
                                        <label htmlFor={`type-${cat.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-zinc-700 dark:text-zinc-300">
                                            {cat.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 relative" ref={regionRef}>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                        Região
                    </label>
                    <button
                        onClick={() => setIsRegionOpen(!isRegionOpen)}
                        className="w-full h-10 px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 flex items-center justify-between text-left hover:border-blue-400 transition-colors"
                    >
                        <span className="truncate pr-2">
                            {selectedRegions.length === 0 ? "Todas as Regiões" : `${selectedRegions.length} selecionada(s)`}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                    </button>

                    {isRegionOpen && (
                        <div className="absolute top-[70px] left-0 w-full min-w-[200px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl p-3 z-[60] max-h-[300px] overflow-y-auto custom-scrollbar">
                            <div className="space-y-3">
                                {regions.map((region) => (
                                    <div key={region} className="flex items-center gap-2">
                                        <Checkbox
                                            id={`region-${region}`}
                                            checked={selectedRegions.includes(region)}
                                            onCheckedChange={() => toggleRegion(region)}
                                        />
                                        <label htmlFor={`region-${region}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-zinc-700 dark:text-zinc-300">
                                            {region}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-end pb-0 sm:pb-0 px-2 flex-col justify-end">
                    <span className="text-[13px] font-semibold text-zinc-600 dark:text-zinc-400 mb-2 sm:mb-1 block">
                        Exibindo <strong className="text-cyan-600 dark:text-cyan-400">{filteredUnits.length}</strong> unidades no mapa
                    </span>
                    {(selectedTypes.length > 0 || selectedRegions.length > 0) && (
                        <button
                            onClick={clearFilters}
                            className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors flex items-center self-end sm:self-start"
                        >
                            <FilterX className="h-3 w-3 mr-1" />
                            Limpar Filtros
                        </button>
                    )}
                </div>
            </div>

            {/* Map Container */}
            <div className="w-full h-[700px] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg relative z-0">
                <MapContainer
                    center={[-18.9186, -48.2766]} // Uberlândia coords
                    zoom={12}
                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {filteredUnits.length > 0 && filteredUnits.map((unit) => {
                        const iconColor = unit.map_categories?.color || 'blue'

                        return (
                            <Marker
                                key={unit.id}
                                position={[unit.latitude, unit.longitude]}
                                icon={createCustomIcon(iconColor)}
                            >
                                <Popup>
                                    <div className="font-sans text-sm">
                                        <b className="text-base text-zinc-900 block mb-1">{unit.name}</b>
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 inline-block mb-2 border border-zinc-200">
                                            {unit.map_categories?.name || 'Sem Categoria'}
                                        </span>
                                        <div className="space-y-1 mt-1 text-zinc-700">
                                            <p><b>Região:</b> {unit.region || 'N/A'}</p>
                                            <p>📍 <b>Endereço:</b> {unit.address || 'N/A'}</p>
                                            {unit.phone && <p>☎️ <b>Telefone:</b> {unit.phone}</p>}
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        )
                    })}
                </MapContainer>
            </div>
        </div>
    )
}
