import { getOSCs } from "@/app/dashboard/actions"
import { PlanoTrabalhoClient } from "./plano-trabalho-client"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function PlanoTrabalhoPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const oscs = await getOSCs()

    return (
        <PlanoTrabalhoClient directorateId={id} oscs={oscs} />
    )
}
