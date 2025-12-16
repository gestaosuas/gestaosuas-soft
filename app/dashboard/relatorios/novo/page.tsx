import { createClient } from "@/utils/supabase/server"
import { SubmissionFormClient } from "./form-client"
import { FormDefinition } from "@/components/form-engine"
import { redirect } from "next/navigation"

export default async function NewReportPage() {
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

    const directorate = profile.directorates
    const formDefinition = directorate.form_definition as FormDefinition

    if (!formDefinition) {
        return <div>Erro: Formulário não configurado.</div>
    }

    return (
        <div className="container mx-auto max-w-7xl py-8">
            <SubmissionFormClient
                definition={formDefinition}
                directorateName={directorate.name}
            />
        </div>
    )
}
