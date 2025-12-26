'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import * as React from "react"

export function YearSelector({ currentYear }: { currentYear: number }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const years = []
    const startYear = 2024
    const endYear = new Date().getFullYear() + 1
    for (let y = endYear; y >= startYear; y--) {
        years.push(y)
    }

    const handleYearChange = (year: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('year', year)
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="flex items-center gap-2 print:hidden">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Ano:</span>
            <select
                value={currentYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-bold text-blue-900 dark:text-blue-100 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
            >
                {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                ))}
            </select>
        </div>
    )
}
