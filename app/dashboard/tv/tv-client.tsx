'use client'

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { 
    Play, 
    Pause, 
    ChevronLeft, 
    ChevronRight, 
    Maximize2, 
    Minimize2,
    X,
    Filter
} from "lucide-react"
import { CrasPageClient } from "@/components/cras-page-client"
import { BeneficiosPageClient } from "@/components/beneficios-page-client"
import { SineCpPageClient } from "@/components/sine-cp-page-client"
import { CeaiPageClient } from "@/components/ceai-page-client"
import { CreasPageClient } from "@/components/creas-page-client"
import { PopRuaPageClient } from "@/components/pop-rua-page-client"
import { NaicaPageClient } from "@/components/naica-page-client"
import { CasaMulherPageClient } from "@/components/casa-mulher-page-client"
import { CRAS_UNITS } from "@/app/dashboard/cras-config"
import { CEAI_UNITS } from "@/app/dashboard/ceai-config"
import { NAICA_UNITS } from "@/app/dashboard/naica-config"
import { cn } from "@/lib/utils"
import Link from "next/link"

const SLIDE_DURATION = 30000 // 30 seconds per dashboard

export function TvDashboardClient({ directorates }: { directorates: any[] }) {
    const [activeIndex, setActiveIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(true)
    const [showFilters, setShowFilters] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [currentTime, setCurrentTime] = useState("")

    useEffect(() => {
        setIsMounted(true)
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('pt-BR'))
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const nextSlide = useCallback(() => {
        setActiveIndex((prev) => (prev + 1) % directorates.length)
    }, [directorates.length])

    const prevSlide = useCallback(() => {
        setActiveIndex((prev) => (prev - 1 + directorates.length) % directorates.length)
    }, [directorates.length])
    
    const [isFullscreen, setIsFullscreen] = useState(false)
    
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
            setIsFullscreen(true)
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen()
                setIsFullscreen(false)
            }
        }
    }

    useEffect(() => {
        const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement)
        document.addEventListener('fullscreenchange', handleFsChange)
        return () => document.removeEventListener('fullscreenchange', handleFsChange)
    }, [])

    const currentDir = directorates[activeIndex]
    if (!currentDir) return null

    const normalizedName = currentDir.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    const id = currentDir.id
    
    const isSINE = normalizedName.includes('sine') || id === 'd9f66b00-4782-4fc3-a064-04029529054b'
    const isCP = normalizedName.includes('formacao') || normalizedName.includes('profissional') || normalizedName.includes('centro') || id === 'd9f66b00-4782-4fc3-a064-04029529054b'
    const isBeneficios = normalizedName.includes('beneficios') || id === 'efaf606a-53ae-4bbc-996c-79f4354ce0f9'
    const isCRAS = normalizedName.includes('cras')
    const isCREAS = normalizedName.includes('creas')
    const isCEAI = normalizedName.includes('ceai')
    const isPopRua = normalizedName.includes('populacao') && normalizedName.includes('rua')
    const isNAICA = normalizedName.includes('naica')
    const isCasaDaMulher = normalizedName.includes('casa da mulher')

    const currentYear = new Date().getFullYear()
    const getMonthName = (month: number) => new Date(0, month - 1).toLocaleString('pt-BR', { month: 'long' })
    const latestSubmission = currentDir.submissions?.[0]
    const latestMonth = latestSubmission ? getMonthName(latestSubmission.month) : null

    const renderDashboard = () => {
        const props = {
            directorate: currentDir,
            submissions: currentDir.submissions,
            currentYear,
            tvMode: true
        }

        if (isSINE || isCP) return <SineCpPageClient {...props} latestMonthSINE_CP={latestMonth} />
        if (isBeneficios) return <BeneficiosPageClient {...props} />
        if (isCRAS) return <CrasPageClient {...props} allowedUnits={null} />
        if (isCEAI) return <CeaiPageClient {...props} allowedUnits={null} filteredCEAI={CEAI_UNITS} />
        if (isCREAS) return <CreasPageClient {...props} latestMonth={latestMonth} />
        if (isNAICA) return <NaicaPageClient {...props} filteredNAICA={NAICA_UNITS} />
        if (isPopRua) return <PopRuaPageClient {...props} latestMonth={latestMonth} />
        if (isCasaDaMulher) return <CasaMulherPageClient {...props} />

        return (
            <div className="flex flex-col items-center justify-center h-full">
                <h1 className="text-4xl font-black text-zinc-300 uppercase tracking-widest">{currentDir.name}</h1>
                <p className="text-zinc-500 mt-4 font-bold uppercase tracking-widest">Módulo em Desenvolvimento</p>
            </div>
        )
    }

    if (!isMounted) return null

    return (
        <main 
            className={cn(
                "fixed inset-y-0 right-0 z-[15] bg-white dark:bg-zinc-950 overflow-hidden transition-all duration-300 ease-in-out",
                isFullscreen && "z-[100]"
            )}
            style={{ left: isFullscreen ? '0px' : 'var(--sidebar-width, 0px)' }}
        >
            <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
                {/* Header / Progress Bar */}
                <ProgressBar isPlaying={isPlaying} onComplete={nextSlide} activeIndex={activeIndex} />

                {/* Top Toolbar */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <X className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-2" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none">
                                Dashboard Diretorias
                            </span>
                            <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight leading-tight">
                                {currentDir.name}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-full px-4 py-1.5 flex items-center gap-4 mr-4">
                            <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">
                                {activeIndex + 1} / {directorates.length}
                            </span>
                        </div>

                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="rounded-full shadow-sm"
                            onClick={prevSlide}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>

                        <Button 
                            variant="default" 
                            size="icon" 
                            className="rounded-full w-12 h-12 shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700"
                            onClick={() => setIsPlaying(!isPlaying)}
                        >
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                        </Button>

                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="rounded-full shadow-sm"
                            onClick={nextSlide}
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>

                        <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-2" />

                        <Button 
                            variant={showFilters ? "secondary" : "ghost"}
                            size="icon" 
                            className="rounded-full"
                            onClick={() => setShowFilters(!showFilters)}
                            title="Alternar Filtros"
                        >
                            <Filter className="h-5 w-5" />
                        </Button>

                        <Button 
                            variant="ghost"
                            size="icon" 
                            className="rounded-full"
                            onClick={toggleFullscreen}
                            title="Tela Cheia"
                        >
                            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className={cn(
                    "flex-1 overflow-hidden p-4 md:p-6 lg:p-8 relative",
                    !showFilters && "hide-filters"
                )}>
                    <style jsx global>{`
                        .hide-filters div[class*="filter"], 
                        .hide-filters div[class*="Filter"],
                        .hide-filters .sticky.top-0,
                        .hide-filters .z-50.sticky {
                            display: ${showFilters ? 'flex' : 'none'} !important;
                        }
                        /* Remove scrollbars */
                        *::-webkit-scrollbar {
                            display: none !important;
                        }
                        * {
                            -ms-overflow-style: none !important;
                            scrollbar-width: none !important;
                        }
                        body {
                            overflow: hidden !important;
                        }
                    `}</style>
                    <div className="max-w-[1600px] mx-auto animate-in fade-in zoom-in-95 duration-700">
                        {renderDashboard()}
                    </div>
                </div>

                {/* Footer Status */}
                <div className="px-6 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-sm flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Modo TV Ativo • Atualização em Tempo Real</span>
                    </div>
                    <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                        {currentTime}
                    </div>
                </div>
            </div>
        </main>
    )
}

function ProgressBar({ isPlaying, onComplete, activeIndex }: { isPlaying: boolean, onComplete: () => void, activeIndex: number }) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        setProgress(0)
    }, [activeIndex])

    useEffect(() => {
        if (!isPlaying) return

        const step = 100 / (30000 / 100) // SLIDE_DURATION is 30000
        const interval = setInterval(() => {
            setProgress((prev) => {
                const next = prev + step
                return next > 100 ? 100 : next
            })
        }, 100)

        return () => clearInterval(interval)
    }, [isPlaying])

    useEffect(() => {
        if (progress >= 100) {
            onComplete()
        }
    }, [progress, onComplete])

    return (
        <div className="h-1 bg-zinc-200 dark:bg-zinc-800 w-full relative">
            <div 
                className="h-full bg-blue-600 transition-all duration-100 ease-linear" 
                style={{ width: `${progress}%` }}
            />
        </div>
    )
}
