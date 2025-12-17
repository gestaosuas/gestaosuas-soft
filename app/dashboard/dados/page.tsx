import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Table as TableIcon } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { FormDefinition } from "@/components/form-engine"

export default async function DataPage({
    searchParams,
}: {
    searchParams: Promise<{ year?: string }>
}) {
    const { year } = await searchParams
    const selectedYear = Number(year) || 2025

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*, directorates(*)')
        .eq('id', user.id)
        .single()

    if (!profile?.directorates) return <div>Sem diretoria.</div>

    const directorate = profile.directorates
    const formDefinition = directorate.form_definition as FormDefinition

    // Obter todos os campos (Indicadores) na ordem definida
    const indicators = formDefinition.sections.flatMap(s => s.fields)

    // Buscar Submissões do Ano
    const { data: submissions } = await supabase
        .from('submissions')
        .select('month, data')
        .eq('directorate_id', directorate.id)
        .eq('year', selectedYear)

    // Organizar dados em um mapa fácil: month -> dataObject
    const dataByMonth = new Map<number, Record<string, any>>()

    submissions?.forEach(sub => {
        dataByMonth.set(sub.month, sub.data)
    })

    const months = [
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-[98%] mx-auto py-8">
            <div className="flex items-center gap-4 px-2">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                        Meus Dados: {selectedYear}
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <TableIcon className="w-4 h-4" />
                        {directorate.name}
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-white dark:bg-zinc-950 shadow-2xl shadow-indigo-500/5 overflow-hidden">
                <div className="w-full">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-indigo-100 dark:border-indigo-900/30">
                                <TableHead className="w-[20%] min-w-[200px] font-bold text-indigo-900 dark:text-indigo-100 pl-6 h-14">
                                    INDICADOR
                                </TableHead>
                                {months.map((m, i) => (
                                    <TableHead key={i} className="text-center font-bold text-xs text-zinc-500 dark:text-zinc-400 h-14 px-1 tracking-wider">
                                        {m.toUpperCase()}
                                    </TableHead>
                                ))}
                                <TableHead className="text-center font-bold text-indigo-600 text-xs h-14 px-1 bg-indigo-50/50 dark:bg-indigo-900/10">TOTAL</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {indicators.map((indicator, index) => {
                                let rowTotal = 0
                                return (
                                    <TableRow key={indicator.id} className="h-11 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors border-b border-zinc-50 dark:border-zinc-800/50">
                                        <TableCell className="font-medium text-xs text-zinc-700 dark:text-zinc-300 pl-6 py-2 border-r border-indigo-50/50 dark:border-indigo-900/20 truncate max-w-[300px]" title={indicator.label}>
                                            {indicator.label}
                                        </TableCell>
                                        {months.map((_, idx) => {
                                            const monthNum = idx + 1
                                            const monthData = dataByMonth.get(monthNum)
                                            const val = monthData?.[indicator.id]
                                            const numVal = Number(val)

                                            if (!isNaN(numVal)) {
                                                rowTotal += numVal
                                            }

                                            return (
                                                <TableCell key={monthNum} className="text-center text-xs text-zinc-600 dark:text-zinc-400 p-0 border-r border-zinc-50 dark:border-zinc-800/10 last:border-0">
                                                    {val !== undefined && val !== '' ? (
                                                        <span className="inline-block py-1 px-2 rounded hover:bg-white hover:shadow-sm transition-all cursor-default">
                                                            {val}
                                                        </span>
                                                    ) : (
                                                        <span className="text-zinc-300 dark:text-zinc-700">-</span>
                                                    )}
                                                </TableCell>
                                            )
                                        })}
                                        <TableCell className="text-center font-bold text-xs text-indigo-600 bg-indigo-50/20 dark:bg-indigo-900/10 p-0">
                                            {rowTotal > 0 ? rowTotal.toLocaleString('pt-BR') : '-'}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
