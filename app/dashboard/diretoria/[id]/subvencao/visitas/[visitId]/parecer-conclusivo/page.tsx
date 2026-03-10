import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowLeft, Construction } from "lucide-react"
import Link from "next/link"

export default async function ParecerConclusivoPage({
    params
}: {
    params: Promise<{ id: string, visitId: string }>
}) {
    const { id, visitId } = await params

    return (
        <div className="container mx-auto py-12 space-y-8">
            <Link
                href={`/dashboard/diretoria/${id}`}
                className="group flex items-center gap-2 text-zinc-500 hover:text-blue-900 transition-colors w-fit"
            >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Voltar para Diretoria
            </Link>

            <Card className="max-w-2xl mx-auto border-none shadow-2xl shadow-blue-900/5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="p-12 text-center space-y-4">
                    <div className="mx-auto p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full w-fit">
                        <Construction className="h-12 w-12" />
                    </div>
                    <CardTitle className="text-3xl font-black text-blue-900 dark:text-blue-50 tracking-tight">
                        Parecer Conclusivo
                    </CardTitle>
                    <p className="text-zinc-500 font-medium">
                        Esta funcionalidade está em desenvolvimento.
                    </p>
                </CardHeader>
                <CardContent className="p-12 pt-0 text-center">
                    <p className="text-zinc-500 text-sm leading-relaxed">
                        Em breve você poderá preencher o Parecer Conclusivo para esta visita.
                        As informações necessárias para este relatório serão integradas em breve.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
