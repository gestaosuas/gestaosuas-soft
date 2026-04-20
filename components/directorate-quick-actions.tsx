"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, Settings2, X, ArrowLeft, Maximize2, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DirectorateQuickActionsProps {
    title: string
    defaultOpen?: boolean
    children: React.ReactNode
    actions?: React.ReactNode
}

export function DirectorateQuickActions({ title, defaultOpen = false, children, actions }: DirectorateQuickActionsProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)
    const [modalUrl, setModalUrl] = useState<string | null>(null)
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleContainerClick = (e: React.MouseEvent) => {
        let target = e.target as HTMLElement
        const anchor = target.closest('a')
        
        if (anchor) {
            const href = anchor.getAttribute('href') || ""
            const label = anchor.querySelector('h3')?.textContent || anchor.textContent || ""
            
            const isMatch = label.includes("Atualizar Dados") || 
                          label.includes("Ver Dados") || 
                          label.includes("Ver Relatórios") || 
                          href.includes("/relatorios/novo") || 
                          href.includes("/dashboard/dados") ||
                          href.includes("/relatorios/lista")

            if (href && isMatch) {
                e.preventDefault()
                e.stopPropagation()
                
                // Append modal=true if not present
                const url = new URL(href, window.location.origin)
                url.searchParams.set('modal', 'true')
                setModalUrl(url.pathname + url.search)
            }
        }
    }

    useEffect(() => {
        if (modalUrl) {
            document.body.classList.add('overflow-hidden')
        } else {
            document.body.classList.remove('overflow-hidden')
        }
        
        // Listen for messages from iframe
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'closeModal' || event.data === 'closeModal') {
                setModalUrl(null)
                // Optional: trigger a refresh or specific action on parent
                if (event.data?.refresh) {
                    window.location.reload()
                }
            }
        }
        
        window.addEventListener('message', handleMessage)
        return () => { 
            document.body.classList.remove('overflow-hidden')
            window.removeEventListener('message', handleMessage)
        }
    }, [modalUrl])

    return (
        <div className="space-y-6" onClickCapture={handleContainerClick}>
            <div className={cn(
                "sticky top-2 z-[40] transition-all duration-300",
                isScrolled ? "translate-y-1" : "translate-y-0"
            )}>
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-3 px-5 shadow-lg shadow-zinc-200/20 dark:shadow-none flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 overflow-hidden">
                        <h1 className="text-xl md:text-2xl font-black text-[#1e3a8a] dark:text-blue-50 tracking-tight truncate shrink-0">
                            {title}
                        </h1>
                        {actions && (
                            <div className="hidden md:flex flex-1 items-center justify-end px-4 border-l border-zinc-100 dark:border-zinc-800 ml-2 overflow-x-auto no-scrollbar">
                                {actions}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button 
                            onClick={() => setIsOpen(!isOpen)}
                            className={cn(
                                "font-bold rounded-xl px-4 py-6 transition-all active:scale-95 flex items-center gap-2 ring-2 ring-blue-500/10",
                                isOpen 
                                    ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 shadow-none border-zinc-200" 
                                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30"
                            )}
                        >
                            <Settings className={cn("w-4 h-4 transition-transform duration-500", !isOpen && "rotate-90")} />
                            <span className="hidden sm:inline font-black uppercase tracking-wider text-[11px]">
                                {isOpen ? "Fechar Menu" : "Gerenciar Unidade"}
                            </span>
                            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </Button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-500">
                    {children}
                </div>
            )}

            {modalUrl && (
                <div 
                    className="fixed top-0 bottom-0 right-0 z-[150] transition-all duration-300 ease-in-out flex flex-col pt-[72px] md:pt-0"
                    style={{ left: 'var(--sidebar-width, 0px)' }}
                >
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalUrl(null)} />
                    <div className="relative flex-1 m-4 md:m-8 bg-white dark:bg-zinc-950 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col animate-in slide-in-from-right-12 duration-500 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                        <div className="h-16 flex items-center justify-between px-8 border-b border-zinc-100 dark:border-zinc-900 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md z-10 shrink-0">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="sm" onClick={() => setModalUrl(null)} className="rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-900 h-10 px-4 group bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-bold">
                                    <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                                    <span className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-600 dark:text-zinc-400">Voltar ao Painel</span>
                                </Button>
                                <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                                    <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest leading-none">Ambiente de Trabalho</span>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setModalUrl(null)} className="h-11 w-11 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30">
                                <X className="w-6 h-6" />
                            </Button>
                        </div>
                        <div className="flex-1 w-full bg-white dark:bg-zinc-950 overflow-hidden relative">
                             <iframe src={modalUrl} className="w-full h-full border-none shadow-inner" title="Action Modal" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
