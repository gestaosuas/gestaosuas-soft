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
import { submitReport } from '@/app/dashboard/actions'

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
        className={`h-8 w-8 p-0 ${active ? 'bg-indigo-100 text-indigo-700' : 'text-zinc-500 hover:text-zinc-900'}`}
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
        <div className="border rounded-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <div className="flex items-center gap-1 p-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <ToolbarButton icon={Bold} onClick={() => exec('bold')} />
                <ToolbarButton icon={Italic} onClick={() => exec('italic')} />
                <ToolbarButton icon={Underline} onClick={() => exec('underline')} />
                <div className="w-px h-4 bg-zinc-300 mx-1" />
                <ToolbarButton icon={List} onClick={() => exec('insertUnorderedList')} />
            </div>
            <div
                ref={editorRef}
                className="min-h-[120px] p-4 outline-none prose prose-indigo max-w-none text-sm dark:text-zinc-300"
                contentEditable
                onInput={handleInput}
                onBlur={handleInput}
            // No dangerouslySetInnerHTML here to avoid re-render cursor reset
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

    // Helper: Current Date Logic
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

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
                _attach_indicators: attachIndicators
            }
            const result = await submitReport(payload, Number(month), Number(year), directorateId, setor)
            if (result?.error) alert(result.error)
            else {
                alert("Relatório salvo com sucesso!")
                window.location.href = `/dashboard/diretoria/${directorateId}`
            }
        } catch (e) {
            console.error(e)
            alert("Erro ao salvar.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/diretoria/${directorateId}`}>
                        <Button variant="ghost" size="icon" className="hover:bg-amber-50 hover:text-amber-600 transition-colors">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                            Relatório Mensal
                        </h1>
                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {directorateName}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20 font-bold"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Relatório
                    </Button>
                </div>
            </div>

            {/* Config Card */}
            <Card className="border-amber-100 dark:border-amber-900/30 shadow-xl shadow-amber-500/5 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl">
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <Label>Mês de Referência</Label>
                        <Select value={month} onValueChange={setMonth} disabled={loading}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
                                    const selectedYearInt = parseInt(year)
                                    let isDisabled = false
                                    if (!isAdmin) {
                                        if (selectedYearInt > currentYear) isDisabled = true
                                        else if (selectedYearInt === currentYear && m > currentMonth) isDisabled = true
                                    }
                                    return (
                                        <SelectItem key={m} value={String(m)} disabled={isDisabled}>
                                            {new Date(0, m - 1).toLocaleString('pt-BR', { month: 'long' }).toUpperCase()}
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-3">
                        <Label>Ano</Label>
                        <Select value={year} onValueChange={setYear} disabled={loading}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2025">2025</SelectItem>
                                <SelectItem value="2026">2026</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-2 flex items-center gap-3 pt-2 border-t border-amber-100 dark:border-amber-900/10">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="attachIndicators"
                                checked={attachIndicators}
                                onChange={(e) => setAttachIndicators(e.target.checked)}
                                className="h-5 w-5 rounded border-zinc-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                            />
                            <Label htmlFor="attachIndicators" className="cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
                                Anexar Tabela de Indicadores (Dados Quantitativos) no final do relatório?
                            </Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Editor Area */}
            <div className="space-y-6 max-w-4xl mx-auto">
                {blocks.map((block, index) => (
                    <div key={block.id} className="group relative transition-all duration-300">
                        <div className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => removeBlock(block.id)}>
                                <Trash className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Heading Block */}
                        {block.type === 'heading' && (
                            <div className="relative">
                                <Heading1 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <Input
                                    className="pl-10 text-xl font-bold border-transparent hover:border-zinc-200 focus:border-indigo-500 bg-transparent h-14"
                                    placeholder="Digite o título..."
                                    value={block.content as string}
                                    onChange={(e) => updateBlockContent(block.id, e.target.value)}
                                />
                            </div>
                        )}

                        {/* Paragraph Block */}
                        {block.type === 'paragraph' && (
                            <RichTextEditor
                                content={block.content as string}
                                onChange={(val) => updateBlockContent(block.id, val)}
                            />
                        )}

                        {/* Table Block */}
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
                                                    <th key={i} className="border border-zinc-200 p-1 bg-zinc-50 min-w-[150px]">
                                                        <Input
                                                            value={header}
                                                            onChange={(e) => handleHeaderChange(block.id, i, e.target.value)}
                                                            className="h-8 border-transparent hover:border-zinc-300 focus:border-indigo-500 bg-transparent font-bold text-center"
                                                        />
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {block.content.rows.map((row: string[], i: number) => (
                                                <tr key={i}>
                                                    {row.map((cell: string, j: number) => (
                                                        <td key={j} className="border border-zinc-200 p-1 min-w-[150px]">
                                                            <Input
                                                                value={cell}
                                                                onChange={(e) => handleTableChange(block.id, i, j, e.target.value)}
                                                                className="h-8 border-transparent hover:border-zinc-300 focus:border-indigo-500 bg-transparent"
                                                            />
                                                        </td>
                                                    ))}
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
                ))}

                {/* Add Buttons */}
                <div className="flex justify-center gap-4 py-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 transition-colors hover:border-indigo-300">
                    <Button variant="outline" onClick={() => addBlock('heading')} className="hover:border-indigo-500 hover:text-indigo-600 hover:bg-white">
                        <Heading1 className="w-4 h-4 mr-2" />
                        Título
                    </Button>
                    <Button variant="outline" onClick={() => addBlock('paragraph')} className="hover:border-indigo-500 hover:text-indigo-600 hover:bg-white">
                        <Type className="w-4 h-4 mr-2" />
                        Texto
                    </Button>
                    <Button variant="outline" onClick={() => addBlock('table')} className="hover:border-indigo-500 hover:text-indigo-600 hover:bg-white">
                        <TableIcon className="w-4 h-4 mr-2" />
                        Tabela
                    </Button>
                </div>
            </div>
        </div>
    )
}
