'use client'

import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

export type FieldDefinition = {
    id: string
    label: string
    type: 'text' | 'number' | 'date' | 'file'
    required?: boolean
    disabled?: boolean
    tooltip?: string
    badgeNode?: React.ReactNode
}

export type SectionDefinition = {
    title: string
    fields: FieldDefinition[]
}

export type FormDefinition = {
    sections: SectionDefinition[]
}

export function FormEngine({
    definition,
    initialData = {},
    onSubmit,
    onDataChange,
    disabled = false
}: {
    definition: FormDefinition,
    initialData?: Record<string, any>,
    onSubmit: (data: Record<string, any>) => void
    onDataChange?: (data: Record<string, any>, setData: (data: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => void) => void
    disabled?: boolean
}) {
    const [formData, setFormData] = useState<Record<string, any>>(initialData)
    const isFirstRender = React.useRef(true)

    const handleChange = (id: string, value: any) => {
        setFormData(prev => ({ ...prev, [id]: value }))
    }

    React.useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormData(prev => ({ ...initialData, ...prev }))
        }
    }, [initialData])

    React.useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        if (onDataChange) {
            onDataChange(formData, setFormData)
        }
    }, [formData, onDataChange])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    if (!definition || !definition.sections) {
        return <div>Formulário não configurado.</div>
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {definition.sections.map((section, idx) => (
                <div key={idx} className="space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="h-[2px] w-4 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                        <h3 className="text-[10px] font-black text-blue-900/40 dark:text-blue-400/40 uppercase tracking-[0.2em]">
                            {section.title}
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4">
                        {section.fields.map((field) => (
                            <div key={field.id} className="flex flex-col space-y-1">
                                <div className="min-h-[22px] flex items-end">
                                    <Label
                                        htmlFor={field.id}
                                        className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider ml-0.5 leading-none"
                                    >
                                        {field.label}
                                        {field.tooltip && (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="h-3 w-3 text-green-600 dark:text-green-500 cursor-help hover:text-green-700 dark:hover:text-green-400 transition-colors inline-block ml-1 align-middle" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="max-w-[200px] text-[10px] font-medium">{field.tooltip}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        {field.badgeNode && (
                                            <span className="ml-1 inline-block align-middle">
                                                {field.badgeNode}
                                            </span>
                                        )}
                                    </Label>
                                </div>
                                {field.type === 'file' ? (
                                    <div className="relative">
                                        <input
                                            id={field.id}
                                            name={field.id}
                                            type="file"
                                            accept=".pdf"
                                            disabled={disabled || field.disabled}
                                            required={field.required}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) handleChange(field.id, file)
                                            }}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor={field.id}
                                            className={cn(
                                                "flex items-center justify-center w-full h-9 px-3 bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all",
                                                (disabled || field.disabled) && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            <span className="text-[11px] font-medium text-zinc-500 truncate max-w-[200px]">
                                                {formData[field.id] instanceof File
                                                    ? (formData[field.id] as File).name
                                                    : "Selecionar PDF"}
                                            </span>
                                        </label>
                                    </div>
                                ) : (
                                    <Input
                                        id={field.id}
                                        name={field.id}
                                        type={field.type}
                                        onChange={(e) => handleChange(field.id, e.target.value)}
                                        disabled={disabled || field.disabled}
                                        required={field.required}
                                        value={formData[field.id] || ''}
                                        className="h-9 bg-zinc-50/20 dark:bg-zinc-950/20 border-zinc-200/60 dark:border-zinc-800 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-600 transition-all font-semibold text-[13px]"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="flex justify-end pt-6 border-t border-zinc-100 dark:border-zinc-800/60">
                <Button
                    type="submit"
                    disabled={disabled}
                    className="h-11 px-10 bg-blue-900 dark:bg-blue-600 text-white hover:bg-blue-800 dark:hover:bg-blue-500 font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-900/10 dark:shadow-none uppercase tracking-widest text-[11px]"
                >
                    {disabled ? 'Enviando...' : 'Finalizar Preenchimento'}
                </Button>
            </div>
        </form>
    )
}
