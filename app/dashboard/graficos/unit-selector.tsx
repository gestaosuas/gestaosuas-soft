"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { CRAS_UNITS } from "../cras-config"

export function UnitSelector({ currentUnit, units = CRAS_UNITS }: { currentUnit: string, units?: string[] }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value
        const params = new URLSearchParams(searchParams.toString())
        params.set('unit', value)
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="relative z-[110]">
            <select
                value={currentUnit}
                onChange={handleUnitChange}
                className="h-10 w-[220px] appearance-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus:ring-zinc-300 cursor-pointer font-bold text-blue-900 dark:text-blue-100"
            >
                <option value="all">Todas as Unidades</option>
                {units.map((unit, index) => (
                    <option key={index} value={unit}>
                        {unit}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
        </div>
    )
}
