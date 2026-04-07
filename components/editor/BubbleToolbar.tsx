
'use client'

import { type Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import {
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  MessageSquare,
  Highlighter
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BubbleToolbarProps {
  editor: Editor | null
}

export function BubbleToolbar({ editor }: BubbleToolbarProps) {
  if (!editor) return null

  return (
    <BubbleMenu 
      editor={editor} 
      className="flex items-center gap-0.5 p-1 bg-zinc-900 dark:bg-zinc-100 border border-zinc-800 dark:border-zinc-200 rounded-lg shadow-xl"
    >
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => editor.chain().focus().toggleBold().run()} 
        className={editor.isActive('bold') ? 'text-blue-400 dark:text-blue-600 bg-white/10' : 'text-white dark:text-zinc-900'}
      >
        <Bold className="w-3.5 h-3.5" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => editor.chain().focus().toggleItalic().run()} 
        className={editor.isActive('italic') ? 'text-blue-400 dark:text-blue-600 bg-white/10' : 'text-white dark:text-zinc-900'}
      >
        <Italic className="w-3.5 h-3.5" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => editor.chain().focus().toggleUnderline().run()} 
        className={editor.isActive('underline') ? 'text-blue-400 dark:text-blue-600 bg-white/10' : 'text-white dark:text-zinc-900'}
      >
        <Underline className="w-3.5 h-3.5" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => editor.chain().focus().toggleHighlight().run()} 
        className={editor.isActive('highlight') ? 'text-yellow-400 dark:text-yellow-600 bg-white/10' : 'text-white dark:text-zinc-900'}
      >
        <Highlighter className="w-3.5 h-3.5" />
      </Button>
      <div className="w-px h-4 bg-zinc-700 dark:bg-zinc-300 mx-1" />
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => {
          const url = window.prompt('URL do link:')
          if (url) editor.chain().focus().setLink({ href: url }).run()
        }} 
        className={editor.isActive('link') ? 'text-blue-400 dark:text-blue-600 bg-white/10' : 'text-white dark:text-zinc-900'}
      >
        <LinkIcon className="w-3.5 h-3.5" />
      </Button>
    </BubbleMenu>
  )
}
