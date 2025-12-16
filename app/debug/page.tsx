import { createClient } from "@/utils/supabase/server"

export default async function DebugPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Não logado.</div>

    const { data: profile } = await supabase.from('profiles').select('*, directorates(*)').eq('id', user.id).single()
    const { data: allDirectorates } = await supabase.from('directorates').select('*')

    return (
        <div className="p-8 space-y-4 font-mono text-sm">
            <h1 className="text-xl font-bold">Debug Usuário</h1>
            <div className="bg-gray-100 p-4 rounded text-black">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
            </div>

            <h2 className="text-lg font-bold mt-4">Profile (Banco de Dados)</h2>
            <pre className="bg-gray-100 p-4 rounded text-black overflow-auto">
                {JSON.stringify(profile, null, 2)}
            </pre>

            <h2 className="text-lg font-bold mt-4">Todas as Diretorias Disponíveis</h2>
            <pre className="bg-gray-100 p-4 rounded text-black overflow-auto">
                {JSON.stringify(allDirectorates, null, 2)}
            </pre>
        </div>
    )
}
