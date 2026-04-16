"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { CRAS_UNITS } from "../cras-config"

export function UnitSelector({ currentUnit, units = CRAS_UNITS, onChange }: { currentUnit: string, units?: string[], onChange?: (unit: string) => void }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleUnitChange = (value: string) => {
        if (onChange) {
            onChange(value)
            return
        }
        const params = new URLSearchParams(searchParams.toString())
        params.set('unit', value)
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="relative group/select">
            <select
                value={currentUnit}
                onChange={(e) => handleUnitChange(e.target.value)}
                className="h-9 min-w-[160px] appearance-none rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 pl-8 py-1.5 text-xs font-bold ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer font-medium text-blue-900 dark:text-blue-100 shadow-sm"
            >
                <option value="all">Unidade Geral</option>
                {units.map((unit, index) => (
                    <option key={index} value={unit}>
                        {unit}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
        </div>
    )
}
