
import { getCachedDirectorate, getCachedProfile } from "@/app/dashboard/cached-data"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { MonthlyReportEditor } from "./editor"

export default async function MonthlyReportPage({
    searchParams,
}: {
    searchParams: Promise<{ setor?: string; directorate_id?: string; unit?: string }>
}) {
    const { setor, directorate_id } = await searchParams

    if (!directorate_id || !setor) {
        return notFound()
    }

    const directorate = await getCachedDirectorate(directorate_id)
    if (!directorate) return notFound()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    return (
        <div className="p-4 md:p-8">
            <MonthlyReportEditor 
                directorateId={directorate_id} 
                setor={setor} 
                directorateName={directorate.name} 
            />
        </div>
    )
}
