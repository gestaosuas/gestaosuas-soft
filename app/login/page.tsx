import { login } from './actions'
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

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const { error } = await searchParams

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-white dark:bg-zinc-950 px-4 relative overflow-hidden">
            {/* Elegant Background Layering */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(30,58,138,0.06),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(30,58,138,0.04),rgba(0,0,0,0))]"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            <main className="w-full max-w-[380px] animate-in fade-in slide-in-from-bottom-3 duration-1000">
                <header className="text-center mb-10 pt-8 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-zinc-200/50 dark:shadow-none transform hover:scale-105 transition-all duration-500 border border-zinc-100 dark:border-zinc-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo-vigilancia.png" alt="Logo" className="w-12 h-12 object-contain" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-extrabold tracking-tight text-blue-900 dark:text-blue-50">
                            Bem-vindo de volta
                        </h1>
                        <p className="text-[13px] text-zinc-500 dark:text-zinc-400 font-medium tracking-wide italic">
                            Sistema de Vigilância Socioassistencial • 2026
                        </p>
                    </div>
                </header>

                <Card className="border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none rounded-2xl overflow-hidden">
                    <form action={login}>
                        <CardContent className="grid gap-6 pt-10 px-8">
                            {error && (
                                <div className="rounded-lg bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 p-3 text-[13px] font-medium text-red-600 dark:text-red-400 animate-in fade-in zoom-in-95 duration-500 text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2.5">
                                <Label
                                    htmlFor="email"
                                    className="text-[12px] uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 ml-0.5"
                                >
                                    E-mail Corporativo
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="exemplo@uberlandia.mg.gov.br"
                                    required
                                    className="h-11 bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-600 focus-visible:border-blue-400 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-none text-zinc-900 dark:text-zinc-100"
                                />
                            </div>

                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="text-[12px] uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 ml-0.5"
                                    >
                                        Senha
                                    </Label>
                                    <a
                                        href="#"
                                        className="text-[11px] font-bold text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-tight"
                                    >
                                        Esqueceu a senha?
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="h-11 bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-600 focus-visible:border-blue-400 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-none text-zinc-900 dark:text-zinc-100"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 bg-blue-900 dark:bg-blue-600 text-white hover:bg-blue-800 dark:hover:bg-blue-500 font-bold rounded-lg transition-all mt-2 active:scale-[0.98] shadow-lg shadow-blue-900/10 dark:shadow-none uppercase tracking-widest text-[11px]"
                            >
                                Entrar
                            </Button>
                        </CardContent>
                        <div className="pb-10"></div>
                    </form>
                </Card>

                <footer className="mt-16 text-center opacity-40 hover:opacity-100 transition-opacity duration-500">
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold tracking-[0.2em] uppercase">
                        © 2026 • Sistema de Vigilância • Klisman rDs
                    </p>
                </footer>
            </main>
        </div>
    )
}
