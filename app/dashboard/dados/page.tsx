import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"
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
    const selectedYear = Number(year) || new Date().getFullYear()

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
        <div className="space-y-6 animate-in fade-in duration-500 w-full max-w-[98%] mx-auto py-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Tabela de Dados: {selectedYear}</h1>
                        <p className="text-sm text-muted-foreground">{directorate.name}</p>
                    </div>
                </div>
            </div>

            <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
                <div className="w-full">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                                <TableHead className="w-[20%] min-w-[200px] font-bold text-zinc-900 dark:text-zinc-100 pl-4 h-12">
                                    Indicador
                                </TableHead>
                                {months.map((m, i) => (
                                    <TableHead key={i} className="text-center font-semibold text-xs h-12 px-1">
                                        {m.toUpperCase()}
                                    </TableHead>
                                ))}
                                <TableHead className="text-center font-bold text-primary text-xs h-12 px-1">TOTAL</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {indicators.map((indicator) => {
                                let rowTotal = 0
                                return (
                                    <TableRow key={indicator.id} className="h-10">
                                        <TableCell className="font-medium text-xs text-zinc-700 dark:text-zinc-300 pl-4 py-2 border-r border-zinc-100 dark:border-zinc-800/50 truncate max-w-[300px]" title={indicator.label}>
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
                                                <TableCell key={monthNum} className="text-center text-xs text-zinc-600 dark:text-zinc-400 p-0 border-r border-zinc-50 dark:border-zinc-800/20">
                                                    {val !== undefined && val !== '' ? val : '-'}
                                                </TableCell>
                                            )
                                        })}
                                        <TableCell className="text-center font-bold text-xs text-primary bg-zinc-50/30 dark:bg-zinc-900/30 p-0">
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
