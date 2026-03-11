import { OpinionReportForm } from "./parecer-form"
import { getVisitById } from "@/app/dashboard/actions"
import { getSystemSettings } from "@/app/dashboard/cached-data"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export default async function ParecerPage({
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

    const [visit, settings] = await Promise.all([
        getVisitById(visitId),
        getSystemSettings()
    ])

    if (!visit) {
        notFound()
    }

    return (
        <div className="container mx-auto py-8">
            <OpinionReportForm 
                visit={visit} 
                directorateId={id} 
                logoUrl={settings?.logo_url} 
            />
        </div>
    )
}
