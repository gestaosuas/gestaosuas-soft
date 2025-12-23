import { VisitForm } from "./visit-form"
import { getOSCs } from "@/app/dashboard/actions"

export default async function NovaVisitaPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const oscs = await getOSCs()

    return (
        <div className="container mx-auto py-8">
            <VisitForm directorateId={id} oscs={oscs} />
        </div>
    )
}
