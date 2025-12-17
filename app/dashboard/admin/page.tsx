import { createClient } from "@/utils/supabase/server"
import { createUser } from "./actions"
import { getCachedDirectorates } from "@/app/dashboard/cached-data"
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
import { UserPlus, Shield } from "lucide-react"

export default async function AdminPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string, success?: string }>
}) {
    const supabase = await createClient()
    const { error, success } = await searchParams
    const directorates = await getCachedDirectorates()

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 py-10">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-100 text-indigo-600 mb-4 shadow-inner">
                    <Shield className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                    Gestão de Usuários
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                    Cadastre novos membros e gerencie permissões de acesso às diretorias.
                </p>
            </div>

            <Card className="border-indigo-100 dark:border-indigo-900/30 shadow-2xl shadow-indigo-500/10 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 pb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">Novo Cadastro</CardTitle>
                            <CardDescription>Preencha os dados abaixo para criar uma credencial.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-8">
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 text-sm font-semibold border border-red-100 flex items-center gap-2 animate-in slide-in-from-left-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 rounded-lg bg-emerald-50 text-emerald-600 text-sm font-semibold border border-emerald-100 flex items-center gap-2 animate-in slide-in-from-left-2">
                            <span>✅</span> {success}
                        </div>
                    )}

                    <form action={createUser} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-zinc-600 dark:text-zinc-400 font-medium">Nome Completo</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="Ex: João da Silva"
                                    className="h-11 bg-zinc-50/50 border-zinc-200 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-zinc-600 dark:text-zinc-400 font-medium">E-mail Corporativo</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="usuario@uberlandia.mg.gov.br"
                                    className="h-11 bg-zinc-50/50 border-zinc-200 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-zinc-600 dark:text-zinc-400 font-medium">Senha Provisória</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    minLength={6}
                                    placeholder="••••••"
                                    className="h-11 bg-zinc-50/50 border-zinc-200 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="directorate" className="text-zinc-600 dark:text-zinc-400 font-medium">Vincular Diretoria</Label>
                                <Select name="directorate" required>
                                    <SelectTrigger className="h-11 bg-zinc-50/50 border-zinc-200 focus:ring-indigo-500">
                                        <SelectValue placeholder="Selecione a diretoria..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {directorates?.map((d) => (
                                            <SelectItem key={d.id} value={d.id}>
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="pt-6 flex justify-end gap-3">
                            <Button type="button" variant="outline" className="h-11 px-6">Cancelar</Button>
                            <Button type="submit" className="h-11 px-8 bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300">
                                Criar Acesso
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
