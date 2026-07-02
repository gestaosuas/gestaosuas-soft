
'use client'

import { type Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Table as TableIcon,
  Plus,
  Trash2,
  Undo,
  Redo,
  Layout
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ToolbarProps {
  editor: Editor | null
}

export function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm mb-4 sticky top-0 z-10">
      {/* Undo/Redo */}
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Desfazer">
        <Undo className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Refazer">
        <Redo className="w-4 h-4" />
      </Button>
      <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1" />

      {/* Typography */}
      <Button variant={editor.isActive('heading', { level: 1 }) ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40' : ''}>
        <Heading1 className="w-4 h-4" />
      </Button>
      <Button variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40' : ''}>
        <Heading2 className="w-4 h-4" />
      </Button>
      <Button variant={editor.isActive('heading', { level: 3 }) ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40' : ''}>
        <Heading3 className="w-4 h-4" />
      </Button>
      <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1" />

      {/* Formatting */}
      <Button variant={editor.isActive('bold') ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40' : ''}>
        <Bold className="w-4 h-4" />
      </Button>
      <Button variant={editor.isActive('italic') ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40' : ''}>
        <Italic className="w-4 h-4" />
      </Button>
      <Button variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40' : ''}>
        <Quote className="w-4 h-4" />
      </Button>
      <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1" />

      {/* Lists */}
      <Button variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40' : ''}>
        <List className="w-4 h-4" />
      </Button>
      <Button variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40' : ''}>
        <ListOrdered className="w-4 h-4" />
      </Button>
      <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1" />

      {/* Tables Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={editor.isActive('table') ? 'secondary' : 'ghost'} size="sm" className="gap-2 px-3 font-bold">
            <TableIcon className="w-4 h-4" /> Tabela
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onClick={() => {
            const rows = window.prompt('Número de linhas:', '3')
            const cols = window.prompt('Número de colunas:', '3')
            if (rows && cols) {
              editor.chain().focus().insertTable({ rows: parseInt(rows), cols: parseInt(cols), withHeaderRow: true }).run()
            }
          }}>
            <Plus className="w-4 h-4 mr-2" /> Inserir Tabela Personalizada
          </DropdownMenuItem>
          <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
          <DropdownMenuItem onClick={() => editor.chain().focus().addColumnBefore().run()} disabled={!editor.isActive('table')}>
            Adicionar Coluna Esquerda
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={!editor.isActive('table')}>
            Adicionar Coluna Direita
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().addRowBefore().run()} disabled={!editor.isActive('table')}>
            Adicionar Linha Acima
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().addRowAfter().run()} disabled={!editor.isActive('table')}>
            Adicionar Linha Abaixo
          </DropdownMenuItem>
          <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
          <DropdownMenuItem onClick={() => editor.chain().focus().deleteColumn().run()} disabled={!editor.isActive('table')} className="text-red-500">
            Excluir Coluna
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().deleteRow().run()} disabled={!editor.isActive('table')} className="text-red-500">
            Excluir Linha
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().deleteTable().run()} disabled={!editor.isActive('table')} className="text-red-500 font-bold">
            <Trash2 className="w-4 h-4 mr-2" /> Excluir Tabela
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
