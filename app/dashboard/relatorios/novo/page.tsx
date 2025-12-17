import { createClient } from "@/utils/supabase/server"
import { SubmissionFormClient } from "./form-client"
import { FormDefinition } from "@/components/form-engine"
import { redirect } from "next/navigation"
import { CP_FORM_DEFINITION } from "@/app/dashboard/cp-config"
import { BENEFICIOS_FORM_DEFINITION } from "@/app/dashboard/beneficios-config"

export default async function NewReportPage({
    searchParams,
}: {
    searchParams: Promise<{ setor?: string }>
}) {
    const { setor } = await searchParams
    const isCP = setor === 'centros'
    const isBeneficios = setor === 'beneficios'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*, directorates(*)')
        .eq('id', user.id)
        .single()

    if (!profile?.directorates) {
        return <div>Erro: Sem diretoria vinculada.</div>
    }

    const directorate = Array.isArray(profile.directorates) ? profile.directorates[0] : profile.directorates

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
            />
        </div>
    )
}
