'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Check } from 'lucide-react'

interface SignaturePadProps {
    onSave: (dataUrl: string) => void
    onClear?: () => void
    defaultValue?: string
    readOnly?: boolean
    label?: string
}

export function SignaturePad({ onSave, onClear, defaultValue, readOnly, label }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [isEmpty, setIsEmpty] = useState(!defaultValue)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set high DPI support
        const dpr = window.devicePixelRatio || 1
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        ctx.scale(dpr, dpr)
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.strokeStyle = '#000'

        if (defaultValue) {
            const img = new Image()
            img.src = defaultValue
            img.onload = () => {
                ctx.drawImage(img, 0, 0, rect.width, rect.height)
            }
        }
    }, [defaultValue])

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (readOnly) return
        setIsDrawing(true)
        draw(e)
    }

    const stopDrawing = () => {
        if (readOnly) return
        setIsDrawing(false)
        const canvas = canvasRef.current
        if (canvas) {
            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.beginPath() // Reset path
                const dataUrl = canvas.toDataURL()
                onSave(dataUrl)
                setIsEmpty(false)
            }
        }
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || readOnly) return
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return

        const rect = canvas.getBoundingClientRect()
        let x, y

        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left
            y = e.touches[0].clientY - rect.top
        } else {
            x = (e as React.MouseEvent).clientX - rect.left
            y = (e as React.MouseEvent).clientY - rect.top
        }

        ctx.lineTo(x, y)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x, y)
    }

    const clear = () => {
        if (readOnly) return
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setIsEmpty(true)
        onSave('')
        if (onClear) onClear()
    }

    return (
        <div className="space-y-4">
            {label && <label className="text-[12px] font-bold uppercase tracking-widest text-zinc-400">{label}</label>}
            <div className="relative group">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseMove={draw}
                    onTouchStart={startDrawing}
                    onTouchEnd={stopDrawing}
                    onTouchMove={draw}
                    className={`w-full h-40 rounded-2xl touch-none ${readOnly ? 'cursor-not-allowed border-none bg-transparent shadow-none' : 'bg-zinc-50 dark:bg-zinc-950 border-2 border-dashed border-zinc-200 dark:border-zinc-800 cursor-crosshair active:border-blue-500 transition-colors'}`}
                />
                {!readOnly && !isEmpty && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={clear}
                        className="absolute bottom-3 right-3 h-8 w-8 rounded-lg bg-white/80 dark:bg-zinc-900/80 text-red-500 hover:text-red-600 hover:bg-red-50 shadow-sm"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
                {isEmpty && !readOnly && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-zinc-300 dark:text-zinc-700 text-sm font-medium">
                        Assine aqui
                    </div>
                )}
            </div>
        </div>
    )
}
