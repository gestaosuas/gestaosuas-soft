import { getCachedDirectorates, getCachedSubmissionsForUser, getCachedProfile } from "@/app/dashboard/cached-data"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { TvDashboardClient } from "./tv-client"

export default async function TvDashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const profile = await getCachedProfile(user.id)
    if (profile?.role !== 'admin') {
        redirect('/dashboard')
    }

    const allDirectorates = await getCachedDirectorates()
    
    // Filter out monitoring directorates same as main dashboard
    const directorates = allDirectorates?.filter(dir => 
        !['Subvenção', 'Emendas e Fundos', 'Outros'].includes(dir.name)
    ) || []

    // Fetch data for all directorates in parallel
    const directoratesWithData = await Promise.all(
        directorates.map(async (dir) => {
            const submissions = await getCachedSubmissionsForUser(user.id, dir.id)
            return {
                ...dir,
                submissions: submissions || []
            }
        })
    )

    return (
        <main className="fixed inset-0 z-[100] bg-white dark:bg-zinc-950 overflow-hidden">
            <TvDashboardClient directorates={directoratesWithData} />
        </main>
    )
}
