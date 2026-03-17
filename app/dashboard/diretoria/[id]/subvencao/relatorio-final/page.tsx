import { getCachedDirectorate, getCachedProfile } from "@/app/dashboard/cached-data"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { getVisits } from "@/app/dashboard/actions"
import { FinalReportList } from "./final-report-list"

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

    const profile = await getCachedProfile(user.id)
    const isAdmin = profile?.role === 'admin'
    
    // Fetch visits - getVisits already filters by user/delegation/role
    const visits = await getVisits(directorate.id)
    const finalizedVisits = visits.filter((v: any) => v.status === 'finalized' && v.parecer_tecnico?.status === 'finalized')

    // Fetch available users for delegation (Admins and Directors only)
    let availableUsers: { id: string, full_name: string }[] = []
    if (isAdmin || profile?.role === 'diretor') {
        const adminSupabase = createAdminClient()
        const { data: users } = await adminSupabase
            .from('profiles')
            .select('id, full_name')
            .order('full_name')
        availableUsers = users || []
    }

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

            <FinalReportList 
                visits={finalizedVisits} 
                directorateId={directorate.id} 
                isAdmin={isAdmin}
                role={profile?.role}
                availableUsers={availableUsers}
            />
        </div>
    )
}
