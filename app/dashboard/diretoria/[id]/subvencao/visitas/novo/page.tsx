import { VisitForm } from "./visit-form"
import { getOSCs } from "@/app/dashboard/actions"
import { getSystemSettings, getCachedDirectorate } from "@/app/dashboard/cached-data"

export default async function NovaVisitaPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
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
            />
        </div>
    )
}
