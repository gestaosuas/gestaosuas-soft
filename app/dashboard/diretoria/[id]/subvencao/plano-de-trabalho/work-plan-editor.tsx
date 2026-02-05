'use client'

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Plus, GripVertical, Type, AlignLeft, Table as TableIcon } from "lucide-react"

export interface Block {
    id: string
    type: 'title' | 'paragraph' | 'table'
    content: any
}

interface WorkPlanEditorProps {
    initialTitle?: string
    initialBlocks?: Block[]
    onSave: (title: string, blocks: Block[]) => void
    onCancel: () => void
}

export function WorkPlanEditor({ initialTitle = "Novo Plano de Trabalho", initialBlocks = [], onSave, onCancel }: WorkPlanEditorProps) {
    const [title, setTitle] = useState(initialTitle)
    const [blocks, setBlocks] = useState<Block[]>(initialBlocks)

    const addBlock = (type: Block['type']) => {
        const newBlock: Block = {
            id: crypto.randomUUID(),
            type,
            content: type === 'table'
                ? { headers: ['Coluna 1', 'Coluna 2'], rows: [['', '']] }
                : ''
        }
        setBlocks([...blocks, newBlock])
    }

    const updateBlock = (id: string, content: any) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b))
    }

    const removeBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id))
    }

    const handleSave = () => {
        onSave(title, blocks)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xl font-bold border-transparent hover:border-zinc-200 focus:border-blue-500 px-2 h-auto py-2"
                />
            </div>

            <div className="flex justify-center gap-3 py-4 sticky top-0 bg-white dark:bg-zinc-950 z-10 border-b border-zinc-100 dark:border-zinc-800 mb-2">
                <Button variant="outline" onClick={() => addBlock('title')} className="gap-2 rounded-full h-10 px-6">
                    <Type className="h-4 w-4" /> Novo Título
                </Button>
                <Button variant="outline" onClick={() => addBlock('paragraph')} className="gap-2 rounded-full h-10 px-6">
                    <AlignLeft className="h-4 w-4" /> Novo Parágrafo
                </Button>
                <Button variant="outline" onClick={() => addBlock('table')} className="gap-2 rounded-full h-10 px-6">
                    <TableIcon className="h-4 w-4" /> Nova Tabela
                </Button>
            </div>

            <div className="flex justify-center items-center gap-6 px-4 py-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-6">
                <div className="flex items-center gap-1.5">
                    <span className="bg-zinc-200 dark:bg-zinc-800 px-1 rounded text-zinc-900">**texto**</span>
                    <span>Negrito</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="bg-zinc-200 dark:bg-zinc-800 px-1 rounded text-zinc-900">*texto*</span>
                    <span>Itálico</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="bg-zinc-200 dark:bg-zinc-800 px-1 rounded text-zinc-900">__texto__</span>
                    <span>Sublinhado</span>
                </div>
            </div>

            <div className="space-y-6 min-h-[400px]">
                {blocks.map((block, index) => (
                    <div key={block.id} className="group relative pl-8 pr-12 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-xl border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all">
                        <div className="absolute left-2 top-6 opacity-0 group-hover:opacity-30 cursor-grab active:cursor-grabbing">
                            <GripVertical className="h-4 w-4" />
                        </div>

                        {block.type === 'title' && (
                            <Input
                                value={block.content}
                                onChange={(e) => updateBlock(block.id, e.target.value)}
                                placeholder="Digite o título..."
                                className="text-lg font-bold border-none shadow-none bg-transparent px-0 focus-visible:ring-0"
                            />
                        )}

                        {block.type === 'paragraph' && (
                            <Textarea
                                value={block.content}
                                onChange={(e) => updateBlock(block.id, e.target.value)}
                                placeholder="Digite o texto deste parágrafo..."
                                className="min-h-[100px] border-none shadow-none bg-transparent px-0 focus-visible:ring-0 text-zinc-600 dark:text-zinc-300 resize-none"
                            />
                        )}

                        {block.type === 'table' && (
                            <div className="space-y-2 overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr>
                                            {block.content.headers.map((header: string, i: number) => (
                                                <th key={i} className="p-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
                                                    <input
                                                        value={header}
                                                        onChange={(e) => {
                                                            const newHeaders = [...block.content.headers]
                                                            newHeaders[i] = e.target.value
                                                            updateBlock(block.id, { ...block.content, headers: newHeaders })
                                                        }}
                                                        className="w-full bg-transparent font-bold outline-none"
                                                    />
                                                </th>
                                            ))}
                                            <th className="w-8 p-1 border-none bg-transparent">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6"
                                                    onClick={() => {
                                                        const newHeaders = [...block.content.headers, 'Nova Coluna']
                                                        const newRows = block.content.rows.map((row: string[]) => [...row, ''])
                                                        updateBlock(block.id, { headers: newHeaders, rows: newRows })
                                                    }}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {block.content.rows.map((row: string[], i: number) => (
                                            <tr key={i}>
                                                {row.map((cell: string, j: number) => (
                                                    <td key={j} className="p-2 border border-zinc-200 dark:border-zinc-700">
                                                        <input
                                                            value={cell}
                                                            onChange={(e) => {
                                                                const newRows = [...block.content.rows]
                                                                newRows[i][j] = e.target.value
                                                                updateBlock(block.id, { ...block.content, rows: newRows })
                                                            }}
                                                            className="w-full bg-transparent outline-none"
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        const newRow = new Array(block.content.headers.length).fill('')
                                        const newRows = [...block.content.rows, newRow]
                                        updateBlock(block.id, { ...block.content, rows: newRows })
                                    }}
                                    className="text-xs"
                                >
                                    <Plus className="h-3 w-3 mr-1" /> Adicionar Linha
                                </Button>
                            </div>
                        )}

                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute right-2 top-4 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                            onClick={() => removeBlock(block.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}

                {blocks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                        <Type className="h-10 w-10 mb-4 opacity-20" />
                        <p>Comece adicionando um título ou parágrafo</p>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">Salvar Plano</Button>
            </div>
        </div>
    )
}
