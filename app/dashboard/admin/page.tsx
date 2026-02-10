import { createClient } from "@/utils/supabase/server"
import { createUser } from "./actions"
import { getCachedDirectorates } from "@/app/dashboard/cached-data"
import { UserList } from "./user-list"
import { createAdminClient } from "@/utils/supabase/admin"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default async function AdminPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string, success?: string }>
}) {
    const supabase = await createClient()
    const { error, success } = await searchParams
    const directorates = await getCachedDirectorates()
    const mappedUsers = await fetchAllUsers()

    return (
        <div className="max-w-[1000px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-1000 py-10">
            <header className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-blue-900 dark:text-blue-50">
                    Administração de Usuários
                </h1>
                <p className="text-[15px] text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl leading-relaxed">
                    Controle de acesso institucional. Cadastre novos membros e gerencie permissões de visibilidade por diretoria.
                </p>
            </header>

            <Card className="border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none rounded-2xl overflow-hidden">
                <CardHeader className="pt-10 px-8 pb-6 border-b border-zinc-100 dark:border-zinc-800/60">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Novo Cadastro</CardTitle>
                        <CardDescription className="text-sm font-medium text-zinc-500">Credenciais oficiais de acesso ao sistema.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="pt-8 px-8 pb-10">
                    {error && (
                        <div className="mb-8 p-4 rounded-lg bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-[13px] font-medium text-red-600 dark:text-red-400 flex items-center gap-2 animate-in fade-in zoom-in-95">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-8 p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 text-[13px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in zoom-in-95">
                            {success}
                        </div>
                    )}

                    <form action={createUser} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <Label htmlFor="name" className="text-[12px] uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 ml-0.5">Nome Completo</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    placeholder=""
                                    className="h-11 bg-zinc-50/50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-600 transition-all font-medium whitespace-nowrap"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="email" className="text-[12px] uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 ml-0.5">E-mail Corporativo</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder=""
                                    className="h-11 bg-zinc-50/50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-lg focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 transition-all font-medium whitespace-nowrap"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="password" className="text-[12px] uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 ml-0.5">Senha Provisória</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    minLength={6}
                                    placeholder=""
                                    className="h-11 bg-zinc-50/50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-lg focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 transition-all font-medium whitespace-nowrap"
                                />
                            </div>
                            <div className="space-y-4 md:col-span-2">
                                <Label className="text-[12px] uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 ml-0.5">Atribuição de Diretorias</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 rounded-xl border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/30 dark:bg-zinc-950/20">
                                    {directorates?.map((d) => (
                                        <label key={d.id} className="flex items-center gap-3 p-3 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 rounded-lg cursor-pointer transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-800 group shadow-none">
                                            <div className="flex items-center h-5">
                                                <input
                                                    type="checkbox"
                                                    name="directorates"
                                                    value={d.id}
                                                    className="h-4 w-4 rounded border-zinc-300 text-blue-900 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800"
                                                />
                                            </div>
                                            <span className="text-[13px] font-semibold text-zinc-600 dark:text-zinc-400 group-hover:text-blue-900 dark:group-hover:text-blue-200 transition-colors uppercase tracking-tight">{d.name}</span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-[11px] text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-wider ml-1 italic">Dica: Um usuário pode monitorar múltiplas áreas simultaneamente.</p>
                            </div>
                        </div>
                        <div className="pt-6 flex justify-end gap-4 border-t border-zinc-100 dark:border-zinc-800/60 pt-10">
                            <Button type="button" variant="ghost" className="h-11 px-6 font-bold text-zinc-500 hover:text-blue-900 dark:hover:text-blue-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all uppercase tracking-widest text-[11px]">Limpar</Button>
                            <Button type="submit" className="h-11 px-10 bg-blue-900 dark:bg-blue-600 text-white hover:bg-blue-800 dark:hover:bg-blue-500 font-bold rounded-lg transition-all active:scale-[0.98] shadow-lg shadow-blue-900/10 dark:shadow-none uppercase tracking-widest text-[11px]">
                                Cadastrar Membro
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <UserList users={mappedUsers} directorates={directorates || []} />
        </div>
    )
}

async function fetchAllUsers() {
    const supabaseAdmin = createAdminClient()

    // 1. Get Auth Users
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
    if (error || !users) return []

    // 2. Get Profiles & Permissions
    const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select(`
            id, 
            role, 
            full_name,
            profile_directorates (
                directorate_id
            )
        `)

    // Map for easy lookup
    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))

    // 3. Merge
    const mergedUsers = (users || []).map((u: any) => {
        const profile = profileMap.get(u.id)
        // Access nested join safely
        // @ts-ignore
        const rawDirs = profile?.profile_directorates || []
        // @ts-ignore
        const dirIds = rawDirs.map(pd => pd.directorate_id)

        return {
            id: u.id,
            email: u.email || 'No email',
            name: profile?.full_name || u.user_metadata?.full_name || 'Desconhecido',
            role: profile?.role || 'user',
            directorateIds: dirIds
        }
    })

    return mergedUsers
}
