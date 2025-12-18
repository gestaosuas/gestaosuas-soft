import { createClient } from "@/utils/supabase/server"
import { getCachedSubmissionsForUser } from "@/app/dashboard/cached-data"
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

import { CP_FORM_DEFINITION } from "@/app/dashboard/cp-config"
import { BENEFICIOS_FORM_DEFINITION } from "@/app/dashboard/beneficios-config"

export default async function DataPage({
    searchParams,
}: {
    searchParams: Promise<{ year?: string, setor?: string, directorate_id?: string }>
}) {
    const { year, setor, directorate_id } = await searchParams
    const selectedYear = Number(year) || 2025
    const isCP = setor === 'centros'
    const isBeneficios = setor === 'beneficios'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select(`
            *,
            profile_directorates (
                directorates (*)
            )
        `)
        .eq('id', user.id)
        .single()

    if (!profile) return <div>Perfil não encontrado.</div>

    // Flatten directorates
    // @ts-ignore
    const userDirectorates = profile.profile_directorates?.map(pd => pd.directorates) || []

    let directorate = null

    const isEmailAdmin = ['klismanrds@gmail.com', 'gestaosuas@uberlandia.mg.gov.br'].includes(user.email || '')
    const isAdmin = profile.role === 'admin' || isEmailAdmin

    if (directorate_id) {
        if (isAdmin) {
            const { data: d } = await supabase.from('directorates').select('*').eq('id', directorate_id).single()
            directorate = d
        } else {
            // Check if user is linked to the requested directorate
            const isLinked = userDirectorates.some((d: any) => d.id === directorate_id)
            if (isLinked) {
                directorate = userDirectorates.find((d: any) => d.id === directorate_id)
            }
        }
    }

    if (!directorate) {
        if (isBeneficios) {
            directorate = userDirectorates.find((d: any) => d.name.toLowerCase().includes('benefícios') || d.name.toUpperCase().includes('BENEFICIOS'))
        } else if (isCP || setor === 'sine') {
            directorate = userDirectorates.find((d: any) => d.name.toLowerCase().includes('formação profissional') || d.name.toLowerCase().includes('sine'))
        } else {
            // Default / First one
            directorate = userDirectorates[0]
        }
    }

    // Admin Override: If admin, fetch all directorates to find the target one?
    // Access control: If user is admin (profile.role === 'admin'), they can see any sector.
    if (isAdmin && !directorate) {
        // If admin didn't find it in their "assigned" list (which might be empty), find it by query
        const { data: allDirs } = await supabase.from('directorates').select('*')
        if (isBeneficios) {
            directorate = allDirs?.find(d => d.name.toLowerCase().includes('benefícios'))
        } else if (isCP || setor === 'sine') {
            directorate = allDirs?.find(d => d.name.toLowerCase().includes('formação'))
        }
    }

    if (!directorate) return <div className="p-8 text-center text-red-500">Você não tem permissão para visualizar dados desta diretoria ou ela não foi encontrada.</div>

    // Choose Form Definition based on setor
    let formDefinition = directorate.form_definition as FormDefinition
    let titleContext = directorate.name

    if (isCP) {
        formDefinition = CP_FORM_DEFINITION
        titleContext = `${directorate.name} (CP)`
    }

    if (isBeneficios) {
        formDefinition = BENEFICIOS_FORM_DEFINITION
        titleContext = "Benefícios Socioassistenciais"
    }

    if (setor === 'sine') {
        titleContext = `${directorate.name} (SINE)`
    }

    // Buscar Submissões do Ano (Securely)
    // We filter by year in memory since the cache returns all months (it's efficient enough)
    // The previous code fetched all directorate submissions anyway? No, filtering by year/directorate on DB.
    // Our cache fetches ALL submissions for the directorate. We will filter by year in loop.
    const allSubmissions = await getCachedSubmissionsForUser(user.id, directorate.id)
    const submissions = allSubmissions.filter((s: any) => s.year === selectedYear)

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
                <Link href={isBeneficios ? `/dashboard/beneficios` : `/dashboard/diretoria/${directorate.id}`}>
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
                        {titleContext}
                    </p>
                </div>
            </div>

            <div className="space-y-12">
                {formDefinition.sections.map((section, sIdx) => {
                    const sectionIndicators = section.fields

                    return (
                        <div key={sIdx} className="space-y-4">
                            <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-100 pl-2 border-l-4 border-indigo-500">
                                {section.title}
                            </h2>
                            <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-white dark:bg-zinc-950 shadow-xl shadow-indigo-500/5 overflow-hidden">
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
                                            {sectionIndicators.map((indicator) => {
                                                let rowTotal = 0
                                                return (
                                                    <TableRow key={indicator.id} className="h-11 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 property-row">
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
                })}
            </div>
        </div>
    )
}
