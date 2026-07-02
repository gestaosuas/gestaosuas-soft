
'use client'

import { Button } from "@/components/ui/button"
import { Printer, FileJson, Download, FileText } from "lucide-react"

export function PrintExportControls() {
    return (
        <div className="flex items-center gap-2 print:hidden">
            <Button
                onClick={() => window.print()}
                variant="outline"
                className="bg-white dark:bg-zinc-950 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 shadow-sm"
            >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir / PDF
            </Button>

            <Button
                variant="outline"
                className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 shadow-sm hidden md:flex"
                onClick={() => {
                    // Simple hack to download page as text or just alert
                    // Extracting data would be better but print fulfills the main request
                    alert("A extração de dados CSV será implementada em breve. Use a impressão como PDF por enquanto.")
                }}
            >
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
            </Button>
        </div>
    )
}
