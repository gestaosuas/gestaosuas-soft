
import { getSystemSettings } from "@/app/dashboard/cached-data"
import SettingsForm from "./settings-form"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Admin check
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isEmailAdmin = ['klismanrds@gmail.com', 'gestaosuas@uberlandia.mg.gov.br'].includes(user.email || '')
    const isAdmin = profile?.role === 'admin' || isEmailAdmin

    if (!isAdmin) {
        return <div className="p-8">Acesso Negado. Apenas administradores podem acessar esta página.</div>
    }

    const settings = await getSystemSettings()

    return (
        <div className="container mx-auto max-w-4xl py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Configurações do Sistema</h1>
            <p className="text-muted-foreground mb-8">Gerencie as opções globais da aplicação.</p>

            <SettingsForm initialSettings={settings} />
        </div>
    )
}
