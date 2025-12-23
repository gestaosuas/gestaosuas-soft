import { VisitForm } from "../novo/visit-form"
import { getOSCs, getVisitById } from "@/app/dashboard/actions"
import { notFound } from "next/navigation"

export default async function VisitaDetailPage({
    params
}: {
    params: Promise<{ id: string, visitId: string }>
}) {
    const { id, visitId } = await params
    const [visit, oscs] = await Promise.all([
        getVisitById(visitId),
        getOSCs()
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
            />
        </div>
    )
}
