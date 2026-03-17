import { VisitForm } from "../novo/visit-form"
import { getOSCs, getVisitById } from "@/app/dashboard/actions"
import { getSystemSettings, getCachedDirectorate } from "@/app/dashboard/cached-data"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { canAccessVisit } from "@/lib/auth-utils"

export default async function VisitaDetailPage({
    params
}: {
    params: Promise<{ id: string, visitId: string }>
}) {
    const { id, visitId } = await params

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const [visit, oscs, settings, directorate] = await Promise.all([
        getVisitById(visitId),
        getOSCs(id),
        getSystemSettings(),
        getCachedDirectorate(id)
    ])

    const directorateName = directorate?.name || ""

    if (!visit) {
        notFound()
    }

    // Check permissions
    if (!await canAccessVisit(user.id, visitId)) {
        redirect(`/dashboard/diretoria/${id}/subvencao/visitas`)
    }

    return (
        <div className="container mx-auto py-8">
            <VisitForm
                directorateId={id}
                directorateName={directorateName}
                oscs={oscs}
                initialVisit={visit}
                logoUrl={settings?.logo_url}
                userId={user.id}
            />
        </div>
    )
}
