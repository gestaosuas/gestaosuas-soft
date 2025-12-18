import { createClient } from "@/utils/supabase/server"
import MonthlyReportEditor from "./editor"
import { redirect } from "next/navigation"

export default async function MonthlyReportPage({
    searchParams,
}: {
    searchParams: Promise<{ setor?: string, directorate_id?: string }>
}) {
    const { setor, directorate_id } = await searchParams

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select(`
            *,
            profile_directorates (
                directorates (*)
            )
        `)
        .eq('id', user.id)
        .single()

    const isEmailAdmin = ['klismanrds@gmail.com', 'gestaosuas@uberlandia.mg.gov.br'].includes(user.email || '')
    const isAdmin = profile?.role === 'admin' || isEmailAdmin

    let directorate = null;

    if (directorate_id) {
        const { data: requestedDirectorate } = await supabase
            .from('directorates')
            .select('*')
            .eq('id', directorate_id)
            .single()

        if (requestedDirectorate) {
            // @ts-ignore
            const userDirectorates = profile?.profile_directorates?.map(pd => pd.directorates) || []
            const isLinked = userDirectorates.some((d: any) => d.id === directorate_id)

            if (isAdmin || isLinked) {
                directorate = requestedDirectorate
            } else {
                return <div>Acesso não autorizado.</div>
            }
        }
    }

    if (!directorate) return <div>Diretoria não encontrada.</div>

    return (
        <div className="container mx-auto max-w-5xl py-8">
            <MonthlyReportEditor
                directorateId={directorate.id}
                directorateName={directorate.name}
                setor={setor}
                isAdmin={isAdmin}
            />
        </div>
    )
}
