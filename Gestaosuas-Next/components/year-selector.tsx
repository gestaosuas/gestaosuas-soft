'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import * as React from "react"

export function YearSelector({ currentYear, onChange }: { currentYear: number, onChange?: (year: number) => void }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const years = []
    const startYear = 2024
    const endYear = new Date().getFullYear() + 1
    for (let y = endYear; y >= startYear; y--) {
        years.push(y)
    }

    const handleYearChange = (year: string) => {
        if (onChange) {
            onChange(Number(year))
            return
        }
        const params = new URLSearchParams(searchParams.toString())
        params.set('year', year)
        router.push(`?${params.toString()}`)
    }

    return (
        <select
            value={currentYear}
            onChange={(e) => handleYearChange(e.target.value)}
            className="h-9 min-w-[100px] appearance-none rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-bold ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer font-medium text-blue-900 dark:text-blue-100 shadow-sm"
        >
            {years.map(y => (
                <option key={y} value={y}>{y}</option>
            ))}
        </select>
    )
}
