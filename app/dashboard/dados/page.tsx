import { createClient } from "@/utils/supabase/server"
import { getCachedSubmissionsForUser, getCachedProfile, getCachedDirectorates } from "@/app/dashboard/cached-data"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { CRAS_FORM_DEFINITION, CRAS_UNITS } from "@/app/dashboard/cras-config"
import { CREAS_IDOSO_FORM_DEFINITION, CREAS_DEFICIENTE_FORM_DEFINITION } from "@/app/dashboard/creas-config"
import { PrintExportControls } from "@/components/print-export-controls"
import { YearSelector } from "@/components/year-selector"

export default async function DataPage({
    searchParams,
}: {
    searchParams: Promise<{ year?: string, setor?: string, directorate_id?: string }>
}) {
    const { year, setor, directorate_id } = await searchParams
    const selectedYear = Number(year) || new Date().getFullYear()
    let isCP = setor === 'centros'
    let isBeneficios = setor === 'beneficios'
    let isCRAS = setor === 'cras'
    let isCREAS = setor === 'creas'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Use cached profile (Admin-safe)
    const profile = await getCachedProfile(user.id)

    console.log("[DEBUG] DataPage - User:", user.email)
    console.log("[DEBUG] DataPage - Profile Role:", profile?.role || 'Guest (Email Admin)')
    console.log("[DEBUG] DataPage - SearchParams:", { year, setor, directorate_id })

    // If no profile and not email admin, return early
    const isEmailAdmin = ['klismanrds@gmail.com', 'gestaosuas@uberlandia.mg.gov.br'].includes(user.email || '')
    if (!profile && !isEmailAdmin) return <div>Perfil não encontrado.</div>

    // Flatten directorates
    const userDirectorates = profile?.directorates || []

    let directorate = null
    const isAdmin = profile?.role === 'admin' || isEmailAdmin

    if (directorate_id) {
        if (isAdmin) {
            const all = await getCachedDirectorates()
            directorate = all?.find(d => d.id === directorate_id)
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
            directorate = userDirectorates.find((d: any) => {
                const norm = d.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                return norm.includes('beneficios')
            })
        } else if (isCP || setor === 'sine') {
            directorate = userDirectorates.find((d: any) => {
                const norm = d.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                return norm.includes('formacao') || norm.includes('sine') || norm.includes('profissional')
            })
        } else {
            // Default / First one
            directorate = userDirectorates[0]
        }
    }

    // Admin Override: Global Search
    if (isAdmin && !directorate) {
        const allDirs = await getCachedDirectorates()
        if (allDirs) {
            if (isBeneficios) {
                directorate = allDirs.find(d => {
                    const norm = d.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    return norm.includes('beneficios')
                })
            } else if (isCP || setor === 'sine') {
                directorate = allDirs.find(d => {
                    const norm = d.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    return norm.includes('formacao') || norm.includes('sine') || norm.includes('profissional')
                })
            }
        }
    }

    if (!directorate) return <div className="p-8 text-center text-red-500">Você não tem permissão para visualizar dados desta diretoria ou ela não foi encontrada.</div>

    console.log("[DEBUG] DataPage - Final Directorate:", directorate?.name)

    // Ensure sector is set based on resolved directorate if it was missing
    if (directorate && !isBeneficios && !isCP && !isCRAS && setor !== 'sine') {
        const norm = directorate.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        if (norm.includes('beneficios')) isBeneficios = true
        else if (norm.includes('formacao') || norm.includes('centro') || norm.includes('profissional')) isCP = true
        else if (norm.includes('cras')) isCRAS = true
        else if (norm.includes('creas')) isCREAS = true
    }

    // Choose Form Definition based on setor
    let formDefinition = directorate.form_definition as FormDefinition
    let titleContext = directorate.name

    let printTitle = `Meus Dados: ${selectedYear}`

    if (isCP) {
        formDefinition = CP_FORM_DEFINITION
        titleContext = `Dados Centro Profissionalizante ${selectedYear}`
        printTitle = titleContext
    }

    if (isBeneficios) {
        formDefinition = BENEFICIOS_FORM_DEFINITION
        titleContext = `Dados Benefícios Socioassistenciais ${selectedYear}`
        printTitle = titleContext
    }

    if (setor === 'sine') {
        titleContext = `Dados SINE ${selectedYear}`
        printTitle = titleContext
    }

    if (isCRAS) {
        formDefinition = CRAS_FORM_DEFINITION
        titleContext = `Dados CRAS ${selectedYear}`
        printTitle = titleContext
    }

    if (isCREAS) {
        formDefinition = {
            sections: [
                ...CREAS_IDOSO_FORM_DEFINITION.sections,
                ...CREAS_DEFICIENTE_FORM_DEFINITION.sections
            ]
        }
        titleContext = `Dados CREAS ${selectedYear}`
        printTitle = titleContext
    }

    // Buscar Submissões do Ano (Securely)
    // We filter by year in memory since the cache returns all months (it's efficient enough)
    // The previous code fetched all directorate submissions anyway? No, filtering by year/directorate on DB.
    // Our cache fetches ALL submissions for the directorate. We will filter by year in loop.
    const allSubmissions = await getCachedSubmissionsForUser(user.id, directorate.id)
    const submissions = allSubmissions.filter((s: any) => s.year === selectedYear)

    // Organizar dados em um mapa fácil: unit -> month -> dataObject
    const dataByUnitAndMonth = new Map<string, Map<number, Record<string, any>>>()

    submissions?.forEach(sub => {
        if (sub.data._is_multi_unit && sub.data.units) {
            // New format: multiple units in one row
            Object.entries(sub.data.units).forEach(([unitName, unitData]: [string, any]) => {
                if (!dataByUnitAndMonth.has(unitName)) {
                    dataByUnitAndMonth.set(unitName, new Map())
                }
                dataByUnitAndMonth.get(unitName)!.set(sub.month, unitData)
            })
        } else {
            // Old flat format or single-unit directorates
            const unitName = sub.data._unit || 'Principal'
            if (!dataByUnitAndMonth.has(unitName)) {
                dataByUnitAndMonth.set(unitName, new Map())
            }
            dataByUnitAndMonth.get(unitName)!.set(sub.month, sub.data)
        }
    })

    // If not CRAS, we expect only one logical unit (the directorate itself)
    const unitsToRender = isCRAS ? CRAS_UNITS : ['Principal']

    const months = [
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ]

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-1000 w-full max-w-[98%] mx-auto py-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="flex items-center gap-6">
                    <Link href={`/dashboard/diretoria/${directorate.id}`}>
                        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">
                            <ArrowLeft className="h-5 w-5 text-zinc-500" />
                        </Button>
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-extrabold tracking-tight text-blue-900 dark:text-blue-50 print:hidden">
                            Histórico de Dados {selectedYear}
                        </h1>
                        <h1 className="hidden print:block text-2xl font-bold text-black border-b border-zinc-200 pb-4 mb-6">
                            {printTitle}
                        </h1>
                        <div className="flex items-center gap-2 print:hidden">
                            <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none truncate max-w-[400px]">
                                {titleContext}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 print:hidden">
                    <YearSelector currentYear={selectedYear} />
                    <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden md:block"></div>
                    <PrintExportControls />
                </div>
            </header>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { 
                        size: portrait;
                        margin: 12mm 8mm !important;
                    }
                    * {
                        transition: none !important;
                        animation: none !important;
                        transform: none !important;
                        box-shadow: none !important;
                    }
                    body {
                        background: white !important;
                        color: black !important;
                        font-family: 'Inter', sans-serif !important;
                    }
                    .print-section {
                        page-break-inside: avoid !important;
                        margin-bottom: 8mm !important;
                    }
                    h2 {
                        font-size: 11pt !important;
                        text-transform: uppercase !important;
                        letter-spacing: 0.1em !important;
                        border-left: 4px solid #000 !important;
                        padding-left: 3mm !important;
                        margin-bottom: 3mm !important;
                    }
                    table {
                        width: 100% !important;
                        font-size: 6pt !important;
                        border-collapse: collapse !important;
                        border: 1px solid #000 !important;
                    }
                    th, td {
                        border: 0.5px solid #666 !important;
                        padding: 1.2mm 0.5mm !important;
                        vertical-align: middle !important;
                    }
                    th {
                        background: #f8f8f8 !important;
                        font-weight: 800 !important;
                        text-transform: uppercase !important;
                    }
                    .print-hidden {
                        display: none !important;
                    }
                }
            `}} />

            <div className="space-y-16">
                {unitsToRender.map((unitName) => {
                    const unitData = dataByUnitAndMonth.get(unitName) || new Map<number, Record<string, any>>()

                    // Skip units with no data if it's CRAS (optional, but requested "all tables")
                    // Actually, the user asked to see all tables, so we'll show them even if empty

                    return (
                        <div key={unitName} className="space-y-12 pb-12 border-b border-zinc-100 dark:border-zinc-800 last:border-0 last:pb-0">
                            {isCRAS && (
                                <div className="flex items-center gap-4 px-2">
                                    <h2 className="text-xl font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight">
                                        {unitName}
                                    </h2>
                                    <div className="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-800"></div>
                                </div>
                            )}

                            {formDefinition.sections.map((section, sIdx) => {
                                const sectionIndicators = section.fields

                                return (
                                    <div key={sIdx} className="space-y-8 print-section">
                                        {!isCRAS && (
                                            <div className="flex items-center gap-3 px-2">
                                                <div className="h-1 w-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                                                <h2 className="text-[11px] font-extrabold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">
                                                    {section.title}
                                                </h2>
                                            </div>
                                        )}

                                        <Card className="border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-none rounded-2xl overflow-hidden">
                                            <div className="overflow-x-auto custom-scrollbar">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-zinc-50/50 dark:bg-zinc-950/50 border-b border-zinc-100 dark:border-zinc-800/60">
                                                            <TableHead className="w-[28%] min-w-[280px] font-bold text-[11px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-8 h-14 border-r border-zinc-100 dark:border-zinc-800/60">
                                                                Atributo / Indicador
                                                            </TableHead>
                                                            {months.map((m, i) => (
                                                                <TableHead key={i} className="text-center font-bold text-[10px] text-zinc-400 dark:text-zinc-500 h-14 px-1 uppercase tracking-tighter">
                                                                    {m}
                                                                </TableHead>
                                                            ))}
                                                            <TableHead className="text-center font-bold text-zinc-900 dark:text-zinc-50 text-[10px] h-14 px-1 bg-zinc-50/80 dark:bg-zinc-800/40 uppercase tracking-widest">Acumulado</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                                                        {sectionIndicators.map((indicator) => {
                                                            let rowTotal = 0
                                                            return (
                                                                <TableRow key={indicator.id} className="h-12 hover:bg-zinc-50/30 dark:hover:bg-zinc-800/10 transition-colors border-none group">
                                                                    <TableCell className="font-bold text-[11px] text-zinc-700 dark:text-zinc-300 pl-8 py-3 border-r border-zinc-100 dark:border-zinc-800/60 uppercase tracking-tight" title={indicator.label}>
                                                                        {indicator.label}
                                                                    </TableCell>
                                                                    {months.map((_, idx) => {
                                                                        const monthNum = idx + 1
                                                                        const monthData = unitData.get(monthNum)
                                                                        const val = monthData?.[indicator.id]
                                                                        const numVal = Number(val)

                                                                        if (!isNaN(numVal)) {
                                                                            rowTotal += numVal
                                                                        }

                                                                        return (
                                                                            <TableCell key={monthNum} className="text-center text-[12px] font-medium text-zinc-500 dark:text-zinc-400 p-0 border-r border-zinc-100/50 dark:border-zinc-800/20 last:border-0">
                                                                                {val !== undefined && val !== '' ? (
                                                                                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                                                                        {val}
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="text-zinc-200 dark:text-zinc-800">-</span>
                                                                                )}
                                                                            </TableCell>
                                                                        )
                                                                    })}
                                                                    <TableCell className="text-center font-bold text-[12px] text-zinc-900 dark:text-zinc-50 bg-zinc-50/30 dark:bg-zinc-800/20 p-0">
                                                                        {rowTotal > 0 ? rowTotal.toLocaleString('pt-BR') : '-'}
                                                                    </TableCell>
                                                                </TableRow>
                                                            )
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </Card>
                                    </div>
                                )
                            })}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
