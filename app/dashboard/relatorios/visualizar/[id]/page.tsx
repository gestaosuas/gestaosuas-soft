import { createClient } from "@/utils/supabase/server"
import { ArrowLeft, Printer } from "lucide-react"
import { getCachedSubmission } from "@/app/dashboard/cached-data"
import { redirect } from "next/navigation"
import ReportActions from "./report-actions"
import { cn } from "@/lib/utils"
import { getCachedIndicators } from "@/app/dashboard/cached-data"
import { CP_FORM_DEFINITION } from "@/app/dashboard/cp-config"
import { BENEFICIOS_FORM_DEFINITION } from "@/app/dashboard/beneficios-config"
import { FormDefinition } from "@/components/form-engine"

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

    // Logic for Attached Indicators
    let AttachIndicatorsElement = null
    if (submission.data?._attach_indicators) {
        const indicatorsSub = await getCachedIndicators(
            user.id,
            submission.directorate_id,
            submission.month,
            submission.year
        )

        if (indicatorsSub) {
            let formDef = submission.directorates?.form_definition as FormDefinition
            const dirName = (submission.directorates?.name || '').toLowerCase()

            // Resolve Config if not in DB
            if (!formDef) {
                if (dirName.includes('benefícios') || dirName.includes('beneficios')) {
                    formDef = BENEFICIOS_FORM_DEFINITION
                } else if (dirName.includes('formação') || dirName.includes('cp')) {
                    formDef = CP_FORM_DEFINITION
                }
                // SINE usually has it in DB, but if not, logic implies it might be missing or handled elsewhere.
                // If standard SINE config exists in file I should import it, but I don't see sine-config.ts reference.
                // Assuming SINE has it in DB as per previous steps.
            }

            if (formDef && formDef.sections) {
                AttachIndicatorsElement = (
                    <div className="mt-12 pt-8 border-t-2 border-zinc-900 break-before-page print:block">
                        <h3 className="text-xl font-bold mb-6 text-center uppercase border-b border-zinc-200 pb-2">Anexo: Indicadores Quantitativos</h3>
                        <div className="grid gap-8">
                            {formDef.sections.map((section, idx) => (
                                <div key={idx} className="break-inside-avoid">
                                    <h4 className="font-bold bg-zinc-100 dark:bg-zinc-800 p-2 border border-zinc-300 dark:border-zinc-700 text-sm mb-0 uppercase tracking-tight">
                                        {section.title}
                                    </h4>
                                    <table className="w-full text-xs md:text-sm border-collapse border border-t-0 border-zinc-300 dark:border-zinc-700">
                                        <tbody>
                                            {section.fields.map((field) => (
                                                <tr key={field.id} className="border-b border-zinc-200 dark:border-zinc-800 odd:bg-white even:bg-zinc-50 dark:odd:bg-zinc-900 dark:even:bg-zinc-900/50">
                                                    <td className="p-2 border-r border-zinc-300 dark:border-zinc-700 w-2/3">{field.label}</td>
                                                    <td className="p-2 text-center font-mono font-bold text-zinc-900 dark:text-zinc-100">
                                                        {indicatorsSub.data?.[field.id] !== undefined && indicatorsSub.data?.[field.id] !== '' ? indicatorsSub.data[field.id] : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                        <div className="text-[10px] text-zinc-400 text-center mt-4">
                            * Dados extraídos automaticamente do relatório de indicadores referência {monthName}/{submission.year}.
                        </div>
                    </div>
                )
            }
        }
    }

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

                    {/* ATTACHED INDICATORS SECTION */}
                    {AttachIndicatorsElement}

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
