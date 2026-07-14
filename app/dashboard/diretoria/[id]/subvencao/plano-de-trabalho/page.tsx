import { getOSCs, getWorkPlansCount } from "@/app/dashboard/actions"
import { PlanoTrabalhoClient } from "./plano-trabalho-client"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { getSystemSettings, getCachedProfile, getCachedDirectorate } from "@/app/dashboard/cached-data"

export default async function PlanoTrabalhoPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const profile = await getCachedProfile(user.id)
    const oscs = await getOSCs(id)
    const counts = await getWorkPlansCount(id)
    const settings = await getSystemSettings()
    const directorate = await getCachedDirectorate(id)

    const dirName = directorate?.name?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || ""
    const isEmendas = dirName.includes('emenda') || dirName.includes('fundo') || id === '63553b96-3771-4842-9f45-630c7558adac' || id === '12b2a325-113f-4bc5-a74a-4f58a569be24'

    return (
        <PlanoTrabalhoClient
            directorateId={id}
            oscs={oscs}
            profile={profile}
            planCounts={counts}
            logoUrl={settings?.logo_url}
            isEmendas={isEmendas}
        />
    )
}
