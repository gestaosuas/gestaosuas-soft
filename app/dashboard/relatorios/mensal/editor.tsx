'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Trash, Type, Table as TableIcon, FileText, ArrowLeft, Save,
    Bold, Italic, Underline, Heading1, Plus, AlignLeft, AlignCenter, AlignRight, List
} from "lucide-react"
import Link from 'next/link'
import { submitReport, checkSubmissionExists, deleteMonthData } from '@/app/dashboard/actions'
import { AlertTriangle, Lock } from 'lucide-react'

// --- Types ---

type BlockType = 'heading' | 'paragraph' | 'table'

interface ReportBlock {
    id: string
    type: BlockType
    content: any
}

interface UserProps {
    isAdmin?: boolean
    directorateId: string
    directorateName: string
    setor?: string
}

// --- Components ---

const ToolbarButton = ({ onClick, icon: Icon, active = false }: { onClick: () => void, icon: any, active?: boolean }) => (
    <Button
        variant="ghost"
        size="sm"
        className={`h-8 w-8 p-0 ${active ? 'bg-blue-100 text-blue-700' : 'text-zinc-500 hover:text-zinc-900'}`}
        onClick={(e) => { e.preventDefault(); onClick(); }}
    >
        <Icon className="w-4 h-4" />
    </Button>
)

const RichTextEditor = ({ content, onChange }: { content: string, onChange: (html: string) => void }) => {
    const editorRef = useRef<HTMLDivElement>(null)

    const exec = (command: string, value: string = '') => {
        document.execCommand(command, false, value)
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML)
        }
    }

    // Sync content changes from props (only if different to prevent cursor jumps)
    useEffect(() => {
        if (editorRef.current && content !== editorRef.current.innerHTML) {
            // Check if the difference is meaningful (sometimes browser adds attributes)
            // For simple usage, strict inequality is usually enough if we are the only writer.
            // But to be safe, we only updating if the prop is truly different (e.g. loaded from db)
            // If the user just typed, onInput triggered onChange, so content == innerHTML mostly.
            // If they differ slightly due to parsing, we might still jump. 
            // BUT, usually local typing updates DOM -> onInput -> state update -> Effect -> props update.
            // If props == DOM, no update. Cursor safe.
            editorRef.current.innerHTML = content
        }
    }, [content])

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML)
        }
    }

    return (
        <div className="border rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all shadow-sm">
            <div className="flex items-center gap-1 p-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <ToolbarButton icon={Bold} onClick={() => exec('bold')} />
                <ToolbarButton icon={Italic} onClick={() => exec('italic')} />
                <ToolbarButton icon={Underline} onClick={() => exec('underline')} />
                <div className="w-px h-4 bg-zinc-200 mx-2" />
                <ToolbarButton icon={List} onClick={() => exec('insertUnorderedList')} />
            </div>
            <div
                ref={editorRef}
                className="min-h-[160px] p-6 outline-none prose prose-blue max-w-none text-sm dark:text-zinc-300"
                contentEditable
                onInput={handleInput}
                onBlur={handleInput}
            />
        </div>
    )
}

// --- Main Page Component ---

