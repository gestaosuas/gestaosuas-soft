import { createClient } from "@/utils/supabase/server"
import { ArrowLeft, Printer } from "lucide-react"
import { getCachedSubmission } from "@/app/dashboard/cached-data"
import { redirect } from "next/navigation"
import ReportActions from "./report-actions"
import { cn } from "@/lib/utils"

export default async function ViewReportPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const supabase = await createClient()
    // Use Secure Cache Fetcher
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <div>Acesso negado.</div>

    const submission = await getCachedSubmission(id, user.id)

    if (!submission) return <div>Relatório não encontrado.</div>

    // Check Admin Status
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    let isAdmin = false
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        const isEmailAdmin = ['klismanrds@gmail.com', 'gestaosuas@uberlandia.mg.gov.br'].includes(user.email || '')
        isAdmin = profile?.role === 'admin' || isEmailAdmin
    }

    const content = submission.data?._report_content || []
    const isNarrative = content.length > 0
    const directorateName = submission.directorates?.name || 'Diretoria'
    const monthName = new Date(0, submission.month - 1).toLocaleString('pt-BR', { month: 'long' })

    return (
        <div className="container mx-auto max-w-4xl py-8 animate-in fade-in zoom-in-95 duration-500">

            <ReportActions
                reportId={id}
                directorateId={submission.directorate_id}
                isAdmin={isAdmin}
            />

            {/* Report Document */}
            {/* print-only-container is used by globals.css to be the ONLY visible thing when printing */}
            <div className="bg-white text-black p-12 shadow-2xl min-h-[29.7cm] print:shadow-none print:p-0 print-only-container print:min-h-0">

                {/* Content Area - Grows to push footer down */}
                <div className="print-content-area">

                    {/* Header */}
                    <div className="border-b-2 border-zinc-900 pb-6 mb-12 text-center">
                        <h1 className="text-2xl font-bold uppercase tracking-wider">Secretaria Municipal de Desenvolvimento Social</h1>
                        <h2 className="text-xl font-semibold mt-2">{directorateName}</h2>
                        <h3 className="text-lg mt-4 font-medium">Relatório Mensal - Uberlândia {new Date().getDate()} de {new Date().toLocaleString('pt-BR', { month: 'long' })} de {new Date().getFullYear()}</h3>
                    </div>

                    {isNarrative ? (
                        <div className="space-y-8">
                            {content.map((block: any) => (
                                <div key={block.id} className={cn(
                                    "print-content-block break-inside-avoid",
                                    block.type === 'heading' && "break-after-avoid mb-0 pb-0"
                                )}>
                                    {block.type === 'heading' && (
                                        <h4 className="text-xl font-bold mt-8 mb-4 border-b border-zinc-200 pb-2">{block.content}</h4>
                                    )}

                                    {block.type === 'paragraph' && (
                                        <div
                                            className="prose prose-zinc max-w-none text-justify leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: block.content }}
                                        />
                                    )}

                                    {block.type === 'table' && (
                                        <div className="mt-4 mb-8 overflow-hidden rounded-lg border border-zinc-300">
                                            <table className="w-full text-sm">
                                                <thead className="bg-zinc-100">
                                                    <tr>
                                                        {block.content.headers.map((h: string, i: number) => (
                                                            <th key={i} className="border-b border-r border-zinc-300 px-4 py-2 font-bold text-left last:border-r-0">
                                                                {h}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {block.content.rows.map((row: string[], i: number) => (
                                                        <tr key={i} className="even:bg-zinc-50">
                                                            {row.map((cell: string, j: number) => (
                                                                <td key={j} className="border-b border-r border-zinc-300 px-4 py-2 last:border-r-0">
                                                                    {cell}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(submission.data).map(([key, value]) => {
                                if (key.startsWith('_')) return null
                                return (
                                    <div key={key} className="border p-4 rounded bg-zinc-50">
                                        <span className="block text-xs font-bold uppercase text-zinc-500">{key}</span>
                                        <span className="text-lg font-mono">{String(value)}</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="mt-20 pt-8 border-t border-zinc-200 flex justify-between text-xs text-zinc-500 print-footer">
                    <span>Sistema de Vigilância Socioassistencial</span>
                    <span>Gerado em {new Date().toLocaleDateString('pt-BR')}</span>
                </div>

            </div>
        </div>
    )
}
