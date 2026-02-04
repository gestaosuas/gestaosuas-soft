'use client'

import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

export type FieldDefinition = {
    id: string
    label: string
    type: 'text' | 'number' | 'date'
    required?: boolean
    disabled?: boolean
    tooltip?: string
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
        if (Object.keys(initialData).length > 0) {
            setFormData(prev => ({ ...prev, ...initialData }))
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
        <form onSubmit={handleSubmit} className="space-y-12">
            {definition.sections.map((section, idx) => (
                <div key={idx} className="space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                        <h3 className="text-[11px] font-extrabold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">
                            {section.title}
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {section.fields.map((field) => (
                            <div key={field.id} className="space-y-2.5">
                                <Label
                                    htmlFor={field.id}
                                    className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider ml-0.5"
                                >
                                    {field.label}
                                    {field.tooltip && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-3.5 w-3.5 text-green-600 dark:text-green-500 cursor-help hover:text-green-700 dark:hover:text-green-400 transition-colors inline-block ml-1.5 align-middle mb-0.5" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="max-w-[200px] text-xs font-medium">{field.tooltip}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </Label>
                                <Input
                                    id={field.id}
                                    name={field.id}
                                    type={field.type}
                                    onChange={(e) => handleChange(field.id, e.target.value)}
                                    disabled={disabled || field.disabled}
                                    required={field.required}
                                    value={formData[field.id] || ''}
                                    className="h-11 bg-zinc-50/50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-600 transition-all font-medium"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="flex justify-end pt-10 border-t border-zinc-100 dark:border-zinc-800/60">
                <Button
                    type="submit"
                    disabled={disabled}
                    className="h-12 px-12 bg-blue-900 dark:bg-blue-600 text-white hover:bg-blue-800 dark:hover:bg-blue-500 font-bold rounded-lg transition-all active:scale-[0.98] shadow-lg shadow-blue-900/10 dark:shadow-none uppercase tracking-widest text-[11px]"
                >
                    {disabled ? 'Processando...' : 'Confirmar e Enviar'}
                </Button>
            </div>
        </form>
    )
}
