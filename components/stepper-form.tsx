'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { FormDefinition } from "./form-engine"

export function StepperForm({
    definition,
    initialData = {},
    onSubmit,
    onDataChange,
    disabled = false,
    stepsConfig
}: {
    definition: FormDefinition,
    initialData?: Record<string, any>,
    onSubmit: (data: Record<string, any>) => void
    onDataChange?: (data: Record<string, any>, setData: (data: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => void) => void
    disabled?: boolean
    stepsConfig: { title: string, sectionIndexes: number[] }[]
}) {
    const [formData, setFormData] = useState<Record<string, any>>(initialData)
    const [currentStep, setCurrentStep] = useState(0)
    const [direction, setDirection] = useState<'next' | 'prev' | null>(null)
    const isFirstRender = useRef(true)

    const handleChange = (id: string, value: any) => {
        setFormData(prev => ({ ...prev, [id]: value }))
    }

    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormData(prev => ({ ...initialData, ...prev }))
        }
    }, [initialData])

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }
        if (onDataChange) {
            onDataChange(formData, setFormData)
        }
    }, [formData, onDataChange])

    const nextStep = () => {
        if (currentStep < stepsConfig.length - 1) {
            setDirection('next')
            setCurrentStep(prev => prev + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setDirection('prev')
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation() // Prevent event bubbling
        
        if (currentStep === stepsConfig.length - 1) {
            onSubmit(formData)
        } else {
            nextStep()
        }
    }

    if (!definition || !definition.sections || !stepsConfig || stepsConfig.length === 0) {
        return <div className="p-8 text-center text-red-500 font-bold bg-red-50 rounded-2xl border border-red-100">Formulário não configurado corretamente para o modo Stepper (Sem passos definidos).</div>
    }

    const progress = ((currentStep + 1) / stepsConfig.length) * 100

    return (
        <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                    <span>Passo {currentStep + 1} de {stepsConfig.length}</span>
                    <span className="text-blue-600 dark:text-blue-400">{stepsConfig[currentStep].title}</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="relative overflow-x-hidden min-h-[200px]">
                <div 
                    className={cn(
                        "space-y-6 transition-all duration-500 ease-in-out",
                        direction === 'next' ? "animate-in slide-in-from-right-8 fade-in" : 
                        direction === 'prev' ? "animate-in slide-in-from-left-8 fade-in" : ""
                    )}
                    key={currentStep}
                >
                    {stepsConfig[currentStep].sectionIndexes.map((sectionIdx) => {
                        const section = definition.sections[sectionIdx]
                        if (!section) return null
                        
                        return (
                            <div key={sectionIdx} className="space-y-6 animate-in fade-in duration-700">
                                <div className="flex items-center gap-3">
                                    <div className="h-1 w-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                                    <h3 className="text-[11px] font-extrabold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">
                                        {section.title}
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {section.fields.map((field) => (
                                        <div key={field.id} className="flex flex-col space-y-2.5 group">
                                            <div className="min-h-[40px] flex items-end">
                                                <Label
                                                    htmlFor={field.id}
                                                    className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider ml-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
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
                                            </div>
                                            <Input
                                                id={field.id}
                                                name={field.id}
                                                type={field.type}
                                                onChange={(e) => handleChange(field.id, e.target.value)}
                                                disabled={disabled || field.disabled}
                                                required={field.required}
                                                value={formData[field.id] || ''}
                                                placeholder="0"
                                                className="h-12 bg-zinc-50/50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-400/50 dark:focus-visible:ring-blue-600/50 focus-visible:border-blue-500 transition-all font-semibold text-lg"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/60 mt-6">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={prevStep}
                        disabled={currentStep === 0 || disabled}
                        className={cn(
                            "h-12 px-8 text-zinc-500 font-bold rounded-xl transition-all uppercase tracking-widest text-[10px] gap-2",
                            currentStep === 0 && "opacity-0 pointer-events-none"
                        )}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Anterior
                    </Button>

                    <div className="flex gap-4">
                        {currentStep < stepsConfig.length - 1 ? (
                            <Button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    nextStep()
                                }}
                                disabled={disabled}
                                className="h-12 px-10 bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20 uppercase tracking-widest text-[11px] gap-2"
                            >
                                Próximo Passo
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={disabled}
                                className="h-12 px-12 bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600 font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-green-600/20 uppercase tracking-widest text-[11px] gap-2"
                            >
                                {disabled ? 'Processando...' : 'Confirmar e Enviar'}
                                <CheckCircle2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    )
}
