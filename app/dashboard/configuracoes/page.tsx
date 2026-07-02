
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
        <div className="container mx-auto max-w-4xl py-8 animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-20">
            <h1 className="text-4xl font-extrabold tracking-tight text-blue-900 dark:text-blue-50 mb-2">
                Configurações do Sistema
            </h1>
            <p className="text-[15px] text-zinc-500 dark:text-zinc-400 font-medium mb-12">Gerencie as opções globais e identidade visual da aplicação.</p>

            <SettingsForm initialSettings={settings} />
        </div>
    )
}
