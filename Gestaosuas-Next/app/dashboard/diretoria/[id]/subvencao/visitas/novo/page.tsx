import { VisitForm } from "./visit-form"
import { getOSCs } from "@/app/dashboard/actions"
import { getSystemSettings, getCachedDirectorate } from "@/app/dashboard/cached-data"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function NovaVisitaPage({
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

    const [oscs, settings, directorate] = await Promise.all([
        getOSCs(id),
        getSystemSettings(),
        getCachedDirectorate(id)
    ])

    const directorateName = directorate?.name || ""

    return (
        <div className="container mx-auto py-8">
            <VisitForm
                directorateId={id}
                directorateName={directorateName}
                oscs={oscs}
                logoUrl={settings?.logo_url}
                userId={user.id}
            />
        </div>
    )
}
