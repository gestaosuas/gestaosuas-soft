import { createClient } from "@/utils/supabase/server"
import { createUser } from "./actions"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default async function AdminPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string, success?: string }>
}) {
    const supabase = await createClient()

    const { error, success } = await searchParams

    // Fetch directorates
    const { data: directorates } = await supabase.from('directorates').select('*')

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Criar Novo Usuário</CardTitle>
                    <CardDescription>Adicione um novo usuário e vincule a uma diretoria.</CardDescription>
                </CardHeader>
                <CardContent>
                    {error && <div className="mb-4 text-sm text-destructive font-bold">Erro: {error}</div>}
                    {success && <div className="mb-4 text-sm text-green-600 font-bold">{success}</div>}

                    <form action={createUser} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome Completo</Label>
                                <Input id="name" name="name" required placeholder="João Silva" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" required placeholder="user@example.com" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Senha Inicial</Label>
                                <Input id="password" name="password" type="password" required minLength={6} placeholder="******" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="directorate">Diretoria</Label>
                                <Select name="directorate" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {directorates?.map((d) => (
                                            <SelectItem key={d.id} value={d.id}>
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                        {!directorates?.length && (
                                            <SelectItem value="none" disabled>Nenhuma diretoria cadastrada</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="pt-4">
                            <Button type="submit">Criar Usuário</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
