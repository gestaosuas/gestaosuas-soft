import { createClient } from "@/utils/supabase/server"
import { getCachedSubmissionsForUser } from "@/app/dashboard/cached-data"
import { CP_FORM_DEFINITION } from "../cp-config"
import { BENEFICIOS_FORM_DEFINITION } from "../beneficios-config"
import { redirect } from "next/navigation"
import { MetricsCards, ServicesBarChart, AttendanceLineChart, GenderPieChart, GenericLineChart, ComparisonLineChart, GenericPieChart } from "./charts"
import { FormDefinition } from "@/components/form-engine"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { MonthSelector } from "./month-selector"

function findFieldId(fields: any[], keywords: string[]): string | undefined {
    // Search for a field where label contains ALL keywords (case insensitive)
    const field = fields.find(f => {
        const label = f.label.toLowerCase()
        return keywords.every(k => label.includes(k.toLowerCase()))
    })
    return field?.id
}

function findFieldIdBySuffix(fields: any[], suffix: string): string[] {
    return fields.filter(f => f.id.endsWith(suffix)).map(f => f.id)
}

export default async function GraficosPage({
    searchParams,
}: {
    searchParams: Promise<{ year?: string, setor?: string, month?: string, directorate_id?: string }>
}) {
    const { year, setor, month, directorate_id } = await searchParams
    const selectedYear = Number(year) || new Date().getFullYear()

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

    // Flatten directorates
    // @ts-ignore
    const userDirectorates = profile?.profile_directorates?.map(pd => pd.directorates) || []

    let directorate = null

    const isEmailAdmin = ['klismanrds@gmail.com', 'gestaosuas@uberlandia.mg.gov.br'].includes(user.email || '')
    const isAdmin = profile?.role === 'admin' || isEmailAdmin

    // 0. Resolve by ID if provided
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

    // 1. Resolve Field IDs & Config based on Sector if not found by ID
    const isCP = setor === 'centros'
    const isBeneficios = setor === 'beneficios'

    if (!directorate) {
        if (isBeneficios) {
            directorate = userDirectorates.find((d: any) => d.name.toLowerCase().includes('benefícios') || d.name.toUpperCase().includes('BENEFICIOS'))
        } else if (isCP || setor === 'sine') {
            directorate = userDirectorates.find((d: any) => d.name.toLowerCase().includes('formação profissional') || d.name.toLowerCase().includes('sine'))
        } else {
            directorate = userDirectorates[0]
        }
    }

    // Admin Override
    if (isAdmin && !directorate) {
        const { data: allDirs } = await supabase.from('directorates').select('*')
        if (isBeneficios) {
            directorate = allDirs?.find(d => d.name.toLowerCase().includes('benefícios'))
        } else if (isCP || setor === 'sine') {
            directorate = allDirs?.find(d => d.name.toLowerCase().includes('formação'))
        }
    }

    if (!directorate) return <div className="p-8">Diretoria não encontrada ou sem permissão.</div>

    if (!directorate) return <div>Diretoria não encontrada.</div>



    const formDef = directorate.form_definition as FormDefinition
    const allFields = formDef?.sections?.flatMap(s => s.fields) || []

    // 2. Fetch Data (Securely)
    const allSubmissions = await getCachedSubmissionsForUser(user.id, directorate.id)
    const submissions = allSubmissions.filter((s: any) => s.year === selectedYear)

    // 3. Process Data
    const dataByMonth = new Map<number, any>()
    submissions?.forEach(sub => dataByMonth.set(sub.month, sub.data))

    const monthsWithData = Array.from(dataByMonth.keys()).sort((a, b) => b - a)
    let selectedMonth = month ? Number(month) : (monthsWithData.length > 0 ? monthsWithData[0] : 1)
    if (selectedMonth < 1) selectedMonth = 1
    if (selectedMonth > 12) selectedMonth = 12

    const latestData = dataByMonth.get(selectedMonth) || {}
    const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"]
    const selectedMonthName = monthNames[selectedMonth - 1]

    // --- BENEFÍCIOS Dashboard Logic ---
    if (isBeneficios) {
        // Specific IDs from BENEFICIOS_FORM_DEFINITION
        const id_inclusao = "encaminhadas_inclusao_cadunico"
        const id_atualizacao = "encaminhadas_atualizacao_cadunico"
        const id_pro_pao = "pro_pao"
        const id_cesta = "cesta_basica"

        const id_familias_pbf = "familias_pbf"
        const id_pessoas_cadunico = "pessoas_cadunico"

        // Visitas Breakdown IDs
        const visitas_ids = [
            { id: "visitas_cadunico", label: "Visitas D. CadÚnico" },
            { id: "visitas_convocacoes", label: "Visitas Convocações" },
            { id: "visita_nucleo_habitacao", label: "Visita Nucleo S. Habitação" }, // Note: Adjusted label for display
            { id: "visita_cesta_fraldas_colchoes", label: "Visita D. Cesta Básica/ fraldas / colchões" },
            { id: "visita_dmae", label: "Visita DMAE" },
            { id: "visitas_pro_pao", label: "Visitas Pró-pão" }
        ]

        // Cards Data
        const cardsData = [
            { label: "Inclusão CadUnico (Total)", value: Number(latestData[id_inclusao] || 0), color: "#0ea5e9" },
            { label: "Atualização CadUnico (Total)", value: Number(latestData[id_atualizacao] || 0), color: "#0ea5e9" },
            { label: "Pró-Pão (Total)", value: Number(latestData[id_pro_pao] || 0), color: "#0ea5e9" },
            { label: "Cesta Básica (Total)", value: Number(latestData[id_cesta] || 0), color: "#0ea5e9" },
        ]

        // Line Chart: Famílias Beneficiadas no BPF
        const pbfData = monthNames.map((name, index) => ({
            name,
            value: Number(dataByMonth.get(index + 1)?.[id_familias_pbf] || 0)
        }))

        // Line Chart: Pessoas Cadastradas
        const cadunicoData = monthNames.map((name, index) => ({
            name,
            value: Number(dataByMonth.get(index + 1)?.[id_pessoas_cadunico] || 0)
        }))

        // Donut Chart: Visitas Breakdown (Selected Month)
        const visitasData = visitas_ids.map(item => ({
            name: item.label,
            value: Number(latestData[item.id] || 0)
        })).filter(d => d.value > 0)

        // Custom colors for Donut Chart (trying to match the image broadly or just use nice palette)
        const visitasColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316']

        return (
            <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 p-6 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-[100] pointer-events-auto">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/dashboard/diretoria/efaf606a-53ae-4bbc-996c-79f4354ce0f9"
                            className="p-2 h-11 w-11 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
                        >
                            <ArrowLeft className="h-5 w-5 text-zinc-500" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-blue-900 dark:text-blue-50">
                                Dashboard Benefícios <span className="text-blue-600/60 font-medium ml-2">{selectedYear}</span>
                            </h1>
                            <p className="text-[14px] font-medium text-zinc-500 mt-0.5">
                                Indicadores de benefícios eventuais e continuados.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 relative z-[100] pointer-events-auto">
                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Mês de Referência:</span>
                        <MonthSelector currentMonth={selectedMonth} />
                    </div>
                </div>

                {/* Cards */}
                <MetricsCards data={cardsData} monthName={selectedMonthName} />

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="col-span-1">
                        <GenericLineChart
                            title="Famílias Beneficiadas no BPF"
                            data={pbfData}
                            dataKey="value"
                            color="#3b82f6" // Blue
                        />
                    </div>
                    <div className="col-span-1">
                        <GenericLineChart
                            title="Pessoas Cadastradas no CadUnico"
                            data={cadunicoData}
                            dataKey="value"
                            color="#f59e0b" // Orange/Amber
                        />
                    </div>
                    <div className="col-span-1">
                        <GenericPieChart
                            title="Visitas Domiciliares"
                            data={visitasData}
                            colors={visitasColors}
                        />
                    </div>
                </div>

                <div className="text-xs text-muted-foreground text-center pt-8">
                    * Dados baseados nos relatórios enviados. Mês de referência: {selectedMonthName}.
                </div>
            </div>
        )
    }

    // --- CP Dashboard Logic ---
    if (isCP) {
        // Use the hardcoded definition to ensure we have all fields for the dashboard
        const cpFields = CP_FORM_DEFINITION.sections.flatMap(s => s.fields)

        // Specific IDs for CP
        const id_concluintes = "resumo_concluintes"
        const id_vagas = "resumo_vagas"
        const id_cursos = "resumo_cursos"
        const id_turmas = "resumo_turmas"
        const id_homens = "resumo_homens"
        const id_mulheres = "resumo_mulheres"

        // Breakdowns
        const atendimentosFields = cpFields.filter(f => f.id.endsWith('_atendimentos')).map(f => f.id)
        const procedimentosFields = cpFields.filter(f => f.id.endsWith('_procedimentos')).map(f => f.id)

        const sumFields = (data: any, fields: string[]) => {
            return fields.reduce((acc, fieldId) => acc + (Number(data[fieldId]) || 0), 0)
        }

        const sumYearTotal = (fieldId: string) => {
            let total = 0
            dataByMonth.forEach(data => {
                total += (Number(data[fieldId]) || 0)
            })
            return total
        }

        // Card Metrics
        const valConcluintes = Number(latestData[id_concluintes] || 0)
        const valAtendimentos = sumFields(latestData, atendimentosFields)
        const valProcedimentos = sumFields(latestData, procedimentosFields)
        const valCursos = sumYearTotal(id_cursos) // Total Year
        const valTurmas = sumYearTotal(id_turmas) // Total Year

        const cardsData = [
            { label: "Concluintes", value: valConcluintes, color: "#0ea5e9" }, // cyan-500
            { label: "Atendimentos", value: valAtendimentos, color: "#0ea5e9" },
            { label: "Procedimentos", value: valProcedimentos, color: "#0ea5e9" },
            { label: "Cursos (Total)", value: valCursos, color: "#0ea5e9" },
            { label: "Turmas (Total)", value: valTurmas, color: "#0ea5e9" },
        ]

        // Chart: Concluintes Evolution
        const concluintesData = monthNames.map((name, index) => ({
            name,
            value: Number(dataByMonth.get(index + 1)?.[id_concluintes] || 0)
        }))

        // Chart: Atendimentos vs Procedimentos
        const comparisonData = monthNames.map((name, index) => {
            const mData = dataByMonth.get(index + 1) || {}
            return {
                name,
                Atendimentos: sumFields(mData, atendimentosFields),
                Procedimentos: sumFields(mData, procedimentosFields)
            }
        })

        // Chart: Gender Distribution (Selected Month)
        const genderData = [
            { name: "Homem", value: Number(latestData[id_homens] || 0) },
            { name: "Mulher", value: Number(latestData[id_mulheres] || 0) },
        ].filter(d => d.value > 0)

        return (

            <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 p-6 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-[100] pointer-events-auto">
                    <div className="flex items-center gap-6">
                        <Link
                            href={`/dashboard/diretoria/${directorate.id}`}
                            className="p-2 h-11 w-11 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
                        >
                            <ArrowLeft className="h-5 w-5 text-zinc-500" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-blue-900 dark:text-blue-50">
                                Dashboard CP <span className="text-blue-600/60 font-medium ml-2">{selectedYear}</span>
                            </h1>
                            <p className="text-[14px] font-medium text-zinc-500 mt-0.5">
                                Centros Profissionalizantes.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 relative z-[100] pointer-events-auto">
                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Mês de Referência:</span>
                        <MonthSelector currentMonth={selectedMonth} />
                    </div>
                </div>

                {/* Cards */}
                <MetricsCards data={cardsData} monthName={selectedMonthName} />

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-1">
                        <GenericLineChart
                            title="Concluintes"
                            data={concluintesData}
                            dataKey="value"
                            color="#0ea5e9"
                        />
                    </div>
                    <div className="xl:col-span-1">
                        <ComparisonLineChart
                            title="Atendimentos e Procedimentos"
                            data={comparisonData}
                            keys={['Atendimentos', 'Procedimentos']}
                            colors={['#2563eb', '#60a5fa']} // Blue and Light Blue
                        />
                    </div>
                    <div className="xl:col-span-1">
                        <GenderPieChart data={genderData} />
                    </div>
                </div>

                <div className="text-xs text-muted-foreground text-center pt-8">
                    * Dados baseados nos relatórios enviados. Mês de referência para cartões e gráfico de gênero: {selectedMonthName}.
                </div>
            </div>
        )
    }

    // --- SINE Dashboard Logic (Existing) ---
    const ids = {
        inseridos: findFieldId(allFields, ['Inseridos', 'Mercado']),
        entrevistas: findFieldId(allFields, ['Entrevistas']),
        vagas: findFieldId(allFields, ['Vagas', 'Captadas']),
        seguro: findFieldId(allFields, ['Seguro', 'Desemprego']),
        curriculos: findFieldId(allFields, ['Currículos']),

        orientacao: findFieldId(allFields, ['Orientação', 'Profissional']),
        carteira: findFieldId(allFields, ['Carteira', 'digital']),
        processo: findFieldId(allFields, ['Processo', 'seletivo']),

        atend_empregador: findFieldId(allFields, ['Atendimento', 'Empregador']),
        atend_trabalhador: findFieldId(allFields, ['Atendimento', 'Trabalhador']),
    }

    const cardsData = [
        { label: "Inseridos no Mercado", value: Number(latestData[ids.inseridos || ''] || 0), color: "#0ea5e9" },
        { label: "Entrevistas", value: Number(latestData[ids.entrevistas || ''] || 0), color: "#0ea5e9" },
        { label: "Vagas Captadas", value: Number(latestData[ids.vagas || ''] || 0), color: "#0ea5e9" },
        { label: "Seguro Desemprego", value: Number(latestData[ids.seguro || ''] || 0), color: "#0ea5e9" },
        { label: "Currículos", value: Number(latestData[ids.curriculos || ''] || 0), color: "#0ea5e9" },
    ]

    const servicesData = [
        { name: "Orientação Profissional", value: Number(latestData[ids.orientacao || ''] || 0) },
        { name: "Carteira Digital", value: Number(latestData[ids.carteira || ''] || 0) },
        { name: "Processo Seletivo", value: Number(latestData[ids.processo || ''] || 0) },
        { name: "Currículos", value: Number(latestData[ids.curriculos || ''] || 0) },
        { name: "Seguro Desemprego", value: Number(latestData[ids.seguro || ''] || 0) },
    ]

    const attendanceData = monthNames.map((name, index) => {
        const mData = dataByMonth.get(index + 1) || {}
        return {
            name,
            empregador: Number(mData[ids.atend_empregador || ''] || 0),
            trabalhador: Number(mData[ids.atend_trabalhador || ''] || 0)
        }
    })

    return (
        <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 p-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-[100] pointer-events-auto">
                <div className="flex items-center gap-6">
                    <Link
                        href={`/dashboard/diretoria/${directorate.id}`}
                        className="p-2 h-11 w-11 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
                    >
                        <ArrowLeft className="h-5 w-5 text-zinc-500" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-blue-900 dark:text-blue-50">
                            Dashboard SINE <span className="text-blue-600/60 font-medium ml-2">{selectedYear}</span>
                        </h1>
                        <p className="text-[14px] font-medium text-zinc-500 mt-0.5">
                            Visão geral dos indicadores de performance.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 relative z-[100] pointer-events-auto">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Mês de Referência:</span>
                    <MonthSelector currentMonth={selectedMonth} />
                </div>
            </div>

            {/* Cards Row */}
            <MetricsCards data={cardsData} monthName={selectedMonthName} />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ServicesBarChart data={servicesData} />
                <AttendanceLineChart data={attendanceData} />
            </div>

            <div className="text-xs text-muted-foreground text-center pt-8">
                * Dados baseados nos relatórios enviados. Mês de referência para cartões e barras: {selectedMonthName}.
            </div>
        </div>
    )
}

