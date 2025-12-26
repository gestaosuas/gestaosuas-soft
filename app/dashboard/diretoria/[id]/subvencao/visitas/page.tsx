import { Button } from "@/components/ui/button"
import { VisitList } from "./visit-list"
import { getVisits } from "@/app/dashboard/actions"
import { Plus, ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"
import { isAdmin as checkAdmin } from "@/lib/auth-utils"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function VisitasPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const [visits, isAdmin] = await Promise.all([
        getVisits(id),
        checkAdmin(user.id)
    ])

    return (
        <div className="container mx-auto py-8 space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                    <Link
                        href={`/dashboard/diretoria/${id}`}
                        className="group flex items-center gap-2 text-zinc-500 hover:text-blue-900 transition-colors w-fit"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Voltar para Diretoria
                    </Link>
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-blue-900 text-white rounded-[1.5rem] shadow-xl shadow-blue-900/20">
                            <FileText className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-blue-900 dark:text-blue-50 tracking-tight">
                                Instrumental de Visita
                            </h1>
                            <p className="text-zinc-500 font-medium">
                                Monitoramento e Avaliação Técnica
                            </p>
                        </div>
                    </div>
                </div>

                <Link href={`/dashboard/diretoria/${id}/subvencao/visitas/novo`}>
                    <Button
                        className="h-14 px-8 rounded-2xl bg-blue-900 dark:bg-blue-600 text-white hover:bg-blue-800 dark:hover:bg-blue-500 font-bold uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-900/20 transition-all active:scale-[0.98] group"
                    >
                        <Plus className="h-5 w-5 mr-3 transition-transform group-hover:rotate-90" />
                        Nova Visita
                    </Button>
                </Link>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-zinc-200/60 dark:border-zinc-800"></div>
                </div>
            </div>

            <VisitList visits={visits} directorateId={id} isAdmin={isAdmin} />
        </div>
    )
}
