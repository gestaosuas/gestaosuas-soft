import { createClient } from "@/utils/supabase/server"
import { getCachedSubmissionsForUser, getCachedProfile, getCachedDirectorates } from "@/app/dashboard/cached-data"
import { CP_FORM_DEFINITION } from "../cp-config"
import { BENEFICIOS_FORM_DEFINITION } from "../beneficios-config"
import { redirect } from "next/navigation"
import { MetricsCards, ServicesBarChart, AttendanceLineChart, GenderPieChart, GenericLineChart, ComparisonLineChart, GenericPieChart } from "./charts"
import { FormDefinition } from "@/components/form-engine"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, BarChart3 } from "lucide-react"
import { MonthSelector } from "./month-selector"
import { YearSelector } from "@/components/year-selector"
import { UnitSelector } from "./unit-selector"
import { CRAS_UNITS } from "../cras-config"

function findFieldId(fields: any[], keywords: string[]): string | undefined {
    // Search for a field where label contains ALL keywords (case insensitive)
    const field = fields.find(f => {
        const label = f.label.toLowerCase()
        return keywords.every(k => label.includes(k.toLowerCase()))
    })
    return field?.id
}

export default async function GraficosPage({
    searchParams,
}: {
    searchParams: Promise<{ year?: string, setor?: string, month?: string, directorate_id?: string, unit?: string }>
}) {
    const { year, setor, month, directorate_id, unit } = await searchParams
    const selectedYear = Number(year) || new Date().getFullYear()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const profile = await getCachedProfile(user.id)
    const userDirectorates = profile?.directorates || []
    let directorate = null

    const isEmailAdmin = ['klismanrds@gmail.com', 'gestaosuas@uberlandia.mg.gov.br'].includes(user.email || '')
    const isAdmin = profile?.role === 'admin' || isEmailAdmin

    if (directorate_id) {
        if (isAdmin) {
            const all = await getCachedDirectorates()
            directorate = all?.find(d => d.id === directorate_id)
        } else {
            directorate = userDirectorates.find((d: any) => d.id === directorate_id)
        }
    }

    let isCP = setor === 'centros'
    let isBeneficios = setor === 'beneficios'
    let isCRAS = setor === 'cras'

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
        } else if (isCRAS) {
            directorate = userDirectorates.find((d: any) => {
                const norm = d.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                return norm.includes('cras')
            })
        }
    }

    if (isAdmin && !directorate) {
        const allDirs = await getCachedDirectorates()
        if (allDirs) {
            if (isBeneficios) {
                directorate = allDirs.find(d => d.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('beneficios'))
            } else if (isCP || setor === 'sine') {
                directorate = allDirs.find(d => {
                    const norm = d.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    return norm.includes('formacao') || norm.includes('sine') || norm.includes('profissional')
                })
            } else if (isCRAS) {
                directorate = allDirs.find(d => d.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('cras'))
            }
        }
    }

    if (!directorate) return <div className="p-8 text-center text-red-500 font-bold">Diretoria não encontrada ou sem permissão.</div>

    if (!isBeneficios && !isCP && !isCRAS && setor !== 'sine') {
        const normName = directorate.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        if (normName.includes('beneficios')) isBeneficios = true
        else if (normName.includes('formacao') || normName.includes('centro') || normName.includes('profissional')) isCP = true
        else if (normName.includes('cras')) isCRAS = true
    }

    const allSubmissions = await getCachedSubmissionsForUser(user.id, directorate.id)
    const submissions = allSubmissions.filter((s: any) => s.year === selectedYear)
    const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"]

    // --- CRAS Dashboard ---
    if (isCRAS) {
        const selectedUnit = unit || 'all'
        const selectedMonth = month || 'all'
        const unitDataByMonth = new Map<number, any>()

        submissions.forEach(sub => {
            let dataToUse = null
            if (selectedUnit === 'all') {
                const sumData: any = {}
                if (sub.data._is_multi_unit && sub.data.units) {
                    Object.values(sub.data.units).forEach((uData: any) => {
                        Object.keys(uData).forEach(key => {
                            const val = Number(uData[key])
                            if (!isNaN(val)) {
                                sumData[key] = (sumData[key] || 0) + val
                            }
                        })
                    })
                } else {
                    Object.keys(sub.data).forEach(key => {
                        const val = Number(sub.data[key])
                        if (!isNaN(val)) {
                            sumData[key] = (sumData[key] || 0) + val
                        }
                    })
                }
                dataToUse = sumData
            } else {
                if (sub.data._is_multi_unit && sub.data.units?.[selectedUnit]) {
                    dataToUse = sub.data.units[selectedUnit]
                } else if (sub.data._unit === selectedUnit || (!sub.data._unit && selectedUnit === "Campo Alegre")) {
                    dataToUse = sub.data
                }
            }
            if (dataToUse) unitDataByMonth.set(sub.month, dataToUse)
        })

        const monthsWithData = Array.from(unitDataByMonth.keys()).sort((a, b) => b - a)
        const selectedMonthNum = selectedMonth === 'all' ? 0 : Number(selectedMonth)
        let latestData: any = {}
        let selectedMonthName = ""

        if (selectedMonth === 'all') {
            selectedMonthName = "Ano Inteiro"
            unitDataByMonth.forEach((mData) => {
                Object.keys(mData).forEach(key => {
                    const val = Number(mData[key])
                    if (!isNaN(val)) latestData[key] = (latestData[key] || 0) + val
                })
            })
            if (monthsWithData.length > 0) {
                const lastMonthData = unitDataByMonth.get(monthsWithData[0])
                latestData.atual = Number(lastMonthData?.atual || 0)
            }
        } else {
            latestData = unitDataByMonth.get(selectedMonthNum) || {}
            selectedMonthName = monthNames[selectedMonthNum - 1] || "N/A"
        }

        const desligadas = Number(latestData.desligadas || 0)
        const atual = Number(latestData.atual || 0)
        const taxaRetencaoValue = atual > 0 ? (((atual - desligadas) / atual) * 100).toFixed(1) : "0.0"

        const cardsData = [
            { label: "Famílias em Acomp. PAIF", value: atual, color: "#0ea5e9" },
            { label: "Visita Domiciliar", value: Number(latestData.visita_domiciliar || 0), color: "#0ea5e9" },
            { label: "Cadastros Novos", value: Number(latestData.cadastros_novos || 0), color: "#0ea5e9" },
            { label: "Atualização Cadastral", value: Number(latestData.recadastros || 0), color: "#0ea5e9" },
            { label: "Admitidas PAIF", value: Number(latestData.admitidas || 0), color: "#0ea5e9" },
            { label: "Desligadas PAIF", value: desligadas, color: "#0ea5e9" },
            { label: "Taxa de Retenção", value: `${taxaRetencaoValue}%`, color: "#0ea5e9" },
        ]

        const chartData = (field1: string, field2?: string) => monthNames.map((name, index) => {
            const data = unitDataByMonth.get(index + 1) || {}
            const res: any = { name }
            res[field1] = Number(data[field1] || 0)
            if (field2) res[field2] = Number(data[field2] || 0)
            return res
        })

        return (
            <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 p-2 sm:p-4 space-y-3 pb-8">
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 relative z-[100] pointer-events-auto bg-white dark:bg-zinc-900 p-2 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all">
                    <div className="flex items-center gap-6">
                        <Link href={`/dashboard/diretoria/${directorate.id}`} className="transition-transform hover:scale-105">
                            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl border border-zinc-200 dark:border-zinc-800"><ArrowLeft className="h-5 w-5 text-zinc-500" /></Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg"><BarChart3 className="w-5 h-5 text-white" /></div>
                                <h1 className="text-2xl font-black tracking-tight text-blue-900 dark:text-blue-50">Dashboard CRAS <span className="text-blue-600/60 font-medium ml-2">{selectedYear}</span></h1>
                            </div>
                            <p className="text-[13px] font-medium text-zinc-500 ml-11 -mt-0.5">Unidade <span className="text-blue-600 font-bold">{selectedUnit === 'all' ? "Todas as Unidades" : selectedUnit}</span> • {selectedMonthName}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex flex-col gap-1"><span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Unidade</span><UnitSelector currentUnit={selectedUnit} /></div>
                        <div className="h-10 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden lg:block"></div>
                        <div className="flex flex-col gap-1"><span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Referência</span>
                            <div className="flex items-center gap-3"><YearSelector currentYear={selectedYear} /><MonthSelector currentMonth={selectedMonth} /></div>
                        </div>
                    </div>
                </header>

                <MetricsCards data={cardsData} monthName={selectedMonthName} compact={true} />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    <ComparisonLineChart title="Cadastros e Recadastros" data={monthNames.map((name, i) => ({ name, "Cadastros Novos": Number(unitDataByMonth.get(i + 1)?.cadastros_novos || 0), "Recadastros": Number(unitDataByMonth.get(i + 1)?.recadastros || 0) }))} keys={['Cadastros Novos', 'Recadastros']} colors={['#3b82f6', '#f59e0b']} />
                    <ComparisonLineChart title="Famílias Admitidas e Desligadas" data={monthNames.map((name, i) => ({ name, "Admitidas": Number(unitDataByMonth.get(i + 1)?.admitidas || 0), "Desligadas": Number(unitDataByMonth.get(i + 1)?.desligadas || 0) }))} keys={['Admitidas', 'Desligadas']} colors={['#3b82f6', '#f59e0b']} />
                    <GenericLineChart title="Evolução de Atendimentos" data={chartData('atendimentos')} dataKey="atendimentos" color="#3b82f6" />
                    <GenericLineChart title="Famílias em Acompanhamento" data={chartData('atual')} dataKey="atual" color="#3b82f6" />
                </div>
                <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 text-center pt-2 uppercase tracking-[0.2em]">* SISTEMA DE VIGILÂNCIA SOCIOASSISTENCIAL - UBERLÂNDIA-MG</div>
            </div>
        )
    }

    const dataByMonth = new Map<number, any>()
    submissions.forEach(sub => dataByMonth.set(sub.month, sub.data))

    const selectedMonthInput = month || 'all'
    const monthsWithDataGlobal = Array.from(dataByMonth.keys()).sort((a, b) => b - a)
    const selectedMonthNum = selectedMonthInput === 'all' ? 0 : Number(selectedMonthInput)

    let latestData: any = {}
    let selectedMonthName = ""

    if (selectedMonthInput === 'all') {
        selectedMonthName = "Ano Inteiro"
        dataByMonth.forEach((mData) => {
            Object.keys(mData).forEach(key => {
                const val = Number(mData[key])
                if (!isNaN(val)) latestData[key] = (latestData[key] || 0) + val
            })
        })
    } else {
        latestData = dataByMonth.get(selectedMonthNum) || {}
        selectedMonthName = monthNames[selectedMonthNum - 1] || "N/A"
    }
    const formDef = directorate.form_definition as FormDefinition
    const allFields = formDef?.sections?.flatMap(s => s.fields) || []

    if (isBeneficios) {
        const id_inclusao = "encaminhadas_inclusao_cadunico"
        const id_atualizacao = "encaminhadas_atualizacao_cadunico"
        const id_pro_pao = "pro_pao"
        const id_cesta = "cesta_basica"
        const id_familias_pbf = "familias_pbf"
        const id_pessoas_cadunico = "pessoas_cadunico"
        const visitas_ids = [
            { id: "visitas_cadunico", label: "Visitas D. CadÚnico" },
            { id: "visitas_convocacoes", label: "Visitas Convocações" },
            { id: "visita_nucleo_habitacao", label: "Visita Nucleo S. Habitação" },
            { id: "visita_cesta_fraldas_colchoes", label: "Visita D. Cesta Básica" },
            { id: "visita_dmae", label: "Visita DMAE" },
            { id: "visitas_pro_pao", label: "Visitas Pró-pão" }
        ]

        const cardsData = [
            { label: "Inclusão CadUnico (Total)", value: Number(latestData[id_inclusao] || 0), color: "#0ea5e9" },
            { label: "Atualização CadUnico (Total)", value: Number(latestData[id_atualizacao] || 0), color: "#0ea5e9" },
            { label: "Pró-Pão (Total)", value: Number(latestData[id_pro_pao] || 0), color: "#0ea5e9" },
            { label: "Cesta Básica (Total)", value: Number(latestData[id_cesta] || 0), color: "#0ea5e9" },
        ]

        return (
            <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 p-2 sm:p-4 space-y-3 pb-8">
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 relative z-[100] pointer-events-auto bg-white dark:bg-zinc-900 p-2 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all">
                    <div className="flex items-center gap-6">
                        <Link href={`/dashboard/diretoria/${directorate.id}`} className="transition-transform hover:scale-105">
                            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl border border-zinc-200 dark:border-zinc-800"><ArrowLeft className="h-5 w-5 text-zinc-500" /></Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg"><BarChart3 className="w-5 h-5 text-white" /></div>
                                <h1 className="text-2xl font-black tracking-tight text-blue-900 dark:text-blue-50">Dashboard Benefícios <span className="text-blue-600/60 font-medium ml-2">{selectedYear}</span></h1>
                            </div>
                            <p className="text-[13px] font-medium text-zinc-500 ml-11 -mt-0.5">{selectedMonthName}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Referência</span>
                            <div className="flex items-center gap-3"><YearSelector currentYear={selectedYear} /><MonthSelector currentMonth={selectedMonthInput} /></div>
                        </div>
                    </div>
                </header>
                <MetricsCards data={cardsData} monthName={selectedMonthName} compact={true} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <GenericLineChart title="Famílias Beneficiadas no BPF" data={monthNames.map((name, i) => ({ name, value: Number(dataByMonth.get(i + 1)?.[id_familias_pbf] || 0) }))} dataKey="value" color="#3b82f6" />
                    <GenericLineChart title="Pessoas Cadastradas" data={monthNames.map((name, i) => ({ name, value: Number(dataByMonth.get(i + 1)?.[id_pessoas_cadunico] || 0) }))} dataKey="value" color="#f59e0b" />
                    <GenericPieChart title="Visitas Domiciliares" data={visitas_ids.map(v => ({ name: v.label, value: Number(latestData[v.id] || 0) })).filter(d => d.value > 0)} colors={['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316']} />
                </div>
            </div>
        )
    }

    if (isCP) {
        const cpFields = CP_FORM_DEFINITION.sections.flatMap(s => s.fields)
        const id_concluintes = "resumo_concluintes"
        const id_cursos = "resumo_cursos"
        const id_turmas = "resumo_turmas"
        const id_homens = "resumo_homens"
        const id_mulheres = "resumo_mulheres"
        const atendimentosFields = cpFields.filter(f => f.id.endsWith('_atendimentos')).map(f => f.id)
        const procedimentosFields = cpFields.filter(f => f.id.endsWith('_procedimentos')).map(f => f.id)
        const sumFields = (data: any, fields: string[]) => fields.reduce((acc, f) => acc + (Number(data[f]) || 0), 0)
        let totalCursos = 0, totalTurmas = 0
        dataByMonth.forEach(d => { totalCursos += Number(d[id_cursos] || 0); totalTurmas += Number(d[id_turmas] || 0); })
        const cardsData = [
            { label: "Concluintes", value: Number(latestData[id_concluintes] || 0), color: "#0ea5e9" },
            { label: "Atendimentos", value: sumFields(latestData, atendimentosFields), color: "#0ea5e9" },
            { label: "Procedimentos", value: sumFields(latestData, procedimentosFields), color: "#0ea5e9" },
            { label: "Cursos (Total)", value: totalCursos, color: "#0ea5e9" },
            { label: "Turmas (Total)", value: totalTurmas, color: "#0ea5e9" },
        ]
        return (
            <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 p-2 sm:p-4 space-y-3 pb-8">
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 relative z-[100] pointer-events-auto bg-white dark:bg-zinc-900 p-2 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all">
                    <div className="flex items-center gap-6">
                        <Link href={`/dashboard/diretoria/${directorate.id}`} className="transition-transform hover:scale-105">
                            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl border border-zinc-200 dark:border-zinc-800"><ArrowLeft className="h-5 w-5 text-zinc-500" /></Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg"><BarChart3 className="w-5 h-5 text-white" /></div>
                                <h1 className="text-2xl font-black tracking-tight text-blue-900 dark:text-blue-50">Dashboard CP <span className="text-blue-600/60 font-medium ml-2">{selectedYear}</span></h1>
                            </div>
                            <p className="text-[13px] font-medium text-zinc-500 ml-11 -mt-0.5">{selectedMonthName}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Referência</span>
                            <div className="flex items-center gap-3"><YearSelector currentYear={selectedYear} /><MonthSelector currentMonth={selectedMonthInput} /></div>
                        </div>
                    </div>
                </header>
                <MetricsCards data={cardsData} monthName={selectedMonthName} compact={true} />
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    <GenericLineChart title="Concluintes" data={monthNames.map((name, i) => ({ name, value: Number(dataByMonth.get(i + 1)?.[id_concluintes] || 0) }))} dataKey="value" color="#0ea5e9" />
                    <ComparisonLineChart title="Atendimentos e Procedimentos" data={monthNames.map((name, i) => { const mData = dataByMonth.get(i + 1) || {}; return { name, Atendimentos: sumFields(mData, atendimentosFields), Procedimentos: sumFields(mData, procedimentosFields) } })} keys={['Atendimentos', 'Procedimentos']} colors={['#2563eb', '#60a5fa']} />
                    <GenderPieChart data={[{ name: "Homem", value: Number(latestData[id_homens] || 0) }, { name: "Mulher", value: Number(latestData[id_mulheres] || 0) }].filter(d => d.value > 0)} />
                </div>
            </div>
        )
    }

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

    return (
        <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 p-2 sm:p-4 space-y-3 pb-8">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 relative z-[100] pointer-events-auto bg-white dark:bg-zinc-900 p-2 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all">
                <div className="flex items-center gap-6">
                    <Link href={`/dashboard/diretoria/${directorate.id}`} className="transition-transform hover:scale-105">
                        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl border border-zinc-200 dark:border-zinc-800"><ArrowLeft className="h-5 w-5 text-zinc-500" /></Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg"><BarChart3 className="w-5 h-5 text-white" /></div>
                            <h1 className="text-2xl font-black tracking-tight text-blue-900 dark:text-blue-50">Dashboard SINE <span className="text-blue-600/60 font-medium ml-2">{selectedYear}</span></h1>
                        </div>
                        <p className="text-[13px] font-medium text-zinc-500 ml-11 -mt-0.5">{selectedMonthName}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Referência</span>
                        <div className="flex items-center gap-3"><YearSelector currentYear={selectedYear} /><MonthSelector currentMonth={selectedMonthInput} /></div>
                    </div>
                </div>
            </header>
            <MetricsCards data={cardsData} monthName={selectedMonthName} compact={true} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ServicesBarChart data={[
                    { name: "Orientação Profissional", value: Number(latestData[ids.orientacao || ''] || 0) },
                    { name: "Carteira Digital", value: Number(latestData[ids.carteira || ''] || 0) },
                    { name: "Processo Seletivo", value: Number(latestData[ids.processo || ''] || 0) },
                    { name: "Currículos", value: Number(latestData[ids.curriculos || ''] || 0) },
                    { name: "Seguro Desemprego", value: Number(latestData[ids.seguro || ''] || 0) }
                ]} />
                <AttendanceLineChart data={monthNames.map((name, i) => { const mData = dataByMonth.get(i + 1) || {}; return { name, empregador: Number(mData[ids.atend_empregador || ''] || 0), trabalhador: Number(mData[ids.atend_trabalhador || ''] || 0) } })} />
            </div>
            <div className="text-xs text-muted-foreground text-center pt-8">* Dados baseados nos relatórios enviados.</div>
        </div>
    )
}
