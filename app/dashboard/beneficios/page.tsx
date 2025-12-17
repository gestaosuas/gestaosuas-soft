import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileText, BarChart3, Settings } from "lucide-react"
import Link from "next/link"

export default function BeneficiosPage() {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative">
                <div className="absolute -left-10 -top-10 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -z-10"></div>
                <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600 dark:from-pink-400 dark:to-rose-400">
                    Benefícios Socioassistenciais
                </h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
                    Gestão de benefícios eventuais e continuados.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Card 1: Enviar Relatório */}
                <Link href="/dashboard/relatorios/novo?setor=beneficios" className="group relative block w-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                    <Card className="relative h-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-pink-100 dark:border-pink-900/30 overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-pink-500/20">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FileText className="w-32 h-32 text-pink-600 -rotate-12 translate-x-10 -translate-y-10" />
                        </div>
                        <CardHeader className="relative z-10">
                            <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform duration-300">
                                <FileText className="h-7 w-7" />
                            </div>
                            <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-pink-600 transition-colors">
                                Enviar Relatório
                            </CardTitle>
                            <CardDescription className="text-sm mt-2">
                                Preencher indicadores mensais de benefícios.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                {/* Card 2: Dados */}
                <Link href="/dashboard/dados?setor=beneficios" className="group relative block w-full">
                    <Card className="h-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-zinc-200 dark:border-zinc-800 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:border-rose-500/30">
                        <CardHeader>
                            <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform duration-300">
                                <BarChart3 className="h-7 w-7" />
                            </div>
                            <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-rose-600 transition-colors">
                                Dados
                            </CardTitle>
                            <CardDescription className="text-sm mt-2">
                                Tabela consolidada dos registros.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                {/* Card 3: Dashboard */}
                <Link href="/dashboard/graficos?setor=beneficios" className="group relative block w-full">
                    <Card className="h-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-zinc-200 dark:border-zinc-800 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:border-orange-500/30">
                        <CardHeader>
                            <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300">
                                <Settings className="h-7 w-7" />
                            </div>
                            <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-orange-600 transition-colors">
                                Dashboard
                            </CardTitle>
                            <CardDescription className="text-sm mt-2">
                                Gráficos e visualização de indicadores.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
