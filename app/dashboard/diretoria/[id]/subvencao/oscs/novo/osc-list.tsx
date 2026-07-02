'use client'

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, MapPin, Phone, Calendar, Printer, Edit2, Trash2, Loader2, ArrowLeft } from "lucide-react"
import { deleteOSC } from "@/app/dashboard/actions"
import { useRouter } from "next/navigation"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const ACTIVITY_TYPES = [
    "Serviço de Convivência e Fortalecimento de Vínculos – 6 a 15 anos",
    "Serviço de Promoção da Integração ao Mundo Trabalho",
    "Fortalecimento do trabalho com famílias em situação de vulnerabilidade",
    "Trabalho com famílias e gestantes em situação de vulnerabilidade social",
    "Assessoria",
    "Serviço Especializado para População em Situação de Rua",
    "Serviço de Habilitação e Reabilitação da Pessoa com Deficiência",
    "Serviço Acolhimento Residência Inclusiva",
    "Serviço de Acolhimento Institucional para Idoso",
    "Serviço de Acolhimento Institucional para Crianças e Adolescentes",
    "Serviço de Família Acolhedora para Crianças e Adolescentes e Apadrinhamento Afetivo",
    "Serviço de Defesa de Direitos da Criança e Adolescente/ Família",
    "Serviço de Atendimento Especializado à Mulher Vítima de Violência",
    "Serviço de Acolhimento Institucional para Mulher Vítima de Violência"
]

