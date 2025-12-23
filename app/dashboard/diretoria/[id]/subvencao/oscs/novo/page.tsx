import { getOSCs } from "@/app/dashboard/actions"
import { OSCManagementClient } from "./osc-management-client"

export default async function NewOSCPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const oscs = await getOSCs()

    return (
        <OSCManagementClient directorateId={id} initialOscs={oscs} />
    )
}
