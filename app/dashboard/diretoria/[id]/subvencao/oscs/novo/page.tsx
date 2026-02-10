import { getOSCs } from "@/app/dashboard/actions"
import { OSCManagementClient } from "./osc-management-client"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function NewOSCPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const oscs = await getOSCs(id)

    return (
        <OSCManagementClient directorateId={id} initialOscs={oscs} />
    )
}
