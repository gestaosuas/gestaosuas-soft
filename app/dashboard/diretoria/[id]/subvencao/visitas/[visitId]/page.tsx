import { VisitForm } from "../novo/visit-form"
import { getOSCs, getVisitById } from "@/app/dashboard/actions"
import { getSystemSettings, getCachedDirectorate } from "@/app/dashboard/cached-data"
import { notFound } from "next/navigation"

export default async function VisitaDetailPage({
    params
}: {
    params: Promise<{ id: string, visitId: string }>
}) {
    const { id, visitId } = await params
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

    return (
        <div className="container mx-auto py-8">
            <VisitForm
                directorateId={id}
                directorateName={directorateName}
                oscs={oscs}
                initialVisit={visit}
                logoUrl={settings?.logo_url}
            />
        </div>
    )
}
