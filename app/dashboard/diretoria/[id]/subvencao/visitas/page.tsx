import { Button } from "@/components/ui/button"
import { getCachedProfile, getCachedDirectorate, getCachedDirectorates } from "@/app/dashboard/cached-data"
import { VisitList } from "./visit-list"
import { getVisits } from "@/app/dashboard/actions"
import { Plus, FileText } from "lucide-react"
import { ClientNavigateButton } from "./client-navigate-button"
import { ReturnLink } from "./return-link"
import { isAdmin as checkAdmin } from "@/lib/auth-utils"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

import { createAdminClient } from "@/utils/supabase/admin"

export default async function VisitasPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const [visits, profile, directorate, usersResponse, allDirectorates] = await Promise.all([
        getVisits(id),
        getCachedProfile(user.id),
        getCachedDirectorate(id),
        adminSupabase.from('profiles')
            .select(`
                id,
                full_name
            `)
            .order('full_name'),
        getCachedDirectorates()
    ])

    const isAdmin = profile?.role === 'admin'
    const role = profile?.role
    
    console.log(`[VisitasPage] User: ${user.email}, Role: ${role}, isAdmin: ${isAdmin}`)

    const availableUsers = (usersResponse.data || [])

    const dirName = directorate?.name?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || ""
    const isEmendas = dirName.includes('emenda') || dirName.includes('fundo') || id === '63553b96-3771-4842-9f45-630c7558adac' || id === '12b2a325-113f-4bc5-a74a-4f58a569be24'

    return (
        <div className="container mx-auto py-8 space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
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
                    <ReturnLink href={`/dashboard/diretoria/${id}`} />
                </div>

                <ClientNavigateButton href={`/dashboard/diretoria/${id}/subvencao/visitas/novo`} label="Nova Visita" />
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-zinc-200/60 dark:border-zinc-800"></div>
                </div>
            </div>

            <VisitList
                visits={visits}
                directorateId={id}
                isAdmin={isAdmin}
                isEmendas={isEmendas}
                role={role}
                currentUserId={user.id}
                availableUsers={availableUsers}
                availableDirectorates={allDirectorates || []}
            />
        </div>
    )
}
