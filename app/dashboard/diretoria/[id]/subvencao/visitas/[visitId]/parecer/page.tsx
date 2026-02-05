import { getVisitById } from "@/app/dashboard/actions"
import { OpinionReportForm } from "./parecer-form"
import { redirect } from "next/navigation"
import { getSystemSettings } from "@/app/dashboard/cached-data"

export default async function ParecerPage({
    params
}: {
    params: Promise<{ id: string, visitId: string }>
}) {
    const { id, visitId } = await params
    const visit = await getVisitById(visitId)
    const settings = await getSystemSettings()

    if (!visit) {
        redirect(`/dashboard/diretoria/${id}/subvencao/visitas`)
    }

    if (visit.status !== 'finalized') {
        // Option report only allowed for finalized visits
        redirect(`/dashboard/diretoria/${id}/subvencao/visitas/${visitId}`)
    }

    return (
        <div className="p-4 md:p-8">
            <OpinionReportForm
                visit={visit}
                directorateId={id}
                logoUrl={settings?.logo_url}
            />
        </div>
    )
}
