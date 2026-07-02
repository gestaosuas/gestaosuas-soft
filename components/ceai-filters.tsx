'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CEAIFiltersProps {
    isAdmin: boolean
    availableUnits: string[]
    availableCategories: string[]
}

export function CEAIFilters({ isAdmin, availableUnits, availableCategories }: CEAIFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentUnit = searchParams.get('unit_filter') || 'todos'
    const currentCategory = searchParams.get('category_filter') || 'todos'

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === 'todos') {
            params.delete(key)
        } else {
            params.set(key, value)
        }
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="flex flex-wrap items-center gap-4">
            {isAdmin && (
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Unidade:</span>
                    <Select value={currentUnit} onValueChange={(val) => updateFilter('unit_filter', val)}>
                        <SelectTrigger className="w-[180px] h-8 text-[11px] font-bold bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-lg">
                            <SelectValue placeholder="Todas as Unidades" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                            <SelectItem value="todos" className="text-[11px] font-bold">Todas as Unidades</SelectItem>
                            {availableUnits.map(unit => (
                                <SelectItem key={unit} value={unit} className="text-[11px] font-bold">{unit}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Categoria:</span>
                <Select value={currentCategory} onValueChange={(val) => updateFilter('category_filter', val)}>
                    <SelectTrigger className="w-[180px] h-8 text-[11px] font-bold bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-lg">
                        <SelectValue placeholder="Todas as Categorias" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                        <SelectItem value="todos" className="text-[11px] font-bold">Todas as Categorias</SelectItem>
                        {availableCategories.map(cat => (
                            <SelectItem key={cat} value={cat} className="text-[11px] font-bold">{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
