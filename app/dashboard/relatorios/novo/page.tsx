import { createClient } from "@/utils/supabase/server"
import { SubmissionFormClient } from "./form-client"
import { FormDefinition } from "@/components/form-engine"
import { redirect } from "next/navigation"
import { CP_FORM_DEFINITION } from "@/app/dashboard/cp-config"
import { BENEFICIOS_FORM_DEFINITION } from "@/app/dashboard/beneficios-config"

export default async function NewReportPage({
    searchParams,
}: {
    searchParams: Promise<{ setor?: string, directorate_id?: string }>
}) {
    const { setor, directorate_id } = await searchParams
    const isCP = setor === 'centros'
    const isBeneficios = setor === 'beneficios'

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
        // Fetch the requested directorate details
        const { data: requestedDirectorate } = await supabase
            .from('directorates')
            .select('*')
            .eq('id', directorate_id)
            .single()

        if (requestedDirectorate) {
            // Check permissions: Admin or Linked
            // @ts-ignore
            const userDirectorates = profile?.profile_directorates?.map(pd => pd.directorates) || []

            const isLinked = userDirectorates.some((d: any) => d.id === directorate_id)

            if (isAdmin || isLinked) {
                directorate = requestedDirectorate
            } else {
                return (
                    <div className="p-8 text-center">
                        <h2 className="text-xl font-bold text-red-600 mb-2">Acesso não autorizado</h2>
                        <p>Você não tem permissão para acessar a diretoria: <strong>{requestedDirectorate.name}</strong></p>
                        <div className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded text-xs text-left inline-block">
                            <p>Debug Info:</p>
                            <p>User Email: {user.email}</p>
                            <p>Role: {profile?.role}</p>
                            <p>Is Admin: {isAdmin ? 'Sim' : 'Não'}</p>
                            <p>Is Linked: {isLinked ? 'Sim' : 'Não'}</p>
                        </div>
                    </div>
                )
            }
        }
    }

    // Fallback if no ID provided or not found (for legacy support or default)
    // Fallback if no ID provided or not found
    if (!directorate) {
        // @ts-ignore
        const userDirectorates = profile?.profile_directorates?.map(pd => pd.directorates) || []

        if (userDirectorates.length === 0) {
            return <div>Erro: Sem diretoria vinculada.</div>
        }
        directorate = userDirectorates[0]
    }

    // Choose Form Definition based on setor
    let formDefinition = directorate.form_definition as FormDefinition
    let titleContext = directorate.name

    if (isCP) {
        formDefinition = CP_FORM_DEFINITION
        titleContext = `${directorate.name} (CP)`
    }

    if (isBeneficios) {
        formDefinition = BENEFICIOS_FORM_DEFINITION
        titleContext = "Benefícios Socioassistenciais"
    }

    if (setor === 'sine') {
        titleContext = `${directorate.name} (SINE)`
    }

    if (!formDefinition) {
        return <div>Erro: Formulário não configurado.</div>
    }

    return (
        <div className="container mx-auto max-w-7xl py-8">
            <SubmissionFormClient
                definition={formDefinition}
                directorateName={titleContext}
                directorateId={directorate.id}
                setor={setor}
                isAdmin={isAdmin}
            />
        </div>
    )
}