export default function MonthlyReportEditor({
    directorateId,
    directorateName,
    setor,
    isAdmin = false
}: UserProps) {
    const [month, setMonth] = useState<string>(String(new Date().getMonth() + 1))
    const [year, setYear] = useState<string>(String(new Date().getFullYear()))
    const [blocks, setBlocks] = useState<ReportBlock[]>([])
    const [attachIndicators, setAttachIndicators] = useState(false)
    const [loading, setLoading] = useState(false)
    const [alreadySubmitted, setAlreadySubmitted] = useState(false)

    // Effect to check if submission already exists
    useEffect(() => {
        async function check() {
            if (!directorateId || !month || !year) return
            const exists = await checkSubmissionExists(directorateId, Number(month), Number(year), undefined, setor)
            setAlreadySubmitted(exists)
        }
        check()
    }, [month, year, directorateId, setor])

    // Helper: Current Date Logic
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    // Period Lock Logic (Current or Previous)
    const isCurrentPeriod = (Number(month) === currentMonth && Number(year) === currentYear)
    const isPreviousPeriod = (Number(year) === (currentMonth === 1 ? currentYear - 1 : currentYear) &&
        Number(month) === (currentMonth === 1 ? 12 : currentMonth - 1))

    const isLocked = !isAdmin && !isCurrentPeriod && !isPreviousPeriod
    const isEditBlocked = !isAdmin && alreadySubmitted

    const addBlock = (type: BlockType) => {
        const newBlock: ReportBlock = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content: type === 'table'
                ? { headers: ['Coluna 1', 'Coluna 2'], rows: [['', '']] }
                : (type === 'heading' ? 'Novo Título' : 'Comece a digitar...')
        }
        setBlocks([...blocks, newBlock])
    }

    const removeBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id))
    }

    const updateBlockContent = (id: string, content: any) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b))
    }

    // Table Helpers
    const handleTableChange = (blockId: string, rowIndex: number, colIndex: number, value: string) => {
        const block = blocks.find(b => b.id === blockId)
        if (!block || block.type !== 'table') return
        const newRows = [...block.content.rows]
        newRows[rowIndex][colIndex] = value
        updateBlockContent(blockId, { ...block.content, rows: newRows })
    }

    const handleHeaderChange = (blockId: string, colIndex: number, value: string) => {
        const block = blocks.find(b => b.id === blockId)
        if (!block || block.type !== 'table') return
        const newHeaders = [...block.content.headers]
        newHeaders[colIndex] = value
        updateBlockContent(blockId, { ...block.content, headers: newHeaders })
    }

    const addRow = (blockId: string) => {
        const block = blocks.find(b => b.id === blockId)
        if (!block || block.type !== 'table') return
        const newRow = new Array(block.content.headers.length).fill('')
        updateBlockContent(blockId, { ...block.content, rows: [...block.content.rows, newRow] })
    }

    const addColumn = (blockId: string) => {
        const block = blocks.find(b => b.id === blockId)
        if (!block || block.type !== 'table') return
        const newHeaders = [...block.content.headers, `Nova Coluna`]
        const newRows = block.content.rows.map((row: string[]) => [...row, ''])
        updateBlockContent(blockId, { ...block.content, headers: newHeaders, rows: newRows })
    }

    const removeRow = (blockId: string, rowIndex: number) => {
        const block = blocks.find(b => b.id === blockId)
        if (!block || block.type !== 'table') return
        if (block.content.rows.length <= 1) return
        const newRows = block.content.rows.filter((_: any, i: number) => i !== rowIndex)
        updateBlockContent(blockId, { ...block.content, rows: newRows })
    }

    const removeColumn = (blockId: string, colIndex: number) => {
        const block = blocks.find(b => b.id === blockId)
        if (!block || block.type !== 'table') return
        if (block.content.headers.length <= 1) return
        const newHeaders = block.content.headers.filter((_: any, i: number) => i !== colIndex)
        const newRows = block.content.rows.map((row: string[]) => row.filter((_: any, j: number) => j !== colIndex))
        updateBlockContent(blockId, { ...block.content, headers: newHeaders, rows: newRows })
    }

    const handleUnlock = async () => {
        if (!confirm("Isso irá remover o relatório atual deste mês para permitir um novo preenchimento pelo usuário. Confirmar?")) {
            return
        }

        setLoading(true)
        try {
            const result = await deleteMonthData(directorateId, Number(month), Number(year), undefined, setor)
            if (result.success) {
                setAlreadySubmitted(false)
                setBlocks([]) // Limpa o editor
                alert("Preenchimento liberado com sucesso!")
            } else {
                alert("Erro ao liberar preenchimento.")
            }
        } catch (e) {
            console.error(e)
            alert("Erro ao liberar preenchimento.")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (blocks.length === 0) {
            alert("Adicione pelo menos um bloco de conteúdo.")
            return
        }
        if (!confirm(`Confirma o envio do Relatório Mensal de ${directorateName}?`)) return

        setLoading(true)
        try {
            const payload = {
                _report_content: blocks,
                _report_type: 'monthly_narrative',
                _attach_indicators: false
            }
            const result = await submitReport(payload, Number(month), Number(year), directorateId, setor)
            if (result?.error) alert(result.error)
            else {
                alert("Relatório salvo com sucesso!")
                window.location.href = `/dashboard/relatorios/lista?directorate_id=${directorateId}${setor ? `&setor=${setor}` : ''}`
            }
        } catch (e) {
            console.error(e)
            alert("Erro ao salvar.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-zinc-100 dark:border-zinc-800/60">
                <div className="flex items-center gap-6">
                    <Link href={`/dashboard/diretoria/${directorateId}`}>
                        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">
                            <ArrowLeft className="h-5 w-5 text-zinc-500" />
                        </Button>
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-extrabold tracking-tight text-blue-900 dark:text-blue-50">
                            Relatório Mensal
                        </h1>
                        <p className="text-[12px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                            {directorateName}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || isEditBlocked || isLocked}
                        className="h-11 px-8 bg-blue-900 dark:bg-blue-600 text-white hover:bg-blue-800 dark:hover:bg-blue-500 font-bold rounded-lg transition-all active:scale-[0.98] shadow-lg shadow-blue-900/10 dark:shadow-none uppercase tracking-widest text-[11px]"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Enviando...' : 'Salvar Relatório'}
                    </Button>
                </div>
            </div>

            {/* Selection Context & Alerts */}
            <div className="max-w-4xl mx-auto space-y-10">
                {/* Context Selector Card */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-1 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 shadow-sm">
                    <div className="flex items-center gap-2 px-6 border-r border-zinc-100 dark:border-zinc-800 h-14">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Mês</span>
                        <Select value={month} onValueChange={setMonth} disabled={loading || isEditBlocked}>
                            <SelectTrigger className="w-[140px] border-none shadow-none font-bold text-blue-900 dark:text-blue-100 focus:ring-0">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl">
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                    <SelectItem key={m} value={String(m)} className="uppercase text-[11px] font-bold py-3 px-4 focus:bg-blue-900 dark:focus:bg-blue-600 focus:text-white cursor-pointer transition-colors">
                                        {new Date(0, m - 1).toLocaleString('pt-BR', { month: 'long' })}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2 px-6 h-14">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Ano</span>
                        <Select value={year} onValueChange={setYear} disabled={loading || isEditBlocked}>
                            <SelectTrigger className="w-[100px] border-none shadow-none font-bold text-blue-900 dark:text-blue-100 focus:ring-0">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl">
                                {Array.from({ length: 3 }, (_, i) => 2024 + i).map(y => (
                                    <SelectItem key={y} value={String(y)} className="text-[11px] font-bold py-3 px-4 focus:bg-blue-900 dark:focus:bg-blue-600 focus:text-white cursor-pointer transition-colors">{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Lock Alerts */}
                {alreadySubmitted && !isAdmin && (
                    <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl flex items-start gap-5 text-amber-900 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="p-3 bg-amber-100 rounded-2xl text-amber-600 shadow-sm">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-1">Relatório já enviado e bloqueado para edição</h4>
                            <p className="text-sm leading-relaxed opacity-80">
                                Este relatório narrativo já foi consolidado no sistema para o período selecionado.
                                Para garantir a integridade do acervo, não é possível realizar alterações após o envio.
                                <br />
                                <span className="font-bold mt-2 block">Dica: Utilize o Histórico para visualizar o documento final.</span>
                            </p>
                        </div>
                    </div>
                )}

                {alreadySubmitted && isAdmin && (
                    <div className="p-6 bg-blue-50 border border-blue-200 rounded-3xl flex items-center justify-between gap-5 text-blue-900 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="flex items-start gap-5">
                            <div className="p-3 bg-blue-100 rounded-2xl text-blue-600 shadow-sm">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-1">Relatório Existente (Modo Admin)</h4>
                                <p className="text-sm leading-relaxed opacity-80">
                                    Este relatório já foi enviado. Você pode editá-lo ou liberar para que o usuário envie um novo.
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleUnlock}
                            disabled={loading}
                            className="shrink-0 border-blue-200 hover:bg-blue-100 text-blue-700 font-bold uppercase tracking-widest text-[11px]"
                        >
                            <Lock className="w-4 h-4 mr-2" />
                            Liberar Preenchimento
                        </Button>
                    </div>
                )}

                {!isEditBlocked && isLocked && (
                    <div className="p-6 bg-red-50 border border-red-200 rounded-3xl flex items-start gap-5 text-red-900 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="p-3 bg-red-100 rounded-2xl text-red-600 shadow-sm">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-1">Período de Preenchimento Bloqueado</h4>
                            <p className="text-sm leading-relaxed opacity-80">
                                O envio de relatórios retroativos está limitado ao mês anterior do calendário atual.
                                Selecione o mês atual ou o imediatamente anterior para prosseguir com o preenchimento.
                            </p>
                        </div>
                    </div>
                )}

                {/* Editor Content Area */}
                <div className={`space-y-6 transition-all duration-500 ${(isEditBlocked || isLocked) ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                    {blocks.map((block, index) => (
                        <div key={block.id} className="group relative transition-all duration-300">
                            <div className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                    onClick={() => removeBlock(block.id)}
                                >
                                    <Trash className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm overflow-hidden p-6">
                                {block.type === 'heading' && (
                                    <div className="flex gap-4 items-center">
                                        <div className="h-10 w-1 bg-blue-600 rounded-full" />
                                        <Input
                                            value={block.content as string}
                                            onChange={(e) => updateBlockContent(block.id, e.target.value)}
                                            className="text-xl font-bold border-none shadow-none focus-visible:ring-0 p-0 h-auto bg-transparent text-blue-900 dark:text-blue-50 placeholder:text-zinc-300"
                                            placeholder="Digite o título da seção..."
                                        />
                                    </div>
                                )}

                                {block.type === 'paragraph' && (
                                    <RichTextEditor
                                        content={block.content as string}
                                        onChange={(val) => updateBlockContent(block.id, val)}
                                    />
                                )}

                                {block.type === 'table' && (
                                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                                        <div className="bg-zinc-50 dark:bg-zinc-900 px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                                <TableIcon className="w-3 h-3" /> Tabela
                                            </span>
                                        </div>
                                        <CardContent className="p-4 overflow-x-auto">
                                            <table className="w-full border-collapse text-sm">
                                                <thead>
                                                    <tr>
                                                        {block.content.headers.map((header: string, i: number) => (
                                                            <th key={i} className="group/col border border-zinc-200 p-1 bg-zinc-50 min-w-[150px] relative">
                                                                <Input
                                                                    value={header}
                                                                    onChange={(e) => handleHeaderChange(block.id, i, e.target.value)}
                                                                    className="h-8 border-transparent hover:border-zinc-300 focus:border-indigo-500 bg-transparent font-bold text-center text-zinc-900"
                                                                />
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-4 w-4 absolute -top-1 -right-1 opacity-0 group-hover/col:opacity-100 bg-white dark:bg-zinc-800 border shadow-sm"
                                                                    onClick={() => removeColumn(block.id, i)}
                                                                >
                                                                    <Trash className="h-2 w-2 text-red-500" />
                                                                </Button>
                                                            </th>
                                                        ))}
                                                        <th className="w-8 border-none bg-transparent" />
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {block.content.rows.map((row: string[], i: number) => (
                                                        <tr key={i} className="group/row">
                                                            {row.map((cell: string, j: number) => (
                                                                <td key={j} className="border border-zinc-200 p-1 min-w-[150px]">
                                                                    <Input
                                                                        value={cell}
                                                                        onChange={(e) => handleTableChange(block.id, i, j, e.target.value)}
                                                                        className="h-8 border-transparent hover:border-zinc-300 focus:border-indigo-500 bg-transparent text-zinc-700"
                                                                    />
                                                                </td>
                                                            ))}
                                                            <td className="w-8 p-1 border-none bg-transparent">
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-6 w-6 opacity-0 group-hover/row:opacity-100"
                                                                    onClick={() => removeRow(block.id, i)}
                                                                >
                                                                    <Trash className="h-3 w-3 text-red-500" />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <div className="mt-4 flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => addRow(block.id)} className="text-xs"><Plus className="w-3 h-3 mr-1" /> Linha</Button>
                                                <Button variant="outline" size="sm" onClick={() => addColumn(block.id)} className="text-xs"><Plus className="w-3 h-3 mr-1" /> Coluna</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Add Blocks Area */}
                    <div className="flex flex-col md:flex-row justify-center items-center gap-6 py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800/60 rounded-3xl bg-zinc-50/30 dark:bg-zinc-900/20 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                        <Button variant="outline" onClick={() => addBlock('heading')} className="h-12 px-8 rounded-xl border-zinc-200 hover:border-blue-600 hover:text-blue-600 hover:bg-white bg-white dark:bg-zinc-900 transition-all font-bold text-[11px] uppercase tracking-widest shadow-sm">
                            <Heading1 className="w-4 h-4 mr-2" />
                            Novo Título
                        </Button>
                        <Button variant="outline" onClick={() => addBlock('paragraph')} className="h-12 px-8 rounded-xl border-zinc-200 hover:border-blue-600 hover:text-blue-600 hover:bg-white bg-white dark:bg-zinc-900 transition-all font-bold text-[11px] uppercase tracking-widest shadow-sm">
                            <Type className="w-4 h-4 mr-2" />
                            Novo Parágrafo
                        </Button>
                        <Button variant="outline" onClick={() => addBlock('table')} className="h-12 px-8 rounded-xl border-zinc-200 hover:border-blue-600 hover:text-blue-600 hover:bg-white bg-white dark:bg-zinc-900 transition-all font-bold text-[11px] uppercase tracking-widest shadow-sm">
                            <TableIcon className="w-4 h-4 mr-2" />
                            Nova Tabela
                        </Button>
                    </div>

                    {/* Final Action */}
                    <div className="flex justify-end pt-10">
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || isEditBlocked || isLocked}
                            className="h-14 px-12 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm uppercase tracking-widest shadow-xl shadow-blue-900/20 transition-all active:scale-[0.98]"
                        >
                            {loading ? 'Enviando...' : (isEditBlocked ? 'Relatório Bloqueado' : 'Finalizar e Enviar Relatório')}
                            <Save className="w-5 h-5 ml-3" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
