"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"

export function MonthSelector({ currentMonth, onChange }: { currentMonth: number | string, onChange?: (month: string) => void }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleMonthChange = (value: string) => {
        if (onChange) {
            onChange(value)
            return
        }
        const params = new URLSearchParams(searchParams.toString())
        params.set('month', value)
        router.push(`?${params.toString()}`)
    }

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ]

    return (
        <div className="relative group/select">
            <select
                value={currentMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="h-9 min-w-[140px] appearance-none rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 pl-8 py-1.5 text-xs font-bold ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer font-medium text-blue-900 dark:text-blue-100 shadow-sm"
            >
                <option value="all">Ano Inteiro</option>
                {months.map((month, index) => (
                    <option key={index} value={index + 1}>
                        {month}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
        </div>
    )
}
