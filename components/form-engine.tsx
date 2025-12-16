'use client'

import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type FieldDefinition = {
    id: string
    label: string
    type: 'text' | 'number' | 'date'
    required?: boolean
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
    disabled = false
}: {
    definition: FormDefinition,
    initialData?: Record<string, any>,
    onSubmit: (data: Record<string, any>) => void
    disabled?: boolean
}) {
    const [formData, setFormData] = useState<Record<string, any>>(initialData)

    const handleChange = (id: string, value: any) => {
        setFormData(prev => ({ ...prev, [id]: value }))
    }

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
                <div key={idx} className="space-y-6">
                    <div className="flex items-center gap-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 uppercase tracking-tight">
                            {section.title}
                        </h3>
                        <div className="h-pxflex-1 bg-zinc-100 dark:bg-zinc-800"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {section.fields.map((field) => (
                            <div key={field.id} className="space-y-2 group">
                                <Label
                                    htmlFor={field.id}
                                    className="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-primary transition-colors"
                                >
                                    {field.label}
                                </Label>
                                <Input
                                    id={field.id}
                                    name={field.id}
                                    type={field.type}
                                    onChange={(e) => handleChange(field.id, e.target.value)}
                                    disabled={disabled}
                                    required={field.required}
                                    value={formData[field.id] || ''}
                                    className="h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="flex justify-end pt-6">
                <Button
                    type="submit"
                    disabled={disabled}
                    size="lg"
                    className="w-full md:w-auto min-w-[200px] h-12 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                >
                    {disabled ? 'Salvando...' : 'Salvar Relatório'}
                </Button>
            </div>
        </form>
    )
}
