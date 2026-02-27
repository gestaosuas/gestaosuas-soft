import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { getCachedProfile } from "@/app/dashboard/cached-data"
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

    const cachedProfile = await getCachedProfile(user.id)
    const isAdmin = cachedProfile?.role === 'admin'

    let directorate = null;

    if (directorate_id) {
        const adminSupabase = createAdminClient()
        const { data: requestedDirectorate } = await adminSupabase
            .from('directorates')
            .select('*')
            .eq('id', directorate_id)
            .single()

        if (requestedDirectorate) {
            // Check permissions using the cached profile data which comes from admin context
            // @ts-ignore
            const userDirectorates = cachedProfile?.directorates || []
            const isLinked = userDirectorates.some((d: any) => d.id === directorate_id)

            if (isAdmin || isLinked) {
                directorate = requestedDirectorate
            } else {
                return (
                    <div className="flex h-[80vh] items-center justify-center">
                        <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Acesso não autorizado</h2>
                            <p className="text-zinc-600 dark:text-zinc-400">Você não tem permissão para acessar esta diretoria.</p>
                        </div>
                    </div>
                )
            }
        }
    }

    if (!directorate) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Diretoria não encontrada</h2>
                <p className="text-zinc-500">Verifique se o link está correto ou contate o administrador.</p>
            </div>
        </div>
    )

    const { getUserAllowedUnits } = await import("@/lib/auth-utils")
    const allowedUnits = await getUserAllowedUnits(user.id, directorate.id)

    if (allowedUnits) {
        if (setor === 'sine' && !allowedUnits.includes('SINE')) {
            return (
                <div className="flex h-[80vh] items-center justify-center">
                    <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100">
                        <h2 className="text-xl font-bold text-red-600 mb-2">Acesso Restrito</h2>
                        <p>Você não tem permissão para os relatórios mensais do <strong>SINE</strong>.</p>
                    </div>
                </div>
            )
        }
        if (setor === 'centros' && !allowedUnits.includes('Centro Profissionalizante')) {
            return (
                <div className="flex h-[80vh] items-center justify-center">
                    <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100">
                        <h2 className="text-xl font-bold text-red-600 mb-2">Acesso Restrito</h2>
                        <p>Você não tem permissão para os relatórios mensais do <strong>Centro Profissionalizante</strong>.</p>
                    </div>
                </div>
            )
        }
    }

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
