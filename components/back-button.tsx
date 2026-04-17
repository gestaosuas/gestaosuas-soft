'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BackButtonProps {
    href: string
    label?: string
    className?: string
}

export function BackButton({ href, label = "Voltar para Diretoria", className }: BackButtonProps) {
    const router = useRouter()

    return (
        <button
            type="button"
            onClick={() => router.push(href)}
            className={cn(
                "group flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:text-blue-900 shadow-sm rounded-full px-4 py-2 h-9 font-bold text-[10px] uppercase transition-all hover:border-blue-200",
                className
            )}
        >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            <span>{label}</span>
        </button>
    )
}
