import { VisitForm } from "./visit-form"
import { getOSCs } from "@/app/dashboard/actions"
import { getSystemSettings } from "@/app/dashboard/cached-data"

export default async function NovaVisitaPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const [oscs, settings] = await Promise.all([
        getOSCs(),
        getSystemSettings()
    ])

    return (
        <div className="container mx-auto py-8">
            <VisitForm
                directorateId={id}
                oscs={oscs}
                logoUrl={settings?.logo_url}
            />
        </div>
    )
}
