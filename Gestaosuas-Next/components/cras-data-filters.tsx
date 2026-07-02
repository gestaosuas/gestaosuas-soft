"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface CRASFiltersProps {
    availableUnits: string[]
}

export function CRASFilters({ availableUnits }: CRASFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const updateFilter = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === 'todos') {
            params.delete('unit_filter')
        } else {
            params.set('unit_filter', value)
        }
        router.push(`?${params.toString()}`)
    }

    const currentUnit = searchParams.get('unit_filter') || 'todos'

    return (
        <div className="flex items-center gap-3">
            <div className="flex flex-col">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 ml-1">Filtrar Unidade</span>
                <Select value={currentUnit} onValueChange={updateFilter}>
                    <SelectTrigger className="h-9 w-[200px] rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[11px] font-bold shadow-sm">
                        <SelectValue placeholder="Todas as Unidades" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <SelectItem value="todos" className="text-[11px] font-medium">Todas as Unidades</SelectItem>
                        {availableUnits.map((unit) => (
                            <SelectItem key={unit} value={unit} className="text-[11px] font-medium">
                                {unit}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
