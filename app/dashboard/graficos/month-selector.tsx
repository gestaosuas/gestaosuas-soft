"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"

export function MonthSelector({ currentMonth }: { currentMonth: number }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value
        const params = new URLSearchParams(searchParams.toString())
        params.set('month', value)
        router.push(`?${params.toString()}`)
    }

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ]

    return (
        <div className="relative z-[110]">
            <select
                value={currentMonth}
                onChange={handleMonthChange}
                className="h-10 w-[180px] appearance-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus:ring-zinc-300 cursor-pointer"
            >
                {months.map((month, index) => (
                    <option key={index} value={index + 1}>
                        {month}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
        </div>
    )
}
