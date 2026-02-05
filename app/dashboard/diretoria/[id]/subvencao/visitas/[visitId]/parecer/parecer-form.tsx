'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Save, Printer, Loader2, CheckCircle } from "lucide-react"
import { SignaturePad } from "@/components/signature-pad"
import { saveOpinionReport } from "@/app/dashboard/actions"
import { cn } from "@/lib/utils"

interface ParecerFormProps {
    visit: any
    directorateId: string
    logoUrl?: string
}

export function OpinionReportForm({ visit, directorateId, logoUrl }: ParecerFormProps) {
    const router = useRouter()
    const [isSaving, setIsSaving] = useState(false)
    const [report, setReport] = useState(visit.parecer_tecnico || {
        objeto_relatorio: visit.oscs?.objeto || "",
        item2_a_objetivos: visit.oscs?.objetivos || "",
        item2_b_metas: visit.oscs?.metas || "",
        item2_c_atividades: visit.oscs?.atividades || "",
        item3_resultados: "",
        item4_type: "fully", // fully, partially, custom
        item4_custom: "",
        assinaturas: {
            tecnico1: "",
            tecnico1_nome: "",
            tecnico2: "",
            tecnico2_nome: ""
        },
        date: new Date().toISOString().split('T')[0]
    })

    const finalLogoUrl = logoUrl || "https://ovfpxrepxlrspsjbtpnd.supabase.co/storage/v1/object/public/system/logo-pm-uberlandia.png"
    const oscName = visit.oscs?.name || "Entidade não identificada"
    const today = new Date().toLocaleDateString('pt-BR')

    const getOptionText = (type: string) => {
        if (type === 'fully') {
            return `constatou-se que a parceria com a entidade ${oscName} está sendo executada de maneira coerente com o Plano de Trabalho – Anexo I parte integrante do Termo de Colaboração, desenvolvendo as atividades e atingindo tanto os objetivos quanto as metas qualitativas e quantitativas estabelecidas, logo, cumprindo o objeto pactuado.`
        }
        if (type === 'partially') {
            return `está sendo executada de maneira coerente com o Plano de Trabalho – Anexo I parte integrante do Termo de Colaboração no que se refere ao desenvolvimento das atividades, alcance dos objetivos e metas qualitativas. Entretanto a meta quantitativa não foi alcançada, logo, cumprindo parcialmente o objeto pactuado.`
        }
        return report.item4_custom
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const result = await saveOpinionReport(visit.id, report)
            if (result.success) {
                alert("Parecer salvo com sucesso!")
                router.refresh()
            }
        } catch (error: any) {
            alert("Erro ao salvar: " + error.message)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
            {/* Toolbar */}
            <div className="flex items-center justify-between no-print sticky top-4 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg">
                <Button variant="ghost" onClick={() => router.back()} className="gap-2 font-bold uppercase text-[10px] text-zinc-500">
                    <ArrowLeft className="h-4 w-4" /> Voltar
                </Button>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => window.print()} className="gap-2 font-bold uppercase text-[10px] border-zinc-200">
                        <Printer className="h-4 w-4" /> Imprimir
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="gap-2 bg-blue-900 text-white hover:bg-black font-bold uppercase text-[10px] px-8">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Salvar Parecer
                    </Button>
                </div>
            </div>

            {/* Document Content */}
            <div className="bg-white dark:bg-zinc-900 shadow-xl rounded-[2rem] p-12 border border-zinc-100 dark:border-zinc-800 print:shadow-none print:border-none print:p-0">
                {/* Header Section */}
                <div className="flex flex-col items-center text-center mb-8 border-b-2 border-black pb-8">
                    <img
                        src={finalLogoUrl}
                        alt="Logo"
                        className="h-20 w-auto object-contain mb-4"
                    />
                    <div className="space-y-1">
                        <p className="text-xs font-black uppercase text-zinc-400">Secretaria Municipal de Desenvolvimento Social</p>
                        <h1 className="text-2xl font-black uppercase text-blue-900 dark:text-blue-50">Relatório do monitoramento</h1>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">SISTEMA VIGILÂNCIA SOCIOASSISTENCIAL 2026</p>
                    </div>
                </div>

                {/* Identification Info (No header as per request) */}
                <div className="grid grid-cols-1 gap-2 mb-8 text-sm">
                    <p><strong>OSC:</strong> {oscName}</p>
                    <p><strong>DATA DE PREENCHIMENTO:</strong> {today}</p>
                </div>

                <div className="space-y-10 text-justify leading-relaxed text-sm">
                    {/* Item 1: Objeto do relatório */}
                    <section className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <h2 className="font-black border-b border-black pb-1 uppercase">1. Objeto do relatório.</h2>
                            <p className="text-[10px] text-zinc-500 italic">Colocar o mesmo objeto do Plano de Trabalho (Objetivo e especificação do nome do projeto)</p>
                        </div>
                        <div className="no-print">
                            <Textarea
                                placeholder="Digite aqui o objeto do relatório..."
                                value={report.objeto_relatorio}
                                onChange={e => setReport({ ...report, objeto_relatorio: e.target.value })}
                                className="min-h-[100px] bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 focus:ring-blue-900"
                            />
                        </div>
                        <div className="hidden print:block whitespace-pre-wrap min-h-[60px] border-b border-dotted border-zinc-300">
                            {report.objeto_relatorio || "________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________"}
                        </div>
                    </section>

                    {/* Item 2: Descrição dos objetivos, metas, atividades previstas */}
                    <section className="space-y-6">
                        <h2 className="font-black border-b border-black pb-1 uppercase">2. Descrição dos objetivos, metas, atividades previstas</h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase">a) - Dos objetivos</Label>
                                <div className="no-print">
                                    <Textarea
                                        value={report.item2_a_objetivos}
                                        onChange={e => setReport({ ...report, item2_a_objetivos: e.target.value })}
                                        className="bg-zinc-50 dark:bg-zinc-950/50"
                                    />
                                </div>
                                <div className="hidden print:block whitespace-pre-wrap min-h-[40px] border-b border-dotted border-zinc-300">
                                    {report.item2_a_objetivos || "________________________________________________________________________________________________________________________________________________________________"}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase">b) - Das metas estabelecidas</Label>
                                <div className="no-print">
                                    <Textarea
                                        value={report.item2_b_metas}
                                        onChange={e => setReport({ ...report, item2_b_metas: e.target.value })}
                                        className="bg-zinc-50 dark:bg-zinc-950/50"
                                    />
                                </div>
                                <div className="hidden print:block whitespace-pre-wrap min-h-[40px] border-b border-dotted border-zinc-300">
                                    {report.item2_b_metas || "________________________________________________________________________________________________________________________________________________________________"}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase">c) - Das atividades</Label>
                                <div className="no-print">
                                    <Textarea
                                        value={report.item2_c_atividades}
                                        onChange={e => setReport({ ...report, item2_c_atividades: e.target.value })}
                                        className="bg-zinc-50 dark:bg-zinc-950/50"
                                    />
                                </div>
                                <div className="hidden print:block whitespace-pre-wrap min-h-[40px] border-b border-dotted border-zinc-300">
                                    {report.item2_c_atividades || "________________________________________________________________________________________________________________________________________________________________"}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Item 3: Resultados */}
                    <section className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <h2 className="font-black border-b border-black pb-1 uppercase">3. Resultados</h2>
                            <p className="text-[10px] text-zinc-500 italic">explicitar os resultados detectados na visita em relação aos objetivos, metas e atividades</p>
                        </div>
                        <div className="no-print">
                            <Textarea
                                placeholder="Relate as análises realizadas durante o monitoramento..."
                                value={report.item3_resultados}
                                onChange={e => setReport({ ...report, item3_resultados: e.target.value })}
                                className="min-h-[150px] bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 focus:ring-blue-900"
                            />
                        </div>
                        <div className="hidden print:block whitespace-pre-wrap min-h-[100px] border-b border-dotted border-zinc-300">
                            {report.item3_resultados || "____________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________"}
                        </div>
                    </section>

                    {/* Item 4: Cumprimento do Objeto */}
                    <section className="space-y-4">
                        <h2 className="font-black border-b border-black pb-1 uppercase">4. CUMPRIMENTO DO OBJETO ATÉ A PRESENTE DATA</h2>

                        <div className="no-print space-y-6 bg-zinc-50 dark:bg-zinc-950/30 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                            <RadioGroup value={report.item4_type} onValueChange={val => setReport({ ...report, item4_type: val })}>
                                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-zinc-900 transition-colors">
                                    <RadioGroupItem value="fully" id="fully" className="mt-1" />
                                    <Label htmlFor="fully" className="cursor-pointer leading-normal">
                                        <span className="font-bold text-blue-900 dark:text-blue-400 block mb-1 uppercase text-xs">Cumprimento Integral</span>
                                        <span className="text-[11px] text-zinc-500">Conforme Plano de Trabalho, atividades coerentes e metas atingidas.</span>
                                    </Label>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-zinc-900 transition-colors">
                                    <RadioGroupItem value="partially" id="partially" className="mt-1" />
                                    <Label htmlFor="partially" className="cursor-pointer leading-normal">
                                        <span className="font-bold text-amber-600 block mb-1 uppercase text-xs">Cumprimento Parcial</span>
                                        <span className="text-[11px] text-zinc-500">Coerente nas atividades, mas meta quantitativa não alcançada.</span>
                                    </Label>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-zinc-900 transition-colors">
                                    <RadioGroupItem value="custom" id="custom" className="mt-1" />
                                    <Label htmlFor="custom" className="cursor-pointer leading-normal">
                                        <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1 uppercase text-xs">Outro / Ressalvas</span>
                                        <span className="text-[11px] text-zinc-500">Houve problemas ou desvios em relação ao objeto pactuado.</span>
                                    </Label>
                                </div>
                            </RadioGroup>

                            {report.item4_type === 'custom' && (
                                <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                                    <Label className="text-[10px] font-bold uppercase mb-2 block">Descreva a situação:</Label>
                                    <Textarea
                                        value={report.item4_custom}
                                        onChange={e => setReport({ ...report, item4_custom: e.target.value })}
                                        className="bg-white dark:bg-zinc-950"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="italic text-justify">
                            <p className="bg-blue-50/10 p-2 rounded">
                                Com base nas descrições relatadas e análises realizadas do monitoramento e avaliação desenvolvido por meio de Visita Técnica in loco, {getOptionText(report.item4_type)}
                            </p>
                        </div>
                    </section>

                    {/* Signatures */}
                    <section className="pt-20">
                        <div className="grid grid-cols-2 gap-20">
                            <div className="space-y-2">
                                <SignaturePad
                                    label=""
                                    defaultValue={report.assinaturas.tecnico1}
                                    onSave={data => setReport({ ...report, assinaturas: { ...report.assinaturas, tecnico1: data } })}
                                />
                                <div className="no-print">
                                    <Input
                                        placeholder="Nome do Técnico 1"
                                        value={report.assinaturas.tecnico1_nome}
                                        onChange={e => setReport({ ...report, assinaturas: { ...report.assinaturas, tecnico1_nome: e.target.value } })}
                                        className="text-center font-bold text-xs border-none bg-zinc-50"
                                    />
                                </div>
                                <div className="text-center">
                                    <p className="text-[11px] font-bold border-t border-black pt-1">{report.assinaturas.tecnico1_nome || "_________________________"}</p>
                                    <p className="text-[9px] font-black uppercase text-zinc-400">Técnico SMDS</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <SignaturePad
                                    label=""
                                    defaultValue={report.assinaturas.tecnico2}
                                    onSave={data => setReport({ ...report, assinaturas: { ...report.assinaturas, tecnico2: data } })}
                                />
                                <div className="no-print">
                                    <Input
                                        placeholder="Nome do Técnico 2"
                                        value={report.assinaturas.tecnico2_nome}
                                        onChange={e => setReport({ ...report, assinaturas: { ...report.assinaturas, tecnico2_nome: e.target.value } })}
                                        className="text-center font-bold text-xs border-none bg-zinc-50"
                                    />
                                </div>
                                <div className="text-center">
                                    <p className="text-[11px] font-bold border-t border-black pt-1">{report.assinaturas.tecnico2_nome || "_________________________"}</p>
                                    <p className="text-[9px] font-black uppercase text-zinc-400">Técnico SMDS</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Print Footer */}
                <div className="hidden print:block mt-8 text-[9px] text-center text-zinc-400 border-t pt-2 italic">
                    Documento gerado eletronicamente em {today} • Sistema de Vigilância Socioassistencial
                </div>
            </div>
        </div>
    )
}
