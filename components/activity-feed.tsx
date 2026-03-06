'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Bell, FileText, CheckCircle2, FilePlus, RefreshCw, Trash2, Building2, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { formatDistanceToNow, format, startOfDay, endOfDay, addDays, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from './ui/button'

type ActivityLog = {
    id: string
    created_at: string
    user_name: string
    directorate_name: string
    action_type: string
    resource_type: string
    resource_name: string
    details: any
}

export function ActivityFeed() {
    const [logs, setLogs] = useState<ActivityLog[]>([])
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const fetchLogsByDate = async () => {
            setLoading(true)
            const start = startOfDay(selectedDate).toISOString()
            const end = endOfDay(selectedDate).toISOString()

            const { data, error } = await supabase
                .from('activity_logs')
                .select('*')
                .gte('created_at', start)
                .lte('created_at', end)
                .order('created_at', { ascending: false })

            if (data && !error) setLogs(data)
            setLoading(false)
        }

        fetchLogsByDate()

        // Realtime subscription only for today
        const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
        let channel: any

        if (isToday) {
            channel = supabase
                .channel('activity-feed-today')
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'activity_logs' },
                    (payload) => {
                        const newLog = payload.new as ActivityLog
                        setLogs((prev) => [newLog, ...prev])
                    }
                )
                .subscribe()
        }

        return () => {
            if (channel) supabase.removeChannel(channel)
        }
    }, [supabase, selectedDate])

    const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1))
    const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1))
    const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

    const getIcon = (action_type: string) => {
        switch (action_type) {
            case 'CREATE': return <FilePlus className="w-4 h-4 text-emerald-500" />
            case 'UPDATE': return <RefreshCw className="w-4 h-4 text-blue-500" />
            case 'DELETE': return <Trash2 className="w-4 h-4 text-red-500" />
            case 'DRAFT': return <FileText className="w-4 h-4 text-amber-500" />
            default: return <Bell className="w-4 h-4 text-zinc-500" />
        }
    }

    const getActionText = (action_type: string, resource_type: string) => {
        const resourceMap: Record<string, string> = {
            'REPORT': 'um relatório',
            'VISIT': 'uma visita',
            'OSC': 'uma OSC',
            'WORK_PLAN': 'um plano de trabalho',
        }
        const res = resourceMap[resource_type] || 'um registro'

        switch (action_type) {
            case 'CREATE': return `criou ${res}`
            case 'UPDATE': return `atualizou ${res}`
            case 'DELETE': return `excluiu ${res}`
            case 'DRAFT': return `salvou um rascunho de ${res}`
            default: return `modificou ${res}`
        }
    }

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800 p-8 flex flex-col shadow-sm min-h-[calc(100vh-250px)] mb-10 w-full">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 border-b border-zinc-50 dark:border-zinc-800 pb-6">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        {isToday && (
                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                            </span>
                        )}
                    </div>
                    <div className="space-y-0.5">
                        <h3 className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100">Atividade da Rede</h3>
                        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Feed de Monitoramento</p>
                    </div>
                </div>

                {/* Date Navigation */}
                <div className="flex items-center bg-zinc-50 dark:bg-zinc-800/50 p-1.5 rounded-xl border border-zinc-100 dark:border-zinc-700/50">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-white dark:hover:bg-zinc-800 shadow-none"
                        onClick={handlePrevDay}
                    >
                        <ChevronLeft className="w-4 h-4 text-zinc-600" />
                    </Button>

                    <div className="flex items-center gap-2 px-4 min-w-[180px] justify-center">
                        <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[12px] font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                            {isToday ? 'Hoje, ' : ''}{format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                        </span>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-white dark:hover:bg-zinc-800 shadow-none disabled:opacity-30"
                        onClick={handleNextDay}
                        disabled={isToday}
                    >
                        <ChevronRight className="w-4 h-4 text-zinc-600" />
                    </Button>
                </div>
            </div>

            <div className={`flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 ${loading ? 'opacity-50' : ''}`}>
                {logs.length === 0 ? (
                    <div className="text-center text-sm text-zinc-500 dark:text-zinc-400 py-24 flex flex-col items-center">
                        <Bell className="w-8 h-8 text-zinc-200 dark:text-zinc-800 mb-3" />
                        <p className="font-bold">Nenhuma atividade neste dia.</p>
                        <p className="text-xs mt-1">Utilize as setas acima para navegar entre os dias.</p>
                    </div>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="flex gap-4 p-3 -mx-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <div className="mt-1 p-2 bg-white dark:bg-zinc-800 rounded-full border border-zinc-100 dark:border-zinc-700 shadow-sm shrink-0">
                                {getIcon(log.action_type)}
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-[13px] text-zinc-800 dark:text-zinc-200 leading-snug">
                                    <span className="font-bold text-blue-900 dark:text-blue-100">{log.user_name || 'Usuário'}</span>{' '}
                                    <span className="text-zinc-500">{getActionText(log.action_type, log.resource_type)}</span>
                                    {log.resource_name && <span className="font-semibold text-zinc-700 dark:text-zinc-300"> - {log.resource_name}</span>}
                                </p>
                                <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
                                    <span>{formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR })}</span>
                                    {log.directorate_name && (
                                        <>
                                            <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                                <Building2 className="w-3 h-3" />
                                                <span>{log.directorate_name}</span>
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
            `}</style>
        </div>
    )
}
