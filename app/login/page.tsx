import { login } from './actions'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Mail } from 'lucide-react'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const { error } = await searchParams

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
            <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-zinc-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <Card className="w-full max-w-md shadow-2xl border-0 ring-1 ring-zinc-200 dark:ring-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
                <CardHeader className="space-y-1 text-center pb-8 pt-10">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 ring-8 ring-primary/5">
                        <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Acesso Restrito</CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                        Sistema de Vigilância 2026
                    </CardDescription>
                </CardHeader>
                <form action={login}>
                    <CardContent className="grid gap-5">
                        {error && (
                            <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive flex gap-2 items-center justify-center animate-in fade-in slide-in-from-top-2">
                                <span>Erro: {error}</span>
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-zinc-500 dark:text-zinc-400">Email Corporativo</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="usuario@diretoria.com"
                                    required
                                    className="pl-9 h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-zinc-500 dark:text-zinc-400">Senha</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="pb-8 pt-4">
                        <Button className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30">Entrar no Sistema</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
