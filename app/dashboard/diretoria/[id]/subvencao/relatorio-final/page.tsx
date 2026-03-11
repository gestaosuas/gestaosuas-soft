import { getCachedDirectorate, getCachedProfile } from "@/app/dashboard/cached-data"
import { notFound, redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, CheckCircle2, FileCheck } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { getVisits } from "@/app/dashboard/actions"
import { isAdmin as checkAdmin } from "@/lib/auth-utils"

export default async function FinalReportsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const directorate = await getCachedDirectorate(id)

    if (!directorate) {
        return notFound()
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const isAdmin = await checkAdmin(user.id)
    if (!isAdmin) redirect(`/dashboard/diretoria/${id}`)

    const visits = await getVisits(directorate.id)
    const finalizedVisits = visits.filter((v: any) => v.status === 'finalized' && v.parecer_tecnico?.status === 'finalized')

    return (
        <div className="container mx-auto py-12 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-1000">
            <Link
                href={`/dashboard/diretoria/${id}`}
                className="group flex items-center gap-2 text-zinc-500 hover:text-blue-900 transition-colors w-fit"
            >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Voltar para Diretoria
            </Link>

            <header className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-[#1e3a8a] dark:text-blue-50">
                    Relatórios Finais e Pareceres
                </h1>
                <p className="text-zinc-500 font-medium">
                    Listagem de visitas com monitoramento e relatórios técnicos finalizados.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {finalizedVisits.length > 0 ? (
                    finalizedVisits.map((visit: any) => (
                        <Card key={visit.id} className="h-full bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none hover:border-green-600 dark:hover:border-green-400 transition-all rounded-3xl group hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                            <CardHeader className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 w-fit bg-zinc-50 dark:bg-zinc-800 rounded-xl group-hover:bg-green-600 dark:group-hover:bg-green-500 transition-colors shadow-sm">
                                        <FileCheck className="w-5 h-5 text-zinc-500 group-hover:text-white" />
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-full text-green-700 dark:text-green-400 uppercase tracking-tight font-black text-[10px]">
                                        Finalizado
                                    </div>
                                </div>
                                <CardTitle className="text-base font-bold text-blue-900 dark:text-blue-100 transition-colors truncate" title={visit.oscs?.name}>
                                    {visit.oscs?.name}
                                </CardTitle>
                                <CardDescription className="text-[13px] text-zinc-500 mt-1 font-medium italic">
                                    Visita em {new Date(visit.visit_date).toLocaleDateString('pt-BR')}
                                </CardDescription>
                                <div className="mt-8 flex flex-col gap-3">
                                    <Link href={`/dashboard/diretoria/${directorate.id}/subvencao/visitas/${visit.id}/parecer`} className="w-full">
                                        <Button variant="outline" className="w-full h-10 gap-2 font-bold uppercase text-[10px] rounded-xl border-zinc-200 hover:bg-green-600 hover:text-white transition-all">
                                            <FileText className="h-4 w-4" />
                                            Relatório Final
                                        </Button>
                                    </Link>
                                    <Link href={`/dashboard/diretoria/${directorate.id}/subvencao/visitas/${visit.id}/parecer-conclusivo`} className="w-full">
                                        <Button variant="outline" className="w-full h-10 gap-2 font-bold uppercase text-[10px] rounded-xl border-zinc-200 hover:bg-blue-900 hover:text-white transition-all">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Parecer Conclusivo
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                        </Card>
                    ))
                ) : (
                    <Card className="col-span-full border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-2xl">
                        <CardContent className="p-12 text-center text-zinc-400 font-medium text-sm italic">
                            Nenhum relatório finalizado encontrado para esta diretoria.
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
