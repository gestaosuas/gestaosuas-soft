import { createClient } from "@/utils/supabase/server"
import { SubmissionFormClient } from "./form-client"
import { FormDefinition } from "@/components/form-engine"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/utils/supabase/admin"
import { CP_FORM_DEFINITION } from "@/app/dashboard/cp-config"
import { BENEFICIOS_FORM_DEFINITION } from "@/app/dashboard/beneficios-config"
import { CRAS_FORM_DEFINITION } from "@/app/dashboard/cras-config"

export default async function NewReportPage({
    searchParams,
}: {
    searchParams: Promise<{ setor?: string, directorate_id?: string, unit?: string }>
}) {
    const { setor, directorate_id, unit } = await searchParams
    const isCP = setor === 'centros'
    const isBeneficios = setor === 'beneficios'
    const isCRAS = setor === 'cras'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const adminSupabase = createAdminClient()

    const { data: profile } = await adminSupabase
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
        // Fetch the requested directorate details using admin client
        const { data: requestedDirectorate } = await adminSupabase
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

        // Try to find by keyword in assigned directorates
        if (isBeneficios) {
            directorate = userDirectorates.find((d: any) => d.name.toLowerCase().includes('benefícios'))
        } else if (isCP || setor === 'sine') {
            directorate = userDirectorates.find((d: any) => d.name.toLowerCase().includes('profis') || d.name.toLowerCase().includes('sine'))
        } else if (isCRAS) {
            directorate = userDirectorates.find((d: any) => d.name.toLowerCase().includes('cras'))
        }

        // If still not found and admin, fetch all to try and find a match
        if (!directorate && isAdmin) {
            const { data: allDirs } = await adminSupabase.from('directorates').select('*')
            const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

            if (isBeneficios) {
                directorate = allDirs?.find(d => normalize(d.name).includes('beneficios'))
            } else if (isCP || setor === 'sine') {
                directorate = allDirs?.find(d => normalize(d.name).includes('profis') || normalize(d.name).includes('sine'))
            } else if (isCRAS) {
                directorate = allDirs?.find(d => normalize(d.name).includes('cras'))
            }
        }

        if (!directorate) {
            if (userDirectorates.length === 0 && !isAdmin) {
                return <div>Erro: Sem diretoria vinculada.</div>
            }
            directorate = userDirectorates?.[0]
        }
    }

    if (!directorate) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-red-600 mb-2">Diretoria não encontrada ou sem permissão</h2>
                <p>Favor contatar o administrador ou verificar se você possui as permissões necessárias.</p>
            </div>
        )
    }

    // Choose Form Definition based on setor
    let formDefinition = (directorate as any).form_definition as FormDefinition
    let titleContext = directorate.name

    if (isCP) {
        formDefinition = CP_FORM_DEFINITION
        titleContext = `${directorate.name} (CP)`
    }

    if (isBeneficios) {
        formDefinition = BENEFICIOS_FORM_DEFINITION
        titleContext = "Benefícios Socioassistenciais"
    }

    if (isCRAS) {
        formDefinition = CRAS_FORM_DEFINITION
        titleContext = "CRAS"
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
                unit={unit}
                isAdmin={isAdmin}
            />
        </div>
    )
}
