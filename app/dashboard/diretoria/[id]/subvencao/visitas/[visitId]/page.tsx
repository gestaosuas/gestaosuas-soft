import { VisitForm } from "../novo/visit-form"
import { getOSCs, getVisitById } from "@/app/dashboard/actions"
import { getSystemSettings } from "@/app/dashboard/cached-data"
import { notFound } from "next/navigation"

export default async function VisitaDetailPage({
    params
}: {
    params: Promise<{ id: string, visitId: string }>
}) {
    const { id, visitId } = await params
    const [visit, oscs, settings] = await Promise.all([
        getVisitById(visitId),
        getOSCs(),
        getSystemSettings()
    ])

    if (!visit) {
        notFound()
    }

    return (
        <div className="container mx-auto py-8">
            <VisitForm
                directorateId={id}
                oscs={oscs}
                initialVisit={visit}
                logoUrl={settings?.logo_url}
            />
        </div>
    )
}
