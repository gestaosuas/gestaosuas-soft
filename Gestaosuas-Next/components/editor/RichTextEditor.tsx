import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import BubbleMenuExtension from '@tiptap/extension-bubble-menu'
import { Toolbar } from './Toolbar'
import { BubbleToolbar } from './BubbleToolbar'

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Highlight.configure({ multicolor: true }),
      Table.configure({
        resizable: true,
      }),
      BubbleMenuExtension,
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: placeholder || 'Comece a digitar seu relatório aqui...',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-zinc dark:prose-invert max-w-none min-h-[400px] focus:outline-none p-6 pb-20 editor-content',
      },
    },
  })

  return (
    <div className="w-full border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-500/20 relative">
      <Toolbar editor={editor} />
      <BubbleToolbar editor={editor} />
      <EditorContent editor={editor} />
      
      <style jsx global>{`
        .editor-content h1 { font-size: 2.25rem; font-weight: 900; color: #1e3a8a; margin-top: 2rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
        .editor-content h2 { font-size: 1.5rem; font-weight: 800; color: #1e40af; margin-top: 1.5rem; }
        .editor-content h3 { font-size: 1.25rem; font-weight: 700; color: #1d4ed8; margin-top: 1rem; }
        .dark .editor-content h1 { color: #60a5fa; border-color: #333; }
        .dark .editor-content h2 { color: #93c5fd; }
        .dark .editor-content h3 { color: #bfdbfe; }
        
        .ProseMirror table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 0;
        }
        .ProseMirror td, .ProseMirror th {
          min-width: 1em;
          border: 2px solid #ddd;
          padding: 3px 5px;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }
        .ProseMirror th {
          font-weight: bold;
          text-align: left;
          background-color: #f1f3f5;
        }
        .dark .ProseMirror th {
          background-color: #1a1a1a;
          border-color: #333;
        }
        .dark .ProseMirror td {
          border-color: #333;
        }
        .ProseMirror .selectedCell:after {
          z-index: 2;
          position: absolute;
          content: "";
          left: 0; right: 0; top: 0; bottom: 0;
          background: rgba(200, 200, 255, 0.4);
          pointer-events: none;
        }
        .ProseMirror .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: -2px;
          width: 4px;
          background-color: #adf;
          pointer-events: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  )
}