export function OSCList({ oscs, onEdit }: { oscs: any[], onEdit?: (osc: any) => void }) {
    // ... previous code ...
    const router = useRouter()
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [selectedActivityType, setSelectedActivityType] = useState<string>("all")

    // Sort alphabetically
    const sortedOscs = [...oscs].sort((a, b) => a.name.localeCompare(b.name))

    // Filter by activity type
    const filteredOscs = selectedActivityType === "all"
        ? sortedOscs
        : sortedOscs.filter(osc => osc.activity_type === selectedActivityType)

    const handlePrint = () => {
        window.print()
    }

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Tem certeza que deseja excluir a OSC "${name}"?`)) return

        setDeletingId(id)
        try {
            const result = await deleteOSC(id)
            if (result.success) {
                router.refresh()
            } else {
                alert(result.error)
            }
        } catch (error: any) {
            alert("Erro ao excluir: " + error.message)
        } finally {
            setDeletingId(null)
        }
    }

    if (!oscs || oscs.length === 0) {
        return (
            <Card className="border-none shadow-2xl shadow-blue-900/5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <CardContent className="p-12 text-center text-zinc-500 font-medium">
                    Nenhuma OSC cadastrada até o momento.
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <style jsx global>{`
                @media print {
                    @page { margin: 5mm; size: landscape; }
                    
                    /* Hide Sidebar and Header - assuming typical Nextjs layout structure */
                    /* We need to target the containers outside this component */
                    nav, header, aside, .sidebar, .fixed, .sticky { 
                        display: none !important; 
                    }

                    /* Ensure Body is clean */
                    body { 
                        background: white !important; 
                        -webkit-print-color-adjust: exact; 
                        overflow: visible !important;
                        height: auto !important;
                    }

                    /* Main Container Reset */
                    .container, .main-content, main {
                        width: 100% !important;
                        max-width: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: visible !important;
                        display: block !important;
                    }

                    /* Hide elements marked as no-print */
                    .no-print { display: none !important; }

                    /* The print card itself */
                    .print-area { 
                        width: 100% !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                        background: white !important;
                        /* Reset any card styles */
                        display: block !important;
                        position: static !important;
                        overflow: visible !important;
                    }
                    
                    .print-area > div:first-child {
                        padding: 10px 0 !important;
                        margin-bottom: 0 !important;
                        page-break-after: avoid !important;
                        break-after: avoid !important;
                    }

                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    
                    thead {
                        display: table-header-group !important;
                    }
                    
                    tr {
                        page-break-inside: avoid !important;
                    }

                    th, td {
                        padding: 6px 4px !important;
                        border-bottom: 1px solid #e5e7eb !important;
                        font-size: 10px !important;
                        white-space: normal !important;
                        vertical-align: top !important;
                        color: black !important;
                    }

                    .rounded-2xl, .rounded-xl, .rounded-lg {
                        border-radius: 0 !important;
                    }

                    td:first-child { width: 25% !important; }
                    td:nth-child(2) { width: 25% !important; }
                    td:nth-child(3) { width: 35% !important; }
                    
                    .truncate {
                        white-space: normal !important;
                        overflow: visible !important;
                    }
                }
            `}</style>

            <Card className="border-none shadow-2xl shadow-blue-900/5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 print-area">
                <CardHeader className="p-8 pb-6 space-y-6">
                    <div className="flex items-center justify-between no-print">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="group flex items-center gap-2 text-zinc-500 hover:text-blue-900 transition-colors -ml-4"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Voltar para o Painel
                        </Button>

                        <Button
                            onClick={handlePrint}
                            variant="outline"
                            className="h-10 px-4 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 hover:bg-blue-900 hover:text-white transition-all gap-2 font-bold text-[11px] uppercase tracking-widest"
                        >
                            <Printer className="h-4 w-4" />
                            Imprimir Lista
                        </Button>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-400 rounded-xl">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-50 tracking-tight">
                                    OSCs Cadastradas
                                </CardTitle>
                                <p className="text-[12px] font-medium text-zinc-500">
                                    Total: {filteredOscs.length} instituições {selectedActivityType !== 'all' && `(filtrado)`}
                                </p>
                            </div>
                        </div>

                        <div className="w-full md:w-auto min-w-[300px] no-print">
                            <Select
                                value={selectedActivityType}
                                onValueChange={setSelectedActivityType}
                            >
                                <SelectTrigger className="h-10 text-[11px] font-medium uppercase tracking-wide bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl">
                                    <SelectValue placeholder="Filtrar por Atividade" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    <SelectItem value="all" className="font-bold">Todas as Atividades</SelectItem>
                                    {ACTIVITY_TYPES.map((type) => (
                                        <SelectItem key={type} value={type} className="text-[11px]">
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-100 dark:border-zinc-800 hover:bg-transparent">
                                    <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Instituição</TableHead>
                                    <TableHead className="py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Atividade</TableHead>
                                    <TableHead className="py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Contatos / Endereço</TableHead>
                                    <TableHead className="py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Bairro</TableHead>
                                    <TableHead className="py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Subvencionados</TableHead>
                                    <TableHead className="no-print px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOscs.map((osc) => (
                                    <TableRow key={osc.id} className="border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                                        <TableCell className="px-6 py-4">
                                            <div className="font-bold text-[13px] text-blue-900 dark:text-blue-50 group-hover:text-blue-600 transition-colors">
                                                {osc.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 max-w-[200px] truncate" title={osc.activity_type}>
                                                {osc.activity_type}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col gap-0.5">
                                                {osc.phone && (
                                                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-[11px] font-semibold">
                                                        <Phone className="h-3 w-3 text-blue-600/50" />
                                                        {osc.phone}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-500 text-[11px]">
                                                    <MapPin className="h-3 w-3 text-zinc-300" />
                                                    {osc.address}, {osc.number}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase tracking-tight">
                                                {osc.neighborhood}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4 text-center font-black text-blue-900 dark:text-blue-400">
                                            {osc.subsidized_count === -1 ? (
                                                <span className="text-[9px] text-zinc-500 uppercase">Conforme Demanda</span>
                                            ) : (
                                                osc.subsidized_count || 0
                                            )}
                                        </TableCell>
                                        <TableCell className="no-print px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onEdit?.(osc)}
                                                    className="h-8 w-8 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(osc.id, osc.name)}
                                                    disabled={deletingId === osc.id}
                                                    className="h-8 w-8 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                                    title="Excluir"
                                                >
                                                    {deletingId === osc.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
