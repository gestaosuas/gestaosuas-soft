'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { updateSubmissionCell } from '@/app/dashboard/actions'
import { Loader2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditableTableCellProps {
    initialValue: any
    submissionId?: string
    fieldId: string
    unitName?: string
    isAdmin: boolean
    className?: string
}

export function EditableTableCell({
    initialValue,
    submissionId,
    fieldId,
    unitName,
    isAdmin,
    className
}: EditableTableCellProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [value, setValue] = useState(initialValue ?? '')
    const [isPending, startTransition] = useTransition()
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [isEditing])

    if (!isAdmin || !submissionId) {
        return (
            <span className={cn("font-bold text-zinc-900 dark:text-zinc-100", className)}>
                {initialValue !== undefined && initialValue !== '' ? initialValue : '-'}
            </span>
        )
    }

    const handleSave = () => {
        if (value === initialValue) {
            setIsEditing(false)
            return
        }

        startTransition(async () => {
            try {
                const res = await updateSubmissionCell(submissionId, fieldId, value, unitName)
                if (res.success) {
                    setIsEditing(false)
                } else {
                    alert("Erro ao salvar dado.")
                }
            } catch (error) {
                console.error("Save error:", error)
                alert("Erro ao salvar.")
            }
        })
    }

    const handleCancel = () => {
        setValue(initialValue ?? '')
        setIsEditing(false)
    }

    if (isEditing) {
        return (
            <div className="flex items-center justify-center gap-1 px-1 min-w-[60px]">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave()
                        if (e.key === 'Escape') handleCancel()
                    }}
                    disabled={isPending}
                    className="w-full h-8 text-center text-[12px] font-bold bg-white dark:bg-zinc-800 border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <div className="flex flex-col gap-0.5">
                    <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="text-green-600 hover:text-green-700 disabled:opacity-50"
                    >
                        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={isPending}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className={cn(
                "cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 py-1 px-2 rounded transition-colors group/cell relative min-h-[24px] flex items-center justify-center",
                className
            )}
            title="Clique para editar"
        >
            <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {initialValue !== undefined && initialValue !== '' ? initialValue : '-'}
            </span>
            <div className="absolute inset-0 border border-transparent group-hover/cell:border-blue-200 dark:group-hover/cell:border-blue-800 rounded pointer-events-none" />
        </div>
    )
}
